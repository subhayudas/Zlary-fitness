import { PillCTA, type PillVariant } from "@/components/ui/PillCTA";
import type { AnalyticsEvent, AnalyticsProps } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * The call to action that closes a section.
 *
 * Every section ends on one of these and no section ends on two: a button on
 * its own is a click with no reason attached, and two buttons side by side make
 * the visitor choose instead of act. The note is the reason — one line naming
 * what happens after the click, written for the section it sits under, never
 * reused between two of them.
 *
 * `layout` is about the space available, not about hierarchy:
 *   · "stack" — note above the button. Narrow columns, sticky rails.
 *   · "row"   — note beside it. Full-width bands and panels.
 *
 * A Server Component wrapping a Client one: only `PillCTA` reaches the browser,
 * because only the click has to be reported.
 */

export type SectionCta = {
  label: string;
  href: string;
  /** One line, specific to this section, naming what the click leads to. */
  note?: string;
};

export function SectionCTA({
  cta,
  variant = "ink",
  event = "primary_cta_click",
  eventProps,
  layout = "stack",
  className,
  children,
}: {
  cta: SectionCta;
  variant?: PillVariant;
  event?: AnalyticsEvent;
  eventProps?: AnalyticsProps;
  layout?: "stack" | "row";
  className?: string;
  /** Subordinate link — a text link, never a second button. */
  children?: React.ReactNode;
}) {
  const onLight = variant !== "outline-light";

  const note = cta.note ? (
    <p
      className={cn(
        "flex gap-2.5 text-pretty text-[0.8125rem] leading-relaxed",
        onLight ? "text-ink/55" : "text-white/60",
        layout === "stack" ? "max-w-[38ch]" : "max-w-[42ch]",
      )}
    >
      {/* The marker ties the line to the button below it rather than letting it
          read as one more sentence of body copy. It is a flex item, not an
          inline glyph, so a note that wraps keeps a hanging indent instead of
          dropping its second line back to the margin. */}
      <span
        aria-hidden="true"
        className={cn(
          "mt-[0.5em] size-1.5 shrink-0 rounded-pill",
          onLight ? "bg-lime" : "bg-white/50",
        )}
      />
      <span>{cta.note}</span>
    </p>
  ) : null;

  const button = (
    <PillCTA
      href={cta.href}
      variant={variant}
      withArrow
      event={event}
      eventProps={eventProps}
      className="w-full shrink-0 sm:w-auto"
    >
      {cta.label}
    </PillCTA>
  );

  if (layout === "row") {
    return (
      <div
        className={cn(
          "flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8",
          className,
        )}
      >
        <div className="space-y-3">
          {note}
          {children}
        </div>
        {button}
      </div>
    );
  }

  return (
    <div className={cn("space-y-5", className)}>
      {note}
      {button}
      {children ? <div>{children}</div> : null}
    </div>
  );
}
