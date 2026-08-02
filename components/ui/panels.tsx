import type { ReactNode } from "react";
import { PhotoBackdrop } from "@/components/ui/MediaFrame";
import type { MediaAsset } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * Inner panels used *inside* a SectionShell.
 *
 * These carry the smaller radius of the concentric scale (`--radius-media` /
 * `--radius-card`) so they visually follow the curve of their parent shell.
 */

export type PanelTone = "white" | "surface" | "canvas" | "lime" | "ink";

const TONE_CLASS: Record<PanelTone, string> = {
  white: "bg-surface-pure text-ink",
  surface: "bg-surface text-ink",
  canvas: "bg-canvas text-ink",
  lime: "bg-lime text-ink-strong",
  ink: "bg-ink-strong text-surface-pure on-dark",
};

const RING_CLASS: Record<PanelTone, string> = {
  white: "hairline",
  surface: "hairline",
  canvas: "hairline",
  lime: "",
  ink: "",
};

/**
 * A restrained double-bezel card: canvas enclosure + concentric core.
 * Use for cards that need to feel like physical objects (metric panels,
 * pull-quotes, floating information).
 */
export function DoubleBezelCard({
  children,
  tone = "white",
  className,
  innerClassName,
  as: Tag = "div",
}: {
  children: ReactNode;
  tone?: PanelTone;
  className?: string;
  innerClassName?: string;
  as?: "div" | "article" | "aside" | "li";
}) {
  return (
    <Tag
      className={cn(
        "rounded-[calc(var(--radius-media)+5px)] bg-canvas-deep p-[5px] hairline-bezel",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-media",
          TONE_CLASS[tone],
          RING_CLASS[tone],
          innerClassName,
        )}
      >
        {children}
      </div>
    </Tag>
  );
}

/** Flat panel — no bezel. The workhorse for bento cells. */
export function Panel({
  children,
  tone = "white",
  className,
  radius = "media",
  as: Tag = "div",
  /**
   * Optional photographic texture behind the panel. Ink panels only — the
   * light tones have no contrast headroom to spend. See `PhotoBackdrop`.
   */
  backdrop,
  backdropSizes,
  /**
   * Classes for the wrapper a `backdrop` introduces around `children`.
   *
   * That wrapper sits between the panel and its content, so any layout the
   * children depend on — `flex flex-col` for an `mt-auto` footer, say — has to
   * move here or it stops applying. Ignored when there is no backdrop.
   */
  contentClassName,
}: {
  children: ReactNode;
  tone?: PanelTone;
  className?: string;
  radius?: "media" | "card" | "chip";
  as?: "div" | "article" | "aside" | "li" | "section";
  backdrop?: MediaAsset;
  backdropSizes?: string;
  contentClassName?: string;
}) {
  return (
    <Tag
      className={cn(
        radius === "media"
          ? "rounded-media"
          : radius === "card"
            ? "rounded-card"
            : "rounded-chip",
        TONE_CLASS[tone],
        RING_CLASS[tone],
        // The backdrop is absolutely positioned and must be clipped to the
        // panel's own radius, so the panel becomes its containing block.
        backdrop && "relative isolate overflow-hidden",
        className,
      )}
    >
      {backdrop ? (
        <PhotoBackdrop asset={backdrop} sizes={backdropSizes} />
      ) : null}
      {backdrop ? (
        <div className={cn("photo-backdrop-content", contentClassName)}>
          {children}
        </div>
      ) : (
        children
      )}
    </Tag>
  );
}

/**
 * Acid-lime feature panel. Deliberately limited to one or two per page —
 * lime is an accent, not a background.
 */
export function LimeFeaturePanel({
  children,
  className,
  soft = false,
}: {
  children: ReactNode;
  className?: string;
  soft?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-media text-ink-strong",
        soft ? "bg-lime-soft" : "bg-lime",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Small floating information card designed to sit over photography.
 * Opaque rather than glassy: legibility over any frame of a photo beats a
 * fashionable blur, and it keeps the paint cost near zero.
 */
export function FloatingMetricCard({
  label,
  children,
  tone = "white",
  className,
}: {
  label?: string;
  children: ReactNode;
  tone?: "white" | "lime" | "ink";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card p-4 sm:p-5",
        tone === "lime"
          ? "bg-lime text-ink-strong"
          : tone === "ink"
            ? "bg-ink-strong text-surface-pure on-dark"
            : "bg-surface-pure text-ink",
        className,
      )}
    >
      {label ? (
        <p
          className={cn(
            "type-micro mb-3",
            tone === "ink" ? "text-white/55" : "text-ink/50",
          )}
        >
          {label}
        </p>
      ) : null}
      {children}
    </div>
  );
}

/** Small index chip, e.g. "01/04", used on photographic panels. */
export function IndexChip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "type-micro inline-flex items-center rounded-pill bg-black/30 px-3 py-1.5 text-white/90 backdrop-blur-[2px]",
        className,
      )}
    >
      {children}
    </span>
  );
}
