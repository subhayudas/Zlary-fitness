import type { Metadata } from "next";
import { FAQAccordion } from "@/components/FAQAccordion";
import { BookingFlow } from "@/components/form/BookingFlow";
import { FunnelHeader } from "@/components/nav/FunnelHeader";
import { ResultsSection } from "@/components/sections/ResultsSection";
import { FaqSchema, VideoSchema } from "@/components/StructuredData";
import { VideoFrame } from "@/components/VideoFrame";
import { LimeFeaturePanel, Panel } from "@/components/ui/panels";
import { PillCTA } from "@/components/ui/PillCTA";
import { Reveal } from "@/components/ui/Reveal";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading, Rule } from "@/components/ui/typography";
import { getVslFaqItems } from "@/content/faq";
import { getMedia } from "@/content/media";
import { getNav, sectionIds } from "@/content/navigation";
import { getRouteSeo } from "@/content/seo";
import { getSiteCopy, site } from "@/content/site";
import { getUi } from "@/content/ui";
import { getVslConfig, getVslContent } from "@/content/vsl";
import { languageAlternates, localePath } from "@/lib/i18n";
import { resolveLocale } from "@/lib/route-locale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const seo = getRouteSeo(locale).vsl;

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
 * Video sales letter.
 *
 * Same design system, far fewer exits: the header carries only the wordmark,
 * a back control, the language switch and the application CTA. There is no site
 * navigation and no footer navigation columns competing with the single action
 * on this page.
 */
export default async function VslPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const config = getVslConfig();
  const vslContent = getVslContent(locale);
  const vslFaqItems = getVslFaqItems(locale);
  const media = getMedia(locale);
  const { navCta } = getNav(locale);
  const t = getUi(locale);
  const formHref = `${localePath("/vsl", locale)}?source=vsl#${sectionIds.apply}`;

  return (
    <>
      <FunnelHeader
        locale={locale}
        backLabel={vslContent.backLabel}
        cta={{
          label: navCta.label,
          href: formHref,
        }}
      />

      <main id="main" className="page-shell section-stack pb-4">
        {/* Headline + player. */}
        <SectionShell ariaLabelledBy="vsl-title" padding="md">
          <Reveal className="mx-auto max-w-4xl text-center">
            <p className="type-micro text-ink/40">{vslContent.eyebrow}</p>

            <EditorialHeading
              as="h1"
              id="vsl-title"
              className="mt-7 text-balance"
            >
              {vslContent.headline}
            </EditorialHeading>

            <p className="mx-auto mt-8 max-w-[54ch] text-pretty text-[0.9375rem] leading-relaxed text-ink-muted md:text-lg">
              {vslContent.support}
            </p>
          </Reveal>

          <Reveal delay={80}>
            <VideoFrame
              locale={locale}
              config={config}
              poster={media.vslPoster}
              className="mx-auto mt-12 max-w-5xl md:mt-16"
            />
          </Reveal>

          <Reveal delay={140}>
            <div className="mt-12 flex justify-center">
              <PillCTA
                href={formHref}
                variant="lime"
                withArrow
                event="primary_cta_click"
                eventProps={{ location: "vsl_hero" }}
                className="w-full sm:w-auto"
              >
                {vslContent.cta.label}
              </PillCTA>
            </div>
          </Reveal>
        </SectionShell>

        {/* Key takeaways. */}
        <SectionShell ariaLabelledBy="takeaways-title" padding="md">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <Reveal className="lg:col-span-4">
              <EditorialHeading
                as="h2"
                id="takeaways-title"
                scale="card"
                className="text-balance"
              >
                {vslContent.takeaways.heading}
              </EditorialHeading>
            </Reveal>

            <div className="lg:col-span-7 lg:col-start-6">
              {vslContent.takeaways.items.map((item, index) => (
                <Reveal key={item.index} delay={index * 70}>
                  <Rule />
                  <div className="grid gap-3 py-7 sm:grid-cols-[3rem_1fr] sm:gap-8 md:py-8">
                    <span className="type-index text-[0.875rem] text-ink/30">
                      {item.index}
                    </span>
                    <div>
                      <h3 className="text-pretty text-lg leading-snug tracking-[-0.02em] text-ink md:text-xl">
                        {item.title}
                      </h3>
                      <p className="measure mt-3 text-pretty text-[0.9375rem] leading-relaxed text-ink-muted">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
              <Rule />
            </div>
          </div>
        </SectionShell>

        <ResultsSection locale={locale} />

        {/* FAQ. */}
        {vslFaqItems.length > 0 ? (
          <SectionShell ariaLabelledBy="vsl-faq-title" padding="md">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
              <Reveal className="lg:col-span-4">
                <EditorialHeading
                  as="h2"
                  id="vsl-faq-title"
                  scale="card"
                  className="text-balance"
                >
                  {vslContent.faqHeading}
                </EditorialHeading>
              </Reveal>
              <Reveal delay={80} className="lg:col-span-7 lg:col-start-6">
                <FAQAccordion items={vslFaqItems} />
              </Reveal>
            </div>
          </SectionShell>
        ) : null}

        {/* Application and booking flow. */}
        <SectionShell
          id={sectionIds.apply}
          padding="sm"
          ariaLabelledBy="vsl-final-title"
        >
          <LimeFeaturePanel className="px-6 py-14 text-center sm:px-10 md:py-20">
            <Reveal className="mx-auto max-w-2xl">
              <EditorialHeading
                as="h2"
                id="vsl-final-title"
                scale="card"
                className="text-balance text-ink-strong"
              >
                {vslContent.finalCta.heading}
              </EditorialHeading>
              <p className="mx-auto mt-6 max-w-[44ch] text-pretty text-[0.9375rem] leading-relaxed text-ink/70">
                {vslContent.finalCta.body}
              </p>
            </Reveal>
          </LimeFeaturePanel>

          <div className="mt-3 md:mt-4">
            <BookingFlow locale={locale} />
          </div>
        </SectionShell>

        {/* Minimal footer: legal + disclaimer only. */}
        <Panel tone="surface" className="px-6 py-8 sm:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="type-micro text-ink/40">
              © {new Date().getFullYear()} {site.brand}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a
                href={localePath("/privacy", locale)}
                className="type-micro text-ink/50 hover:text-ink"
              >
                {t.vslPage.privacy}
              </a>
              <a
                href={localePath("/terms", locale)}
                className="type-micro text-ink/50 hover:text-ink"
              >
                {t.vslPage.terms}
              </a>
            </div>
          </div>
          <Rule className="my-6" />
          <p className="max-w-[70ch] text-[0.75rem] leading-relaxed text-ink/45">
            {getSiteCopy(locale).disclaimer}
          </p>
        </Panel>
      </main>

      <FaqSchema locale={locale} items={vslFaqItems} />
      <VideoSchema
        name={vslContent.headline}
        description={getRouteSeo(locale).vsl.description}
      />
    </>
  );
}
