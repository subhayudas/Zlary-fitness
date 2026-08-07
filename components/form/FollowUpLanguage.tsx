"use client";

import { getApplyContent, languageLabel } from "@/content/apply";
import { otherLocale, type Locale } from "@/lib/i18n";

/**
 * Which language the applicant will be written back in.
 *
 * This replaces the "Langue préférée" radio group that used to open the form.
 * The question was already answered - on the first visit, by the language
 * chooser - and asking it a second time invites a contradictory answer: someone
 * reading in French who idly picks "Anglais" here gets English email about a
 * French application, and nothing on the site knows which one to believe.
 *
 * So this states the stored answer rather than asking for it, and offers one
 * control to correct it. Correcting it writes through to the same stored
 * preference the rest of the site reads, because there is only one language
 * preference per visitor - not a browsing one and a mailing one.
 *
 * Changing it here deliberately does *not* reload the page into the other
 * language: that would throw away everything already typed into the form.
 */
export function FollowUpLanguage({
  /** The page's language - supplies the labels. */
  locale,
  /** The stored preference, i.e. what will actually be submitted. */
  value,
  onChange,
}: {
  locale: Locale;
  value: Locale;
  onChange: (locale: Locale) => void;
}) {
  const copy = getApplyContent(locale).followUpLanguage;
  const next = otherLocale(value);

  return (
    <div className="rounded-card bg-surface p-5 hairline">
      <p className="type-micro text-ink-strong">{copy.label}</p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="text-[0.9375rem] leading-snug text-ink-strong">
          {copy.value(languageLabel(locale, value))}
        </p>

        <button
          type="button"
          onClick={() => onChange(next)}
          className="link-editorial text-[0.8125rem] text-ink underline-offset-4"
        >
          {copy.switchTo(languageLabel(locale, next))}
        </button>
      </div>

      <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-strong">
        {copy.hint}
      </p>
    </div>
  );
}
