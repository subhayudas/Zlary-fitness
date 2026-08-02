import {
  desiredTimelineOptions,
  investmentReadinessOptions,
  obstacleOptions,
  type Option,
  preferredLanguageOptions,
  primaryGoalOptions,
  referralSourceOptions,
  supportNeededOptions,
  trainingFrequencyOptions,
  trainingLevelOptions,
} from "@/content/apply";
import { getEmailCopy } from "@/content/emails";
import { siteUrl } from "@/content/site";
import {
  defaultLocale,
  isLocale,
  localeMeta,
  localePath,
  type Locale,
} from "@/lib/i18n";
import type { ApplicationData } from "./validation";

/**
 * Outbound notifications for a new application.
 *
 * Three channels, all optional and all independent — a failure in any of them
 * must never fail the request, because the application is already safely
 * stored:
 *
 *   · the internal notification, telling Zach a lead came in;
 *   · the applicant's confirmation, telling them it arrived;
 *   · an optional CRM / automation webhook.
 *
 * ---------------------------------------------------------------------------
 * LANGUAGE
 * ---------------------------------------------------------------------------
 * Anything addressed to the *applicant* is written in the language they chose
 * on their first visit, carried here as `preferredLanguage`. Anything addressed
 * to Zach stays in French, his own language — it just states which language the
 * applicant picked, so the reply goes out in the right one.
 *
 * Resend is called over its REST API rather than through the SDK: one fewer
 * dependency, and the payload is trivial.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * Resend requires a verified sending domain. Until one exists, its shared
 * onboarding sender works for internal notifications.
 */
const FROM_ADDRESS =
  process.env.APPLICATION_NOTIFICATION_FROM?.trim() ||
  "Zlary Fitness <onboarding@resend.dev>";

/**
 * The applicant's own language.
 *
 * `preferredLanguage` is already constrained to the site's locales by the Zod
 * enum, but this is the boundary where a stored value becomes the language a
 * real person is written to — worth one guard rather than a mis-addressed
 * email if that enum is ever widened.
 */
