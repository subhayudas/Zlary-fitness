import { MediaFrame } from "@/components/ui/MediaFrame";
import { Panel } from "@/components/ui/panels";
import { PillCTA } from "@/components/ui/PillCTA";
import { Reveal } from "@/components/ui/Reveal";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading } from "@/components/ui/typography";
import { getHome } from "@/content/home";
import { backdrops, getMedia } from "@/content/media";
import { sectionIds } from "@/content/navigation";
import type { Locale } from "@/lib/i18n";

/**
 * Nutrition philosophy — the one deep-petroleum block on the homepage.
 *
 * This is the only centred section on the page. It earns that because it is a
 * single statement rather than a layout, and the tonal shift is what makes it
 * land after five white shells. A coaching backdrop behind the ink keeps that
 * shift from reading as an empty rectangle without competing with the copy.
 *
 * The copy stays educational throughout: no clinical or medical claims.
 */
export function NutritionSection({ locale }: { locale: Locale }) {
  const { nutrition } = getHome(locale);
  const media = getMedia(locale);

  return (
    <SectionShell
      id={sectionIds.nutrition}
      padding="sm"
      ariaLabelledBy="nutrition-title"
    >
      <Panel
        tone="ink"
        className="px-6 py-14 sm:px-10 md:py-20 lg:py-28"
        backdrop={backdrops.coaching}
        backdropSizes="(max-width: 768px) 100vw, 92vw"
      >
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="type-micro text-lime">{nutrition.eyebrow}</p>

          <EditorialHeading
            as="h2"
            id="nutrition-title"
            className="mt-7 text-balance text-white"
          >
            {nutrition.heading}
          </EditorialHeading>

          <p className="mx-auto mt-8 max-w-[52ch] text-pretty text-[0.9375rem] leading-relaxed text-white/70 md:mt-10 md:text-lg">
            {nutrition.body}
          </p>

          <p className="mx-auto mt-6 max-w-[48ch] text-pretty text-[0.9375rem] leading-relaxed text-white/55">
            {nutrition.secondary}
          </p>

          <div className="mt-10 flex justify-center md:mt-12">
            <PillCTA
              href={nutrition.cta.href}
              variant="white"
              withArrow
              event="primary_cta_click"
              eventProps={{ location: "nutrition" }}
              className="w-full sm:w-auto"
            >
              {nutrition.cta.label}
            </PillCTA>
          </div>
        </Reveal>

        {/* Three pillars, separated by hairlines rather than boxed in cards. */}
        <Reveal delay={100}>
          <dl className="mx-auto mt-14 grid max-w-4xl gap-px overflow-hidden rounded-card bg-white/12 sm:grid-cols-3 md:mt-20">
            {nutrition.pillars.map((pillar) => (
              <div key={pillar.name} className="bg-ink-strong px-6 py-7 text-center">
                <dt className="text-lg tracking-[-0.02em] text-white">
                  {pillar.name}
                </dt>
                <dd className="mt-2.5 text-[0.875rem] leading-relaxed text-white/55">
                  {pillar.detail}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Panel>

      {/* Everyday-life context strip. */}
      <Reveal delay={80}>
        <div className="photo-zoom mt-3 md:mt-4">
          <MediaFrame
            asset={media.nutritionContext}
            sizes="(max-width: 768px) 100vw, 92vw"
            className="h-[13rem] w-full sm:h-[17rem] md:h-[21rem]"
          />
        </div>
      </Reveal>
    </SectionShell>
  );
}
