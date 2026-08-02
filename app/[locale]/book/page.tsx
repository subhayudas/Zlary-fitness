import type { Metadata } from "next";
import { BookingEmbed } from "@/components/BookingEmbed";
import { BookingPageView } from "@/components/BookingPageView";
import { Footer } from "@/components/Footer";
import { FunnelHeader } from "@/components/nav/FunnelHeader";
import { Panel } from "@/components/ui/panels";
import { Reveal } from "@/components/ui/Reveal";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading, Rule } from "@/components/ui/typography";
import { getBookingConfig, getBookingContent } from "@/content/booking";
import { backdrops } from "@/content/media";
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
  const seo = getRouteSeo(locale).book;

  return {
    // Absolute: routeSeo titles already carry the brand, so without this the
    // root layout template ("%s | Zlary Fitness") would append it a second time.
    title: { absolute: seo.title },
    description: seo.description,
    alternates: {
      canonical: localePath(seo.path, locale),
      languages: languageAlternates(seo.path),
    },
    // Step inside a funnel: no reason for it to appear in search results.
    robots: { index: false, follow: true },
  };
}

/**
 * Appointment booking.
 *
 * The copy is careful never to imply that the application has been accepted —
 * booking a slot is a conversation, not an admission.
 */
export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const config = getBookingConfig();
  const bookingContent = getBookingContent(locale);
  const t = getUi(locale);

  return (
    <>
      <BookingPageView configured={config.configured} />

      <FunnelHeader locale={locale} backLabel={t.common.backToSite} />

      <main id="main" className="page-shell section-stack pb-4">
        <SectionShell ariaLabelledBy="book-title" padding="md">
          <div className="grid gap-4 lg:grid-cols-12">
            {/* Deep petroleum introduction panel. */}
            <Reveal className="lg:col-span-4">
              <Panel
                tone="ink"
                className="h-full p-7 sm:p-9 lg:p-10"
                // The flex column moves onto the backdrop's content wrapper —
                // the review notice below is positioned with `mt-auto`.
                contentClassName="flex h-full flex-col"
                backdrop={backdrops.session}
                backdropSizes="(max-width: 1024px) 100vw, 32vw"
              >
                <span className="type-micro w-fit rounded-pill bg-lime px-3 py-1.5 text-ink-strong">
                  {bookingContent.eyebrow}
                </span>

                <EditorialHeading
                  as="h1"
                  id="book-title"
                  scale="card"
                  className="mt-8 text-balance text-white"
                >
                  {bookingContent.heading}
                </EditorialHeading>

                <p className="measure-sm mt-6 text-pretty text-[0.9375rem] leading-relaxed text-white/65">
                  {bookingContent.body}
                </p>

                <Rule tone="light" className="my-8" />

                <h2 className="type-micro text-white/45">
                  {bookingContent.callDetails.heading}
                </h2>
                <ol className="mt-6 space-y-6">
                  {bookingContent.callDetails.items.map((item) => (
                    <li key={item.index} className="flex gap-4">
                      <span className="type-index shrink-0 text-[0.75rem] text-lime">
                        {item.index}
                      </span>
                      <div>
                        <p className="text-[0.9375rem] leading-snug text-white">
                          {item.title}
                        </p>
                        <p className="mt-2 text-[0.875rem] leading-relaxed text-white/55">
                          {item.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>

                <p className="mt-auto pt-10 text-[0.8125rem] leading-relaxed text-white/45">
                  {bookingContent.reviewNotice}
                </p>
              </Panel>
            </Reveal>

            {/* Calendar. */}
            <Reveal delay={90} className="lg:col-span-8">
              <BookingEmbed locale={locale} config={config} />

              <Panel tone="surface" className="mt-4 p-6 sm:p-8">
                <h2 className="type-micro text-ink/45">
                  {bookingContent.prepare.heading}
                </h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                  {bookingContent.prepare.items.map((item) => (
                    <li
                      key={item}
                      className="text-[0.9375rem] leading-relaxed text-ink-muted"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </Panel>
            </Reveal>
          </div>
        </SectionShell>

        <Footer locale={locale} />
      </main>
    </>
  );
}
