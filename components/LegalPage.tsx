import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { PendingNote } from "@/components/ui/PendingNote";
import { Reveal } from "@/components/ui/Reveal";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading, Rule } from "@/components/ui/typography";
import { legalPlaceholders } from "@/content/legal";
import { getSiteCopy, intlLocale } from "@/content/site";
import { getUi } from "@/content/ui";
import type { Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";

type Section = {
  readonly id: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
};

/**
 * Shared layout for /privacy and /terms.
 *
 * Two columns on desktop — a sticky table of contents beside the prose — so a
 * legal page still reads as part of the same design system rather than a
 * default document dump.
 */
export function LegalPage({
  locale,
  eyebrow,
  title,
  updated,
  updatedLabel,
  intro,
  sections,
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  updated: string;
  updatedLabel: string;
  intro: string;
  sections: readonly Section[];
}) {
  const t = getUi(locale);

  return (
    <>
      <SiteHeader locale={locale} variant="static" />

      <main id="main" className="page-shell section-stack pb-4">
        <SectionShell ariaLabelledBy="legal-title" padding="md">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Table of contents. */}
            <div className="lg:col-span-3">
              <div className="lg:sticky lg:top-28">
                <p className="type-micro text-ink/40">{eyebrow}</p>
                <nav
                  aria-label={t.legalPage.tableOfContents}
                  className="mt-7 hidden lg:block"
                >
                  <ul className="space-y-3">
                    {sections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="link-editorial text-[0.875rem] leading-snug text-ink/55 hover:text-ink"
                        >
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            <div className="lg:col-span-8 lg:col-start-5">
              <Reveal>
                <EditorialHeading
                  as="h1"
                  id="legal-title"
                  scale="card"
                  className="text-balance"
                >
                  {title}
                </EditorialHeading>

                <p className="type-micro mt-6 text-ink/40">
                  {updatedLabel} : {formatDate(updated, intlLocale(locale))}
                </p>

                <p className="measure-lg mt-8 text-pretty text-[0.9375rem] leading-relaxed text-ink-muted md:text-base">
                  {intro}
                </p>
              </Reveal>

              {/* Legal-entity details Zach must supply — dev-only markers. */}
              <div className="mt-8 space-y-2">
                {Object.values(legalPlaceholders).map((placeholder, index) =>
                  placeholder.status === "awaiting" ? (
                    <PendingNote key={index} note={placeholder.note} />
                  ) : null,
                )}
              </div>

              <div className="mt-14 space-y-14">
                {sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    aria-labelledby={`${section.id}-title`}
                    className="scroll-mt-32"
                  >
                    <Rule />
                    <h2
                      id={`${section.id}-title`}
                      className="mt-7 text-pretty text-xl leading-snug tracking-[-0.022em] text-ink md:text-2xl"
                    >
                      {section.title}
                    </h2>
                    <div className="mt-5 space-y-5">
                      {section.paragraphs.map((paragraph) => (
                        <p
                          key={paragraph.slice(0, 40)}
                          className="measure-lg text-pretty text-[0.9375rem] leading-relaxed text-ink-muted md:text-base"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <Rule className="mt-14" />
              <p className="mt-7 max-w-[70ch] text-[0.8125rem] leading-relaxed text-ink/50">
                {getSiteCopy(locale).disclaimer}
              </p>
            </div>
          </div>
        </SectionShell>

        <Footer locale={locale} />
      </main>
    </>
  );
}
