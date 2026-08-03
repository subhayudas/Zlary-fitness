import { SectionShell } from "@/components/ui/SectionShell";
import { Reveal } from "@/components/ui/Reveal";
import { EditorialHeading, Rule } from "@/components/ui/typography";
import { getHome } from "@/content/home";
import { sectionIds } from "@/content/navigation";
import type { Locale } from "@/lib/i18n";

/**
 * Editorial problem statement.
 *
 * One band, two columns: the statement on the left, the symptoms on the right,
 * with column 7 left empty as a deliberate gutter. The section names the
 * friction and nothing else — the coaching journey and the philosophy that used
 * to sit here belong to the offer and method sections, and repeating them this
 * early only softened the problem.
 */
export function ProblemSection({ locale }: { locale: Locale }) {
  const { problem } = getHome(locale);

  return (
    <SectionShell id={sectionIds.approach} ariaLabelledBy="problem-title">
      <Reveal>
        <p className="type-micro text-ink/40">{problem.label}</p>
        <Rule className="mt-5" />
      </Reveal>

      <div className="mt-10 grid gap-y-10 md:mt-14 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0">
        {/* Left — the statement. */}
        <Reveal className="lg:col-span-6">
          <EditorialHeading as="h2" id="problem-title" className="text-balance">
            {problem.heading}
          </EditorialHeading>

          <p className="type-sub measure mt-6 text-pretty text-ink-muted md:mt-8">
            {problem.subheading}
          </p>
        </Reveal>

        {/* Right — the symptoms, bracketed by rules. Column 7 stays empty. */}
        <Reveal delay={80} className="lg:col-span-5 lg:col-start-8 lg:pt-2">
          <ul>
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
    </SectionShell>
  );
}
