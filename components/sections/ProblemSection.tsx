import { SectionShell } from "@/components/ui/SectionShell";
import { LimeFeaturePanel } from "@/components/ui/panels";
import { Reveal } from "@/components/ui/Reveal";
import { EditorialHeading, Rule } from "@/components/ui/typography";
import { getHome } from "@/content/home";
import { sectionIds } from "@/content/navigation";
import type { Locale } from "@/lib/i18n";

/**
 * Editorial problem statement.
 *
 * Asymmetric 5 / 3 / 3 split with column 6 left empty as a deliberate gutter —
 * the whitespace is the composition, not an accident.
 */
export function ProblemSection({ locale }: { locale: Locale }) {
  const { problem } = getHome(locale);

  return (
    <SectionShell id={sectionIds.approach} ariaLabelledBy="problem-title">
      <Reveal>
        <p className="type-micro text-ink/40">{problem.label}</p>
        <Rule className="mt-5" />
      </Reveal>

      <div className="mt-12 grid gap-y-16 md:mt-16 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0">
        {/* Left — the statement, then the symptoms. */}
        <div className="lg:col-span-5">
          <Reveal>
            <EditorialHeading as="h2" id="problem-title" className="text-balance">
              {problem.heading}
            </EditorialHeading>

            <p className="type-sub measure mt-6 text-pretty text-ink-muted md:mt-8">
              {problem.subheading}
            </p>
          </Reveal>

          <Reveal delay={80}>
            <ul className="mt-12 md:mt-16">
              {problem.statements.map((statement) => (
                <li key={statement}>
                  <Rule />
                  <p className="py-4 text-pretty text-[0.9375rem] leading-relaxed text-ink/75 md:py-5 md:text-base">
                    {statement}
                  </p>
                </li>
              ))}
              <li aria-hidden="true">
                <Rule />
              </li>
            </ul>
          </Reveal>
        </div>

        {/* Middle — the conceptual journey. Column 6 stays empty. */}
        <Reveal delay={120} className="lg:col-span-3 lg:col-start-7">
          <LimeFeaturePanel className="flex h-full flex-col p-7 md:p-8">
            <p className="type-micro text-ink/55">{problem.journey.label}</p>
            <p className="type-sub mt-4 text-pretty text-ink-strong">
              {problem.journey.caption}
            </p>

            {/* Abstract progress rail: four nodes, no numbers, no fake score. */}
            <ol className="relative mt-10 flex-1 space-y-8 md:mt-12">
              <span
                aria-hidden="true"
                className="absolute left-[5.5px] top-2 h-[calc(100%-1rem)] w-px bg-ink/20"
              />
              {problem.journey.steps.map((step, index) => (
                <li key={step.name} className="relative flex gap-4 pl-6">
                  <span
                    aria-hidden="true"
                    className={
                      index === problem.journey.steps.length - 1
                        ? "absolute left-0 top-1.5 size-3 rounded-pill bg-ink-strong"
                        : "absolute left-0 top-1.5 size-3 rounded-pill bg-lime shadow-[inset_0_0_0_1.5px_var(--color-ink-strong)]"
                    }
                  />
                  <div>
                    <p className="text-[0.9375rem] font-medium leading-tight text-ink-strong">
                      {step.name}
                    </p>
                    <p className="type-micro mt-2 text-ink/50">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-10 text-[0.6875rem] leading-relaxed text-ink/45">
              {problem.journey.footnote}
            </p>
          </LimeFeaturePanel>
        </Reveal>

        {/* Right — two coaching principles. */}
        <div className="space-y-10 lg:col-span-3 lg:col-start-10 lg:pt-2">
          {problem.asides.map((aside, index) => (
            <Reveal key={aside.title} delay={160 + index * 80}>
              <Rule />
              <h3 className="mt-6 text-pretty text-lg leading-snug tracking-[-0.02em] text-ink md:text-xl">
                {aside.title}
              </h3>
              <p className="mt-4 text-pretty text-[0.9375rem] leading-relaxed text-ink-muted">
                {aside.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
