import Link from "next/link";
import { ArrowLeft } from "@/components/icons";
import { LanguageToggle } from "@/components/nav/LanguageToggle";
import { Wordmark } from "@/components/nav/Wordmark";
import { getUi } from "@/content/ui";
import { localePath, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Reduced header for the funnel routes (/vsl, /apply, /book, /thank-you).
 *
 * Only four controls: wordmark, a small "back", the language switch and the
 * application CTA. The full navigation is deliberately absent — every extra
 * link on a funnel page is an exit.
 *
 * The language switch is the one addition that earns its place here: these are
 * the pages an ad drops someone onto directly, so this may be the only header
 * they ever see. Switching mid-form does restart the form, which is unavoidable
 * for a page navigation and still better than having no way out of the wrong
 * language.
 */
export function FunnelHeader({
  locale,
  backHref,
  backLabel,
  cta,
  tone = "ink",
  className,
}: {
  locale: Locale;
  /** Defaults to the home page in the current language. */
  backHref?: string;
  backLabel?: string;
  cta?: { label: string; href: string } | null;
  tone?: "ink" | "light";
  className?: string;
}) {
  const light = tone === "light";
  const t = getUi(locale);
  const href = backHref ?? localePath("/", locale);
  const label = backLabel ?? t.common.back;

  return (
    <header
      className={cn(
        "page-shell flex items-center justify-between gap-4 py-6 md:py-8",
        light && "on-dark",
        className,
      )}
    >
      <div className="flex items-center gap-4 sm:gap-6">
        <Wordmark locale={locale} tone={tone} size="md" />
        <span
          aria-hidden="true"
          className={cn("hidden h-4 w-px sm:block", light ? "bg-white/20" : "bg-line")}
        />
        <Link
          href={href}
          className={cn(
            "link-editorial type-micro hidden sm:inline-flex",
            light ? "text-white/65 hover:text-white" : "text-ink/60 hover:text-ink",
          )}
        >
          <ArrowLeft className="size-3.5" />
          <span>{label}</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href={href}
          aria-label={label}
          className={cn(
            "flex size-11 items-center justify-center rounded-pill sm:hidden",
            light ? "bg-white/12 text-white" : "bg-ink/8 text-ink",
          )}
        >
          <ArrowLeft className="size-4" />
        </Link>

        <LanguageToggle locale={locale} tone={light ? "dark" : "ink"} />

        {cta ? (
          <Link
            href={cta.href}
            className="btn btn-lime min-h-11 px-5 py-2 text-[0.6875rem] sm:px-6"
          >
            {cta.label}
          </Link>
        ) : null}
      </div>
    </header>
  );
}
