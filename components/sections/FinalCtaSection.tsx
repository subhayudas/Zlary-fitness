import { LimeFeaturePanel } from "@/components/ui/panels";
import { PillCTA } from "@/components/ui/PillCTA";
import { Reveal } from "@/components/ui/Reveal";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading } from "@/components/ui/typography";
import { getHome } from "@/content/home";
import { sectionIds } from "@/content/navigation";
import type { Locale } from "@/lib/i18n";

/**
 * Closing call to action.
 *
 * No countdown, no "3 places left", no fake waiting list. The scarcity on a
 * coaching page is real and does not need to be manufactured — a fabricated
 * timer is the fastest way to make a premium page read as a funnel template.
 */
export function FinalCtaSection({ locale }: { locale: Locale }) {
  const { finalCta } = getHome(locale);

  return (
    <SectionShell id={sectionIds.apply} padding="sm" ariaLabelledBy="final-cta-title">
      <LimeFeaturePanel className="px-6 py-16 text-center sm:px-10 md:py-24 lg:py-32">
        <Reveal className="mx-auto max-w-3xl">
          <EditorialHeading
            as="h2"
            id="final-cta-title"
            className="text-balance text-ink-strong"
          >
            {finalCta.heading}
          </EditorialHeading>

          <p className="mx-auto mt-8 max-w-[46ch] text-pretty text-[0.9375rem] leading-relaxed text-ink/70 md:text-lg">
            {finalCta.body}
          </p>

          <div className="mt-10 flex justify-center md:mt-12">
            <PillCTA
              href={finalCta.cta.href}
              variant="white"
              withArrow
              event="primary_cta_click"
              eventProps={{ location: "final_cta" }}
              className="w-full sm:w-auto"
            >
              {finalCta.cta.label}
            </PillCTA>
          </div>

          <p className="mt-7 text-[0.8125rem] leading-relaxed text-ink/50">
            {finalCta.note}
          </p>
        </Reveal>
      </LimeFeaturePanel>
    </SectionShell>
  );
}
