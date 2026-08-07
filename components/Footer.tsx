import Link from "next/link";
import { ArrowUpRight, Envelope, Instagram } from "@/components/icons";
import { Wordmark } from "@/components/nav/Wordmark";
import { SectionShell } from "@/components/ui/SectionShell";
import { WhenConfirmed } from "@/components/ui/PendingNote";
import { Rule } from "@/components/ui/typography";
import { backdrops } from "@/content/media";
import { getNav } from "@/content/navigation";
import { getSiteCopy, site } from "@/content/site";
import { getUi } from "@/content/ui";
import type { Locale } from "@/lib/i18n";

/**
 * Deep petroleum footer inside the same rounded shell as every other section,
 * so the page ends on the same visual rhythm it kept throughout.
 *
 * The open-horizon backdrop is the only photography that appears on every page.
 * It fades out well above the disclaimer, which is the smallest type on the
 * site and the one place the extra background luminance would have cost.
 */
export function Footer({ locale }: { locale: Locale }) {
  const year = new Date().getFullYear();
  const { footerNav } = getNav(locale);
  const copy = getSiteCopy(locale);
  const t = getUi(locale);

  return (
    <SectionShell
      as="footer"
      tone="ink"
      padding="md"
      className="mt-4 md:mt-7"
      backdrop={backdrops.horizon}
      backdropSizes="100vw"
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        {/* Brand + positioning */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Wordmark locale={locale} tone="light" size="lg" />
          <p className="measure-sm mt-5 text-pretty text-[0.9375rem] leading-relaxed text-white/60">
            {copy.positioning}
          </p>

          <div className="mt-7 flex flex-col gap-3">
            <a
              href={site.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-editorial type-micro-lg w-fit py-2 text-white/75 hover:text-white"
            >
              <Instagram className="size-4" />
              <span>@{site.instagramHandle}</span>
              <ArrowUpRight className="size-3.5" />
            </a>

            <WhenConfirmed fact={site.email}>
              {(email) => (
                <a
                  href={`mailto:${email}`}
                  className="link-editorial type-micro-lg w-fit py-2 text-white/75 hover:text-white"
                >
                  <Envelope className="size-4" />
                  <span>{email}</span>
                </a>
              )}
            </WhenConfirmed>
          </div>
        </div>

        {/* Navigation columns */}
        <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7 lg:gap-8 xl:col-span-7 xl:col-start-6">
          <FooterColumn title={t.footer.navigation} links={footerNav.site} />
          <FooterColumn title={t.footer.coaching} links={footerNav.funnel} />
          <FooterColumn title={t.footer.legal} links={footerNav.legal} />
        </div>
      </div>

      <Rule tone="light" className="my-10 md:my-12" />

      {/* Disclaimer - required, and kept legible rather than hidden in 10px grey. */}
      <p className="measure-lg text-pretty text-[0.8125rem] leading-relaxed text-white/50">
        {copy.disclaimer}
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="type-micro text-white/40">
          © {year} {site.brand}. {t.footer.rights}
        </p>
        <p className="type-micro text-white/40">
          {copy.serviceArea.status === "confirmed"
            ? copy.serviceArea.value
            : null}
        </p>
      </div>
    </SectionShell>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="type-micro text-white/40">{title}</h2>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="link-editorial py-1.5 text-[0.9375rem] text-white/75 hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
