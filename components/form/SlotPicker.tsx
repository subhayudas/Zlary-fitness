"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar } from "@/components/icons";
import { PillCTA } from "@/components/ui/PillCTA";
import { getApplyContent } from "@/content/apply";
import { site } from "@/content/site";
import { getUi } from "@/content/ui";
import { localeMeta, type Locale } from "@/lib/i18n";
import { browserTimeZone, formatTimeZoneLabel } from "@/lib/utils";

/**
 * The calendar step.
 *
 * A date rail and a grid of times, drawn from `/api/availability` - the site's
 * own schedule rather than a framed third-party widget. That matters for more
 * than aesthetics: an iframe cannot be told which questions were just answered,
 * cannot hand the answers back, and cannot be styled, so a booking made inside
 * one arrives as a separate record that has to be reconciled by hand. Here the
 * chosen slot is simply another value in the same submission.
 *
 * ---------------------------------------------------------------------------
 * TIME ZONES
 * ---------------------------------------------------------------------------
 * Every time on screen is rendered in the *coach's* zone, which the endpoint
 * names, and that zone is printed above the grid. A visitor elsewhere also sees
 * the same slot in their own zone once they pick one, so nobody books 17:00 and
 * turns up at 20:00.
 *
 * Rendering in a fixed, server-supplied zone is also what keeps the grouping
 * honest: the days come back grouped by the coach's calendar, so formatting them
 * in anybody else's would eventually print a Tuesday under Monday.
 *
 * Availability is read once per mount. When the flow needs a fresh list - after
 * losing a slot to somebody faster - it remounts this with a new `key` rather
 * than passing a token in, so "start again" is expressed as a new component
 * instead of as an effect watching a prop.
 */

export type SelectedSlot = { start: string; end: string };

type AvailabilityResponse = {
  ok: true;
  timeZone: string;
  durationMinutes: number;
  location: string | null;
  days: { date: string; slots: SelectedSlot[] }[];
};

export type AvailabilityMeta = {
  timeZone: string;
  durationMinutes: number;
  location: string | null;
};

type State =
  | { status: "loading" }
  | { status: "failed" }
  | { status: "ready"; data: AvailabilityResponse };

