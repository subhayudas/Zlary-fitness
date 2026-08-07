import { Reveal } from "@/components/ui/Reveal";
import { getMethodSteps } from "@/content/method";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * The four coaching steps as a single process row.
 *
 * This used to be a staggered vertical timeline with a photograph cut into it -
 * four large panels the visitor had to scroll through one at a time, which cost
 * a screen and a half to say something whose entire persuasive value is that it
 * is short. Read left to right, the four steps arrive as one shape: this is the
 * whole method, and it is simple.
 *
 * No card, no fill, no shadow. Each step is a rule, an index and two lines of
 * text, so the row reads as a printed process diagram rather than as four more
 * boxes on a page that already has plenty. The lime dot marks the only step the
 * visitor can act on today, and it is the same mark the closing CTA carries.
 *
 * The ordered list carries the sequence; the indices are decorative repetition
 * of it, which is why they are plain text and not list markers.
 */
export function MethodSteps({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const steps = getMethodSteps(locale);

  return (
    <ol
      className={cn(
        "grid gap-x-8 gap-y-6 sm:grid-cols-2 sm:gap-y-8 lg:grid-cols-4",
        className,
      )}
    >
      {steps.map((step, index) => (
        <li key={step.index}>
          {/* The rule belongs to the step, not to the grid: it rides with the
              card as it rises, and at `sm` the two columns are separated by a
              gutter, so nothing here has to line up with a neighbour. */}
          <Reveal delay={index * 70} className="border-t border-line pt-4 md:pt-5">
            <p className="type-index flex items-center text-[0.8125rem] text-ink/40">
              {index === 0 ? (
                <span
                  aria-hidden="true"
                  className="mr-2 inline-block size-1.5 rounded-pill bg-lime"
                />
              ) : null}
              {step.index}
            </p>

            {/* Two lines are reserved between `lg` and `xl` only. In that band
                the four columns are narrow enough that "Suivi et ajustements"
                wraps and "Autonomie" does not, which leaves the descriptions
                starting at four different heights. Past `xl` every title fits
                on one line in both languages, and the reservation would only
                open a gap between each title and the line it belongs to. */}
            <h3 className="mt-3 text-pretty text-[1.0625rem] leading-snug tracking-[-0.02em] text-ink lg:min-h-[3rem] xl:min-h-0">
              {step.title}
            </h3>

            <p className="mt-2 text-pretty text-[0.875rem] leading-normal text-ink-muted">
              {step.body}
            </p>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
