import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { getPrivacyContent } from "@/content/legal";
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
  const seo = getRouteSeo(locale).privacy;

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

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const privacyContent = getPrivacyContent(locale);
  const t = getUi(locale);

  return (
    <>
      <LegalPage
        locale={locale}
        eyebrow={privacyContent.eyebrow}
        title={privacyContent.title}
        updated={privacyContent.updated}
        updatedLabel={privacyContent.updatedLabel}
        intro={privacyContent.intro}
        sections={privacyContent.sections}
      />
      <BreadcrumbSchema
        trail={[
          { name: t.breadcrumb.home, path: localePath("/", locale) },
          { name: t.breadcrumb.privacy, path: localePath("/privacy", locale) },
        ]}
      />
    </>
  );
}
