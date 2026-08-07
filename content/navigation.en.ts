import type { NavLink } from "./types";
import { site } from "./site";

/**
 * Primary navigation - English.
 *
 * Section anchors keep their French ids (`#methode`, `#postuler`): the id is a
 * DOM identifier shared by both languages, not user-facing copy. Translating it
 * would mean rendering two different ids for the same section and breaking any
 * link that was ever shared.
 */
export const primaryNav: readonly NavLink[] = [
  { label: "Home", href: "/en" },
  { label: "Results", href: "/en/results" },
  /* "The method", not "Coaching": the link lands on the section headed "The
     Zlary Method", and the footer already called the same anchor that. Two
     names for one destination is the thing to avoid. */
  { label: "The method", href: "/en/#methode" },
  { label: "About", href: "/en/about" },
  { label: "FAQ", href: "/en/#faq" },
];

export const navCta = {
  label: "Book a call",
  href: "/en/#postuler",
};

export const footerNav = {
  site: [
    { label: "Home", href: "/en" },
    { label: "Results", href: "/en/results" },
    { label: "The method", href: "/en/#methode" },
    { label: "About", href: "/en/about" },
    { label: "FAQ", href: "/en/#faq" },
  ],
  /* Two entries, not three. "Apply" and "Book a call" were separate links to
     the same place - `/book` only redirects to `#postuler` - so the column
     offered a choice that did not exist. */
  funnel: [
    { label: "Watch the presentation", href: "/en/vsl" },
    { label: "Book a call", href: "/en/#postuler" },
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
