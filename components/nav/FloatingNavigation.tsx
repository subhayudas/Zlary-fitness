"use client";

import Link from "next/link";
import { MenuLines } from "@/components/icons";
import { LanguageToggle } from "@/components/nav/LanguageToggle";
import { Wordmark } from "@/components/nav/Wordmark";
import { getNav } from "@/content/navigation";
import { getUi } from "@/content/ui";
import type { Locale } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * The compact navigation island that appears once the in-flow nav scrolls away.
 *
 * Detached from every viewport edge, pill-shaped, and translucent over a small
 * area only — a full-width blurred bar would force the compositor to re-blur
 * the whole scrolling page on every frame.
 *
 * Visibility is driven by an IntersectionObserver in `SiteHeader`, never by a
 * scroll listener, and only `transform`/`opacity` animate.
 */
export function FloatingNavigation({
  locale,
  visible,
  onOpenMenu,
  menuOpen,
}: {
  locale: Locale;
  visible: boolean;
  onOpenMenu: () => void;
  menuOpen: boolean;
}) {
  const { primaryNav, navCta } = getNav(locale);
  const t = getUi(locale);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-4 sm:px-4",
        "transition-[opacity,transform] duration-[600ms] ease-editorial",
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-[140%] opacity-0",
      )}
      // Hidden from assistive tech while off-screen; the in-flow nav is the
      // canonical navigation and is always in the accessibility tree.
      aria-hidden={!visible}
    >
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-[68rem] items-center justify-between gap-4 rounded-pill py-2 pl-5 pr-2",
          "bg-surface-pure/88 hairline backdrop-blur-[10px]",
        )}
      >
        <Wordmark locale={locale} size="sm" tabIndex={visible ? undefined : -1} />

        <ul className="hidden items-center gap-7 lg:flex">
          {primaryNav.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                tabIndex={visible ? undefined : -1}
                className="link-editorial type-micro py-3 text-ink/70 hover:text-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <LanguageToggle locale={locale} tone="ink" focusable={visible} />

          <Link
            href={navCta.href}
            tabIndex={visible ? undefined : -1}
            onClick={() =>
              track("primary_cta_click", { location: "floating_nav" })
            }
            className="btn btn-lime min-h-11 px-5 py-2 text-[0.6875rem]"
          >
            {navCta.label}
          </Link>

          <button
            type="button"
            onClick={onOpenMenu}
            tabIndex={visible ? undefined : -1}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={t.nav.openMenu}
            className="flex size-11 items-center justify-center rounded-pill bg-ink/8 text-ink transition-colors duration-300 ease-editorial hover:bg-ink/15 lg:hidden"
          >
            <MenuLines className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
