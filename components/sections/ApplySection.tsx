import { BookingFlow } from "@/components/form/BookingFlow";
import { LimeFeaturePanel } from "@/components/ui/panels";
import { Reveal } from "@/components/ui/Reveal";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading } from "@/components/ui/typography";
import { getApplyContent } from "@/content/apply";
import { getHome } from "@/content/home";
import { sectionIds } from "@/content/navigation";
import type { Locale } from "@/lib/i18n";

/**
 * The application, on the page rather than one click away.
 *
 * This block replaces the old closing CTA *and* the standalone /apply route:
 * the lime panel carries the copy that used to sit above a button, and the flow
 * itself follows immediately underneath. Every CTA on the site is now an anchor
 * into `#postuler`, so the visitor never leaves the page to book.
 *
 * The flow ends on a confirmed appointment rather than on a submitted form: the
 * five questions, the calendar, the contact details and the confirmation all
 * happen here, and `/book` is only a redirect back to this anchor.
 *
 * No countdown, no "3 places left", no fake waiting list. The scarcity on a
 * coaching page is real and does not need to be manufactured - a fabricated
 * timer is the fastest way to make a premium page read as a funnel template.
 *
 * `BookingFlow` is the only Client Component here; the shell around it stays a
 * Server Component.
 */
export function ApplySection({ locale }: { locale: Locale }) {
  const { finalCta } = getHome(locale);
  const applyContent = getApplyContent(locale);

  return (
    <SectionShell
      id={sectionIds.apply}
      padding="sm"
      ariaLabelledBy="apply-title"
    >
      <LimeFeaturePanel className="px-6 py-14 text-center sm:px-10 md:py-20">
        <Reveal className="mx-auto max-w-3xl">
          <p className="type-micro text-ink/45">{applyContent.eyebrow}</p>

          <EditorialHeading
            as="h2"
            id="apply-title"
            className="mt-7 text-balance text-ink-strong"
          >
            {finalCta.heading}
          </EditorialHeading>
        </Reveal>
      </LimeFeaturePanel>

      <div className="mt-3 md:mt-4">
        <BookingFlow locale={locale} />
      </div>
    </SectionShell>
  );
}
