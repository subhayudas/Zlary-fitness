"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { PillCTA } from "@/components/ui/PillCTA";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading, Rule } from "@/components/ui/typography";
import { getNotFoundContent } from "@/content/legal";
import { stripLocale } from "@/lib/i18n";

/**
 * 404.
 *
 * Kept inside the same design system, with the three destinations that
 * actually matter - a dead end is where a visitor from Instagram gives up.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS ONE PAGE IS A CLIENT COMPONENT
 * ---------------------------------------------------------------------------
 * Next.js renders `not-found.tsx` without route params, so unlike every other
 * page here it cannot be handed its locale. The URL still carries it, so the
 * language is read from the pathname instead. `stripLocale` handles both the
 * rewritten form (`/fr/…`) and the browser-visible one (`/…`), which is exactly
 * the ambiguity a 404 can arrive in.
 *
 * The trade-off is that the page's chrome ships to the browser rather than
 * being prerendered. It is the one route where that costs nothing: it is not
 * indexed, and it is the least-visited page on the site.
 */
export default function NotFound() {
  const pathname = usePathname();
  const { locale } = stripLocale(pathname ?? "/");
  const notFoundContent = getNotFoundContent(locale);

  return (
    <>
      <SiteHeader locale={locale} variant="static" />

      <main id="main" className="page-shell section-stack pb-4">
        <SectionShell ariaLabelledBy="not-found-title" padding="lg">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <p className="type-index text-[6rem] leading-none text-ink/15 md:text-[9rem]">
                {notFoundContent.code}
              </p>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 lg:self-end">
              <p className="type-micro text-ink/40">{notFoundContent.eyebrow}</p>

              <EditorialHeading
                as="h1"
                id="not-found-title"
                scale="card"
                className="mt-6 text-balance"
              >
                {notFoundContent.heading}
              </EditorialHeading>

              <p className="measure mt-6 text-pretty text-[0.9375rem] leading-relaxed text-ink-muted md:text-base">
                {notFoundContent.body}
              </p>

              <Rule className="my-9" />

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {notFoundContent.links.map((link, index) => (
                  <PillCTA
                    key={link.href}
                    href={link.href}
                    variant={index === 0 ? "lime" : "outline"}
                    withArrow={index === 0}
                    className="w-full sm:w-auto"
                  >
                    {link.label}
                  </PillCTA>
                ))}
              </div>
            </div>
          </div>
        </SectionShell>

        <Footer locale={locale} />
      </main>
    </>
  );
}
