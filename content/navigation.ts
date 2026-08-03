import { localePath, type Locale } from "@/lib/i18n";
import type { NavLink } from "./types";
import { site } from "./site";

/**
 * Primary navigation — French.
 *
 * Anchor links point at homepage section ids. They are written as absolute
 * paths (`/#methode`) so they also work from /results, /privacy, etc.
 *
 * The English mirror is `navigation.en.ts`; resolve either with `getNav(locale)`
 * at the bottom of this file.
 */
export const primaryNav: readonly NavLink[] = [
  { label: "Accueil", href: "/" },
  { label: "Résultats", href: "/results" },
  { label: "Coaching", href: "/#methode" },
  { label: "À propos", href: "/about" },
  { label: "FAQ", href: "/#faq" },
];

export const navCta = {
  label: "Postuler",
  href: "/#postuler",
};

/** Section ids used for in-page navigation. Keep in sync with the homepage. */
export const sectionIds = {
  approach: "approche",
  results: "transformations",
  method: "methode",
  /** The single offer block: what the coaching includes. */
  offer: "inclus",
  /** Lives on /about now, but keeps its id so old `#a-propos` links resolve. */
  about: "a-propos",
  faq: "faq",
  apply: "postuler",
} as const;

/**
 * Link to the application form.
 *
 * The form is a section of the homepage rather than a route of its own, so
 * every CTA on the site is an anchor into it. `source` rides along as a query
 * parameter because `MultiStepApplication` reads it off `location.search` for
 * attribution — and a query has to come before the fragment to survive.
 */
export function applyHref(locale: Locale, source?: string): string {
  const base = localePath("/", locale);
  const query = source ? `?source=${encodeURIComponent(source)}` : "";
  return `${base}${query}#${sectionIds.apply}`;
}

export const footerNav = {
  site: [
    { label: "Accueil", href: "/" },
    { label: "Résultats", href: "/results" },
    { label: "La méthode", href: "/#methode" },
    { label: "À propos", href: "/about" },
    { label: "FAQ", href: "/#faq" },
  ],
  funnel: [
    { label: "Voir la présentation", href: "/vsl" },
    { label: "Postuler", href: "/#postuler" },
    { label: "Réserver un appel", href: "/book" },
  ],
  legal: [
    { label: "Politique de confidentialité", href: "/privacy" },
    { label: "Conditions d'utilisation", href: "/terms" },
  ],
};

export const socialLinks = [
  {
    label: "Instagram",
    handle: `@${site.instagramHandle}`,
    href: site.instagramUrl,
  },
];

/* -------------------------------------------------------------------------- */
/* Locale dictionary                                                           */
/* -------------------------------------------------------------------------- */

import * as en from "./navigation.en";

export type NavContent = {
  primaryNav: readonly NavLink[];
  navCta: typeof navCta;
  footerNav: typeof footerNav;
  socialLinks: typeof socialLinks;
};

const dictionary: Record<Locale, NavContent> = {
  fr: { primaryNav, navCta, footerNav, socialLinks },
  en,
};

export function getNav(locale: Locale): NavContent {
  return dictionary[locale];
}
