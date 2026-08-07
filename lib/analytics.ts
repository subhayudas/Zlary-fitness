/**
 * Privacy-conscious analytics abstraction.
 *
 * Nothing loads and nothing is tracked until the visitor grants consent via the
 * banner. `track()` is safe to call from anywhere - on the server, before
 * consent, or with no provider configured, it is a no-op.
 *
 * Providers are all optional and enabled purely by the presence of their id:
 *   NEXT_PUBLIC_GA_ID          → Google Analytics 4 (gtag.js)
 *   NEXT_PUBLIC_GTM_ID         → Google Tag Manager (dataLayer)
 *   NEXT_PUBLIC_META_PIXEL_ID  → Meta Pixel
 */

export const CONSENT_STORAGE_KEY = "zlary.consent.v1";
export const CONSENT_EVENT = "zlary:consent-change";

export type ConsentState = "granted" | "denied" | "unknown";

/** Every event the site is allowed to emit. Keeps naming consistent. */
export type AnalyticsEvent =
  | "primary_cta_click"
  | "secondary_cta_click"
  | "vsl_open"
  | "vsl_start"
  | "vsl_progress"
  /**
   * The booking funnel, in order: the flow opens, each phase completes, and it
   * ends on `booking_complete` - which now fires only once a slot is genuinely
   * reserved, not merely once a form was sent.
   */
  | "booking_start"
  | "booking_step_complete"
  | "booking_error"
  | "booking_link_click"
  | "booking_complete";

export type AnalyticsProps = Record<
  string,
  string | number | boolean | undefined
>;

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
    fbq?: ((...args: unknown[]) => void) & { loaded?: boolean };
  }
}

export const analyticsIds = {
  ga: process.env.NEXT_PUBLIC_GA_ID?.trim() || null,
  gtm: process.env.NEXT_PUBLIC_GTM_ID?.trim() || null,
  metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || null,
};

export const analyticsEnabled =
  Boolean(analyticsIds.ga) ||
  Boolean(analyticsIds.gtm) ||
  Boolean(analyticsIds.metaPixel);

export function readConsent(): ConsentState {
  if (typeof window === "undefined") return "unknown";
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return raw === "granted" || raw === "denied" ? raw : "unknown";
  } catch {
    // Private browsing / storage disabled - treat as "not yet decided".
    return "unknown";
  }
}

export function writeConsent(state: Exclude<ConsentState, "unknown">) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, state);
  } catch {
    /* Storage unavailable: consent simply won't persist across visits. */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
}

/**
 * Meta's standard events; anything else is sent as a custom event.
 *
 * A completed booking is both: it is the lead *and* the appointment, because
 * the funnel no longer separates the two.
 */
const META_STANDARD: Partial<Record<AnalyticsEvent, string>> = {
  booking_complete: "Schedule",
};

/**
 * Record an event. Silently does nothing without consent or configuration.
 * Never throws - analytics must not be able to break a conversion path.
 */
export function track(event: AnalyticsEvent, props: AnalyticsProps = {}) {
  if (typeof window === "undefined") return;
  if (readConsent() !== "granted") return;

  const payload = Object.fromEntries(
    Object.entries(props).filter(([, v]) => v !== undefined),
  );

  try {
    if (analyticsIds.gtm && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, ...payload });
    }

    if (analyticsIds.ga && typeof window.gtag === "function") {
      window.gtag("event", event, payload);
    }

    if (analyticsIds.metaPixel && typeof window.fbq === "function") {
      const standard = META_STANDARD[event];
      if (standard) {
        window.fbq("track", standard, payload);
      } else {
        window.fbq("trackCustom", event, payload);
      }
    }
  } catch {
    /* Never let a tracking failure surface to the user. */
  }
}

/* -------------------------------------------------------------------------- */
/* Attribution                                                                 */
/* -------------------------------------------------------------------------- */

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type Attribution = Partial<Record<UtmKey, string>> & {
  referrer?: string;
};

const ATTRIBUTION_KEY = "zlary.attribution.v1";

/**
 * Reads UTM parameters from the current URL and remembers them for the session,
 * so attribution survives the /vsl → /apply hop.
 *
 * Attribution is stored in sessionStorage and submitted with the form body -
 * it is never appended to a URL, so no lead data ends up in a query string or
 * a server access log.
 */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};

  let stored: Attribution = {};
  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_KEY);
    if (raw) stored = JSON.parse(raw) as Attribution;
  } catch {
    stored = {};
  }

  const params = new URLSearchParams(window.location.search);
  const fresh: Attribution = {};

  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) fresh[key] = value.slice(0, 180);
  }

  // First touch wins for the referrer; only record external referrers.
  if (!stored.referrer && document.referrer) {
    try {
      const ref = new URL(document.referrer);
      if (ref.hostname !== window.location.hostname) {
        fresh.referrer = document.referrer.slice(0, 500);
      }
    } catch {
      /* Malformed referrer - ignore. */
    }
  }

  const merged: Attribution = { ...stored, ...fresh };

  try {
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(merged));
  } catch {
    /* Non-fatal. */
  }

  return merged;
}
