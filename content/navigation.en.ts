import type { NavLink } from "./types";
import { site } from "./site";

/**
 * Primary navigation — English.
 *
 * Section anchors keep their French ids (`#methode`, `#a-propos`): the id is a
 * DOM identifier shared by both languages, not user-facing copy. Translating it
 * would mean rendering two different ids for the same section and breaking any
 * link that was ever shared.
 */
export const primaryNav: readonly NavLink[] = [
  { label: "Home", href: "/en" },
  { label: "Results", href: "/en/results" },
  { label: "Coaching", href: "/en/#methode" },
  { label: "About", href: "/en/#a-propos" },
  { label: "FAQ", href: "/en/#faq" },
];

export const navCta = {
  label: "Apply",
  href: "/en/apply",
};

export const footerNav = {
  site: [
    { label: "Home", href: "/en" },
    { label: "Results", href: "/en/results" },
    { label: "The method", href: "/en/#methode" },
    { label: "About", href: "/en/#a-propos" },
    { label: "FAQ", href: "/en/#faq" },
  ],
  funnel: [
    { label: "Watch the presentation", href: "/en/vsl" },
    { label: "Apply", href: "/en/apply" },
    { label: "Book a call", href: "/en/book" },
  ],
  legal: [
    { label: "Privacy policy", href: "/en/privacy" },
    { label: "Terms of use", href: "/en/terms" },
  ],
};

export const socialLinks = [
  {
    label: "Instagram",
    handle: `@${site.instagramHandle}`,
    href: site.instagramUrl,
  },
];
