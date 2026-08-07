import {
  desiredTimelineOptions,
  investmentReadinessOptions,
  obstacleOptions,
  type Option,
  preferredLanguageOptions,
  primaryGoalOptions,
  trainingLevelOptions,
} from "@/content/apply";
import { getEmailCopy } from "@/content/emails";
import { site, siteUrl } from "@/content/site";
import { buildIcs, type IcsEvent } from "@/lib/ics";
import { leadQuality, leadQualityMark, type LeadQuality } from "@/lib/lead-quality";
import {
  defaultLocale,
  isLocale,
  localeMeta,
  type Locale,
} from "@/lib/i18n";
import { formatSlotDate, formatSlotRange, formatTimeZoneLabel } from "@/lib/utils";
import type { BookingData } from "./validation";

/**
 * Outbound notifications for a booked call.
 *
 * Four things go out, all optional and all independent - a failure in any of
 * them must never fail the request, because the booking is already stored:
 *
 *   · the internal notification, telling Zach who booked and when;
 *   · the applicant's confirmation, with the calendar invitation attached;
 *   · an optional CRM / automation webhook.
 *
 * ---------------------------------------------------------------------------
 * LANGUAGE
 * ---------------------------------------------------------------------------
 * Anything addressed to the *applicant* is written in the language they chose
 * on their first visit, carried here as `preferredLanguage`. Anything addressed
 * to Zach stays in French, his own language - it just states which language the
 * applicant picked, so the reply goes out in the right one.
 *
 * Resend is called over its REST API rather than through the SDK: one fewer
 * dependency, and the payload is trivial.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const TIMEOUT_MS = 8000;

/**
 * Resend requires a verified sending domain. Until one exists, its shared
 * onboarding sender works for internal notifications.
 */
const FROM_ADDRESS =
  process.env.APPLICATION_NOTIFICATION_FROM?.trim() ||
  "Zlary Fitness <onboarding@resend.dev>";

/** Everything an email needs to know about the call that was just booked. */
export type BookingContext = {
  start: Date;
  end: Date;
  timeZone: string;
  durationMinutes: number;
  location: string | null;
  /** Google Calendar link, when the integration created the event. */
  eventLink: string | null;
  /** Stable id for the invitation, so a re-send updates rather than duplicates. */
  uid: string;
};

/**
 * The applicant's own language.
 *
 * `preferredLanguage` is already constrained to the site's locales by the Zod
 * enum, but this is the boundary where a stored value becomes the language a
 * real person is written to - worth one guard rather than a mis-addressed
 * email if that enum is ever widened.
 */
function applicantLocale(data: BookingData): Locale {
  return isLocale(data.preferredLanguage)
    ? data.preferredLanguage
    : defaultLocale;
}

