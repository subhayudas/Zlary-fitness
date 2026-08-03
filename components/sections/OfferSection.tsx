import { deliverableIcons } from "@/components/icons";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { FloatingMetricCard, LimeFeaturePanel } from "@/components/ui/panels";
import { PillCTA } from "@/components/ui/PillCTA";
import { Reveal } from "@/components/ui/Reveal";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading, Rule } from "@/components/ui/typography";
import { getConfirmedDeliverables, getDeliverables } from "@/content/deliverables";
import { getHome } from "@/content/home";
import { getMedia } from "@/content/media";
import { sectionIds } from "@/content/navigation";
import type { Locale } from "@/lib/i18n";

/**
 * The offer, in one block.
 *
 * This section replaces what used to be two separate blocks — "what you build"
 * and "what you receive" — plus the standalone nutrition and qualification
 * sections. Splitting the offer across four screens meant a visitor had to
 * assemble it themselves; here the promise, its three domains and the complete
 * list of what is included are all readable in a single pass.
 *
 * The list is a flat grid of equal tiles on purpose. Nothing is visually ranked
 * above anything else, so the eye reads titles first and only drops into a
 * description when one of them matters to it.
 *
 * Only `confirmedByCoach` items render. Anything switched off is invisible in
 * production and flagged in development.
 */
export function OfferSection({ locale }: { locale: Locale }) {
  const { offer } = getHome(locale);
  const media = getMedia(locale);
  const included = getConfirmedDeliverables(locale);
  const pending = getDeliverables(locale).filter((d) => !d.confirmedByCoach);

  return (
    <SectionShell id={sectionIds.offer} ariaLabelledBy="offer-title">
      {/* Header: the promise on the left, the proof photograph on the right. */}
      <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
        <Reveal className="lg:col-span-7 lg:pr-6">
          <p className="type-micro text-ink/40">{offer.label}</p>

          <EditorialHeading
            as="h2"
            id="offer-title"
            className="mt-5 text-balance"
          >
            {offer.heading}
          </EditorialHeading>

          <p className="measure-lg mt-5 text-pretty text-base leading-relaxed text-ink-muted md:mt-6 md:text-lg">
            {offer.body}
          </p>

          {/* The three domains the coaching covers — the whole scope in a line. */}
          <div className="mt-7 md:mt-8">
            <p className="type-micro text-ink/40">{offer.covers.label}</p>
            <dl className="mt-3.5 grid gap-px overflow-hidden rounded-card bg-ink/10 sm:grid-cols-3">
              {offer.covers.items.map((item) => (
                <div
                  key={item.name}
                  /* Below `sm` the pair reads as one line — name left, detail
                     right — rather than stacking. Three items stacked cost 220px
                     of phone scroll to say what fits in three rows of 43. From
                     `sm` the grid gives each its own column and they stack. */
                  className="flex items-baseline justify-between gap-4 bg-surface-pure px-5 py-3 sm:block sm:py-4"
                >
                  <dt className="text-[0.9375rem] leading-tight text-ink">
                    {item.name}
                  </dt>
                  {/* Sentence case, not the uppercase micro label: at this width
                      the tracking of `type-micro` forces a second line. */}
                  <dd className="shrink-0 text-right text-[0.8125rem] leading-tight text-ink/45 sm:mt-1.5 sm:text-left">
                    {item.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        <Reveal delay={100} className="relative lg:col-span-5">
          <div className="photo-zoom relative h-full">
            <MediaFrame
              asset={media.deliverablesLifestyle}
              sizes="(max-width: 1024px) 100vw, 40vw"
              placeholderTone="ink"
              placeholderDetail="minimal"
              /* `lg:min-h` is a floor, not a target: from `lg` the photo
                 matches whatever height the copy column ends up at. Keeping the
                 floor below that height stops it padding the section out. */
              className="h-[16rem] w-full sm:h-[22rem] lg:h-full lg:min-h-[24rem]"
            />

            <FloatingMetricCard
              label={offer.resultCard.label}
              tone="lime"
              className="mt-3 lg:absolute lg:bottom-5 lg:left-5 lg:right-5 lg:mt-0"
            >
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {offer.resultCard.items.map((item) => (
                  <li
                    key={item}
                    className="text-[0.9375rem] leading-tight text-ink-strong"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </FloatingMetricCard>
          </div>
        </Reveal>
      </div>

      {/* Everything included, as equal tiles. */}
      <div className="mt-8 grid gap-2.5 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4 lg:gap-3">
        {included.map((item, index) => {
          const Glyph =
            deliverableIcons[item.id as keyof typeof deliverableIcons] ??
            deliverableIcons["training-program"];

          return (
            <Reveal key={item.id} delay={(index % 4) * 50}>
              {/* Below `lg` the glyph sits beside the title rather than above
                  it. Stacked, eight cards cost about 400px of extra scroll on
                  a phone for decoration nobody reads. */}
              <div className="hairline flex h-full gap-3.5 rounded-card bg-surface p-4 sm:p-5 lg:block">
                <span
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-ink/35 lg:mt-0 lg:block"
                >
                  <Glyph className="size-6" />
                </span>
                <div>
                  {/* Reserved for two lines from `lg` up, where the four-column
                      grid makes some titles wrap and others not. Without it the
                      descriptions start at different heights across a row,
                      which is what breaks a list you are meant to scan. */}
                  <h3 className="text-pretty text-[1.0625rem] leading-snug tracking-[-0.02em] text-ink lg:mt-4 lg:min-h-[3rem]">
                    {item.title}
                  </h3>
                  {/* `leading-normal`, not `relaxed`: eight of these stacked on
                      a phone, and the looser line box adds a screen of scroll
                      across the grid for no gain at 14px. */}
                  <p className="mt-2 text-pretty text-[0.875rem] leading-normal text-ink-muted">
                    {item.body}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* One close, at the end of the scan. */}
      <Reveal delay={80}>
        <LimeFeaturePanel className="mt-2.5 flex flex-col items-start gap-5 p-6 sm:p-7 lg:mt-3 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:p-9">
          <EditorialHeading
            as="p"
            scale="sub"
            className="text-balance text-ink-strong"
          >
            {offer.closing.heading}
          </EditorialHeading>

          <PillCTA
            href={offer.closing.cta.href}
            variant="ink"
            withArrow
            event="primary_cta_click"
            eventProps={{ location: "offer" }}
            className="w-full shrink-0 sm:w-auto"
          >
            {offer.closing.cta.label}
          </PillCTA>
        </LimeFeaturePanel>
      </Reveal>

      {/* Development-only reminder; renders nothing in production. */}
      {process.env.NODE_ENV === "development" && pending.length > 0 ? (
        <>
          <Rule className="mt-10" />
          <p className="type-micro mt-8 rounded-card border border-dashed border-ink/25 p-4 normal-case tracking-normal text-ink/45">
            {pending.length} livrable(s) désactivé(s) en attente de confirmation :{" "}
            {pending.map((d) => d.title).join(", ")}.
          </p>
        </>
      ) : null}
    </SectionShell>
  );
}
