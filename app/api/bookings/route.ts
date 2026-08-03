import { NextResponse } from "next/server";
import { site } from "@/content/site";
import { loadAvailability } from "@/lib/availability";
import { createCalendarEvent } from "@/lib/google-calendar";
import { leadQuality } from "@/lib/lead-quality";
import {
  sendBookingConfirmationEmail,
  sendBookingWebhook,
  sendCoachBookingEmail,
  type BookingContext,
} from "@/lib/notifications";
import { clientIp, hashKey, rateLimit } from "@/lib/rate-limit";
import { isBookableSlot, slotEnd } from "@/lib/schedule";
import {
  APPLICATIONS_TABLE,
  getSupabaseAdmin,
  type BookingRow,
} from "@/lib/supabase";
import { bookingSchema, type BookingData } from "@/lib/validation";

/**
 * Call booking.
 *
 * Contract: this endpoint returns `{ ok: true }` if and only if the slot was
 * actually reserved in the database. It never reports success for a booking
 * that was dropped — a false confirmation means someone shows up to a call that
 * does not exist, which is worse than any error message.
 *
 * Order of operations, and why it is that order:
 *
 *   1. reserve the slot in the database — the record, and the thing that stops
 *      a second person taking it;
 *   2. put it on the coach's calendar;
 *   3. send the confirmation and the invitation;
 *   4. write back what steps 2 and 3 achieved.
 *
 * Only step 1 can fail the request. A calendar that is unreachable or an email
 * that bounces is recorded and reported, not raised: the appointment exists
 * either way, and the visitor is told plainly if the invitation did not go out.
 */

export const runtime = "nodejs";
/** Never cached: this is a write endpoint. */
export const dynamic = "force-dynamic";

const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };
const MAX_BODY_BYTES = 24 * 1024;
/** Anything submitted faster than this was not typed by a person. */
const MIN_ELAPSED_MS = 3000;
/** Postgres unique-violation. Here it can only be the slot. */
const UNIQUE_VIOLATION = "23505";

const isDev = process.env.NODE_ENV === "development";

/**
 * Development-only logging.
 * Deliberately never logs the booking body — a full lead record in a log
 * aggregator is a data-retention problem nobody signed up for.
 */
function devLog(message: string, detail?: Record<string, unknown>) {
  if (!isDev) return;
  console.warn(`[bookings] ${message}`, detail ?? "");
}

function fail(status: number, code: string) {
  return NextResponse.json({ ok: false, code }, { status });
}

/** What the confirmation screen renders. Contains nothing it did not send us. */
function bookingPayload(context: BookingContext, inviteSent: boolean) {
  return {
    ok: true as const,
    booking: {
      start: context.start.toISOString(),
      end: context.end.toISOString(),
      timeZone: context.timeZone,
      durationMinutes: context.durationMinutes,
      location: context.location,
      eventLink: context.eventLink,
    },
    inviteSent,
  };
}

