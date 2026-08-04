import { FAQAccordion } from "@/components/FAQAccordion";
import { PendingNote } from "@/components/ui/PendingNote";
import { Reveal } from "@/components/ui/Reveal";
import { SectionCTA } from "@/components/ui/SectionCTA";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading } from "@/components/ui/typography";
import { getFaqItems, getVisibleFaqItems } from "@/content/faq";
import { getHome } from "@/content/home";
import { sectionIds } from "@/content/navigation";
import type { Locale } from "@/lib/i18n";

/**
 * FAQ: heading on the left, accordion on the right, a lot of whitespace between.
 *
 * Questions still waiting on an answer from Zach are not rendered — they are
 * listed as dev-only notes instead, so the live page never shows a row that
 * opens onto nothing.
 */
export function FaqSection({ locale }: { locale: Locale }) {
  const { faqIntro } = getHome(locale);
  const visibleFaqItems = getVisibleFaqItems(locale);
  const pending = getFaqItems(locale).filter(
    (item) => item.answer.status === "awaiting",
  );

  return (
    <SectionShell id={sectionIds.faq} ariaLabelledBy="faq-title">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <p className="type-micro text-ink/40">{faqIntro.eyebrow}</p>

              <EditorialHeading
                as="h2"
                id="faq-title"
                scale="card"
                className="mt-6 text-balance"
              >
                {faqIntro.heading}
              </EditorialHeading>

              <p className="measure-sm mt-6 text-pretty text-[0.9375rem] leading-relaxed text-ink-muted">
                {faqIntro.body}
              </p>

              {/* A text link was the wrong weight for the last section before
                  the form: the FAQ is where the remaining objections are, and
                  the visitor who runs out of them needs somewhere to go that
                  looks like an action. */}
              <SectionCTA
                cta={faqIntro.cta}
                variant="ink"
                eventProps={{ location: "faq" }}
                className="mt-8"
              />
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <Reveal delay={80}>
            <FAQAccordion items={visibleFaqItems} />
          </Reveal>

          {process.env.NODE_ENV === "development" && pending.length > 0 ? (
            <div className="mt-8 space-y-2">
              {pending.map((item) => (
                <div key={item.id}>
                  <p className="text-[0.8125rem] text-ink/50">{item.question}</p>
                  {item.answer.status === "awaiting" ? (
                    <PendingNote note={item.answer.note} className="mt-1.5" />
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </SectionShell>
  );
}
