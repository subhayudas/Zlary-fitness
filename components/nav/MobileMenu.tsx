"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Close, Instagram } from "@/components/icons";
import { LanguageToggle } from "@/components/nav/LanguageToggle";
import { Wordmark } from "@/components/nav/Wordmark";
import { PhotoBackdrop } from "@/components/ui/MediaFrame";
import { backdrops } from "@/content/media";
import { getNav } from "@/content/navigation";
import { site } from "@/content/site";
import { getUi } from "@/content/ui";
import type { Locale } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Full-screen mobile navigation overlay.
 *
 * Handles the four things a hand-rolled menu usually gets wrong:
 *   · focus moves into the overlay on open and back to the trigger on close
 *   · Tab is trapped inside the overlay while it is open
 *   · Escape closes it
 *   · the page behind cannot scroll
 *
 * Links reveal with a short stagger driven by CSS transition delays, so the
 * animation costs nothing at runtime and is neutralised by reduced-motion.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

export function MobileMenu({
  locale,
  open,
  onClose,
  returnFocusTo,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  returnFocusTo?: React.RefObject<HTMLButtonElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const { primaryNav, navCta } = getNav(locale);
  const t = getUi(locale);

  /**
   * Closing always returns focus to the control that opened the menu — never
   * to <body>. Done here rather than in the effect's cleanup so the ref is read
   * at the moment of the interaction, not after React has torn the effect down.
   */
  const handleClose = () => {
    onClose();
    returnFocusTo?.current?.focus();
  };

  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    // Compensate for the disappearing scrollbar so the layout does not jump.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        returnFocusTo?.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [open, onClose, returnFocusTo]);

  return (
    <div
      ref={panelRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label={t.nav.menuLabel}
      hidden={!open}
      className={cn(
        "fixed inset-0 z-[60] flex flex-col bg-ink-strong text-surface-pure on-dark lg:hidden",
        // Animate opacity only — the panel is full-bleed so nothing shifts.
        "transition-opacity duration-500 ease-editorial",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      {/* Gives the overlay depth instead of a flat field of ink. Purely
          decorative: the navigation reads identically without it. */}
      <PhotoBackdrop asset={backdrops.guidance} variant="tall" sizes="100vw" />

      <div className="photo-backdrop-content flex items-center justify-between gap-3 px-4 pt-6 sm:px-6">
        <Wordmark locale={locale} tone="light" onClick={handleClose} asLink />

        <div className="flex items-center gap-2">
          {/* Closes the menu on its way out, so the overlay is not left open
              over the newly loaded page. */}
          <LanguageToggle locale={locale} tone="dark" onNavigate={onClose} />

          <button
            ref={closeRef}
            type="button"
            onClick={handleClose}
            className="flex size-11 items-center justify-center rounded-pill bg-white/10 text-white transition-colors duration-300 ease-editorial hover:bg-white/20"
          >
            <Close className="size-5" title={t.nav.closeMenu} />
          </button>
        </div>
      </div>

      <nav
        aria-label={t.nav.primaryLabel}
        className="photo-backdrop-content flex flex-1 flex-col justify-center px-4 sm:px-6"
      >
        <ul className="space-y-1">
          {primaryNav.map((link, index) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={handleClose}
                className={cn(
                  "block py-3 text-[2rem] leading-tight tracking-[-0.03em] text-white transition-all duration-700 ease-editorial sm:text-[2.5rem]",
                  open
                    ? "translate-y-0 opacity-100"
                    : "translate-y-3 opacity-0",
                )}
                style={{ transitionDelay: open ? `${120 + index * 55}ms` : "0ms" }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="photo-backdrop-content space-y-5 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="rule-light" />
        <Link
          href={navCta.href}
          onClick={() => {
            track("primary_cta_click", { location: "mobile_menu" });
            handleClose();
          }}
          className="btn btn-lime w-full"
        >
          {navCta.label}
        </Link>
        <a
          href={site.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="link-editorial type-micro-lg w-fit py-2 text-white/70"
        >
          <Instagram className="size-4" />
          <span>@{site.instagramHandle}</span>
        </a>
      </div>
    </div>
  );
}
