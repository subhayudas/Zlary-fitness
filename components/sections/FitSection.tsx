import { Check, Minus } from "@/components/icons";
import { LimeFeaturePanel, Panel } from "@/components/ui/panels";
import { Reveal } from "@/components/ui/Reveal";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading } from "@/components/ui/typography";
import { getHome } from "@/content/home";
import { sectionIds } from "@/content/navigation";
import { getUi } from "@/content/ui";
import type { Locale } from "@/lib/i18n";

/**
 * Qualification / disqualification.
 *
 * Telling the wrong-fit visitor to leave is the point: it protects Zach's
 * calendar and it is the single most credible thing a coaching page can say.
 * The two panels are deliberately unequal in height — the lists differ in
 * length, and forcing them to match would be the generic choice.
 */
export function FitSection({ locale }: { locale: Locale }) {
  const { fit } = getHome(locale);
  const t = getUi(locale);

  return (
    <SectionShell id={sectionIds.fit} padding="sm" ariaLabelledBy="fit-title">
      <h2 id="fit-title" className="sr-only">
        {t.fit.sectionLabel}
      </h2>

      <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
        <Reveal className="lg:col-span-7">
          <Panel tone="surface" className="h-full p-7 sm:p-10 lg:p-14">
            <p className="type-micro text-ink/40">{fit.eyebrow}</p>

            <EditorialHeading as="h3" scale="card" className="mt-7 text-balance">
              {fit.goodFit.heading}
            </EditorialHeading>

            <ul className="mt-10 space-y-5 md:mt-12">
              {fit.goodFit.items.map((item) => (
                <li key={item} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-pill bg-lime text-ink-strong"
                  >
                    <Check className="size-3.5" />
                  </span>
                  <span className="text-pretty text-[0.9375rem] leading-relaxed text-ink md:text-base">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </Reveal>

        <Reveal delay={100} className="lg:col-span-5">
          <LimeFeaturePanel className="h-full p-7 sm:p-10 lg:p-14">
            <p className="type-micro text-ink/50">{t.fit.honestly}</p>

            <EditorialHeading
              as="h3"
              scale="card"
              className="mt-7 text-balance text-ink-strong"
            >
              {fit.notFit.heading}
            </EditorialHeading>

            <ul className="mt-10 space-y-5 md:mt-12">
              {fit.notFit.items.map((item) => (
                <li key={item} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-pill bg-ink-strong text-lime"
                  >
                    <Minus className="size-3.5" />
                  </span>
                  <span className="text-pretty text-[0.9375rem] leading-relaxed text-ink-strong md:text-base">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </LimeFeaturePanel>
        </Reveal>
      </div>
    </SectionShell>
  );
}
