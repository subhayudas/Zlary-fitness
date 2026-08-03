import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase access.
 *
 * The service-role key bypasses row-level security, so it must never reach the
 * browser. This module is imported exclusively from the API routes, and the key
 * is read from a non-`NEXT_PUBLIC_` variable so Next.js cannot inline it into
 * client bundles.
 */

export type SupabaseStatus =
  | { configured: true; client: SupabaseClient }
  | { configured: false; reason: string };

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseStatus {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) {
    return {
      configured: false,
      reason:
        "NEXT_PUBLIC_SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY ne sont pas définis.",
    };
  }

  if (!cached) {
    cached = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "x-application-name": "zlary-fitness-site" } },
    });
  }

  return { configured: true, client: cached };
}

/**
 * One row per lead, and — since the funnel ends on a booked slot rather than on
 * a form — that row now carries the appointment too. The table keeps its
 * original name so the history stays in one place.
 */
export const APPLICATIONS_TABLE = "coaching_applications";

/**
 * Statuses that still hold their slot. Anything outside this list has released
 * it, which is exactly what the partial unique index in migration 0002 encodes.
 */
export const LIVE_BOOKING_STATUSES = [
  "new",
  "reviewing",
  "booked",
  "accepted",
  "completed",
  "no_show",
] as const;

/** Row shape written by the booking route. Mirrors the SQL migrations exactly. */
export type BookingRow = {
  full_name: string;
  email: string;
  phone: string;
  preferred_language: string;

  primary_goal: string;
  training_level: string;
  biggest_obstacle: string;
  desired_timeline: string;
  investment_readiness: string;

  marketing_consent: boolean;

  slot_start: string;
  slot_end: string;
  booking_timezone: string;
  calendar_event_id: string | null;
  calendar_event_link: string | null;
  invite_sent: boolean;
  lead_quality: string;

  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;

  status: string;
  submission_id: string | null;
};
