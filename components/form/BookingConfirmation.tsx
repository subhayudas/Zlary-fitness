"use client";

import Link from "next/link";
import { Calendar, Check } from "@/components/icons";
import { PillCTA } from "@/components/ui/PillCTA";
import { Rule } from "@/components/ui/typography";
import { getApplyContent } from "@/content/apply";
import { site } from "@/content/site";
import { buildIcs } from "@/lib/ics";
import { localeMeta, localePath, type Locale } from "@/lib/i18n";
import {
  browserTimeZone,
  formatSlotDate,
  formatSlotRange,
  formatTimeZoneLabel,
} from "@/lib/utils";

/**
 * The screen that ends the flow.
 *
 * Its job is to be believed. Someone has just handed over a phone number for a
 * call at a specific time, and the only thing standing between that and a
 * no-show is whether this screen made the appointment feel real: the exact date,
 * the exact time, the zone it is in, who is calling, and where the confirmation
 * went.
 *
 * It is also honest about the one thing that can quietly fail. If the
 * confirmation email did not go out, the screen says so rather than leaving
 * someone waiting for a message that is never coming.
 */

export type ConfirmedBooking = {
  start: string;
  end: string;
  timeZone: string;
  durationMinutes: number;
  location: string | null;
  eventLink: string | null;
};

export function BookingConfirmation({
  locale,
  booking,
  fullName,
  email,
  inviteSent,
}: {
  locale: Locale;
  booking: ConfirmedBooking;
  fullName: string;
  email: string;
  inviteSent: boolean;
}) {
  const content = getApplyContent(locale);
  const copy = content.confirmation;
  const intl = localeMeta[locale].intlLocale;

  const firstName = fullName.trim().split(/\s+/)[0] || fullName.trim();
  const where = booking.location ?? copy.summary.defaultWhere;

  const date = formatSlotDate(booking.start, booking.timeZone, intl);
  const time = formatSlotRange(
    booking.start,
    booking.end,
    booking.timeZone,
    intl,
  );
  const zone = formatTimeZoneLabel(booking.start, booking.timeZone, intl);

  /* The visitor's own zone, only when it differs - see `SlotPicker`. */
  const local = browserTimeZone();
  const localNote =
    local && local !== booking.timeZone
      ? content.calendar.localNote(
          new Intl.DateTimeFormat(intl, {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: local,
          }).format(new Date(booking.start)),
          formatTimeZoneLabel(booking.start, local, intl),
        )
      : null;

  /**
   * A downloadable copy of the appointment, built in the browser from the same
   * module the confirmation email uses - one implementation of the format, so
   * the file someone downloads and the file they are emailed cannot disagree.
   *
   * `PUBLISH`, not `REQUEST`: this is the visitor adding an entry to their own
   * calendar, not the site inviting them to one. An invitation with them as
   * both organiser and attendee would prompt some clients to reply to it.
   *
   * Built and released inside the click rather than held in state: an object URL
   * that exists from the moment the screen renders is a resource kept alive for
   * a button most people will not press.
   */
  const downloadInvite = () => {
    const ics = buildIcs({
      uid: `${new Date(booking.start).getTime().toString(36)}-zlary@zlaryfitness.com`,
      start: new Date(booking.start),
      end: new Date(booking.end),
      summary: copy.summary.eventTitle,
      description: [
        `${copy.summary.who}: ${copy.summary.coach}`,
        `${copy.summary.where}: ${where}`,
      ].join("\n"),
      location: booking.location,
      method: "PUBLISH",
    });

    const url = URL.createObjectURL(
      new Blob([ics], { type: "text/calendar;charset=utf-8" }),
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = locale === "en" ? "call.ics" : "appel.ics";
    link.click();

    // Released on the next tick: revoking synchronously can beat the download.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const rows: { label: string; value: string }[] = [
    { label: copy.summary.when, value: `${date} · ${time} (${zone})` },
    {
      label: copy.summary.duration,
      value: copy.summary.minutes(booking.durationMinutes),
    },
    { label: copy.summary.who, value: copy.summary.coach },
    { label: copy.summary.where, value: where },
  ];

  if (inviteSent) {
    rows.push({ label: copy.summary.contact, value: email });
  }

  return (
    <div className="rounded-media bg-surface-pure p-6 hairline sm:p-8 lg:p-12">
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-pill bg-lime text-ink-strong"
      >
        <Check className="size-5" />
      </span>

      <p className="type-micro mt-7 text-ink-strong">{copy.eyebrow}</p>

      {/* Announced rather than merely rendered: the flow does not navigate, so
          nothing else tells assistive tech that the booking went through. */}
      <h2
        role="status"
        className="type-sub mt-4 text-balance text-ink-strong"
      >
        {copy.heading(firstName)}
      </h2>

      <p className="measure mt-4 text-pretty text-[0.9375rem] leading-relaxed text-ink-strong">
        {inviteSent ? copy.body(email) : copy.bodyWithoutEmail}
      </p>

      {/* The appointment itself. */}
      <div className="mt-8 rounded-card bg-surface p-6 hairline sm:p-7">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="text-ink-strong">
            <Calendar className="size-4" />
          </span>
          <p className="type-micro text-ink-strong">{copy.summary.heading}</p>
        </div>

        <dl className="mt-5 space-y-4">
          {rows.map((row) => (
            <div key={row.label} className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4">
              <dt className="type-micro text-ink-strong">{row.label}</dt>
              <dd className="text-[0.9375rem] leading-relaxed text-ink-strong">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        {localNote ? (
          <p className="mt-5 text-[0.8125rem] leading-relaxed text-ink-strong">
            {localNote}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={downloadInvite}
            className="btn btn-outline"
          >
            {copy.addToCalendar}
          </button>

          {booking.eventLink ? (
            <a
              href={booking.eventLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              {copy.openEvent}
            </a>
          ) : null}
        </div>
      </div>

      <Rule className="mt-10" />

      <h3 className="type-micro mt-8 text-ink-strong">{copy.prepare.heading}</h3>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {copy.prepare.items.map((item) => (
          <li
            key={item}
            className="text-[0.9375rem] leading-relaxed text-ink-strong"
          >
            {item}
          </li>
        ))}
      </ul>

      <p className="measure mt-8 text-[0.8125rem] leading-relaxed text-ink-strong">
        {copy.notice}
      </p>

      <div className="mt-8">
        <PillCTA href={localePath("/", locale)} variant="ink" withArrow>
          {copy.backHome}
        </PillCTA>
      </div>

      {/* Kept for anyone whose confirmation never arrived. */}
      {!inviteSent ? (
        <p className="mt-6 text-[0.8125rem] leading-relaxed text-ink-strong">
          <Link
            href={site.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-editorial text-ink underline-offset-4"
          >
            @{site.instagramHandle}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
