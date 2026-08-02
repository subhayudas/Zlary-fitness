import { FeaturedCaseStudy, ResultsEmptyState } from "@/components/FeaturedCaseStudy";
import { ResultCard } from "@/components/ResultCard";
import { PillCTA } from "@/components/ui/PillCTA";
import { Reveal } from "@/components/ui/Reveal";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading, Rule } from "@/components/ui/typography";
import {
  featuredCaseStudy,
  getResultsDisclaimer,
  supportingCaseStudies,
} from "@/content/case-studies";
import { getHome } from "@/content/home";
import { sectionIds } from "@/content/navigation";
import { site } from "@/content/site";
import type { Locale } from "@/lib/i18n";

/**
 * Client results preview.
 *
 * Renders one featured case study plus up to two supporting ones — and only
 * entries with `approved: true`. When nothing is approved, the section shows a
 * polished empty state rather than inventing proof.
 */
export function ResultsSection({ locale }: { locale: Locale }) {
  const { resultsIntro } = getHome(locale);
  const resultsDisclaimer = getResultsDisclaimer(locale);
  const supporting = supportingCaseStudies.slice(0, 2);
  const hasResults = Boolean(featuredCaseStudy);

  return (
    <SectionShell id={sectionIds.results} ariaLabelledBy="results-title">
      <div className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-8">
        <Reveal className="lg:col-span-5">
          <p className="type-micro text-ink/40">{resultsIntro.eyebrow}</p>
          <EditorialHeading
            as="h2"
            id="results-title"
            className="mt-6 text-balance"
          >
            {resultsIntro.heading}
          </EditorialHeading>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-5 lg:col-start-8 lg:self-end">
          <p className="measure text-pretty text-[0.9375rem] leading-relaxed text-ink-muted md:text-base">
            {resultsIntro.body}
          </p>
        </Reveal>
      </div>

      <Rule className="my-12 md:my-16" />

      {hasResults && featuredCaseStudy ? (
        <>
          <Reveal>
            <FeaturedCaseStudy locale={locale} study={featuredCaseStudy} />
          </Reveal>

          {supporting.length > 0 ? (
            <div className="mt-4 grid gap-4 md:mt-6 md:grid-cols-2">
              {supporting.map((study, index) => (
                <Reveal key={study.id} delay={index * 90}>
                  <ResultCard locale={locale} study={study} className="h-full" />
                </Reveal>
              ))}
            </div>
          ) : null}

          <p className="mt-10 max-w-[64ch] text-[0.8125rem] leading-relaxed text-ink/50">
            {resultsDisclaimer}
          </p>
        </>
      ) : (
        <Reveal>
          <ResultsEmptyState
            heading={resultsIntro.emptyState.heading}
            body={resultsIntro.emptyState.body}
            action={
              <PillCTA
                href={site.instagramUrl}
                external
                variant="outline"
                withArrow
                event="secondary_cta_click"
                eventProps={{ location: "results_empty" }}
              >
                {resultsIntro.emptyState.cta.label}
              </PillCTA>
            }
          />
        </Reveal>
      )}

      {hasResults ? (
        <Reveal delay={120}>
          <div className="mt-12 flex justify-start md:mt-16">
            <PillCTA
              href={resultsIntro.cta.href}
              variant="ink"
              withArrow
              event="secondary_cta_click"
              eventProps={{ location: "results" }}
              className="w-full sm:w-auto"
            >
              {resultsIntro.cta.label}
            </PillCTA>
          </div>
        </Reveal>
      ) : null}
    </SectionShell>
  );
}
