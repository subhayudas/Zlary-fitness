import { MethodSteps } from "@/components/MethodSteps";
import { Reveal } from "@/components/ui/Reveal";
import { SectionCTA } from "@/components/ui/SectionCTA";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading, Rule } from "@/components/ui/typography";
import { getHome } from "@/content/home";
import { sectionIds } from "@/content/navigation";
import type { Locale } from "@/lib/i18n";

/**
 * The coaching method.
 *
 * The shortest section on the page, deliberately. It sits between the offer and
 * the proof, and its whole job is to remove the last uncertainty before the
 * visitor looks at results - what happens after they click, and where it ends.
 * A visitor who has to scroll to count the steps has already been told the
 * method is complicated.
 *
 * So the block is three bands and nothing else: the statement, the four steps
 * across one row, the exit. The heading and the promise share a line rather
 * than stacking, which spends horizontal space the page has instead of vertical
 * space it does not. The sticky heading column, the four large panels and the
 * photograph that used to sit here are gone - none of them said anything the
 * four steps do not.
 */
export function MethodSection({ locale }: { locale: Locale }) {
  const { method } = getHome(locale);

  return (
    <SectionShell
      id={sectionIds.method}
      ariaLabelledBy="method-title"
      /* Horizontal padding matches the offer section above so both content
         columns start on the same line; the vertical rhythm is this section's
         own, and it is short. */
      padding="none"
      innerClassName="px-6 py-9 md:px-12 md:py-11 lg:px-16 lg:py-12 xl:px-20 xl:py-14"
    >
      <Reveal>
        <p className="type-micro text-ink/40">{method.eyebrow}</p>
        <Rule className="rule-draw mt-5" />
      </Reveal>

      {/* The statement, with the promise set beside it rather than under it. */}
      <div className="mt-8 grid gap-x-8 gap-y-4 md:mt-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <EditorialHeading as="h2" id="method-title" className="text-balance">
            {method.heading}
          </EditorialHeading>
        </Reveal>

        {/* Bottom-aligned against the heading's last line, so the two read as
            one band instead of as two stacked paragraphs. */}
        <Reveal
          delay={80}
          className="lg:col-span-4 lg:col-start-9 lg:self-end lg:pb-2"
        >
          <p className="measure text-pretty text-base leading-relaxed text-ink-muted md:text-lg">
            {method.body}
          </p>
        </Reveal>
      </div>

      <MethodSteps locale={locale} className="mt-9 md:mt-11" />

      {/* One exit, under a rule that closes the row above it. */}
      <Reveal delay={60}>
        <Rule className="mt-9 md:mt-11" />
        <SectionCTA
          cta={method.cta}
          variant="ink"
          layout="row"
          eventProps={{ location: "method" }}
          className="mt-6"
        />
      </Reveal>
    </SectionShell>
  );
}
