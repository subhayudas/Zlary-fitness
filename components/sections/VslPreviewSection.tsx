import { Play } from "@/components/icons";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { TrackedLink } from "@/components/ui/PillCTA";
import { Reveal } from "@/components/ui/Reveal";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading } from "@/components/ui/typography";
import { getHome } from "@/content/home";
import { getMedia } from "@/content/media";
import { sectionIds } from "@/content/navigation";
import { getVslContent } from "@/content/vsl";
import type { Locale } from "@/lib/i18n";

/**
 * VSL entry point.
 *
 * A photographic panel that echoes the hero — the same treatment bookends the
 * page. The whole panel is one link so the click target is the full card, with
 * a visible pill for the people who look for a button.
 */
export function VslPreviewSection({ locale }: { locale: Locale }) {
  const { vslPreview } = getHome(locale);
  const media = getMedia(locale);
  const vslContent = getVslContent(locale);

  return (
    <SectionShell
      id={sectionIds.vslPreview}
      padding="sm"
      ariaLabelledBy="vsl-preview-title"
    >
      <Reveal>
        <TrackedLink
          href={vslPreview.cta.href}
          event="vsl_open"
          eventProps={{ location: "homepage_preview" }}
          className="photo-zoom group relative block overflow-hidden rounded-media on-photo"
        >
          <MediaFrame
            asset={media.vslPoster}
            sizes="(max-width: 768px) 100vw, 92vw"
            scrim="full"
            placeholderTone="ink"
            rounded="media"
            className="h-[30rem] w-full sm:h-[34rem] lg:h-[38rem]"
          />

          <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-9 lg:p-12">
            <div className="flex items-start justify-between gap-6">
              <p className="type-micro text-lime">{vslPreview.label}</p>
              {vslContent.duration ? (
                <p className="type-micro text-white/60">{vslContent.duration}</p>
              ) : null}
            </div>

            {/* Circular play control, optically centred. */}
            <div className="flex flex-1 items-center justify-center">
              <span
                aria-hidden="true"
                className="flex size-16 items-center justify-center rounded-pill bg-lime text-ink-strong transition-transform duration-500 ease-editorial group-hover:scale-105 sm:size-20"
              >
                <Play className="ml-0.5 size-6 sm:size-7" />
              </span>
            </div>

            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
              <div>
                <EditorialHeading
                  as="h2"
                  id="vsl-preview-title"
                  scale="card"
                  className="max-w-[22ch] text-balance text-white"
                >
                  {vslPreview.heading}
                </EditorialHeading>

                <p className="measure mt-5 text-pretty text-[0.9375rem] leading-relaxed text-white/70">
                  {vslPreview.body}
                </p>
              </div>

              <div className="shrink-0">
                {/* Rendered as a span: it lives inside the card's own link. */}
                <span className="btn btn-white pointer-events-none w-full justify-center sm:w-auto">
                  {vslPreview.cta.label}
                </span>
              </div>
            </div>
          </div>
        </TrackedLink>
      </Reveal>
    </SectionShell>
  );
}
