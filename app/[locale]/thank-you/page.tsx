import type { Metadata } from "next";
import { Check, Instagram } from "@/components/icons";
import { Footer } from "@/components/Footer";
import { FunnelHeader } from "@/components/nav/FunnelHeader";
import { LimeFeaturePanel, Panel } from "@/components/ui/panels";
import { PillCTA } from "@/components/ui/PillCTA";
import { Reveal } from "@/components/ui/Reveal";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading, Rule } from "@/components/ui/typography";
import { getThankYouContent } from "@/content/legal";
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
  const seo = getRouteSeo(locale).thankYou;

  return {
    // Absolute: routeSeo titles already carry the brand, so without this the
    // root layout template ("%s | Zlary Fitness") would append it a second time.
    title: { absolute: seo.title },
    description: seo.description,
    alternates: {
      canonical: localePath(seo.path, locale),
      languages: languageAlternates(seo.path),
    },
    robots: { index: false, follow: false },
  };
}

/**
 * Confirmation.
 *
 * Confirms only what is actually true - the application was received. It does
 * not say the application was accepted, and there is no upsell.
 */
export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const thankYouContent = getThankYouContent(locale);
  const t = getUi(locale);

  return (
    <>
      <FunnelHeader
        locale={locale}
        backLabel={t.common.backToSite}
        cta={null}
      />

      <main id="main" className="page-shell section-stack pb-4">
        {/* Optimistic lime confirmation panel. */}
        <SectionShell padding="sm" ariaLabelledBy="thanks-title">
          <LimeFeaturePanel className="px-6 py-14 sm:px-10 md:py-20">
            <Reveal className="mx-auto max-w-3xl text-center">
              <span
                aria-hidden="true"
                className="mx-auto flex size-14 items-center justify-center rounded-pill bg-ink-strong text-lime"
              >
                <Check className="size-6" />
              </span>

              <p className="type-micro mt-8 text-ink/55">
                {thankYouContent.eyebrow}
              </p>

              <EditorialHeading
                as="h1"
                id="thanks-title"
                className="mt-6 text-balance text-ink-strong"
              >
                {thankYouContent.heading}
              </EditorialHeading>

              <p className="mx-auto mt-7 max-w-[48ch] text-pretty text-[0.9375rem] leading-relaxed text-ink/70 md:text-lg">
                {thankYouContent.body}
              </p>
            </Reveal>
          </LimeFeaturePanel>
        </SectionShell>

        {/* Information shell. */}
        <SectionShell padding="md">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <Reveal>
                <h2 className="type-micro text-ink/40">
                  {thankYouContent.nextSteps.heading}
                </h2>

                <ol className="mt-8">
                  {thankYouContent.nextSteps.items.map((item) => (
                    <li key={item.index}>
                      <Rule />
                      <div className="grid gap-3 py-7 sm:grid-cols-[3rem_1fr] sm:gap-8">
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
                    </li>
                  ))}
                  <Rule />
                </ol>
              </Reveal>
            </div>

            <div className="space-y-4 lg:col-span-4 lg:col-start-9">
              <Reveal delay={80}>
                <Panel tone="surface" className="p-7">
                  <h2 className="type-micro text-ink/40">
                    {thankYouContent.prepare.heading}
                  </h2>
                  <ul className="mt-5 space-y-4">
                    {thankYouContent.prepare.items.map((item) => (
                      <li key={item} className="flex gap-3.5">
                        <span
                          aria-hidden="true"
                          className="mt-1 size-1.5 shrink-0 rounded-pill bg-lime"
                        />
                        <span className="text-[0.9375rem] leading-relaxed text-ink-muted">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              </Reveal>

              <Reveal delay={140}>
                <Panel tone="canvas" className="p-7">
                  <h2 className="type-sub text-balance text-ink">
                    {thankYouContent.notBooked.heading}
                  </h2>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted">
                    {thankYouContent.notBooked.body}
                  </p>
                  <div className="mt-6">
                    <PillCTA
                      href={thankYouContent.notBooked.cta.href}
                      variant="ink"
                      withArrow
                      event="secondary_cta_click"
                      eventProps={{ location: "thank_you" }}
                      className="w-full sm:w-auto"
                    >
                      {thankYouContent.notBooked.cta.label}
                    </PillCTA>
                  </div>
                </Panel>
              </Reveal>

              <Reveal delay={200}>
                <Panel tone="surface" className="p-7">
                  <h2 className="type-micro text-ink/40">
                    {thankYouContent.instagram.heading}
                  </h2>
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-muted">
                    {thankYouContent.instagram.body}
                  </p>
                  <a
                    href={site.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-editorial type-micro-lg mt-5 inline-flex text-ink/70 hover:text-ink"
                  >
                    <Instagram className="size-4" />
                    <span>@{site.instagramHandle}</span>
                  </a>
                </Panel>
              </Reveal>
            </div>
          </div>
        </SectionShell>

        <Footer locale={locale} />
      </main>
    </>
  );
}
