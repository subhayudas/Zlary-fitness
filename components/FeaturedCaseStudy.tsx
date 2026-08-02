import { BeforeAfter, MetaLabel } from "@/components/ResultCard";
import { Panel } from "@/components/ui/panels";
import { Rule } from "@/components/ui/typography";
import type { CaseStudy } from "@/content/types";
import { getUi } from "@/content/ui";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * The lead transformation: photography on the left, the story on the right.
 *
 * Every field is optional-by-omission rather than filled with a placeholder —
 * if a client did not supply a quote, no empty quote block is rendered.
 */
export function FeaturedCaseStudy({
  locale,
  study,
  className,
}: {
  locale: Locale;
  study: CaseStudy;
  className?: string;
}) {
  const t = getUi(locale).caseStudy;

  const facts = [
    { label: t.startingPoint, value: study.startingPoint },
    { label: t.mainObstacle, value: study.obstacle },
    { label: t.approach, value: study.approach },
    { label: t.result, value: study.physicalResult },
    { label: t.everyday, value: study.lifestyleResult },
  ].filter((fact) => Boolean(fact.value));

  return (
    <article className={cn("grid gap-8 lg:grid-cols-12 lg:gap-10", className)}>
      <div className="lg:col-span-6 xl:col-span-7">
        <BeforeAfter
          locale={locale}
          study={study}
          sizes="(max-width: 1024px) 46vw, 30vw"
          className="gap-3"
        />
      </div>

      <div className="lg:col-span-6 xl:col-span-5">
        <div className="flex flex-wrap items-center gap-2">
          <MetaLabel>{study.displayName}</MetaLabel>
          {study.duration ? <MetaLabel>{study.duration}</MetaLabel> : null}
        </div>

        <p className="type-micro mt-5 text-ink/45">{study.context}</p>

        {study.quote ? (
          <blockquote className="type-card mt-6 text-balance text-ink">
            <p>“{study.quote}”</p>
          </blockquote>
        ) : null}

        <dl className="mt-10">
          {facts.map((fact) => (
            <div key={fact.label}>
              <Rule />
              <div className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6 sm:py-5">
                <dt className="type-micro pt-1 text-ink/40">{fact.label}</dt>
                <dd className="text-pretty text-[0.9375rem] leading-relaxed text-ink-muted md:text-base">
                  {fact.value}
                </dd>
              </div>
            </div>
          ))}
          <Rule />
        </dl>
      </div>
    </article>
  );
}

/**
 * Shown when no client has approved publication yet.
 *
 * A polished empty state is the honest option: fabricated proof is a legal
 * risk, and a visitor who spots one invented testimonial discounts everything
 * else on the page.
 */
export function ResultsEmptyState({
  heading,
  body,
  action,
  className,
}: {
  heading: string;
  body: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Panel
      tone="surface"
      className={cn(
        "flex flex-col items-start gap-6 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-14",
        className,
      )}
    >
      <div>
        <h3 className="type-sub text-balance text-ink">{heading}</h3>
        <p className="measure-lg mt-4 text-pretty text-[0.9375rem] leading-relaxed text-ink-muted md:text-base">
          {body}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </Panel>
  );
}
