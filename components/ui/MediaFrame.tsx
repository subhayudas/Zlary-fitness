import Image from "next/image";
import type { MediaAsset } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * Renders a photograph, or — while the photograph has not been delivered — an
 * art-directed placeholder that states the shooting brief.
 *
 * It never renders a broken <img>, and it never substitutes stock imagery for
 * the real thing. Swap `src` in `content/media.ts` and this component starts
 * rendering the photo with no other change.
 *
 * The parent element controls the aspect ratio; the image always fills it.
 */

export function MediaFrame({
  asset,
  className,
  imageClassName,
  priority = false,
  sizes = "100vw",
  /** Renders the photo-scrim gradient behind overlaid text. */
  scrim,
  children,
  rounded = "media",
  /**
   * Which surface the placeholder uses while the photo is missing.
   *
   * Must be "ink" wherever light text is overlaid on the frame: a light
   * placeholder under a scrim leaves white copy on a pale grey field, which is
   * unreadable. With "ink" the hero stays legible before any photo is shot.
   */
  placeholderTone = "canvas",
  /**
   * How the frame positions itself.
   *
   * An explicit prop rather than something the caller overrides via
   * `className`: Tailwind emits `.relative` after `.absolute`, so passing
   * `absolute` in `className` would silently lose to the base class and
   * collapse the frame to zero height.
   */
  position = "relative",
  /**
   * How much of the shooting brief the placeholder shows.
   *
   * Defaults to the full brief, and to a single marker for `fill` frames.
   * Pass "minimal" explicitly for any frame that carries floating cards or
   * other overlays, otherwise the brief and the overlay collide.
   */
  placeholderDetail,
  /**
   * Overrides `asset.objectPosition`.
   *
   * Exists for the one case the asset field cannot express: framing that has to
   * change between breakpoints. Pass a `var(--…)` reference and set the
   * variable with responsive classes on an ancestor — that keeps a single
   * source of truth when something else (the hero's video layer) must stay
   * framed identically to the image.
   */
  objectPosition,
}: {
  asset: MediaAsset;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  scrim?: "full" | "soft" | "none";
  children?: React.ReactNode;
  rounded?: "media" | "card" | "none" | "inherit";
  placeholderTone?: "canvas" | "ink";
  position?: "relative" | "fill";
  placeholderDetail?: "full" | "minimal";
  objectPosition?: string;
}) {
  const radiusClass =
    rounded === "media"
      ? "rounded-media"
      : rounded === "card"
        ? "rounded-card"
        : rounded === "inherit"
          ? "rounded-[inherit]"
          : "";

  return (
    <div
      className={cn(
        "isolate overflow-hidden bg-canvas",
        position === "fill" ? "absolute inset-0 h-full w-full" : "relative",
        radiusClass,
        className,
      )}
    >
      {asset.src ? (
        <Image
          src={asset.src}
          alt={asset.alt}
          fill
          priority={priority}
          // Only the hero is eager; everything else waits until it is near view.
          loading={priority ? undefined : "lazy"}
          sizes={sizes}
          quality={82}
          className={cn(
            "photo-zoom-target absolute inset-0 h-full w-full object-cover",
            imageClassName,
          )}
          style={{ objectPosition: objectPosition ?? asset.objectPosition }}
        />
      ) : (
        <MediaPlaceholder
          asset={asset}
          tone={placeholderTone}
          // A `fill` frame is a backdrop with copy layered on top, so the full
          // shooting brief would collide with the page content. Those slots get
          // a single unobtrusive marker instead; the brief lives in media.ts.
          detail={placeholderDetail ?? (position === "fill" ? "minimal" : "full")}
        />
      )}

      {/* The scrim exists to protect text over a photo. With no photo the ink
          placeholder already provides the contrast, so it is skipped. */}
      {asset.src && scrim === "full" ? <div className="photo-scrim" /> : null}
      {asset.src && scrim === "soft" ? <div className="photo-scrim-soft" /> : null}

      {children}
    </div>
  );
}

/**
 * The placeholder itself.
 *
 * Deliberately informative: it names the subject to shoot, the orientation, the
 * export size and where the focal point must sit, so a photo can be delivered
 * without anyone reading the code.
 */
