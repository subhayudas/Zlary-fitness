import { isLocale, type Locale } from "@/lib/i18n";

/**
 * The visitor's language, remembered.
 *
 * ---------------------------------------------------------------------------
 * WHY TWO STORES
 * ---------------------------------------------------------------------------
 * The choice is written to `localStorage` *and* mirrored into a cookie, because
 * the two are read by different halves of the site:
 *
 *   · localStorage is the source of truth. It has no expiry, so the answer
 *     really does survive "forever" on that device.
 *   · the cookie exists so `proxy.ts` can act on the choice *before* anything
 *     is rendered. A server that cannot see the preference could only fix the
 *     language after hydration, which means a flash of the wrong language on
 *     every single visit.
 *
 * Cookies do expire — Chrome caps them at 400 days — so `refreshLanguageCookie`
 * re-stamps it from localStorage on every visit. As long as someone comes back
 * within the year, the cookie never lapses; if it ever does, localStorage still
 * has the answer and immediately writes it back.
 *
 * Nothing here is personal data: one value, `fr` or `en`, chosen deliberately
 * by the visitor. It is not an identifier and is never sent anywhere except to
 * this site's own server on its own requests.
 */

/** Versioned so a future format change cannot be read as a valid old value. */
export const LANGUAGE_STORAGE_KEY = "zlary.locale.v1";

/** Read by `proxy.ts`. Deliberately short — it travels on every request. */
export const LANGUAGE_COOKIE = "zlary_locale";

/** Fired on write so every mounted component re-reads in the same tick. */
export const LANGUAGE_EVENT = "zlary:locale-change";

/** One year. Re-stamped on every visit, so it only lapses after a year away. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function normalize(value: string | null | undefined): Locale | null {
  return value && isLocale(value) ? value : null;
}

function readCookie(): Locale | null {
  if (typeof document === "undefined") return null;

  for (const part of document.cookie.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === LANGUAGE_COOKIE) return normalize(rest.join("="));
  }

  return null;
}

function writeCookie(locale: Locale) {
  if (typeof document === "undefined") return;

  // `SameSite=Lax` is what lets the cookie ride along on a top-level navigation
  // from an ad or an Instagram link — the exact visit that needs it most.
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${LANGUAGE_COOKIE}=${locale}; Path=/; Max-Age=${COOKIE_MAX_AGE}` +
    `; SameSite=Lax${secure}`;
}

/**
 * The stored choice, or `null` if the visitor has never been asked.
 *
 * Falls back to the cookie when localStorage throws, which is what Safari's
 * private mode and a handful of locked-down enterprise profiles do.
 */
export function readLanguagePreference(): Locale | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = normalize(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
    if (stored) return stored;
  } catch {
    /* Storage unavailable — the cookie below is the fallback. */
  }

  return readCookie();
}

/** Records the choice in both stores and notifies every listener. */
export function writeLanguagePreference(locale: Locale) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
  } catch {
    /* Non-fatal: the cookie still carries the choice for up to a year. */
  }

  writeCookie(locale);
  window.dispatchEvent(new CustomEvent(LANGUAGE_EVENT, { detail: locale }));
}

/**
 * Re-stamps the cookie from localStorage.
 *
 * Called once per visit. It repairs the two cases where the two stores drift:
 * a cookie that expired while localStorage kept the answer, and a browser that
 * cleared cookies but not site data.
 */
export function refreshLanguageCookie() {
  if (typeof window === "undefined") return;

  let stored: Locale | null = null;
  try {
    stored = normalize(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return;
  }

  if (stored && stored !== readCookie()) writeCookie(stored);
}
