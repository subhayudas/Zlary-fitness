import Link from "next/link";
import { site } from "@/content/site";
import { getUi } from "@/content/ui";
import { defaultLocale, localePath, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * The Zlary Fitness wordmark.
 *
 * Type-only by design — set in the site's own grotesk with tight tracking, so
 * there is no logo file to manage and it stays crisp at any size. The second
 * word carries reduced opacity to create hierarchy without a second weight.
 *
 * The wordmark links to the home page *of the current language*: sending an
 * English reader back to the French homepage would silently undo their choice.
 */
export function Wordmark({
  locale = defaultLocale,
  tone = "ink",
  className,
  asLink = true,
  size = "md",
  onClick,
  tabIndex,
}: {
  locale?: Locale;
  tone?: "ink" | "light";
  className?: string;
  asLink?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  tabIndex?: number;
}) {
  const sizeClass =
    size === "sm"
      ? "text-[0.9375rem]"
      : size === "lg"
        ? "text-xl md:text-2xl"
        : "text-base md:text-lg";

  const content = (
    <span
      className={cn(
        "inline-flex items-baseline gap-[0.3em] font-medium tracking-[-0.03em]",
        sizeClass,
        tone === "light" ? "text-white" : "text-ink",
      )}
    >
      <span>{site.wordmark.primary}</span>
      <span className={tone === "light" ? "text-white/60" : "text-ink/45"}>
        {site.wordmark.secondary}
      </span>
    </span>
  );

  if (!asLink) return <span className={className}>{content}</span>;

  return (
    <Link
      href={localePath("/", locale)}
      onClick={onClick}
      tabIndex={tabIndex}
      className={cn("inline-flex rounded-sm", className)}
      aria-label={`${site.brand} — ${getUi(locale).common.homeLinkLabel}`}
    >
      {content}
    </Link>
  );
}
