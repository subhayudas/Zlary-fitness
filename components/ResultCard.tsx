import { MediaFrame } from "@/components/ui/MediaFrame";
import { Panel } from "@/components/ui/panels";
import { Rule } from "@/components/ui/typography";
import type { CaseStudy } from "@/content/types";
import { getUi } from "@/content/ui";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Before / after pair.
 *
 * Both frames are rendered at the same size and aspect ratio, and each is
 * labelled - an unlabelled or unevenly cropped pair is how transformation
 * photography turns misleading.
 */
export function BeforeAfter({
  locale,
  study,
  className,
  sizes = "(max-width: 1024px) 45vw, 26vw",
}: {
  locale: Locale;
  study: CaseStudy;
  className?: string;
  sizes?: string;
}) {
  if (!study.before && !study.after) return null;

  const t = getUi(locale).caseStudy;

  const frames = [
    { key: "before", label: t.before, asset: study.before },
    { key: "after", label: t.after, asset: study.after },
  ] as const;

  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:gap-3", className)}>
      {frames.map((frame) =>
        frame.asset ? (
          <figure key={frame.key} className="relative">
            <MediaFrame
              asset={frame.asset}
              sizes={sizes}
              className="aspect-4/5 w-full"
            />
            <figcaption className="type-micro absolute left-3 top-3 rounded-pill bg-lime px-2.5 py-1.5 text-ink-strong">
              {frame.label}
            </figcaption>
          </figure>
        ) : null,
      )}
    </div>
  );
}

/** Small lime metadata label used across the results layouts. */
export function MetaLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "type-micro inline-flex items-center rounded-pill bg-lime px-3 py-1.5 text-ink-strong",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Supporting case study - the smaller card in the asymmetric results grid.
 */
export function ResultCard({
  locale,
  study,
  className,
  sizes,
}: {
  locale: Locale;
  study: CaseStudy;
  className?: string;
  sizes?: string;
}) {
  const t = getUi(locale).caseStudy;

  return (
    <Panel
      as="article"
      tone="surface"
      className={cn("flex flex-col p-5 sm:p-6", className)}
    >
      <BeforeAfter locale={locale} study={study} sizes={sizes} />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <MetaLabel>{study.displayName}</MetaLabel>
        {study.duration ? (
          <span className="type-micro text-ink/45">{study.duration}</span>
        ) : null}
      </div>

      <p className="type-micro mt-4 text-ink/45">{study.context}</p>

      <blockquote className="mt-5 text-pretty text-lg leading-snug tracking-[-0.02em] text-ink">
        <p>“{study.quote}”</p>
      </blockquote>

      <Rule className="my-5" />

      <dl className="mt-auto space-y-3">
        <div>
          <dt className="type-micro text-ink/40">{t.obstacle}</dt>
          <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-muted">
            {study.obstacle}
          </dd>
        </div>
        <div>
          <dt className="type-micro text-ink/40">{t.result}</dt>
          <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-muted">
            {study.physicalResult}
          </dd>
        </div>
      </dl>
    </Panel>
  );
}
