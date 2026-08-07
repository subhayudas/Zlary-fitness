/**
 * Locale plumbing.
 *
 * ---------------------------------------------------------------------------
 * URL STRATEGY - FRENCH IS UNPREFIXED
 * ---------------------------------------------------------------------------
 * French is the site's original language and every existing link, ad and search
 * result points at an unprefixed path, so French keeps `/`, `/apply`, `/vsl`…
 * and English lives under `/en/…`.
 *
 *   /apply      → French  (rewritten to /fr/apply by middleware.ts)
 *   /en/apply   → English (matched directly)
 *
 * Routes live under `app/[locale]/`, so both languages are statically generated
 * from the same components; `middleware.ts` only adds the invisible `fr`
 * segment. Nothing auto-redirects on `Accept-Language`: a visitor who asked for
 * a French URL gets the French page, and the language toggle is the only thing
 * that changes language.
 */

export const locales = ["fr", "en"] as const;

export type Locale = (typeof locales)[number];

/** The unprefixed language. Changing this changes which URLs carry a prefix. */
export const defaultLocale: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Per-locale metadata. `htmlLang` is what lands in `<html lang>`, `ogLocale`
 * is the Open Graph form, and `intlLocale` is used for date formatting.
 */
export const localeMeta = {
  fr: {
    label: "Français",
    /** The two letters shown inside the toggle. */
    short: "FR",
    htmlLang: "fr",
    ogLocale: "fr_CA",
    intlLocale: "fr-CA",
    /** hreflang value used in `alternates.languages`. */
    hreflang: "fr-CA",
  },
  en: {
    label: "English",
    short: "EN",
    htmlLang: "en",
    ogLocale: "en_CA",
    intlLocale: "en-CA",
    hreflang: "en-CA",
  },
} as const satisfies Record<Locale, Record<string, string>>;

/**
 * Prefixes an app-relative path for the given locale.
 *
 *   localePath("/apply", "fr")  → "/apply"
 *   localePath("/apply", "en")  → "/en/apply"
 *   localePath("/", "en")       → "/en"
 *
 * Anchors and query strings ride along untouched, and absolute URLs (Instagram,
 * `mailto:`…) are returned as-is so this is safe to apply indiscriminately.
 */
export function localePath(path: string, locale: Locale): string {
  if (!path.startsWith("/")) return path;
  if (locale === defaultLocale) return path;
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

/**
 * Splits a pathname into its locale and the path underneath.
 *
 * Tolerates both the browser-visible form (`/apply`) and the rewritten,
 * internal form (`/fr/apply`), because `usePathname()` can return either
 * depending on whether the page was reached by a server render or a client
 * navigation.
 */
export function stripLocale(pathname: string): {
  locale: Locale;
  path: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (first && isLocale(first)) {
    const rest = segments.slice(1).join("/");
    return { locale: first, path: rest ? `/${rest}` : "/" };
  }

  return { locale: defaultLocale, path: pathname || "/" };
}

/** The other language. With two locales this is the whole toggle. */
export function otherLocale(locale: Locale): Locale {
  return locale === "fr" ? "en" : "fr";
}

/**
 * `alternates.languages` for Next's Metadata API.
 *
 * `x-default` points at French: it is the original language and the version an
 * unmatched visitor should land on.
 */
export function languageAlternates(path: string): Record<string, string> {
  return {
    [localeMeta.fr.hreflang]: localePath(path, "fr"),
    [localeMeta.en.hreflang]: localePath(path, "en"),
    "x-default": localePath(path, "fr"),
  };
}
