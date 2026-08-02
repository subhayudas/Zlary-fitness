import { deliverableIcons } from "@/components/icons";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { LimeFeaturePanel } from "@/components/ui/panels";
import { Reveal } from "@/components/ui/Reveal";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading, Rule } from "@/components/ui/typography";
import { getConfirmedDeliverables, getDeliverables } from "@/content/deliverables";
import { getHome } from "@/content/home";
import { getMedia } from "@/content/media";
import { sectionIds } from "@/content/navigation";
import type { Locale } from "@/lib/i18n";

/**
 * What clients receive.
 *
 * Bento header (heading / lime feature / photograph), then the deliverables as
 * a hairline-separated two-column list rather than a grid of identical cards.
 *
 * Only `confirmedByCoach` items render. Anything switched off is invisible in
 * production and flagged in development.
 */
export function DeliverablesSection({ locale }: { locale: Locale }) {
  const { deliverables } = getHome(locale);
  const media = getMedia(locale);
  const confirmedDeliverables = getConfirmedDeliverables(locale);
  const pending = getDeliverables(locale).filter((d) => !d.confirmedByCoach);

  return (
    <SectionShell id={sectionIds.deliverables} ariaLabelledBy="deliverables-title">
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-4">
        {/* Oversized heading. */}
        <Reveal className="lg:col-span-5 lg:pr-8">
          <p className="type-micro text-ink/40">{deliverables.eyebrow}</p>

          <EditorialHeading
            as="h2"
            id="deliverables-title"
            className="mt-6 text-balance"
          >
            {deliverables.heading}
          </EditorialHeading>

          <p className="measure mt-7 text-pretty text-[0.9375rem] leading-relaxed text-ink-muted md:mt-9 md:text-base">
            {deliverables.body}
          </p>
        </Reveal>

        {/* Tall lime feature card. */}
        <Reveal delay={90} className="lg:col-span-3 lg:col-start-7">
          <LimeFeaturePanel className="flex h-full flex-col justify-between gap-10 p-7 sm:p-9">
            <span
              aria-hidden="true"
              className="flex size-11 items-center justify-center rounded-pill bg-ink-strong text-lime"
            >
              <deliverableIcons.adjustments className="size-5" />
            </span>
            <div>
              <h3 className="text-pretty text-xl leading-snug tracking-[-0.022em] text-ink-strong sm:text-2xl">
                {deliverables.featured.title}
              </h3>
              <p className="mt-4 text-pretty text-[0.9375rem] leading-relaxed text-ink/70">
                {deliverables.featured.body}
              </p>
            </div>
          </LimeFeaturePanel>
        </Reveal>

        {/* Photographic panel. */}
        <Reveal delay={140} className="lg:col-span-3 lg:col-start-10">
          <div className="photo-zoom h-full">
            <MediaFrame
              asset={media.deliverablesLifestyle}
              sizes="(max-width: 1024px) 100vw, 24vw"
              className="h-[18rem] w-full sm:h-[24rem] lg:h-full lg:min-h-[24rem]"
            />
          </div>
        </Reveal>
      </div>

      {/* The list itself. */}
      <div className="mt-14 grid md:mt-20 md:grid-cols-2 md:gap-x-12 lg:gap-x-20">
        {confirmedDeliverables.map((item, index) => {
          const Glyph =
            deliverableIcons[item.id as keyof typeof deliverableIcons] ??
            deliverableIcons["training-program"];

          return (
            <Reveal key={item.id} delay={(index % 2) * 60}>
              <div>
                <Rule />
                <div className="flex gap-5 py-6 md:py-8">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-ink/35"
                  >
                    <Glyph className="size-6" />
                  </span>
                  <div>
                    <h3 className="text-pretty text-lg leading-snug tracking-[-0.02em] text-ink">
                      {item.title}
                    </h3>
                    <p className="measure mt-3 text-pretty text-[0.9375rem] leading-relaxed text-ink-muted">
                      {item.body}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Rule />

      {/* Development-only reminder; renders nothing in production. */}
      {process.env.NODE_ENV === "development" && pending.length > 0 ? (
        <p className="type-micro mt-8 rounded-card border border-dashed border-ink/25 p-4 normal-case tracking-normal text-ink/45">
          {pending.length} livrable(s) désactivé(s) en attente de confirmation :{" "}
          {pending.map((d) => d.title).join(", ")}.
        </p>
      ) : null}
    </SectionShell>
  );
}
