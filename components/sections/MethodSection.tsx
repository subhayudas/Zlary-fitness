import { MethodTimeline } from "@/components/MethodTimeline";
import { PillCTA } from "@/components/ui/PillCTA";
import { Reveal } from "@/components/ui/Reveal";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading, Rule } from "@/components/ui/typography";
import { getHome } from "@/content/home";
import { sectionIds } from "@/content/navigation";
import type { Locale } from "@/lib/i18n";

/**
 * The coaching method.
 *
 * The heading column is sticky on large screens so the four steps read against
 * a fixed statement — the cheapest way to make a long column feel art-directed
 * without touching scroll position.
 */
export function MethodSection({ locale }: { locale: Locale }) {
  const { method } = getHome(locale);

  return (
    <SectionShell id={sectionIds.method} ariaLabelledBy="method-title">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <p className="type-micro text-ink/40">{method.eyebrow}</p>

              <EditorialHeading
                as="h2"
                id="method-title"
                className="mt-6 text-balance"
              >
                {method.heading}
              </EditorialHeading>

              <p className="measure-sm mt-6 text-pretty text-[0.9375rem] leading-relaxed text-ink-muted md:text-base">
                {method.body}
              </p>

              <Rule className="my-8" />

              <PillCTA
                href={method.cta.href}
                variant="ink"
                withArrow
                event="primary_cta_click"
                eventProps={{ location: "method" }}
                className="w-full sm:w-auto"
              >
                {method.cta.label}
              </PillCTA>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <MethodTimeline locale={locale} />
        </div>
      </div>
    </SectionShell>
  );
}
