"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { getUi } from "@/content/ui";
import {
  localeMeta,
  localePath,
  locales,
  stripLocale,
  type Locale,
} from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * FR / EN switch.
 *
 * Both languages are rendered as real links to the *same page* in the other
 * language, rather than a single button that toggles state. That buys three
 * things a stateful toggle cannot:
 *
 *   · the destination is a URL, so it can be opened in a new tab, bookmarked
 *     and — critically — crawled, which is what makes the `hreflang` pairs on
 *     each page mean anything;
 *   · the current language is announced through `aria-current`, so a screen
 *     reader user knows which one is active without relying on colour;
 *   · no client state has to survive navigation.
 *
 * `stripLocale` tolerates both `/apply` and `/fr/apply`, because middleware
 * rewrites the unprefixed French paths and `usePathname()` may report either
 * form depending on whether the page was server-rendered or reached by a client
 * navigation. Both strip to the same value, so the rendered hrefs are identical
 * on the server and after hydration.
 */

type Tone = "light" | "ink" | "dark";

const TONE: Record<
  Tone,
  { container: string; indicator: string; active: string; inactive: string }
> = {
  /** Over photography — the overlay navigation on the homepage hero. */
  light: {
    container: "bg-white/15",
    indicator: "bg-white",
    active: "text-ink-strong",
    inactive: "text-white/70 hover:text-white",
  },
  /** On the warm-grey canvas and inside the floating island. */
  ink: {
    container: "bg-ink/8",
    indicator:
      "bg-surface-pure shadow-[0_1px_2px_rgba(9,37,50,0.12)]",
    active: "text-ink",
    inactive: "text-ink/55 hover:text-ink",
  },
  /** On deep petroleum — the full-screen mobile menu. */
  dark: {
    container: "bg-white/10",
    indicator: "bg-white",
    active: "text-ink-strong",
    inactive: "text-white/60 hover:text-white",
  },
};

export function LanguageToggle({
  locale,
  tone = "ink",
  className,
  /** Set false while the containing island is off-screen. */
  focusable = true,
  onNavigate,
}: {
  locale: Locale;
  tone?: Tone;
  className?: string;
  focusable?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const t = getUi(locale);
  const styles = TONE[tone];
  const [selection, setSelection] = useState({ source: locale, value: locale });

  // Reset an optimistic selection when the URL changes by any other means.
  if (selection.source !== locale) {
    setSelection({ source: locale, value: locale });
  }

  const selectedLocale =
    selection.source === locale ? selection.value : locale;

  const { path } = stripLocale(pathname ?? "/");

  /**
   * Campaign parameters live in the query string and are read by the
   * application form, so dropping them on a language switch would silently
   * break attribution for anyone who arrives from an ad and changes language.
   * `useSearchParams()` would force every static page into a Suspense boundary
   * for this one control, so the query is read at click time instead.
   */
  const navigate = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
    candidate: Locale,
  ) => {
    onNavigate?.();

    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();
    setSelection({ source: locale, value: candidate });

    const search = window.location.search;
    // Let React paint the pressed position before the route starts changing.
    requestAnimationFrame(() => router.push(`${href}${search}`));
  };

  return (
    <div
      aria-label={t.nav.languageLabel}
      className={cn(
        "type-micro relative grid grid-cols-2 items-center rounded-pill p-0.5",
        styles.container,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-0.125rem)] rounded-pill transition-transform duration-300 ease-editorial will-change-transform motion-reduce:transition-none",
          selectedLocale === locales[1] && "translate-x-full",
          styles.indicator,
        )}
      />

      {locales.map((candidate) => {
        const meta = localeMeta[candidate];
        const active = candidate === locale;
        const selected = candidate === selectedLocale;

        if (active) {
          return (
            <span
              key={candidate}
              aria-current="true"
              className={cn(
                "relative flex min-h-8 items-center justify-center rounded-pill px-2.5 transition-colors duration-300 ease-editorial",
                selected ? styles.active : styles.inactive,
              )}
            >
              {meta.short}
            </span>
          );
        }

        const href = localePath(path, candidate);

        return (
          <Link
            key={candidate}
            href={href}
            hrefLang={meta.hreflang}
            lang={meta.htmlLang}
            tabIndex={focusable ? undefined : -1}
            onClick={(event) => navigate(event, href, candidate)}
            className={cn(
              "relative flex min-h-8 items-center justify-center rounded-pill px-2.5 transition-[color,transform] duration-300 ease-editorial active:scale-[0.98]",
              selected ? styles.active : styles.inactive,
            )}
          >
            <span className="sr-only">{meta.label} — </span>
            <span aria-hidden="true">{meta.short}</span>
          </Link>
        );
      })}
    </div>
  );
}