export function MediaPlaceholder({
  asset,
  className,
  tone = "canvas",
  detail = "full",
}: {
  asset: MediaAsset;
  className?: string;
  tone?: "canvas" | "ink";
  detail?: "full" | "minimal";
}) {
  const dark = tone === "ink";

  /**
   * Backdrop slots: surface only, plus one marker parked on the right edge —
   * the one region of a full-bleed composition that stays free of copy.
   */
  if (detail === "minimal") {
    return (
      <div
        role="presentation"
        className={cn(
          "absolute inset-0",
          dark ? "bg-ink-strong" : "media-placeholder",
          className,
        )}
      >
        <span
          className={cn(
            "type-micro absolute right-5 top-1/2 hidden -translate-y-1/2 rounded-pill px-3 py-1.5 md:inline-flex",
            dark ? "bg-white/10 text-white/55" : "bg-ink/8 text-ink/50",
          )}
        >
          Image à fournir · {asset.recommended}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col justify-between gap-6 p-5 sm:p-7",
        dark ? "bg-ink-strong" : "media-placeholder",
        className,
      )}
      // The brief is presentational scaffolding, not page content.
      role="presentation"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="type-micro rounded-pill bg-lime px-3 py-1.5 text-ink-strong">
          Image à fournir
        </span>
        <span
          className={cn("type-micro", dark ? "text-white/45" : "text-ink/40")}
        >
          {asset.recommended}
        </span>
      </div>

      <p
        className={cn(
          "measure-sm text-pretty text-[0.9375rem] leading-snug sm:text-base",
          dark ? "text-white/60" : "text-ink/70",
        )}
      >
        {asset.brief}
      </p>

      <div className="space-y-2">
        <div className={dark ? "rule-light" : "rule"} />
        <dl className="flex flex-wrap gap-x-6 gap-y-1">
          <div className="flex gap-2">
            <dt className={cn("type-micro", dark ? "text-white/35" : "text-ink/35")}>
              Cadrage
            </dt>
            <dd className={cn("type-micro", dark ? "text-white/60" : "text-ink/60")}>
              {asset.orientation === "portrait"
                ? "Vertical"
                : asset.orientation === "landscape"
                  ? "Horizontal"
                  : "Carré"}
            </dd>
          </div>
          <div className="flex min-w-0 gap-2">
            <dt
              className={cn(
                "type-micro shrink-0",
                dark ? "text-white/35" : "text-ink/35",
              )}
            >
              Point focal
            </dt>
            <dd
              className={cn(
                "type-micro truncate",
                dark ? "text-white/60" : "text-ink/60",
              )}
            >
              {asset.focal}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

/**
 * A photograph used as surface texture behind copy, on deep-petroleum panels.
 *
 * This is not a content image and must never carry meaning: it is `aria-hidden`
 * with empty alt text, it sits at low opacity under a mask, and if the file is
 * missing the component renders nothing at all — the panel simply goes back to
 * flat ink. That is the whole contract. Anything a reader needs to see belongs
 * in a `MediaFrame`, not here.
 *
 * The parent must establish a stacking context (`relative`, `overflow-hidden`)
 * and put its own content inside `.photo-backdrop-content`. `Panel` and
 * `SectionShell` do both automatically when given a `backdrop`.
 */
export function PhotoBackdrop({
  asset,
  sizes = "100vw",
  /** `tall` anchors the image to the top with a longer fade — full-bleed slots. */
  variant = "default",
  className,
}: {
  asset: MediaAsset;
  sizes?: string;
  variant?: "default" | "tall";
  className?: string;
}) {
  if (!asset.src) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "photo-backdrop",
        variant === "tall" && "photo-backdrop-tall",
        className,
      )}
    >
      <Image
        src={asset.src}
        alt=""
        fill
        loading="lazy"
        sizes={sizes}
        // Lower than content photography: it is composited at 28% opacity
        // behind a mask, so detail beyond this point cannot be perceived.
        quality={55}
        style={{ objectPosition: asset.objectPosition }}
      />
    </div>
  );
}

/**
 * A media panel wrapped in the double-bezel construction.
 * Used where photography needs to read as a discrete object in a bento grid.
 */
export function PhotoPanel({
  asset,
  className,
  innerClassName,
  priority,
  sizes,
  scrim,
  children,
  placeholderTone,
  placeholderDetail,
}: {
  asset: MediaAsset;
  className?: string;
  innerClassName?: string;
  priority?: boolean;
  sizes?: string;
  scrim?: "full" | "soft" | "none";
  children?: React.ReactNode;
  placeholderTone?: "canvas" | "ink";
  placeholderDetail?: "full" | "minimal";
}) {
  return (
    <div
      className={cn(
        "photo-zoom rounded-[calc(var(--radius-media)+5px)] bg-canvas-deep p-[5px] hairline-bezel",
        className,
      )}
    >
      <MediaFrame
        asset={asset}
        className={cn("h-full w-full", innerClassName)}
        priority={priority}
        sizes={sizes}
        scrim={scrim}
        placeholderTone={placeholderTone}
        placeholderDetail={placeholderDetail}
      >
        {children}
      </MediaFrame>
    </div>
  );
}