export async function POST(request: Request) {
  /* ---- Rate limit ------------------------------------------------------ */
  const ip = clientIp(request.headers);
  const limit = rateLimit(`bookings:${hashKey(ip)}`, RATE_LIMIT);

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

  const parsed = bookingSchema.safeParse(json);
  if (!parsed.success) {
    // Field names only — never the submitted values.
    devLog("validation failed", {
      fields: parsed.error.issues.map((issue) => issue.path.join(".")),
    });
    return fail(400, "invalid_payload");
  }

  const data: BookingData = parsed.data;

  /* ---- Availability ----------------------------------------------------
     Re-derived here rather than trusted from the browser. The page may have
     been open for an hour, and the value is trivially editable. */
  const { config, busy } = await loadAvailability();

  const start = new Date(data.slotStart);
  const end = slotEnd(data.slotStart, config);

  const context: BookingContext = {
    start,
    end,
    timeZone: config.timeZone,
    durationMinutes: config.durationMinutes,
    location: config.location,
    eventLink: null,
    uid: `${data.submissionId ?? start.getTime().toString(36)}@zlaryfitness.com`,
  };

  /* ---- Spam traps ------------------------------------------------------
     Both return 200 so a bot cannot tell a trap from a success and start
     probing for the shape that gets through. Nothing is stored, and nothing is
     put on anyone's calendar. */
  if (data.company && data.company.trim().length > 0) {
    devLog("honeypot triggered");
    return NextResponse.json(bookingPayload(context, false));
  }

  if (typeof data.elapsedMs === "number" && data.elapsedMs < MIN_ELAPSED_MS) {
    devLog("submitted too fast", { elapsedMs: data.elapsedMs });
    return NextResponse.json(bookingPayload(context, false));
  }

  if (!isBookableSlot({ startIso: data.slotStart, config, busy })) {
    devLog("slot no longer offered");
    return fail(409, "slot_unavailable");
  }

  /* ---- Storage --------------------------------------------------------- */
  const supabase = getSupabaseAdmin();

  if (!supabase.configured) {
    devLog(
      "Supabase is not configured — the booking was NOT stored. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      { reason: supabase.reason },
    );
    // Production gets a generic error and no internal detail.
    return fail(503, "storage_unavailable");
  }

  const row: BookingRow = {
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    preferred_language: data.preferredLanguage,
    primary_goal: data.primaryGoal,
    training_level: data.trainingLevel,
    biggest_obstacle: data.biggestObstacle,
    desired_timeline: data.desiredTimeline,
    investment_readiness: data.investmentReadiness,
    marketing_consent: data.marketingConsent,
    slot_start: start.toISOString(),
    slot_end: end.toISOString(),
    booking_timezone: config.timeZone,
    calendar_event_id: null,
    calendar_event_link: null,
    invite_sent: false,
    lead_quality: leadQuality(data),
    utm_source: data.utm_source ?? null,
    utm_medium: data.utm_medium ?? null,
    utm_campaign: data.utm_campaign ?? null,
    utm_content: data.utm_content ?? null,
    utm_term: data.utm_term ?? null,
    referrer: data.referrer ?? null,
    status: "booked",
    submission_id: data.submissionId ?? null,
  };

  /**
   * Upsert on `submission_id` makes a retry idempotent: the browser sends the
   * same id for every attempt in one flow session, so a network blip followed
   * by a retry updates the same row instead of booking a second slot.
   */
  const { data: stored, error } = data.submissionId
    ? await supabase.client
        .from(APPLICATIONS_TABLE)
        .upsert(row, { onConflict: "submission_id" })
        .select("id")
        .single()
    : await supabase.client
        .from(APPLICATIONS_TABLE)
        .insert(row)
        .select("id")
        .single();

  if (error) {
    /**
     * The unique index on `slot_start` is the real guard against two people
     * booking the same minute: both requests can read "free" before either
     * writes. Losing that race is not an error the visitor caused, so it is
     * answered with the one thing they can act on — pick another time.
     */
    if (error.code === UNIQUE_VIOLATION) {
      devLog("slot taken between the check and the write");
      return fail(409, "slot_taken");
    }

    devLog("Supabase rejected the booking", {
      code: error.code,
      message: error.message,
      hint: error.hint,
    });
    return fail(502, "storage_failed");
  }

  /* ---- The coach's calendar (best effort) ------------------------------- */
  const event = await createCalendarEvent({
    summary: `${site.brand} — ${site.coachFirstName} × ${data.fullName}`,
    description: [
      `Objectif : ${data.primaryGoal}`,
      `Niveau : ${data.trainingLevel}`,
      `Obstacle : ${data.biggestObstacle}`,
      `Échéancier : ${data.desiredTimeline}`,
      `Prêt à investir : ${data.investmentReadiness}`,
      "",
      `Courriel : ${data.email}`,
      `Téléphone : ${data.phone}`,
      `Langue : ${data.preferredLanguage}`,
      `Qualité : ${row.lead_quality}`,
    ].join("\n"),
    location: config.location,
    start,
    end,
    timeZone: config.timeZone,
    attendee: { email: data.email, name: data.fullName },
    requestId: data.submissionId ?? String(stored?.id ?? start.getTime()),
  });

  if (event.created) {
    context.eventLink = event.created.htmlLink;
  } else {
    devLog("calendar event not created", { reason: event.reason });
  }

  /* ---- Notifications (best effort, never blocking the result) ----------
     The confirmation goes out in the applicant's own language, with the
     invitation attached — see `lib/notifications.ts`. */
  const [coachEmail, confirmation, webhook] = await Promise.all([
    sendCoachBookingEmail(data, context),
    sendBookingConfirmationEmail(data, context),
    sendBookingWebhook(data, context),
  ]);

  if (!coachEmail.sent) devLog("coach email not sent", { reason: coachEmail.reason });
  if (!confirmation.sent) {
    devLog("confirmation not sent", { reason: confirmation.reason });
  }
  if (!webhook.sent) devLog("webhook not sent", { reason: webhook.reason });

  /* ---- Write back what actually happened -------------------------------
     So the row says whether the visitor was ever told, rather than leaving
     that to be guessed at from a log. */
  if (stored?.id) {
    const { error: updateError } = await supabase.client
      .from(APPLICATIONS_TABLE)
      .update({
        calendar_event_id: event.created?.id ?? null,
        calendar_event_link: event.created?.htmlLink ?? null,
        invite_sent: confirmation.sent,
      })
      .eq("id", stored.id);

    if (updateError) devLog("could not record the follow-up", { code: updateError.code });
  }

  return NextResponse.json(bookingPayload(context, confirmation.sent));
}

/** Anything other than POST is not a thing this endpoint does. */
export async function GET() {
  return fail(405, "method_not_allowed");
}