function label(options: readonly Option[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** `a@x.com, b@x.com` → `["a@x.com", "b@x.com"]`. */
function recipients(list: string): string[] {
  return list
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
}

/** `"Zlary Fitness <zach@x.com>"` → `"zach@x.com"`. */
function bareAddress(value: string): string | null {
  const angled = /<([^>]+)>/.exec(value);
  const candidate = (angled?.[1] ?? value).trim();
  return candidate.includes("@") ? candidate : null;
}

/**
 * Who the calendar invitation comes from.
 *
 * An `.ics` without a resolvable organizer is quietly ignored by some clients,
 * so this walks every address the site already knows about before giving up and
 * synthesising one from the domain.
 */
function organizerEmail(): string {
  const candidates = [
    process.env.BOOKING_ORGANIZER_EMAIL,
    process.env.APPLICATION_NOTIFICATION_EMAIL?.split(",")[0],
    process.env.APPLICATION_CONFIRMATION_FROM,
    process.env.APPLICATION_NOTIFICATION_FROM,
  ];

  for (const candidate of candidates) {
    const address = candidate ? bareAddress(candidate) : null;
    if (address) return address;
  }

  return `contact@${new URL(siteUrl()).host.replace(/^www\./, "")}`;
}

/** First name only - "Merci Marie." reads like a person wrote it. */
function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName.trim();
}

/* -------------------------------------------------------------------------- */
/* The invitation                                                              */
/* -------------------------------------------------------------------------- */

/** Base64 for Resend's attachment field. Node-only, which is where this runs. */
function icsAttachment(event: IcsEvent, filename: string) {
  return {
    filename,
    content: Buffer.from(buildIcs(event), "utf8").toString("base64"),
  };
}

function buildInvite(
  data: BookingData,
  context: BookingContext,
  locale: Locale,
): IcsEvent {
  const copy = getEmailCopy(locale);

  const description = [
    copy.intro,
    "",
    `${copy.withLabel}: ${copy.coach}`,
    context.location ? `${copy.whereLabel}: ${context.location}` : null,
    "",
    copy.notice,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return {
    uid: context.uid,
    start: context.start,
    end: context.end,
    summary: `${site.brand} - ${site.coachFirstName} × ${firstName(data.fullName)}`,
    description,
    location: context.location,
    organizer: { name: site.brand, email: organizerEmail() },
    attendee: { name: data.fullName, email: data.email },
  };
}

/* -------------------------------------------------------------------------- */
/* Internal notification                                                       */
/* -------------------------------------------------------------------------- */

type Row = { label: string; value: string };

function buildRows(data: BookingData, context: BookingContext): Row[] {
  const intl = localeMeta[defaultLocale].intlLocale;
  const zone = formatTimeZoneLabel(
    context.start.toISOString(),
    context.timeZone,
    intl,
  );

  const rows: Row[] = [
    {
      label: "Rendez-vous",
      value: `${formatSlotDate(context.start.toISOString(), context.timeZone, intl)} · ${formatSlotRange(
        context.start.toISOString(),
        context.end.toISOString(),
        context.timeZone,
        intl,
      )} (${zone})`,
    },
    { label: "Nom", value: data.fullName },
    { label: "Courriel", value: data.email },
    { label: "Téléphone", value: data.phone },
    {
      label: "Langue",
      value: label(preferredLanguageOptions, data.preferredLanguage),
    },
    { label: "Objectif", value: label(primaryGoalOptions, data.primaryGoal) },
    { label: "Niveau", value: label(trainingLevelOptions, data.trainingLevel) },
    { label: "Obstacle", value: label(obstacleOptions, data.biggestObstacle) },
    {
      label: "Échéancier",
      value: label(desiredTimelineOptions, data.desiredTimeline),
    },
    {
      label: "Prêt à investir",
      value: label(investmentReadinessOptions, data.investmentReadiness),
    },
    {
      label: "Consentement marketing",
      value: data.marketingConsent ? "Oui" : "Non",
    },
  ];

  if (context.location) {
    rows.push({ label: "Lieu", value: context.location });
  }
  if (context.eventLink) {
    rows.push({ label: "Événement", value: context.eventLink });
  }

  const attribution = [
    data.source && `source=${data.source}`,
    data.utm_source && `utm_source=${data.utm_source}`,
    data.utm_medium && `utm_medium=${data.utm_medium}`,
    data.utm_campaign && `utm_campaign=${data.utm_campaign}`,
    data.utm_content && `utm_content=${data.utm_content}`,
    data.utm_term && `utm_term=${data.utm_term}`,
  ].filter(Boolean);

  if (attribution.length) {
    rows.push({ label: "Attribution", value: attribution.join(" · ") });
  }
  if (data.referrer) {
    rows.push({ label: "Page de provenance", value: data.referrer });
  }

  return rows;
}

const QUALITY_WORD: Record<LeadQuality, string> = {
  hot: "Prioritaire",
  warm: "À qualifier",
  cold: "Exploratoire",
};

function renderInternalEmail(
  data: BookingData,
  context: BookingContext,
  quality: LeadQuality,
): { html: string; text: string } {
  const rows = buildRows(data, context);

  const html = `<!doctype html>
<html lang="fr"><body style="margin:0;background:#E7E9E1;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;color:#102D3A;">
  <div style="max-width:640px;margin:0 auto;background:#FFFFFF;border-radius:24px;padding:32px;">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#5A686E;">Nouvel appel réservé · ${escapeHtml(QUALITY_WORD[quality])}</p>
    <h1 style="margin:0 0 24px;font-size:26px;line-height:1.15;letter-spacing:-.02em;font-weight:500;">${escapeHtml(data.fullName)}</h1>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
      ${rows
        .map(
          (row) => `<tr>
        <td style="padding:12px 0;border-top:1px solid rgba(16,45,58,.1);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5A686E;vertical-align:top;width:38%;">${escapeHtml(row.label)}</td>
        <td style="padding:12px 0;border-top:1px solid rgba(16,45,58,.1);font-size:15px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(row.value)}</td>
      </tr>`,
        )
        .join("")}
    </table>
    <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#5A686E;">L'invitation est jointe à ce courriel. Le rendez-vous est aussi enregistré dans la base de données.</p>
  </div>
</body></html>`;

  const text = [
    `Nouvel appel réservé - ${data.fullName} (${QUALITY_WORD[quality]})`,
    "",
    ...rows.map((row) => `${row.label}: ${row.value}`),
  ].join("\n");

  return { html, text };
}

export async function sendCoachBookingEmail(
  data: BookingData,
  context: BookingContext,
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.APPLICATION_NOTIFICATION_EMAIL?.trim();

  if (!apiKey || !to) {
    return { sent: false, reason: "Resend non configuré." };
  }

  const quality = leadQuality(data);
  const { html, text } = renderInternalEmail(data, context, quality);
  const intl = localeMeta[defaultLocale].intlLocale;

  const when = `${formatSlotDate(
    context.start.toISOString(),
    context.timeZone,
    intl,
  )} ${formatSlotRange(context.start.toISOString(), context.end.toISOString(), context.timeZone, intl).split(" – ")[0]}`;

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: recipients(to),
        reply_to: data.email,
        // Quality mark, name, then when - readable at a glance in a list.
        subject: `${leadQualityMark[quality]} Appel réservé - ${data.fullName} · ${when} · ${
          localeMeta[applicantLocale(data)].short
        }`,
        html,
        text,
        // Attached for the coach too: it puts the call in his calendar even when
        // the Google integration is not configured.
        attachments: [
          icsAttachment(buildInvite(data, context, defaultLocale), "appel.ics"),
        ],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      // Status only - never echo the response body, which can contain the payload.
      return { sent: false, reason: `Resend a répondu ${response.status}.` };
    }

    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? error.name : "Erreur inconnue.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Confirmation to the applicant                                               */
/* -------------------------------------------------------------------------- */

function renderConfirmation(
  data: BookingData,
  context: BookingContext,
  locale: Locale,
): { subject: string; html: string; text: string } {
  const copy = getEmailCopy(locale);
  const intl = localeMeta[locale].intlLocale;
  const host = new URL(siteUrl()).host;
  const name = firstName(data.fullName);

  const startIso = context.start.toISOString();
  const date = formatSlotDate(startIso, context.timeZone, intl);
  const time = formatSlotRange(
    startIso,
    context.end.toISOString(),
    context.timeZone,
    intl,
  );
  const zone = formatTimeZoneLabel(startIso, context.timeZone, intl);

  const details: { label: string; value: string }[] = [
    { label: copy.whenLabel, value: `${date}\n${time} (${zone})` },
    { label: copy.durationLabel, value: copy.minutes(context.durationMinutes) },
    { label: copy.withLabel, value: copy.coach },
  ];

  if (context.location) {
    details.push({ label: copy.whereLabel, value: context.location });
  }

  const html = `<!doctype html>
<html lang="${localeMeta[locale].htmlLang}"><body style="margin:0;background:#E7E9E1;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;color:#102D3A;">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:24px;padding:32px;">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#5A686E;">${escapeHtml(copy.eyebrow)}</p>
    <h1 style="margin:0 0 20px;font-size:26px;line-height:1.15;letter-spacing:-.02em;font-weight:500;">${escapeHtml(copy.greeting(name))}</h1>
    <p style="margin:0 0 28px;font-size:15px;line-height:1.6;">${escapeHtml(copy.intro)}</p>

    <div style="background:#F8F8F4;border-radius:20px;padding:24px;">
      <p style="margin:0 0 16px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5A686E;">${escapeHtml(copy.detailsLabel)}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        ${details
          .map(
            (row, index) => `<tr>
          <td style="padding:10px 0;${index === 0 ? "" : "border-top:1px solid rgba(16,45,58,.1);"}font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5A686E;vertical-align:top;width:34%;">${escapeHtml(row.label)}</td>
          <td style="padding:10px 0;${index === 0 ? "" : "border-top:1px solid rgba(16,45,58,.1);"}font-size:15px;line-height:1.5;white-space:pre-line;">${escapeHtml(row.value)}</td>
        </tr>`,
          )
          .join("")}
      </table>
    </div>

    <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#5A686E;">${escapeHtml(copy.inviteNote)}</p>
    ${
      context.eventLink
        ? `<p style="margin:16px 0 0;"><a href="${escapeHtml(context.eventLink)}" style="display:inline-block;background:#E6FF4D;color:#092532;text-decoration:none;border-radius:999px;padding:14px 28px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:500;">${escapeHtml(copy.detailsLabel)}</a></p>`
        : ""
    }

    <div style="margin-top:28px;padding-top:24px;border-top:1px solid rgba(16,45,58,.1);">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5A686E;">${escapeHtml(copy.prepareLabel)}</p>
      <ul style="margin:0;padding-left:18px;font-size:15px;line-height:1.7;">
        ${copy.prepareItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>

    <div style="margin-top:24px;padding-top:24px;border-top:1px solid rgba(16,45,58,.1);">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5A686E;">${escapeHtml(copy.rescheduleLabel)}</p>
      <p style="margin:0;font-size:15px;line-height:1.6;">${escapeHtml(copy.rescheduleBody)}</p>
    </div>

    <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#5A686E;">${escapeHtml(copy.notice)}</p>
    <p style="margin:28px 0 0;font-size:15px;line-height:1.6;">${escapeHtml(copy.signoff)}</p>
    <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid rgba(16,45,58,.1);font-size:12px;line-height:1.5;color:#5A686E;">${escapeHtml(copy.legal(host))}</p>
  </div>
</body></html>`;

  const text = [
    copy.greeting(name),
    "",
    copy.intro,
    "",
    copy.detailsLabel,
    ...details.map((row) => `${row.label}: ${row.value.replace(/\n/g, " · ")}`),
    "",
    copy.inviteNote,
    ...(context.eventLink ? [context.eventLink] : []),
    "",
    copy.prepareLabel,
    ...copy.prepareItems.map((item) => `- ${item}`),
    "",
    `${copy.rescheduleLabel} ${copy.rescheduleBody}`,
    "",
    copy.notice,
    "",
    copy.signoff,
    "",
    copy.legal(host),
  ].join("\n");

  return { subject: copy.subject(date), html, text };
}

/**
 * Confirms the booking to the applicant, in the language they chose, with the
 * calendar invitation attached.
 *
 * Gated on `APPLICATION_CONFIRMATION_FROM` rather than on `RESEND_API_KEY`
 * alone, and that gate is the point: this is the first email the site sends to
 * a member of the public, and Resend's shared `onboarding@resend.dev` sender
 * can only deliver to the account owner. Requiring an explicit, verified sender
 * means nothing goes out to a real applicant until someone has deliberately set
 * one up - no silently swallowed mail, and no unverified domain landing in a
 * spam folder with the brand on it.
 *
 * The `sent` flag is written to the row and shown on the confirmation screen:
 * if the invitation did not go out, the visitor is told so rather than being
 * left waiting for an email that is never coming.
 */
export async function sendBookingConfirmationEmail(
  data: BookingData,
  context: BookingContext,
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.APPLICATION_CONFIRMATION_FROM?.trim();

  if (!apiKey || !from) {
    return { sent: false, reason: "Confirmation au candidat non configurée." };
  }

  const locale = applicantLocale(data);
  const { subject, html, text } = renderConfirmation(data, context, locale);

  // Replies land wherever the internal notification goes - a human inbox.
  const replyTo = process.env.APPLICATION_NOTIFICATION_EMAIL?.trim();

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [data.email],
        ...(replyTo ? { reply_to: recipients(replyTo) } : {}),
        subject,
        html,
        text,
        attachments: [
          icsAttachment(
            buildInvite(data, context, locale),
            locale === "en" ? "call.ics" : "appel.ics",
          ),
        ],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      return { sent: false, reason: `Resend a répondu ${response.status}.` };
    }

    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? error.name : "Erreur inconnue.",
    };
  }
}

