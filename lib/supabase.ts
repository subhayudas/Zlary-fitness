import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase access.
 *
 * The service-role key bypasses row-level security, so it must never reach the
 * browser. This module is imported exclusively from the API route, and the key
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

export const APPLICATIONS_TABLE = "coaching_applications";

/** Row shape written by the API route. Mirrors the SQL migration exactly. */
export type ApplicationRow = {
  full_name: string;
  email: string;
  phone: string;
  instagram_username: string | null;
  preferred_language: string;
  primary_goal: string;
  training_level: string;
  training_frequency: string;
  desired_timeline: string;
  biggest_obstacle: string;
  motivation: string;
  support_needed: string;
  investment_readiness: string;
  referral_source: string;
  marketing_consent: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  status: string;
  submission_id: string | null;
};
