import { getVisibleFaqItems } from "@/content/faq";
import { applyHref } from "@/content/navigation";
import { absoluteUrl, getSiteCopy, siteUrl, site } from "@/content/site";
import type { FaqItem } from "@/content/types";
import { getUi } from "@/content/ui";
import { getVslConfig } from "@/content/vsl";
import { localeMeta, locales, type Locale } from "@/lib/i18n";

/**
 * JSON-LD structured data.
 *
 * Deliberately conservative. There is no `AggregateRating`, no `Review`, no
 * `Offer` with a price, and no address or `areaServed` claim - every one of
 * those would require facts that have not been verified, and inventing them is
 * both a Google policy violation and a consumer-protection problem.
 *
 * `FAQPage` is emitted only for questions whose answer is actually visible on
 * the page, which is what Google's guidelines require.
 */

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Data is authored in this repo, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const PERSON_ID = () => `${siteUrl()}/#zach`;
const SERVICE_ID = () => `${siteUrl()}/#service`;

/**
 * The `@id`s are language-independent on purpose: `#service` describes one
 * business, not one translation of it. Only the human-readable strings and
 * `inLanguage` change per locale, so the two pages describe the same entity in
 * two languages rather than two entities.
 */
export function OrganizationSchema({ locale }: { locale: Locale }) {
  const t = getUi(locale).schema;
  const copy = getSiteCopy(locale);

  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": PERSON_ID(),
    name: site.coachFullName,
    jobTitle: t.jobTitle,
    url: siteUrl(),
    sameAs: [site.instagramUrl],
    worksFor: { "@id": SERVICE_ID() },
  };

  const service: Record<string, unknown> = {
    "@type": "ProfessionalService",
    "@id": SERVICE_ID(),
    name: site.brand,
    url: siteUrl(),
    description: copy.positioning,
    inLanguage: locales.map((l) => localeMeta[l].hreflang),
    founder: { "@id": PERSON_ID() },
    employee: { "@id": PERSON_ID() },
    sameAs: [site.instagramUrl],
    serviceType: t.serviceType,
    // Online-only: no postal address is asserted because none is verified.
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: absoluteUrl(applyHref(locale)),
      name: t.applicationChannel,
    },
  };

  if (site.email.status === "confirmed") {
    service.email = site.email.value;
  }

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": `${siteUrl()}/#website`,
            url: siteUrl(),
            name: site.brand,
            inLanguage: localeMeta[locale].hreflang,
            publisher: { "@id": SERVICE_ID() },
          },
          service,
          person,
        ],
      }}
    />
  );
}

export function FaqSchema({
  locale,
  items,
}: {
  locale: Locale;
  items?: readonly FaqItem[];
}) {
  const source = items ?? getVisibleFaqItems(locale);
  const answered = source.filter((item) => item.answer.status === "confirmed");
  if (answered.length === 0) return null;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: answered.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text:
              item.answer.status === "confirmed" ? item.answer.value : undefined,
          },
        })),
      }}
    />
  );
}

export function BreadcrumbSchema({
  trail,
}: {
  trail: readonly { name: string; path: string }[];
}) {
  if (trail.length < 2) return null;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((entry, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: entry.name,
          item: absoluteUrl(entry.path),
        })),
      }}
    />
  );
}

/**
 * Emitted only once a real video is configured. Marking up a placeholder would
 * be structured data describing content that does not exist.
 */
export function VideoSchema({
  name,
  description,
  uploadDate,
}: {
  name: string;
  description: string;
  /** ISO date. Omit entirely rather than guess. */
  uploadDate?: string;
}) {
  const vsl = getVslConfig();
  if (!vsl.configured) return null;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    embedUrl: vsl.embedUrl ?? undefined,
    contentUrl: vsl.fileUrl ?? undefined,
    publisher: { "@id": SERVICE_ID() },
  };

  if (uploadDate) data.uploadDate = uploadDate;

  return <JsonLd data={data} />;
}
