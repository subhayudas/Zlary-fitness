"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar } from "@/components/icons";
import { PillCTA } from "@/components/ui/PillCTA";
import { getBookingContent, type BookingConfig } from "@/content/booking";
import { site } from "@/content/site";
import { getUi } from "@/content/ui";
import type { Locale } from "@/lib/i18n";
import { track } from "@/lib/analytics";

/**
 * The scheduling embed.
 *
 * Three states, and none of them is a broken iframe:
 *   · no URL configured → administrator placeholder + Instagram fallback
 *   · URL configured but not embeddable → a large "open the calendar" panel
 *   · embeddable → the iframe, mounted only once it scrolls into view
 *
 * The iframe is lazy-mounted behind an IntersectionObserver and the container
 * reserves its height up front, so the third-party frame costs nothing on load
 * and cannot shift the layout when it arrives.
 */
export function BookingEmbed({
  locale,
  config,
}: {
  locale: Locale;
  config: BookingConfig;
}) {
  const bookingContent = getBookingContent(locale);
  const t = getUi(locale);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const embedUrl = config.configured ? config.embedUrl : null;

  useEffect(() => {
    if (!embedUrl) return;
    const node = containerRef.current;
    if (!node) return;

    // Fallback for browsers without IntersectionObserver: mount on the next
    // frame rather than synchronously, so this never cascades a render.
    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [embedUrl]);

  /* ---- Not configured ---------------------------------------------------- */
  if (!config.configured) {
    return (
      <div className="rounded-media bg-surface p-7 hairline sm:p-10">
        <span
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-pill bg-lime text-ink-strong"
        >
          <Calendar className="size-5" />
        </span>

        <h3 className="type-sub mt-7 text-balance text-ink">
          {bookingContent.fallback.heading}
        </h3>
        <p className="measure mt-4 text-pretty text-[0.9375rem] leading-relaxed text-ink-muted">
          {bookingContent.fallback.body}
        </p>

        <div className="mt-8">
          <PillCTA
            href={site.instagramUrl}
            external
            variant="ink"
            withArrow
            event="booking_link_click"
            eventProps={{ provider: "instagram_fallback" }}
            className="w-full sm:w-auto"
          >
            {t.common.writeOnInstagram}
          </PillCTA>
        </div>

        {/* Visible to the site owner in development only. */}
        {process.env.NODE_ENV === "development" ? (
          <p className="type-micro mt-8 rounded-card border border-dashed border-ink/25 p-4 normal-case leading-relaxed tracking-normal text-ink/45">
            {bookingContent.fallback.adminHint}
          </p>
        ) : null}
      </div>
    );
  }

  /* ---- Configured but not embeddable ------------------------------------- */
  if (!embedUrl) {
    return (
      <div className="rounded-media bg-surface p-7 text-center hairline sm:p-12">
        <span
          aria-hidden="true"
          className="mx-auto flex size-12 items-center justify-center rounded-pill bg-lime text-ink-strong"
        >
          <Calendar className="size-5" />
        </span>

        <h3 className="type-sub mx-auto mt-7 max-w-[24ch] text-balance text-ink">
          {t.booking.newTabHeading}
        </h3>
        <p className="mx-auto mt-4 max-w-[46ch] text-pretty text-[0.9375rem] leading-relaxed text-ink-muted">
          {t.booking.newTabBody}
        </p>

        <div className="mt-8 flex justify-center">
          <PillCTA
            href={config.url}
            external
            variant="lime"
            withArrow
            event="booking_link_click"
            eventProps={{ provider: config.provider }}
            className="w-full sm:w-auto"
          >
            {bookingContent.openCalendarLabel}
          </PillCTA>
        </div>
      </div>
    );
  }

  /* ---- Embedded ---------------------------------------------------------- */
  return (
    <div>
      <div
        ref={containerRef}
        // Height is reserved before the iframe mounts: no layout shift.
        className="relative h-[42rem] w-full overflow-hidden rounded-media bg-surface hairline sm:h-[46rem]"
      >
        {mounted ? (
          <iframe
            src={embedUrl}
            title={t.booking.iframeTitle}
            loading="lazy"
            // The scheduler only needs to be able to render itself.
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="type-micro text-ink/40">{t.booking.loading}</p>
          </div>
        )}
      </div>

      {/* Always give a way out of the iframe — embeds fail in odd browsers. */}
      <div className="mt-5 flex justify-center">
        <a
          href={config.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            track("booking_link_click", { provider: config.provider })
          }
          className="link-editorial type-micro text-ink/55 hover:text-ink"
        >
          {bookingContent.openCalendarLabel}
        </a>
      </div>
    </div>
  );
}
