import { MediaFrame } from "@/components/ui/MediaFrame";
import { FloatingMetricCard, IndexChip, LimeFeaturePanel } from "@/components/ui/panels";
import { PillCTA } from "@/components/ui/PillCTA";
import { Reveal } from "@/components/ui/Reveal";
import { EditorialHeading, Rule } from "@/components/ui/typography";
import { SectionShell } from "@/components/ui/SectionShell";
import { getHome } from "@/content/home";
import { getMedia } from "@/content/media";
import { sectionIds } from "@/content/navigation";
import type { Locale } from "@/lib/i18n";

/**
 * Outcomes bento: lime argument panel on the left, photography with floating
 * information on the right.
 *
 * The floating cards are a single DOM instance. Below `md` they sit in normal
 * flow underneath the photograph; from `md` up the same wrapper becomes an
 * absolute overlay. No duplicated markup, and nothing overlaps a touch target
 * on a phone.
 */
export function OutcomesSection({ locale }: { locale: Locale }) {
  const { outcomes } = getHome(locale);
  const media = getMedia(locale);

  return (
    <SectionShell
      id={sectionIds.outcomes}
      padding="sm"
      ariaLabelledBy="outcomes-title"
    >
      <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
        {/* Left — the claim. */}
        <Reveal className="lg:col-span-5">
          <LimeFeaturePanel className="flex h-full flex-col p-7 sm:p-9 lg:p-11 xl:p-14">
            <p className="type-micro text-ink/55">{outcomes.label}</p>

            <EditorialHeading
              as="h2"
              id="outcomes-title"
              scale="card"
              className="mt-8 text-balance text-ink-strong lg:mt-auto lg:pt-16"
            >
              {outcomes.heading}
            </EditorialHeading>

            <p className="measure mt-6 text-pretty text-[0.9375rem] leading-relaxed text-ink/70 md:text-base">
              {outcomes.body}
            </p>

            <div className="mt-9 lg:mt-11">
              <PillCTA
                href={`#${outcomes.cta.targetId}`}
                variant="white"
                withArrow
                event="secondary_cta_click"
                eventProps={{ location: "outcomes" }}
                className="w-full sm:w-auto"
              >
                {outcomes.cta.label}
              </PillCTA>
            </div>
          </LimeFeaturePanel>
        </Reveal>

        {/* Right — photography with floating information. */}
        <Reveal delay={100} className="relative lg:col-span-7">
          <div className="photo-zoom relative flex h-full flex-col">
            <MediaFrame
              asset={media.outcomesTraining}
              sizes="(max-width: 1024px) 100vw, 58vw"
              scrim="soft"
              placeholderTone="ink"
              placeholderDetail="minimal"
              className="h-[24rem] flex-1 sm:h-[30rem] lg:h-auto lg:min-h-[34rem]"
            >
              <IndexChip className="absolute left-4 top-4 sm:left-5 sm:top-5">
                {outcomes.imageIndex}
              </IndexChip>
            </MediaFrame>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:pointer-events-none lg:absolute lg:inset-0 lg:mt-0 lg:block">
              <FloatingMetricCard
                label={outcomes.resultCard.label}
                tone="lime"
                className="lg:pointer-events-auto lg:absolute lg:right-5 lg:top-5 lg:w-[15.5rem]"
              >
                <ul className="space-y-2.5">
                  {outcomes.resultCard.items.map((item) => (
                    <li
                      key={item}
                      className="text-[0.9375rem] leading-tight text-ink-strong"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </FloatingMetricCard>

              <FloatingMetricCard
                label={outcomes.routineCard.label}
                className="lg:pointer-events-auto lg:absolute lg:bottom-5 lg:left-5 lg:w-[18rem]"
              >
                <ul>
                  {outcomes.routineCard.items.map((item, index) => (
                    <li key={item.name}>
                      {index > 0 ? <Rule className="my-3" /> : null}
                      <div>
                        <span className="block text-[0.9375rem] leading-tight text-ink">
                          {item.name}
                        </span>
                        <span className="type-micro mt-1.5 block text-ink/45">
                          {item.detail}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </FloatingMetricCard>
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
