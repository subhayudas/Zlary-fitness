import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { MultiStepApplication } from "@/components/form/MultiStepApplication";
import { FunnelHeader } from "@/components/nav/FunnelHeader";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { Reveal } from "@/components/ui/Reveal";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading } from "@/components/ui/typography";
import { getApplyContent } from "@/content/apply";
import { getRouteSeo } from "@/content/seo";
import { getUi } from "@/content/ui";
import { languageAlternates, localePath } from "@/lib/i18n";
import { resolveLocale } from "@/lib/route-locale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const seo = getRouteSeo(locale).apply;

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
 * Coaching application.
 *
 * Funnel header only — no full navigation. Every extra link here is an exit.
 */
export default async function ApplyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const applyContent = getApplyContent(locale);
  const t = getUi(locale);

  return (
    <>
      <FunnelHeader locale={locale} backLabel={t.common.backToSite} />

      <main id="main" className="page-shell section-stack pb-4">
        <SectionShell ariaLabelledBy="apply-title" padding="md">
          <Reveal className="max-w-3xl">
            <p className="type-micro text-ink/40">{applyContent.eyebrow}</p>

            <EditorialHeading
              as="h1"
              id="apply-title"
              scale="card"
              className="mt-6 text-balance"
            >
              {applyContent.heading}
            </EditorialHeading>

            <p className="measure-lg mt-6 text-pretty text-[0.9375rem] leading-relaxed text-ink-muted md:text-base">
              {applyContent.body}
            </p>
          </Reveal>

          <div className="mt-10 md:mt-14">
            <MultiStepApplication locale={locale} />
          </div>
        </SectionShell>

        <Footer locale={locale} />
      </main>

      <BreadcrumbSchema
        trail={[
          { name: t.breadcrumb.home, path: localePath("/", locale) },
          {
            name: t.breadcrumb.application,
            path: localePath("/apply", locale),
          },
        ]}
      />
    </>
  );
}