/**
 * Optional CRM / automation webhook. Receives the full booking as JSON.
 * Only ever point this at an endpoint you control.
 */
export async function sendBookingWebhook(
  data: BookingData,
  context: BookingContext,
): Promise<{ sent: boolean; reason?: string }> {
  const url = process.env.APPLICATION_WEBHOOK_URL?.trim();
  if (!url) return { sent: false, reason: "Webhook non configuré." };

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return { sent: false, reason: "URL de webhook invalide." };
  }

  if (target.protocol !== "https:") {
    return { sent: false, reason: "Le webhook doit utiliser HTTPS." };
  }

  try {
    const response = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "zlary-fitness-site",
      },
      body: JSON.stringify({
        type: "coaching_booking",
        submittedAt: new Date().toISOString(),
        /**
         * Lifted out of `data` as well as left inside it: whatever sends the
         * next message to this person - a CRM sequence, an automation, a human
         * with a template - needs the language at the top level, not buried in
         * an answer to a question the flow no longer asks.
         */
        locale: applicantLocale(data),
        leadQuality: leadQuality(data),
        booking: {
          start: context.start.toISOString(),
          end: context.end.toISOString(),
          timeZone: context.timeZone,
          durationMinutes: context.durationMinutes,
          location: context.location,
          calendarEventLink: context.eventLink,
        },
        data,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    return response.ok
      ? { sent: true }
      : { sent: false, reason: `Webhook a répondu ${response.status}.` };
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? error.name : "Erreur inconnue.",
    };
  }
}
