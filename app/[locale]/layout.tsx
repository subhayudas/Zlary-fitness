import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { notFound } from "next/navigation";
import { AnalyticsHelper } from "@/components/AnalyticsHelper";
import { ConsentBanner } from "@/components/ConsentBanner";
import { LanguageGate } from "@/components/LanguageGate";
import { OrganizationSchema } from "@/components/StructuredData";
import { getRouteSeo, getSeoKeywords } from "@/content/seo";
import { site, siteUrl } from "@/content/site";
import { getUi } from "@/content/ui";
import {
  isLocale,
  languageAlternates,
  localeMeta,
  localePath,
  locales,
  type Locale,
} from "@/lib/i18n";
import "../globals.css";

/**
 * Root layout.
 *
 * This is the topmost layout in the tree — there is deliberately no
 * `app/layout.tsx`. Every page lives under `[locale]`, so this is the only
 * place that knows which language is being rendered, and therefore the only
 * place that can put the right value in `<html lang>`. A hard-coded `lang` one
 * level up would label the English pages as French for screen readers and for
 * search engines.
 */

/**
 * Geist — a premium modern grotesk, self-hosted through next/font so there is
 * no render-blocking request to a third-party font CDN and no layout shift.
 * One family throughout; hierarchy comes from scale, not from extra faces.
 */
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
  weight: ["400", "500"],
});

/** Both languages are prerendered at build time. */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};

  const locale: Locale = raw;
  const seo = getRouteSeo(locale).home;
  const meta = localeMeta[locale];

  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: seo.title,
      template: `%s | ${site.brand}`,
    },
    description: seo.description,
    keywords: getSeoKeywords(locale),
    applicationName: site.brand,
    authors: [{ name: site.coachFullName }],
    creator: site.coachFullName,
    publisher: site.brand,
    alternates: {
      canonical: localePath("/", locale),
      languages: languageAlternates("/"),
    },
    openGraph: {
      type: "website",
      locale: meta.ogLocale,
      alternateLocale: locales
        .filter((other) => other !== locale)
        .map((other) => localeMeta[other].ogLocale),
      url: localePath("/", locale),
      siteName: site.brand,
      title: seo.title,
      description: seo.description,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    formatDetection: { telephone: false, address: false, email: false },
    manifest: "/manifest.webmanifest",
  };
}

export const viewport: Viewport = {
  themeColor: "#E7E9E1",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: raw } = await params;
  // Guards against a hand-typed /de/… reaching the tree with an unknown locale.
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const t = getUi(locale);

  return (
    /**
     * `suppressHydrationWarning` on `<html>` and `<body>`: browser extensions
     * (password managers, translators, ad blockers) routinely stamp attributes
     * such as `__processed_<uuid>__` onto these two elements before React
     * hydrates, which React then reports as a server/client attribute mismatch.
     * The flag is one level deep — it silences mismatches on these elements'
     * own attributes only, so real mismatches inside the tree still surface.
     */
    <html
      lang={localeMeta[locale].htmlLang}
      className={geist.variable}
      suppressHydrationWarning
    >
      <body className="antialiased" suppressHydrationWarning>
        <a href="#main" className="skip-link btn btn-ink">
          {t.common.skipToContent}
        </a>

        {children}

        <OrganizationSchema locale={locale} />
        {/* Asked first, and only ever once — the consent banner waits for it. */}
        <LanguageGate locale={locale} />
        <ConsentBanner locale={locale} />
        <AnalyticsHelper />
      </body>
    </html>
  );
}