function applicantLocale(data: ApplicationData): Locale {
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

type Row = { label: string; value: string };

function buildRows(data: ApplicationData): Row[] {
  const rows: Row[] = [
    { label: "Nom", value: data.fullName },
    { label: "Courriel", value: data.email },
    { label: "Téléphone", value: data.phone },
  ];

  if (data.instagramUsername) {
    rows.push({ label: "Instagram", value: data.instagramUsername });
  }

  rows.push(
    {
      label: "Langue",
      value: label(preferredLanguageOptions, data.preferredLanguage),
    },
    { label: "Objectif", value: label(primaryGoalOptions, data.primaryGoal) },
    { label: "Niveau", value: label(trainingLevelOptions, data.trainingLevel) },
    {
      label: "Fréquence actuelle",
      value: label(trainingFrequencyOptions, data.trainingFrequency),
    },
    {
      label: "Échéancier",
      value: label(desiredTimelineOptions, data.desiredTimeline),
    },
    { label: "Obstacle", value: label(obstacleOptions, data.biggestObstacle) },
    { label: "Motivation", value: data.motivation },
    {
      label: "Suivi souhaité",
      value: label(supportNeededOptions, data.supportNeeded),
    },
    {
      label: "Prêt à investir",
      value: label(investmentReadinessOptions, data.investmentReadiness),
    },
    {
      label: "Provenance",
      value: label(referralSourceOptions, data.referralSource),
    },
    {
      label: "Consentement marketing",
      value: data.marketingConsent ? "Oui" : "Non",
    },
  );

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

/** `a@x.com, b@x.com` → `["a@x.com", "b@x.com"]`. */
function recipients(list: string): string[] {
  return list
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
}

function renderEmail(data: ApplicationData): { html: string; text: string } {
  const rows = buildRows(data);

  const html = `<!doctype html>
<html lang="fr"><body style="margin:0;background:#E7E9E1;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;color:#102D3A;">
  <div style="max-width:640px;margin:0 auto;background:#FFFFFF;border-radius:24px;padding:32px;">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#5A686E;">Nouvelle candidature</p>
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
    <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#5A686E;">Cette candidature a aussi été enregistrée dans la base de données.</p>
  </div>
</body></html>`;

  const text = [
    `Nouvelle candidature — ${data.fullName}`,
    "",
    ...rows.map((row) => `${row.label}: ${row.value}`),
  ].join("\n");

  return { html, text };
}

export async function sendApplicationEmail(
  data: ApplicationData,
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.APPLICATION_NOTIFICATION_EMAIL?.trim();

  if (!apiKey || !to) {
    return { sent: false, reason: "Resend non configuré." };
  }

  const { html, text } = renderEmail(data);

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
        // The language is in the subject so a reply can be written in the right
        // one without opening the record first.
        subject: `Nouvelle candidature — ${data.fullName} · ${
          localeMeta[applicantLocale(data)].short
        }`,
        html,
        text,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      // Status only — never echo the response body, which can contain the payload.
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

/** First name only — "Merci Marie." reads like a person wrote it. */
function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName.trim();
}

function renderConfirmation(
  data: ApplicationData,
  locale: Locale,
): { subject: string; html: string; text: string } {
  const copy = getEmailCopy(locale);
  const bookUrl = `${siteUrl()}${localePath("/book", locale)}`;
  const host = new URL(siteUrl()).host;
  const name = firstName(data.fullName);

  const html = `<!doctype html>
<html lang="${localeMeta[locale].htmlLang}"><body style="margin:0;background:#E7E9E1;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;color:#102D3A;">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:24px;padding:32px;">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#5A686E;">${escapeHtml(copy.eyebrow)}</p>
    <h1 style="margin:0 0 20px;font-size:26px;line-height:1.15;letter-spacing:-.02em;font-weight:500;">${escapeHtml(copy.greeting(name))}</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">${escapeHtml(copy.intro)}</p>

    <div style="border-top:1px solid rgba(16,45,58,.1);padding-top:24px;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5A686E;">${escapeHtml(copy.nextStepLabel)}</p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">${escapeHtml(copy.nextStepBody)}</p>
      <a href="${bookUrl}" style="display:inline-block;background:#E6FF4D;color:#092532;text-decoration:none;border-radius:999px;padding:14px 28px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:500;">${escapeHtml(copy.cta)}</a>
      <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#5A686E;">${escapeHtml(copy.notice)}</p>
    </div>

    <p style="margin:28px 0 0;font-size:15px;line-height:1.6;">${escapeHtml(copy.signoff)}</p>
    <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid rgba(16,45,58,.1);font-size:12px;line-height:1.5;color:#5A686E;">${escapeHtml(copy.legal(host))}</p>
  </div>
</body></html>`;

  const text = [
    copy.greeting(name),
    "",
    copy.intro,
    "",
    `${copy.nextStepLabel} — ${copy.nextStepBody}`,
    "",
    copy.ctaFallback(bookUrl),
    copy.notice,
    "",
    copy.signoff,
    "",
    copy.legal(host),
  ].join("\n");

  return { subject: copy.subject, html, text };
}

/**
 * Confirms receipt to the applicant, in the language they chose.
 *
 * Gated on `APPLICATION_CONFIRMATION_FROM` rather than on `RESEND_API_KEY`
 * alone, and that gate is the point: this is the first email the site sends to
 * a member of the public, and Resend's shared `onboarding@resend.dev` sender
 * can only deliver to the account owner. Requiring an explicit, verified sender
 * means nothing goes out to a real applicant until someone has deliberately set
 * one up — no silently swallowed mail, and no unverified domain landing in a
 * spam folder with the brand on it.
 */
export async function sendApplicantConfirmationEmail(
  data: ApplicationData,
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.APPLICATION_CONFIRMATION_FROM?.trim();

  if (!apiKey || !from) {
    return { sent: false, reason: "Confirmation au candidat non configurée." };
  }

  const locale = applicantLocale(data);
  const { subject, html, text } = renderConfirmation(data, locale);

  // Replies land wherever the internal notification goes — a human inbox.
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
      }),
      signal: AbortSignal.timeout(8000),
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
 * Optional CRM / automation webhook. Receives the full application as JSON.
 * Only ever point this at an endpoint you control.
 */
export async function sendApplicationWebhook(
  data: ApplicationData,
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
        type: "coaching_application",
        submittedAt: new Date().toISOString(),
        /**
         * Lifted out of `data` as well as left inside it: whatever sends the
         * next message to this person — a CRM sequence, an automation, a human
         * with a template — needs the language at the top level, not buried in
         * an answer to a question the form no longer asks.
         */
        locale: applicantLocale(data),
        data,
      }),
      signal: AbortSignal.timeout(8000),
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
