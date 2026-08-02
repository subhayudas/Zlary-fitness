import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { getTermsContent } from "@/content/legal";
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
  const seo = getRouteSeo(locale).terms;

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

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const termsContent = getTermsContent(locale);
  const t = getUi(locale);

  return (
    <>
      <LegalPage
        locale={locale}
        eyebrow={termsContent.eyebrow}
        title={termsContent.title}
        updated={termsContent.updated}
        updatedLabel={termsContent.updatedLabel}
        intro={termsContent.intro}
        sections={termsContent.sections}
      />
      <BreadcrumbSchema
        trail={[
          { name: t.breadcrumb.home, path: localePath("/", locale) },
          { name: t.breadcrumb.terms, path: localePath("/terms", locale) },
        ]}
      />
    </>
  );
}
