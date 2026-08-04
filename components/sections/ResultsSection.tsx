import { ResultsEmptyState } from "@/components/FeaturedCaseStudy";
import { TransformationGallery } from "@/components/TransformationGallery";
import { EditorialLink, PillCTA } from "@/components/ui/PillCTA";
import { Reveal } from "@/components/ui/Reveal";
import { SectionCTA } from "@/components/ui/SectionCTA";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading, Rule } from "@/components/ui/typography";
import { getResultsDisclaimer } from "@/content/case-studies";
import { getHome } from "@/content/home";
import { sectionIds } from "@/content/navigation";
import { site } from "@/content/site";
import { getTransformations } from "@/content/transformations";
import type { Locale } from "@/lib/i18n";

/**
 * Client results preview.
 *
 * The proof is the photography, so the section is one draggable before/after
 * comparison rather than a stack of cards — it stays roughly a screen tall on
 * a phone, which is the only length a preview section earns.
 *
 * Only transformations with `approved: true` reach this component. With none
 * approved it falls back to the designed empty state rather than inventing
 * proof.
 */
export function ResultsSection({ locale }: { locale: Locale }) {
  const { resultsIntro } = getHome(locale);
  const resultsDisclaimer = getResultsDisclaimer(locale);
  const transformations = getTransformations(locale);
  const hasResults = transformations.length > 0;

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

      {hasResults ? (
        <>
          <Reveal>
            <TransformationGallery locale={locale} items={transformations} />
          </Reveal>

          <p className="mt-12 max-w-[64ch] text-[0.8125rem] leading-relaxed text-ink/50 md:mt-14">
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
          {/* One button, one text link. The button converts; the link to the
              full results page rides underneath it, because a visitor who has
              just dragged through the comparisons has already seen the proof
              and a second page of it is where the session ends. */}
          <SectionCTA
            cta={resultsIntro.cta}
            variant="ink"
            eventProps={{ location: "results" }}
            layout="row"
            className="mt-12 md:mt-16"
          >
            <EditorialLink
              href={resultsIntro.galleryLink.href}
              className="text-ink/70 hover:text-ink"
              event="secondary_cta_click"
              eventProps={{ location: "results_gallery" }}
            >
              {resultsIntro.galleryLink.label}
            </EditorialLink>
          </SectionCTA>
        </Reveal>
      ) : null}
    </SectionShell>
  );
}
