"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { MenuLines } from "@/components/icons";
import { LanguageToggle } from "@/components/nav/LanguageToggle";
import { Wordmark } from "@/components/nav/Wordmark";
import { getNav } from "@/content/navigation";
import { getUi } from "@/content/ui";
import type { Locale } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * The in-flow navigation.
 *
 * On the homepage it sits *inside* the hero photograph - transparent, white
 * wordmark, small centred links, language switch and lime CTA pill on the
 * right, generous top spacing. There is no large opaque bar anywhere on the
 * site.
 *
 * The `static` variant is the same layout on the warm-grey canvas, for pages
 * that have no photographic hero.
 *
 * The language switch sits to the left of the CTA and is visible at every
 * breakpoint - including mobile, where the rest of the navigation collapses
 * into the menu. Someone who landed on the wrong language should not have to
 * open a menu to fix it.
 */

export type NavVariant = "overlay" | "static";

type Props = {
  locale: Locale;
  variant?: NavVariant;
  onOpenMenu: () => void;
  menuOpen: boolean;
  menuButtonRef?: React.RefObject<HTMLButtonElement | null>;
  className?: string;
};

export const HeroNavigation = forwardRef<HTMLElement, Props>(
  function HeroNavigation(
    { locale, variant = "overlay", onOpenMenu, menuOpen, menuButtonRef, className },
    ref,
  ) {
    const light = variant === "overlay";
    const { primaryNav, navCta } = getNav(locale);
    const t = getUi(locale);

    return (
      <nav
        ref={ref}
        aria-label={t.nav.primaryLabel}
        className={cn(
          "flex items-center justify-between gap-4 sm:gap-6",
          light ? "on-photo" : "",
          className,
        )}
      >
        <Wordmark locale={locale} tone={light ? "light" : "ink"} size="lg" />

        {/* Desktop links, optically centred in the bar. */}
        <ul className="hidden items-center gap-8 lg:flex xl:gap-10">
          {primaryNav.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  // py-3 brings the target to 45px; the label alone is 21px.
                  "link-editorial type-micro-lg py-3",
                  light ? "text-white/85 hover:text-white" : "text-ink/70 hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle locale={locale} tone={light ? "light" : "ink"} />

          <Link
            href={navCta.href}
            onClick={() => track("primary_cta_click", { location: "header" })}
            className="btn btn-lime hidden min-h-11 px-6 py-2.5 sm:inline-flex"
          >
            {navCta.label}
          </Link>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={onOpenMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={t.nav.openMenu}
            className={cn(
              "flex size-11 items-center justify-center rounded-pill transition-colors duration-300 ease-editorial lg:hidden",
              light
                ? "bg-white/15 text-white hover:bg-white/25"
                : "bg-ink/8 text-ink hover:bg-ink/15",
            )}
          >
            <MenuLines className="size-5" />
          </button>
        </div>
      </nav>
    );
  },
);
