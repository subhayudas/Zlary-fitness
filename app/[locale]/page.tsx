import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { ApplySection } from "@/components/sections/ApplySection";
import { EditorialHero } from "@/components/sections/EditorialHero";
import { FaqSection } from "@/components/sections/FaqSection";
import { MethodSection } from "@/components/sections/MethodSection";
import { OfferSection } from "@/components/sections/OfferSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { ResultsSection } from "@/components/sections/ResultsSection";
import { FaqSchema } from "@/components/StructuredData";
import { getRouteSeo } from "@/content/seo";
import { languageAlternates, localePath, type Locale } from "@/lib/i18n";
import { resolveLocale } from "@/lib/route-locale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const seo = getRouteSeo(locale).home;

  return {
    title: seo.title,
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
 * Homepage.
 *
 * Every section is a Server Component. The only client code that reaches the
 * browser is navigation, CTA tracking, the accordion, the reveal observer and
 * the application form in the closing section.
 *
 * `locale` is threaded down as a prop rather than read from a React context or
 * from `headers()`. Context would force the sections to become Client
 * Components, and `headers()` would opt every route out of static rendering -
 * both to avoid passing one string.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale: Locale = await resolveLocale(params);

  return (
    <>
      <EditorialHero locale={locale} />

      <main id="main" className="page-shell section-stack pt-4 md:pt-7">
        <ProblemSection locale={locale} />
        <OfferSection locale={locale} />
        <MethodSection locale={locale} />
        <ResultsSection locale={locale} />
        <FaqSection locale={locale} />
        <ApplySection locale={locale} />
      </main>

      <div className="page-shell pb-3 md:pb-4">
        <Footer locale={locale} />
      </div>

      <FaqSchema locale={locale} />
    </>
  );
}
