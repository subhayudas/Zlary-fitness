import { MediaFrame } from "@/components/ui/MediaFrame";
import { LimeFeaturePanel, Panel } from "@/components/ui/panels";
import { Reveal } from "@/components/ui/Reveal";
import { getMedia } from "@/content/media";
import { getMethodSteps } from "@/content/method";
import type { MethodStep } from "@/content/types";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * The four coaching steps as a staggered editorial timeline.
 *
 * Steps alternate their horizontal offset so the column reads as a composition
 * rather than a stack. One step is a lime panel and one is photographic, which
 * breaks the rhythm exactly once — enough to stop it feeling like a list.
 *
 * The connecting progress line is decorative and hidden from assistive tech;
 * the ordered list carries the actual sequence.
 */
export function MethodTimeline({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const methodSteps = getMethodSteps(locale);
  const media = getMedia(locale);

  /** Index of the step rendered on lime. */
  const limeStep = 1;
  /** Index after which the photographic panel is inserted. */
  const photoAfter = 2;

  return (
    <ol className={cn("relative", className)}>
      {/* Progress rail — desktop only, sits in the gutter left of the cards. */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-4 hidden h-[calc(100%-4rem)] w-px bg-line lg:block"
      />

      {methodSteps.map((step, index) => {
        const isLime = index === limeStep;

        return (
          <li key={step.index}>
            <Reveal delay={index * 70}>
              <div
                className={cn(
                  "relative lg:pl-12",
                  index > 0 && "mt-3 md:mt-4",
                  // Staggered offsets: each card sits a little further right.
                  index === 1 && "lg:ml-[6%]",
                  index === 2 && "lg:ml-[3%]",
                  index === 3 && "lg:ml-[9%]",
                )}
              >
                {/* Node on the rail. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-0 top-8 hidden size-3 -translate-x-[5.5px] rounded-pill lg:block",
                    isLime ? "bg-lime" : "bg-ink/25",
                  )}
                />

                {isLime ? (
                  <LimeFeaturePanel className="p-7 sm:p-9 lg:p-11">
                    <StepBody step={step} tone="lime" />
                  </LimeFeaturePanel>
                ) : (
                  <Panel tone="surface" className="p-7 sm:p-9 lg:p-11">
                    <StepBody step={step} tone="surface" />
                  </Panel>
                )}
              </div>
            </Reveal>

            {index === photoAfter ? (
              <Reveal delay={90}>
                <div className="photo-zoom mt-3 lg:ml-[3%] lg:pl-12 md:mt-4">
                  <MediaFrame
                    asset={media.methodCoaching}
                    sizes="(max-width: 1024px) 100vw, 46vw"
                    className="h-[15rem] w-full sm:h-[19rem] lg:h-[17rem]"
                  />
                </div>
              </Reveal>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function StepBody({
  step,
  tone,
}: {
  step: MethodStep;
  tone: "lime" | "surface";
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:gap-8">
      <p
        className={cn(
          "type-index text-[0.9375rem] sm:w-12 sm:shrink-0 sm:pt-1",
          tone === "lime" ? "text-ink/50" : "text-ink/35",
        )}
      >
        {step.index}
      </p>
      <div>
        <h3
          className={cn(
            "text-pretty text-xl leading-snug tracking-[-0.022em] sm:text-2xl",
            tone === "lime" ? "text-ink-strong" : "text-ink",
          )}
        >
          {step.title}
        </h3>
        <p
          className={cn(
            "measure mt-4 text-pretty text-[0.9375rem] leading-relaxed md:text-base",
            tone === "lime" ? "text-ink/70" : "text-ink-muted",
          )}
        >
          {step.body}
        </p>
      </div>
    </div>
  );
}