export function SlotPicker({
  locale,
  value,
  onChange,
  onLoaded,
  error,
}: {
  locale: Locale;
  value: SelectedSlot | null;
  onChange: (slot: SelectedSlot | null) => void;
  onLoaded?: (meta: AvailabilityMeta) => void;
  error?: string | null;
}) {
  const copy = getApplyContent(locale).calendar;
  const t = getUi(locale);
  const intl = localeMeta[locale].intlLocale;

  const [state, setState] = useState<State>({ status: "loading" });
  /** Null until the visitor picks a day; the open day is derived below. */
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Held in a ref so re-reading availability never re-runs on a new callback
  // identity - the parent re-renders on every keystroke of the flow.
  const onLoadedRef = useRef(onLoaded);
  useEffect(() => {
    onLoadedRef.current = onLoaded;
  }, [onLoaded]);

  /**
   * One read per attempt.
   *
   * The effect deliberately sets no state on the way in: `loading` is the
   * initial state, and the retry button puts it back before bumping `attempt`.
   * A synchronous `setState` here would render twice for every load.
   */
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch("/api/availability", {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error(String(response.status));

        const payload = (await response.json()) as AvailabilityResponse;
        if (!payload.ok) throw new Error("not ok");

        setState({ status: "ready", data: payload });
        onLoadedRef.current?.({
          timeZone: payload.timeZone,
          durationMinutes: payload.durationMinutes,
          location: payload.location,
        });
      } catch (cause) {
        if (controller.signal.aborted) return;
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setState({ status: "failed" });
      }
    })();

    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  /* ---- Loading ----------------------------------------------------------- */
  if (state.status === "loading") {
    return (
      <div
        aria-busy="true"
        className="flex min-h-[18rem] items-center justify-center rounded-media bg-surface p-8 hairline"
      >
        <p className="type-micro text-ink-strong">{copy.loading}</p>
      </div>
    );
  }

  /* ---- Unreachable ------------------------------------------------------- */
  if (state.status === "failed") {
    return (
      <div className="rounded-media bg-surface p-7 hairline sm:p-10">
        <h3 className="type-sub text-balance text-ink">{copy.failed.heading}</h3>
        <p className="measure mt-4 text-pretty text-[0.9375rem] leading-relaxed text-ink-strong">
          {copy.failed.body}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={retry} className="btn btn-outline">
            {copy.failed.retry}
          </button>
          <a
            href={site.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            {t.common.writeOnInstagram}
          </a>
        </div>
      </div>
    );
  }

  const { data } = state;

  /* ---- Nothing free ------------------------------------------------------ */
  if (!data.days.length) {
    return (
      <div className="rounded-media bg-surface p-7 hairline sm:p-10">
        <span
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-pill bg-lime text-ink-strong"
        >
          <Calendar className="size-5" />
        </span>
        <h3 className="type-sub mt-7 text-balance text-ink">
          {copy.empty.heading}
        </h3>
        <p className="measure mt-4 text-pretty text-[0.9375rem] leading-relaxed text-ink-strong">
          {copy.empty.body}
        </p>
        <div className="mt-8">
          <PillCTA
            href={site.instagramUrl}
            external
            variant="ink"
            withArrow
            event="booking_link_click"
            eventProps={{ provider: "instagram_fallback" }}
            className="w-full sm:w-auto"
          >
            {t.common.writeOnInstagram}
          </PillCTA>
        </div>
      </div>
    );
  }

  const zone = data.timeZone;

  /**
   * Which day is open, derived rather than stored.
   *
   * In order: the day the visitor tapped, the day holding the time they already
   * chose, then the first day with anything free. Deriving it means a reload
   * that drops a date cannot leave the grid pointing at a day that is gone.
   */
  const day =
    data.days.find((entry) => entry.date === activeDate) ??
    data.days.find((entry) =>
      entry.slots.some((entrySlot) => entrySlot.start === value?.start),
    ) ??
    data.days[0];

  const dayParts = (iso: string) => {
    const date = new Date(iso);
    const part = (options: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(intl, { ...options, timeZone: zone }).format(date);

    return {
      weekday: part({ weekday: "short" }),
      number: part({ day: "numeric" }),
      month: part({ month: "short" }),
    };
  };

  const timeLabel = (iso: string) =>
    new Intl.DateTimeFormat(intl, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: zone,
    }).format(new Date(iso));

  const zoneLabel = formatTimeZoneLabel(day.slots[0].start, zone, intl);

  /* The visitor's own zone, shown only when it genuinely differs - an identical
     second line reads as a mistake rather than as reassurance. */
  const local = browserTimeZone();
  const localNote =
    value && local && local !== zone
      ? copy.localNote(
          new Intl.DateTimeFormat(intl, {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: local,
          }).format(new Date(value.start)),
          formatTimeZoneLabel(value.start, local, intl),
        )
      : null;

  return (
    <div>
      <p className="type-micro text-ink-strong">{copy.label}</p>
      <p className="measure mt-3 text-pretty text-[0.9375rem] leading-relaxed text-ink-strong">
        {copy.body(data.durationMinutes)}
      </p>

      {/* Dates. */}
      <div className="mt-7">
        <p id="slot-date-label" className="type-micro text-ink-strong">
          {copy.dateLabel}
        </p>
        <div
          role="group"
          aria-labelledby="slot-date-label"
          className="slot-rail mt-3"
        >
          {data.days.map((entry) => {
            const parts = dayParts(entry.slots[0].start);
            const active = entry.date === day.date;

            return (
              <button
                key={entry.date}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveDate(entry.date)}
                className="slot-day"
              >
                <span className="slot-day-weekday">{parts.weekday}</span>
                <span className="slot-day-number">{parts.number}</span>
                <span className="slot-day-month">{parts.month}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Times. */}
      <div className="mt-7">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p id="slot-time-label" className="type-micro text-ink-strong">
            {copy.timeLabel}
          </p>
          <p className="text-[0.8125rem] text-ink-strong">
            {copy.timeZoneNote(zoneLabel)}
          </p>
        </div>

        <div
          role="group"
          aria-labelledby="slot-time-label"
          className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4"
        >
          {day.slots.map((slot) => {
            const active = value?.start === slot.start;

            return (
              <button
                key={slot.start}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(active ? null : slot)}
                className="slot-time"
              >
                {timeLabel(slot.start)}
              </button>
            );
          })}
        </div>
      </div>

      {localNote ? (
        <p className="mt-4 text-[0.8125rem] leading-relaxed text-ink-strong">
          {localNote}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 text-[0.8125rem] text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
