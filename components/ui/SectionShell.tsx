import type { ReactNode } from "react";
import { PhotoBackdrop } from "@/components/ui/MediaFrame";
import type { MediaAsset } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * The large rounded section shell that every homepage block sits inside.
 *
 * Construction is always the same: a canvas-tinted outer bezel wrapping a
 * concentric inner core. Nothing here uses a drop shadow - depth comes from the
 * tonal step between canvas, bezel and core, plus a 1px inset ring.
 */

export type ShellTone = "white" | "surface" | "lime" | "ink" | "photo";

const TONE_CLASS: Record<ShellTone, string> = {
  white: "bg-surface-pure",
  surface: "bg-surface",
  lime: "bg-lime",
  ink: "bg-ink-strong text-surface-pure on-dark",
  photo: "bg-ink-strong on-photo",
};

const HIGHLIGHT_CLASS: Record<ShellTone, string> = {
  white: "bezel-core-light",
  surface: "bezel-core-light",
  lime: "bezel-core-light",
  ink: "bezel-core-dark",
  photo: "",
};

/** Internal card padding: 22–28px on mobile, 32–64px on desktop. */
const PADDING = {
  none: "",
  sm: "p-6 md:p-8 lg:p-10",
  md: "px-6 py-9 md:p-10 lg:p-14",
  lg: "px-6 py-10 md:p-12 lg:p-16 xl:p-20",
} as const;

export function SectionShell({
  children,
  id,
  tone = "white",
  padding = "lg",
  className,
  innerClassName,
  as: Tag = "section",
  ariaLabelledBy,
  ariaLabel,
  /**
   * Optional photographic texture behind the shell. Reserved for the `ink`
   * tone - the light tones have no contrast headroom. See `PhotoBackdrop`.
   */
  backdrop,
  backdropSizes,
}: {
  children: ReactNode;
  id?: string;
  tone?: ShellTone;
  padding?: keyof typeof PADDING;
  className?: string;
  innerClassName?: string;
  as?: "section" | "div" | "article" | "footer" | "aside";
  ariaLabelledBy?: string;
  ariaLabel?: string;
  backdrop?: MediaAsset;
  backdropSizes?: string;
}) {
  return (
    <Tag
      id={id}
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      className={cn("bezel", className)}
    >
      <div
        className={cn(
          "bezel-core",
          HIGHLIGHT_CLASS[tone],
          TONE_CLASS[tone],
          PADDING[padding],
          // `.bezel-core` already sets position:relative and overflow:hidden,
          // so the backdrop is clipped to the concentric radius for free.
          backdrop && "isolate",
          innerClassName,
        )}
      >
        {backdrop ? (
          <PhotoBackdrop asset={backdrop} sizes={backdropSizes} />
        ) : null}
        {backdrop ? (
          <div className="photo-backdrop-content">{children}</div>
        ) : (
          children
        )}
      </div>
    </Tag>
  );
}
