import type { Metadata } from "next";
import { FeaturedCaseStudy, ResultsEmptyState } from "@/components/FeaturedCaseStudy";
import { Footer } from "@/components/Footer";
import { ResultCard } from "@/components/ResultCard";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { LimeFeaturePanel, Panel } from "@/components/ui/panels";
import { PillCTA } from "@/components/ui/PillCTA";
import { Reveal } from "@/components/ui/Reveal";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading, Rule } from "@/components/ui/typography";
import {
  approvedCaseStudies,
  featuredCaseStudy,
  getResultsDisclaimer,
  supportingCaseStudies,
} from "@/content/case-studies";
import { getMedia } from "@/content/media";
import { getRouteSeo } from "@/content/seo";
import { site } from "@/content/site";
import { getUi } from "@/content/ui";
import { languageAlternates, localePath } from "@/lib/i18n";
import { resolveLocale } from "@/lib/route-locale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const seo = getRouteSeo(locale).results;

  return {
    // Absolute: routeSeo titles already carry the brand, so without this the
    // root layout template ("%s | Zlary Fitness") would append it a second time.
    title: { absolute: seo.title },
    description: seo.description,
    alternates: {
      canonical: localePath(seo.path, locale),
      languages: languageAlternates(seo.path),
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: localePath(seo.path, locale),
    },
  };
}

/**
 * Client results.
 *
 * Renders only entries with `approved: true`. With none approved the page shows
 * a designed empty state and the honest reason for it, rather than filler.
 *
 * The supporting grid deliberately alternates card widths (7/5, then 5/7) so it
 * never reads as a stock three-column testimonial section.
 */
export default async function ResultsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const media = getMedia(locale);
  const t = getUi(locale);
  const hasResults = approvedCaseStudies.length > 0;

  return (
    <>
      <SiteHeader locale={locale} variant="static" />

      <main id="main" className="page-shell section-stack pb-4">
        {/* Editorial introduction. */}
        <SectionShell ariaLabelledBy="results-page-title" padding="md">
          <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-8">
            <Reveal className="lg:col-span-7">
              <p className="type-micro text-ink/40">{t.results.eyebrow}</p>
              <EditorialHeading
                as="h1"
                id="results-page-title"
                className="mt-7 text-balance"
              >
                {t.results.heading}
              </EditorialHeading>
            </Reveal>

            <Reveal delay={80} className="lg:col-span-4 lg:col-start-9 lg:self-end">
              <p className="measure text-pretty text-[0.9375rem] leading-relaxed text-ink-muted md:text-base">
                {t.results.body}
              </p>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <div className="photo-zoom mt-12 md:mt-16">
              <MediaFrame
                asset={media.resultsHero}
                sizes="(max-width: 768px) 100vw, 92vw"
                priority
                className="h-[16rem] w-full sm:h-[22rem] lg:h-[28rem]"
              />
            </div>
          </Reveal>
        </SectionShell>

        {hasResults && featuredCaseStudy ? (
          <>
            {/* Featured transformation. */}
            <SectionShell padding="md" ariaLabelledBy="featured-title">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <h2 id="featured-title" className="type-micro text-ink/40">
                  {t.results.featuredLabel}
                </h2>
                <span className="type-micro text-ink/30">
                  01 / {String(approvedCaseStudies.length).padStart(2, "0")}
                </span>
              </div>
              <Rule className="mt-5" />

              <Reveal>
                <FeaturedCaseStudy
                  locale={locale}
                  study={featuredCaseStudy}
                  className="mt-12"
                />
              </Reveal>
            </SectionShell>

            {/* Asymmetric supporting grid. */}
            {supportingCaseStudies.length > 0 ? (
              <SectionShell padding="sm" ariaLabelledBy="others-title">
                <h2 id="others-title" className="sr-only">
                  {t.results.othersLabel}
                </h2>

                <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
                  {supportingCaseStudies.map((study, index) => (
                    <Reveal
                      key={study.id}
                      delay={(index % 2) * 90}
                      className={
                        index % 2 === 0
                          ? "lg:col-span-7"
                          : "lg:col-span-5"
                      }
                    >
                      <ResultCard
                        locale={locale}
                        study={study}
                        className="h-full"
                      />
                    </Reveal>
                  ))}
                </div>
              </SectionShell>
            ) : null}

            <SectionShell padding="sm">
              <Panel tone="surface" className="p-7 sm:p-9">
                <p className="max-w-[70ch] text-[0.8125rem] leading-relaxed text-ink-muted">
                  {getResultsDisclaimer(locale)}
                </p>
              </Panel>
            </SectionShell>
          </>
        ) : (
          <SectionShell padding="md" ariaLabelledBy="empty-title">
            <h2 id="empty-title" className="sr-only">
              {t.results.sectionLabel}
            </h2>
            <Reveal>
              <ResultsEmptyState
                heading={t.results.emptyHeading}
                body={t.results.emptyBody}
                action={
                  <PillCTA
                    href={site.instagramUrl}
                    external
                    variant="ink"
                    withArrow
                    event="secondary_cta_click"
                    eventProps={{ location: "results_page_empty" }}
                  >
                    {t.common.seeInstagram}
                  </PillCTA>
                }
              />
            </Reveal>
          </SectionShell>
        )}

        {/* Closing CTA. */}
        <SectionShell padding="sm" ariaLabelledBy="results-cta-title">
          <LimeFeaturePanel className="px-6 py-14 text-center sm:px-10 md:py-20">
            <Reveal className="mx-auto max-w-2xl">
              <EditorialHeading
                as="h2"
                id="results-cta-title"
                scale="card"
                className="text-balance text-ink-strong"
              >
                {t.results.ctaHeading}
              </EditorialHeading>
              <p className="mx-auto mt-6 max-w-[44ch] text-pretty text-[0.9375rem] leading-relaxed text-ink/70">
                {t.results.ctaBody}
              </p>
              <div className="mt-9 flex justify-center">
                <PillCTA
                  href={localePath("/apply", locale)}
                  variant="white"
                  withArrow
                  event="primary_cta_click"
                  eventProps={{ location: "results_page" }}
                  className="w-full sm:w-auto"
                >
                  {t.results.ctaLabel}
                </PillCTA>
              </div>
            </Reveal>
          </LimeFeaturePanel>
        </SectionShell>

        <Footer locale={locale} />
      </main>

      <BreadcrumbSchema
        trail={[
          { name: t.breadcrumb.home, path: localePath("/", locale) },
          { name: t.breadcrumb.results, path: localePath("/results", locale) },
        ]}
      />
    </>
  );
}
