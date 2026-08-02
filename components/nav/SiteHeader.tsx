"use client";

import { useEffect, useRef, useState } from "react";
import { FloatingNavigation } from "@/components/nav/FloatingNavigation";
import { HeroNavigation, type NavVariant } from "@/components/nav/HeroNavigation";
import { MobileMenu } from "@/components/nav/MobileMenu";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Orchestrates the three navigation states.
 *
 * The in-flow nav is observed directly: once it leaves the viewport the
 * floating island takes over. That is one IntersectionObserver for the whole
 * site — no scroll handler, no resize handler, no layout reads during scroll.
 */
export function SiteHeader({
  locale,
  variant = "overlay",
  className,
}: {
  locale: Locale;
  variant?: NavVariant;
  className?: string;
}) {
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [islandVisible, setIslandVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const node = navRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setIslandVisible(!entry.isIntersecting),
      // Fires as soon as the bar's last pixel clears the top edge.
      { threshold: 0, rootMargin: "0px 0px 0px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <HeroNavigation
        ref={navRef}
        locale={locale}
        variant={variant}
        menuOpen={menuOpen}
        menuButtonRef={menuButtonRef}
        onOpenMenu={() => setMenuOpen(true)}
        className={cn(
          variant === "overlay"
            ? "relative z-20 px-5 pt-6 sm:px-7 md:px-9 md:pt-9 lg:px-11 lg:pt-11"
            : "page-shell py-6 md:py-8",
          className,
        )}
      />

      <FloatingNavigation
        locale={locale}
        visible={islandVisible && !menuOpen}
        menuOpen={menuOpen}
        onOpenMenu={() => setMenuOpen(true)}
      />

      <MobileMenu
        locale={locale}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        returnFocusTo={menuButtonRef}
      />
    </>
  );
}
