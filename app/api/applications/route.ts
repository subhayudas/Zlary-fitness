import { NextResponse } from "next/server";
import {
  sendApplicantConfirmationEmail,
  sendApplicationEmail,
  sendApplicationWebhook,
} from "@/lib/notifications";
import { clientIp, hashKey, rateLimit } from "@/lib/rate-limit";
import {
  APPLICATIONS_TABLE,
  getSupabaseAdmin,
  type ApplicationRow,
} from "@/lib/supabase";
import { applicationSchema, type ApplicationData } from "@/lib/validation";

/**
 * Coaching application intake.
 *
 * Contract: this endpoint returns `{ ok: true }` if and only if the application
 * was actually persisted. It never reports success for a submission that was
 * dropped — a false confirmation means a lead silently disappears, which is
 * the worst possible failure for this site.
 *
 * Notifications (email, webhook) are best-effort: they run after storage has
 * succeeded and a failure in either is logged, not surfaced.
 */

export const runtime = "nodejs";
/** Never cached: this is a write endpoint. */
export const dynamic = "force-dynamic";

const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };
const MAX_BODY_BYTES = 24 * 1024;
/** Anything submitted faster than this was not typed by a person. */
const MIN_ELAPSED_MS = 3000;

const isDev = process.env.NODE_ENV === "development";

/**
 * Development-only logging.
 * Deliberately never logs the application body — a full lead record in a log
 * aggregator is a data-retention problem nobody signed up for.
 */
function devLog(message: string, detail?: Record<string, unknown>) {
  if (!isDev) return;
  console.warn(`[applications] ${message}`, detail ?? "");
}

function fail(status: number, code: string) {
  return NextResponse.json({ ok: false, code }, { status });
}

export async function POST(request: Request) {
  /* ---- Rate limit ------------------------------------------------------ */
  const ip = clientIp(request.headers);
  const limit = rateLimit(`applications:${hashKey(ip)}`, RATE_LIMIT);

  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, code: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  /* ---- Body ------------------------------------------------------------ */
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return fail(415, "unsupported_media_type");
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return fail(413, "payload_too_large");
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail(400, "invalid_json");
  }

  const parsed = applicationSchema.safeParse(json);
  if (!parsed.success) {
    // Field names only — never the submitted values.
    devLog("validation failed", {
      fields: parsed.error.issues.map((issue) => issue.path.join(".")),
    });
    return fail(400, "invalid_payload");
  }

  const data: ApplicationData = parsed.data;

  /* ---- Spam traps ------------------------------------------------------
     Both return 200 so a bot cannot tell a trap from a success and start
     probing for the shape that gets through. Nothing is stored. */
  if (data.company && data.company.trim().length > 0) {
    devLog("honeypot triggered");
    return NextResponse.json({ ok: true, code: "accepted" });
  }

  if (typeof data.elapsedMs === "number" && data.elapsedMs < MIN_ELAPSED_MS) {
    devLog("submitted too fast", { elapsedMs: data.elapsedMs });
    return NextResponse.json({ ok: true, code: "accepted" });
  }

  /* ---- Storage --------------------------------------------------------- */
  const supabase = getSupabaseAdmin();

  if (!supabase.configured) {
    devLog(
      "Supabase is not configured — the application was NOT stored. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      { reason: supabase.reason },
    );
    // Production gets a generic error and no internal detail.
    return fail(503, "storage_unavailable");
  }

  const row: ApplicationRow = {
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    instagram_username: data.instagramUsername ?? null,
    preferred_language: data.preferredLanguage,
    primary_goal: data.primaryGoal,
    training_level: data.trainingLevel,
    training_frequency: data.trainingFrequency,
    desired_timeline: data.desiredTimeline,
    biggest_obstacle: data.biggestObstacle,
    motivation: data.motivation,
    support_needed: data.supportNeeded,
    investment_readiness: data.investmentReadiness,
    referral_source: data.referralSource,
    marketing_consent: data.marketingConsent,
    utm_source: data.utm_source ?? null,
    utm_medium: data.utm_medium ?? null,
    utm_campaign: data.utm_campaign ?? null,
    utm_content: data.utm_content ?? null,
    utm_term: data.utm_term ?? null,
    referrer: data.referrer ?? null,
    status: "new",
    submission_id: data.submissionId ?? null,
  };

  /**
   * Upsert on `submission_id` makes a retry idempotent: the browser sends the
   * same id for every attempt in one form session, so a network blip followed
   * by a retry updates the same row instead of creating a duplicate.
   */
  const { error } = data.submissionId
    ? await supabase.client
        .from(APPLICATIONS_TABLE)
        .upsert(row, { onConflict: "submission_id" })
    : await supabase.client.from(APPLICATIONS_TABLE).insert(row);

  if (error) {
    devLog("Supabase rejected the insert", {
      code: error.code,
      message: error.message,
      hint: error.hint,
    });
    return fail(502, "storage_failed");
  }

  /* ---- Notifications (best effort, never blocking the result) ----------
     The confirmation goes out in the applicant's own language — see
     `lib/notifications.ts`. */
  const [email, confirmation, webhook] = await Promise.all([
    sendApplicationEmail(data),
    sendApplicantConfirmationEmail(data),
    sendApplicationWebhook(data),
  ]);

  if (!email.sent) devLog("email not sent", { reason: email.reason });
  if (!confirmation.sent) {
    devLog("confirmation not sent", { reason: confirmation.reason });
  }
  if (!webhook.sent) devLog("webhook not sent", { reason: webhook.reason });

  return NextResponse.json({ ok: true, code: "stored" });
}

/** Anything other than POST is not a thing this endpoint does. */
export async function GET() {
  return fail(405, "method_not_allowed");
}
