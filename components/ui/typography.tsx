import { Fragment, type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Editorial typography primitives.
 *
 * `EditorialHeading` takes an explicit `as` so heading *level* (document
 * structure) stays independent from heading *size* (visual hierarchy) - a
 * section can carry an <h2> rendered at card scale without breaking the outline.
 */

type Scale = "hero" | "section" | "card" | "sub";

const SCALE_CLASS: Record<Scale, string> = {
  hero: "type-hero",
  section: "type-section",
  card: "type-card",
  sub: "type-sub",
};

export function EditorialHeading({
  as: Tag = "h2",
  scale = "section",
  className,
  children,
  id,
}: {
  as?: ElementType;
  scale?: Scale;
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <Tag id={id} className={cn(SCALE_CLASS[scale], className)}>
      {children}
    </Tag>
  );
}

/**
 * Tiny uppercase technical label.
 * A leading rule is optional - used where the label anchors a column.
 */
export function EyebrowLabel({
  children,
  className,
  withRule = false,
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  withRule?: boolean;
  as?: ElementType;
}) {
  return (
    <Tag className={cn("type-micro flex items-center gap-3", className)}>
      {withRule ? (
        <span
          aria-hidden="true"
          className="h-px w-8 shrink-0 bg-current opacity-30"
        />
      ) : null}
      <span>{children}</span>
    </Tag>
  );
}

/** Renders headline copy as separate lines on large screens only. */
export function BalancedLines({
  lines,
  className,
}: {
  lines: readonly string[];
  className?: string;
}) {
  return (
    <span className={className}>
      {lines.map((line, index) => (
        <span key={line} className="block">
          {line}
          {index < lines.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

/**
 * Splits a line into per-word atoms so a heading can assemble word by word.
 *
 * Layout-neutral on purpose: the words are `inline-block`, the spaces between
 * them stay real text nodes - so the line breaks exactly where it broke as
 * plain text - and only opacity and transform ever change. The heading
 * therefore occupies the same box whether or not the animation has played.
 *
 * The animation itself lives in `.stagger-word` and is driven by the enclosing
 * `.reveal[data-visible="true"]`, so this stays a server component.
 */
export function StaggeredWords({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, index) => (
        <Fragment key={`${index}-${word}`}>
          {index > 0 ? " " : null}
          <span
            className="stagger-word"
            style={{ "--stagger-index": index } as CSSProperties}
          >
            {word}
          </span>
        </Fragment>
      ))}
    </span>
  );
}

export function Rule({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "light" | "strong";
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        tone === "light" ? "rule-light" : tone === "strong" ? "rule-ink" : "rule",
        className,
      )}
    />
  );
}
