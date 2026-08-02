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
import type { ApplicationData } from "./validation";

/**
 * Outbound notifications for a new application.
 *
 * Both channels are optional and independent — a failure in either one must
 * never fail the request, because the application is already safely stored.
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
        to: to.split(",").map((address) => address.trim()),
        reply_to: data.email,
        subject: `Nouvelle candidature — ${data.fullName}`,
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
