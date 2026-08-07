import { ProblemStatements } from "@/components/ProblemStatements";
import { SectionCTA } from "@/components/ui/SectionCTA";
import { SectionShell } from "@/components/ui/SectionShell";
import { Reveal } from "@/components/ui/Reveal";
import {
  EditorialHeading,
  Rule,
  StaggeredWords,
} from "@/components/ui/typography";
import { getHome } from "@/content/home";
import { sectionIds } from "@/content/navigation";
import type { Locale } from "@/lib/i18n";

/**
 * Editorial problem statement.
 *
 * One band, two columns: the statement on the left, the symptoms on the right,
 * with column 7 left empty as a deliberate gutter. The section names the
 * friction and nothing else - the coaching journey and the philosophy that used
 * to sit here belong to the offer and method sections, and repeating them this
 * early only softened the problem.
 *
 * The band is alive but not any taller for it. The heading assembles word by
 * word, the rule under the label draws itself in, and the symptoms answer to
 * both the scroll position and the pointer (see `ProblemStatements`). Every one
 * of those is opacity, transform or absolute positioning, so the section
 * measures exactly what it measured when it was static - the gutter is where
 * the new marks live, not the layout.
 */
export function ProblemSection({ locale }: { locale: Locale }) {
  const { problem } = getHome(locale);

  return (
    <SectionShell id={sectionIds.approach} ariaLabelledBy="problem-title">
      <Reveal>
        <p className="type-micro text-ink/40">{problem.label}</p>
        <Rule className="rule-draw mt-5" />
      </Reveal>

      <div className="mt-10 grid gap-y-10 md:mt-14 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0">
        {/* Left - the statement. */}
        <Reveal className="lg:col-span-6">
          <EditorialHeading as="h2" id="problem-title" className="text-balance">
            <StaggeredWords text={problem.heading} />
          </EditorialHeading>

          <p className="type-sub measure mt-6 text-pretty text-ink-muted md:mt-8">
            {problem.subheading}
          </p>

          {/* The section's exit. It sits under the statement rather than under
              the symptoms so the visitor reads the four lines on the right
              before meeting a button - the recognition is what earns it. */}
          <SectionCTA
            cta={problem.cta}
            variant="outline"
            eventProps={{ location: "problem" }}
            className="mt-10 md:mt-12"
          />
        </Reveal>

        {/* Right - the symptoms, bracketed by rules. Column 7 stays empty. */}
        <Reveal delay={80} className="lg:col-span-5 lg:col-start-8 lg:pt-2">
          <ProblemStatements statements={problem.statements} />
        </Reveal>
      </div>
    </SectionShell>
  );
}
