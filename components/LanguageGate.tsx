"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "@/components/icons";
import { Wordmark } from "@/components/nav/Wordmark";
import { languageGate } from "@/content/language-gate";
import {
  localeMeta,
  localePath,
  locales,
  stripLocale,
  type Locale,
} from "@/lib/i18n";
import { useLanguagePreference } from "@/lib/use-language-preference";
import { cn } from "@/lib/utils";

/**
 * First-visit language chooser.
 *
 * ---------------------------------------------------------------------------
 * WHAT IT IS FOR
 * ---------------------------------------------------------------------------
 * Asked once, on the first page a visitor ever opens, and never again. The
 * answer is written to `lib/language-preference.ts`, which is then read by:
 *
 *   · `proxy.ts`      - sends later visits straight to the right language
 *   · the application form - no longer asks which language to follow up in
 *   · `lib/notifications.ts` - writes to the applicant in that language
 *
 * ---------------------------------------------------------------------------
 * WHY IT IS SAFE TO INTERRUPT WITH
 * ---------------------------------------------------------------------------
 * A modal on arrival is normally a bad trade. This one earns it: the site is
 * genuinely bilingual for a bilingual market, the question has exactly two
 * answers, both are one click away, and answering it once removes a question
 * from the application form later. It renders only when nothing is stored, so
 * a returning visitor never sees it.
 *
 * It is rendered client-side after hydration rather than in the HTML, so it can
 * never appear for someone who has already answered - a flash of this dialog on
 * every visit would be far worse than the dialog itself.
 *
 * ---------------------------------------------------------------------------
 * ESCAPE
 * ---------------------------------------------------------------------------
 * Escape closes it and stores the language of the page already on screen. A
 * dialog with no way out is an accessibility failure, and a visitor who
 * dismisses the question while reading French has answered it in the only way
 * that matters. The FR / EN toggle overwrites the choice at any time.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

export function LanguageGate({ locale }: { locale: Locale }) {
  const { preference, hydrated, choose } = useLanguagePreference();
  const router = useRouter();
  const pathname = usePathname();

  const panelRef = useRef<HTMLDivElement>(null);
  const firstOptionRef = useRef<HTMLButtonElement>(null);
  const [entered, setEntered] = useState(false);

  const open = hydrated && preference === null;

  /* ---- Entrance ---------------------------------------------------------
     One frame after mount, so the browser has a "before" state to animate
     from. Without it the panel would simply appear at its final position. */
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  /* ---- Focus, scroll lock, Escape, tab trap ---------------------------- */
  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    // Compensate for the disappearing scrollbar so the page does not jump.
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    firstOptionRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        // Dismissing while reading a language is a choice of that language.
        choose(locale);
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => element.offsetParent !== null);

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
  }, [open, locale, choose]);

  if (!open) return null;

  const { path } = stripLocale(pathname ?? "/");

  const select = (chosen: Locale) => {
    choose(chosen);

    // Already reading it - storing the answer is the whole job.
    if (chosen === locale) return;

    /**
     * Campaign parameters live in the query string and are read by the
     * application form, so dropping them here would break attribution for
     * anyone who arrives from an ad and picks the other language. Read at click
     * time rather than through `useSearchParams()`, which would push every
     * static page into a Suspense boundary for this one control.
     */
    router.push(`${localePath(path, chosen)}${window.location.search}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={languageGate.dialogLabel}
      className={cn(
        "fixed inset-0 z-[80] flex items-center justify-center p-4",
        "bg-ink-strong/45 backdrop-blur-[2px]",
        "transition-opacity duration-500 ease-editorial motion-reduce:transition-none",
        entered ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        ref={panelRef}
        className={cn(
          "w-full max-w-[27rem] rounded-[calc(var(--radius-media)+5px)] bg-canvas-deep p-[5px] hairline-bezel",
          "transition-transform duration-500 ease-editorial motion-reduce:transition-none",
          entered ? "translate-y-0" : "translate-y-3",
        )}
      >
        <div className="rounded-media bg-surface-pure p-6 sm:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <Wordmark asLink={false} size="sm" />
            <span className="type-micro text-ink/35">
              {languageGate.eyebrow}
            </span>
          </div>

          <div className="mt-7">
            {locales.map((candidate, index) => (
              <p
                key={candidate}
                lang={localeMeta[candidate].htmlLang}
                className={cn(
                  "type-sub",
                  // The second line is the same question, not a second one.
                  index === 0 ? "text-ink" : "mt-1 text-ink/40",
                )}
              >
                {languageGate.title[candidate]}
              </p>
            ))}
          </div>

          <div className="mt-6 space-y-2.5">
            {locales.map((candidate, index) => {
              const meta = localeMeta[candidate];
              const option = languageGate.options[candidate];

              return (
                <button
                  key={candidate}
                  ref={index === 0 ? firstOptionRef : undefined}
                  type="button"
                  lang={meta.htmlLang}
                  onClick={() => select(candidate)}
                  className="group flex w-full items-center justify-between gap-4 rounded-card bg-surface px-5 py-4 text-left transition-colors duration-300 ease-editorial hover:bg-lime-soft"
                >
                  <span>
                    <span className="block text-[1.0625rem] leading-tight tracking-[-0.018em] text-ink">
                      {option.name}
                    </span>
                    <span className="mt-1 block text-[0.8125rem] leading-snug text-ink-muted">
                      {option.action}
                    </span>
                  </span>
                  <span className="flex size-9 flex-none items-center justify-center rounded-pill bg-ink text-surface-pure transition-transform duration-500 ease-editorial group-hover:translate-x-0.5">
                    <ArrowRight className="size-4" />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-1">
            {locales.map((candidate) => (
              <p
                key={candidate}
                lang={localeMeta[candidate].htmlLang}
                className="text-[0.8125rem] leading-snug text-ink-muted"
              >
                {languageGate.body[candidate]}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
