import { Play } from "@/components/icons";
import { SiteHeader } from "@/components/nav/SiteHeader";
import { BackgroundVideo } from "@/components/ui/BackgroundVideo";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { PillCTA } from "@/components/ui/PillCTA";
import { getHome } from "@/content/home";
import { getVideos } from "@/content/media";
import type { Locale } from "@/lib/i18n";

/**
 * Cinematic hero.
 *
 * One full-bleed silent video loop inside the rounded shell, navigation
 * overlaid at the top, copy anchored to the lower-left, secondary VSL control
 * lower-right.
 *
 * Height uses `svh` with a hard ceiling rather than `h-screen`: on mobile
 * `100vh` is taller than the visible viewport once the browser chrome is
 * counted, which pushes the CTA below the fold on exactly the devices most of
 * this traffic arrives from.
 *
 * `svh` and not `dvh`: `dvh` tracks the chrome as it collapses, so the shell
 * grows and the whole page reflows mid-scroll. It also measures the *expanded*
 * height in the Instagram and Facebook in-app browsers, whose toolbars never
 * collapse - so a `dvh` hero reserved more height there than was ever visible.
 * `svh` is the smallest the viewport ever gets, which is the only height the
 * CTA is guaranteed to fit inside.
 *
 * ---------------------------------------------------------------------------
 * THE RUNNER MUST NOT END UP BEHIND THE COPY
 * ---------------------------------------------------------------------------
 * She holds roughly the right third of the frame (the footage is mirrored to
 * put her there - see `videos.hero`), so three things are load-bearing and
 * should be re-checked together if any one of them is touched:
 *
 *   · `--hero-focus` pans the crop per breakpoint. On wide shells the frame is
 *     cropped horizontally, so anchoring it left pushes her further right,
 *     clear of the headline. On narrow shells the crop is severe and she is
 *     the whole picture, so it centres on her instead.
 *   · The headline is capped below `type-hero`. At the full display size
 *     "Transforme ton corps" alone runs to about 73% of the shell - straight
 *     through her - and no amount of panning recovers that.
 *   · The scrim is directional (`photo-scrim-hero`), weighted onto the copy
 *     column so her side of the frame is never dimmed to buy contrast that is
 *     only needed on the left.
 */
export function EditorialHero({ locale }: { locale: Locale }) {
  const { hero } = getHome(locale);
  const videos = getVideos(locale);

  return (
    <div className="page-shell pt-2 md:pt-3">
      <section aria-labelledby="hero-title" className="bezel">
        {/* min-height, never a fixed height: the shell clips its overflow, so a
            fixed height would cut off the trust line on short viewports or at
            large text sizes. The min() caps how tall it gets on big displays.

            --hero-focus frames the still and the video identically. Narrow
            shells crop hard, so they centre on the runner; from md up there is
            horizontal crop to spend and the frame is anchored left, which
            carries her clear of the copy column. */}
        <div className="bezel-core relative flex min-h-[78svh] flex-col [--hero-focus:76%_50%] md:min-h-[min(86svh,900px)] md:[--hero-focus:0%_50%]">
          {/* The still. Server-rendered, so the frame is never empty: it is
              what paints first, what a reduced-motion visitor keeps, and what
              carries the alt text for the whole shell. */}
          <MediaFrame
            asset={videos.hero.poster}
            priority
            sizes="100vw"
            rounded="inherit"
            placeholderTone="ink"
            position="fill"
            objectPosition="var(--hero-focus)"
          />

          {/* The loop, layered over the still it was lifted from. */}
          <BackgroundVideo
            asset={videos.hero}
            className="rounded-[inherit]"
            style={{ objectPosition: "var(--hero-focus)" }}
          />

          {/* Above the footage, below the copy. */}
          <div className="photo-scrim-hero rounded-[inherit]" />

          <div className="relative z-10 flex min-h-full flex-1 flex-col on-photo">
            <SiteHeader locale={locale} variant="overlay" />

            {/* Vertical technical label on the left edge - widescreen only.
                It owns the left gutter; the copy below indents past it at xl. */}
            <div className="pointer-events-none absolute left-6 top-1/2 hidden -translate-y-1/2 xl:block">
              <p
                className="type-micro text-white/55"
                style={{ writingMode: "vertical-rl" }}
              >
                {hero.chip.label} - {hero.chip.value}
                <span className="mx-3 inline-block h-px w-6 align-middle bg-white/30" />
                {hero.chip.detail}
              </p>
            </div>

            <div className="mt-auto flex flex-col gap-8 px-5 pb-7 pt-16 sm:px-7 md:flex-row md:items-end md:justify-between md:gap-12 md:px-9 md:pb-9 lg:px-11 lg:pb-11 xl:pl-20">
              {/* Lower-left: the whole argument. Narrows from md up so the
                  block as a whole stays out of the runner's third. */}
              <div className="max-w-[52rem] md:max-w-[40rem] xl:max-w-[44rem]">
                <p className="type-micro text-lime">{hero.eyebrow}</p>

                {/* Capped below `type-hero` from md up, where the runner is in
                    shot. At the full scale the first line alone reaches ~73% of
                    the shell and lands on her; this holds every line inside the
                    left 59%. `max-w` is in `em` so it tracks the font size
                    rather than fighting it, and keeps the same three-line break
                    at every width. */}
                <h1
                  id="hero-title"
                  className="type-hero mt-5 text-balance text-white md:mt-7 md:max-w-[9.6em] md:text-[clamp(2.875rem,5.1vw,5.25rem)]"
                >
                  {/* The trailing space matters: without it the spans
                      concatenate in the accessibility tree and in search
                      snippets ("ton corpssans mettre"). It collapses visually
                      because each span is a block. */}
                  {hero.headlineLines.map((line, index) => (
                    <span key={line} className="block">
                      {line}
                      {index < hero.headlineLines.length - 1 ? " " : null}
                    </span>
                  ))}
                </h1>

                <p className="measure mt-6 text-pretty text-[0.9375rem] leading-relaxed text-white/80 md:mt-8 md:text-base">
                  {hero.support}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-10">
                  <PillCTA
                    href={hero.primaryCta.href}
                    variant="lime"
                    withArrow
                    event="primary_cta_click"
                    eventProps={{ location: "hero" }}
                    className="w-full sm:w-auto"
                  >
                    {hero.primaryCta.label}
                  </PillCTA>

                  {/* On mobile the VSL control joins the CTA stack. */}
                  <PillCTA
                    href={hero.secondaryCta.href}
                    variant="glass"
                    event="secondary_cta_click"
                    eventProps={{ location: "hero_mobile" }}
                    className="w-full sm:hidden"
                  >
                    <Play className="size-3.5" />
                    {hero.secondaryCta.label}
                  </PillCTA>
                </div>

                <p className="mt-7 text-[0.8125rem] leading-relaxed text-white/55 md:mt-8">
                  {hero.trustLine}
                </p>
              </div>

              {/* Lower-right: the VSL entry point. `nowrap` is safe here -
                  this instance is desktop-only, and mobile gets the separate
                  full-width control stacked with the primary CTA above. */}
              <div className="hidden shrink-0 sm:block">
                <PillCTA
                  href={hero.secondaryCta.href}
                  variant="glass"
                  event="secondary_cta_click"
                  eventProps={{ location: "hero" }}
                  className="whitespace-nowrap"
                >
                  <Play className="size-3.5" />
                  {hero.secondaryCta.label}
                </PillCTA>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
