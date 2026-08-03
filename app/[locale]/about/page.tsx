import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { AboutSection } from "@/components/sections/AboutSection";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { BreadcrumbSchema } from "@/components/StructuredData";
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
  const seo = getRouteSeo(locale).about;

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
 * About Zach.
 *
 * Full navigation rather than the funnel header: this is a page a visitor
 * reaches while still deciding, not a step inside the application, so the way
 * back to the rest of the site stays open.
 */
export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const t = getUi(locale);

  return (
    <>
      <SiteHeader locale={locale} variant="static" />

      <main id="main" className="page-shell section-stack pb-4">
        <AboutSection locale={locale} />

        <Footer locale={locale} />
      </main>

      <BreadcrumbSchema
        trail={[
          { name: t.breadcrumb.home, path: localePath("/", locale) },
          { name: t.breadcrumb.about, path: localePath("/about", locale) },
        ]}
      />
    </>
  );
}
