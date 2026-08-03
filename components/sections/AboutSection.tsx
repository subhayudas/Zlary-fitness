import Link from "next/link";
import { ArrowUpRight, Instagram } from "@/components/icons";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { FloatingMetricCard } from "@/components/ui/panels";
import { PendingNote } from "@/components/ui/PendingNote";
import { Reveal } from "@/components/ui/Reveal";
import { SectionShell } from "@/components/ui/SectionShell";
import { EditorialHeading, Rule } from "@/components/ui/typography";
import { getHome } from "@/content/home";
import { getMedia } from "@/content/media";
import { applyHref, sectionIds } from "@/content/navigation";
import { certifications, getSiteCopy, site } from "@/content/site";
import { isConfirmed, onlyConfirmed } from "@/content/types";
import { getUi } from "@/content/ui";
import type { Locale } from "@/lib/i18n";

/**
 * About Zach.
 *
 * Lives on `/about` rather than on the homepage: it is the one block a visitor
 * seeks out deliberately, and the landing page reads better going from the
 * method straight to the FAQ and the application.
 *
 * It keeps the `#a-propos` id so links shared while it was still a homepage
 * section resolve to something, and its heading is an `h1` because it is now
 * the main content of its own page.
 *
 * The floating information card lists only facts that have actually been
 * confirmed — certifications, languages, platform. If none are confirmed the
 * card is not rendered at all, rather than shown with invented credentials.
 */
export function AboutSection({ locale }: { locale: Locale }) {
  const { about } = getHome(locale);
  const media = getMedia(locale);
  const copy = getSiteCopy(locale);
  const t = getUi(locale);
  const confirmedCerts = onlyConfirmed(certifications);

  const facts: { label: string; value: string }[] = [];

  if (isConfirmed(copy.languagesOffered)) {
    facts.push({ label: t.about.languages, value: copy.languagesOffered.value });
  }
  if (isConfirmed(site.facts.yearsOfExperience)) {
    facts.push({
      label: t.about.experience,
      value: site.facts.yearsOfExperience.value,
    });
  }
  if (isConfirmed(site.facts.coachingPlatform)) {
    facts.push({
      label: t.about.platform,
      value: site.facts.coachingPlatform.value,
    });
  }

  const showCard = confirmedCerts.length > 0 || facts.length > 0;

  return (
    <SectionShell id={sectionIds.about} padding="sm" ariaLabelledBy="about-title">
      <div className="grid gap-3 lg:grid-cols-12 lg:gap-4">
        {/* Portrait — roughly 58% of the width on desktop. */}
        <Reveal className="relative lg:col-span-7">
          <div className="photo-zoom relative h-full">
            <MediaFrame
              asset={media.aboutPortrait}
              sizes="(max-width: 1024px) 100vw, 56vw"
              scrim={showCard ? "soft" : "none"}
              placeholderTone="ink"
              placeholderDetail={showCard ? "minimal" : "full"}
              className="h-[26rem] w-full sm:h-[34rem] lg:h-full lg:min-h-[38rem]"
            />

            {showCard ? (
              <FloatingMetricCard
                label={t.about.cardLabel}
                className="mt-3 sm:absolute sm:bottom-5 sm:left-5 sm:mt-0 sm:w-[19rem]"
              >
                <dl className="space-y-3">
                  {confirmedCerts.map((cert) => (
                    <div key={cert.name}>
                      <dt className="type-micro text-ink/40">
                        {t.about.certification}
                      </dt>
                      <dd className="mt-1 text-[0.9375rem] leading-snug text-ink">
                        {cert.name}
                        <span className="block text-ink-muted">
                          {cert.issuer}
                          {cert.year ? ` · ${cert.year}` : ""}
                        </span>
                      </dd>
                    </div>
                  ))}

                  {facts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="type-micro text-ink/40">{fact.label}</dt>
                      <dd className="mt-1 text-[0.9375rem] leading-snug text-ink">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </FloatingMetricCard>
            ) : null}
          </div>
        </Reveal>

        {/* Biography. */}
        <Reveal delay={100} className="lg:col-span-5">
          <div className="flex h-full flex-col bg-surface rounded-media p-7 hairline sm:p-10 lg:p-12">
            <p className="type-micro text-ink/40">{about.eyebrow}</p>

            <EditorialHeading
              as="h1"
              id="about-title"
              scale="card"
              className="mt-7 text-balance"
            >
              {about.heading}
            </EditorialHeading>

            <p className="measure mt-7 text-pretty text-[0.9375rem] leading-relaxed text-ink-muted md:mt-9 md:text-base">
              {about.bio}
            </p>

            {/* Personal story — hidden until Zach writes it in his own words. */}
            {site.facts.personalStory.status === "confirmed" ? (
              <p className="measure mt-5 text-pretty text-[0.9375rem] leading-relaxed text-ink-muted md:text-base">
                {site.facts.personalStory.value}
              </p>
            ) : (
              <PendingNote note={site.facts.personalStory.note} className="mt-5" />
            )}

            {/* Certifications still pending — dev-only, invisible in production. */}
            {certifications
              .filter((cert) => !isConfirmed(cert))
              .map((cert, index) =>
                cert.status === "awaiting" ? (
                  <PendingNote key={index} note={cert.note} className="mt-3" />
                ) : null,
              )}

            <Rule className="my-8 mt-auto pt-8" />

            <div className="flex items-center justify-between gap-4">
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-editorial type-micro-lg text-ink/70 hover:text-ink"
              >
                <Instagram className="size-4" />
                <span>{about.instagramLabel}</span>
              </a>

              {/* Lime circular arrow control. */}
              <Link
                href={applyHref(locale)}
                aria-label={t.common.startApplication}
                className="group flex size-14 shrink-0 items-center justify-center rounded-pill bg-lime text-ink-strong transition-colors duration-300 ease-editorial hover:bg-lime-hover"
              >
                <span className="arrow-island bg-transparent text-transparent">
                  <ArrowUpRight className="size-5 text-ink-strong" />
                  <ArrowUpRight className="size-5 text-ink-strong" />
                </span>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
