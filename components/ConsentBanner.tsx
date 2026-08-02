"use client";

import Link from "next/link";
import { getUi } from "@/content/ui";
import { localePath, type Locale } from "@/lib/i18n";
import { analyticsEnabled } from "@/lib/analytics";
import { useConsent } from "@/lib/use-consent";
import { useLanguagePreference } from "@/lib/use-language-preference";

/**
 * Consent banner for measurement tags.
 *
 * Only renders when at least one analytics id is configured — a site with no
 * tags has nothing to ask about, and a decorative cookie banner is pure noise.
 *
 * "Refuser" is given the same visual weight as "Accepter": a decline button
 * styled as an afterthought is a dark pattern, and under Québec's Law 25
 * refusing must be as easy as accepting.
 *
 * It also waits for the language chooser: two overlapping asks on a first visit
 * is one too many, and a consent question is only meaningful once it is being
 * read in a language the visitor chose.
 */
export function ConsentBanner({ locale }: { locale: Locale }) {
  const { consent, hydrated, grant, deny } = useConsent();
  const { preference, hydrated: languageHydrated } = useLanguagePreference();
  const t = getUi(locale).consent;

  if (!analyticsEnabled) return null;
  if (!hydrated || consent !== "unknown") return null;
  if (!languageHydrated || preference === null) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-body"
      className="fixed inset-x-3 bottom-3 z-[70] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-[26rem]"
    >
      <div className="rounded-[calc(var(--radius-media)+5px)] bg-canvas-deep p-[5px] hairline-bezel">
        <div className="rounded-media bg-surface-pure p-5 sm:p-6">
          <h2 id="consent-title" className="type-micro text-ink/50">
            {t.title}
          </h2>
          <p
            id="consent-body"
            className="mt-3 text-pretty text-[0.9375rem] leading-relaxed text-ink-muted"
          >
            {t.body}
          </p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={grant} className="btn btn-lime flex-1">
              {t.accept}
            </button>
            <button type="button" onClick={deny} className="btn btn-outline flex-1">
              {t.decline}
            </button>
          </div>

          <Link
            href={localePath("/privacy", locale)}
            className="link-editorial type-micro mt-4 inline-flex text-ink/45 hover:text-ink"
          >
            {t.privacyLink}
          </Link>
        </div>
      </div>
    </div>
  );
}
