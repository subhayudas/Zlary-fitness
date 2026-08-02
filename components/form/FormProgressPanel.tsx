"use client";

import { Check } from "@/components/icons";
import { getApplyContent } from "@/content/apply";
import { getUi } from "@/content/ui";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Left-hand context panel for the application form.
 *
 * Shows where the visitor is, what is left, and why the current step exists.
 * The progress bar animates `transform: scaleX()` rather than `width`, so it
 * never triggers layout.
 */
export function FormProgressPanel({
  locale,
  currentStep,
  className,
}: {
  locale: Locale;
  currentStep: number;
  className?: string;
}) {
  const applyContent = getApplyContent(locale);
  const t = getUi(locale);
  const steps = applyContent.steps;
  const step = steps[currentStep];
  const progress = (currentStep + 1) / steps.length;

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div>
        <p className="type-micro text-ink/45">{applyContent.eyebrow}</p>
        <p className="type-index mt-8 text-[3.5rem] leading-none text-ink/20">
          {step.index}
          <span className="text-[1.25rem]"> / {steps.length}</span>
        </p>
        <h2 className="type-sub mt-5 text-balance text-ink">{step.lead}</h2>
        <p className="measure-sm mt-4 text-pretty text-[0.9375rem] leading-relaxed text-ink-muted">
          {step.benefit}
        </p>
      </div>

      {/* Step list — desktop only. */}
      <ol className="mt-12 space-y-4">
        {steps.map((entry, index) => {
          const done = index < currentStep;
          const active = index === currentStep;

          return (
            <li key={entry.id} className="flex items-center gap-3.5">
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-pill transition-colors duration-500 ease-editorial",
                  done
                    ? "bg-ink text-lime"
                    : active
                      ? "bg-lime text-ink-strong"
                      : "bg-ink/8 text-ink/40",
                )}
              >
                {done ? (
                  <Check className="size-3.5" />
                ) : (
                  <span className="type-index text-[0.625rem]">
                    {entry.index}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "text-[0.9375rem] transition-colors duration-500 ease-editorial",
                  active ? "text-ink" : "text-ink/45",
                )}
              >
                {entry.title}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-auto pt-12">
        <ProgressBar progress={progress} label={t.form.progressLabel} />
        <p className="type-micro mt-4 text-ink/40">
          {t.form.stepOf(currentStep + 1, steps.length)}
        </p>
      </div>
    </div>
  );
}

/** Shared progress bar — also used in the compact mobile header. */
export function ProgressBar({
  progress,
  label,
  className,
}: {
  progress: number;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      aria-label={label}
      className={cn("h-1.5 w-full overflow-hidden rounded-pill bg-ink/10", className)}
    >
      <div
        className="h-full w-full origin-left rounded-pill bg-lime transition-transform duration-700 ease-editorial"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
