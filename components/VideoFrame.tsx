"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "@/components/icons";
import { MediaFrame } from "@/components/ui/MediaFrame";
import type { MediaAsset } from "@/content/types";
import { getUi } from "@/content/ui";
import { getVslContent, type VslConfig } from "@/content/vsl";
import type { Locale } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * The VSL player, inside the double-bezel frame.
 *
 * Three states, and none of them is a broken iframe:
 *   · not configured → branded "bientôt disponible" placeholder
 *   · configured, not started → poster image with a play control
 *   · started → the real player
 *
 * The embed is created only after the visitor clicks play (facade pattern), so
 * a third-party player never touches the critical path or the Lighthouse score.
 *
 * Progress tracking works for the self-hosted `file` provider, where real
 * playback events are available. For iframe providers no progress can be read
 * without loading their JS APIs, so those events are simply not emitted —
 * inventing them would poison the funnel data.
 */
export function VideoFrame({
  locale,
  config,
  poster,
  className,
}: {
  locale: Locale;
  config: VslConfig;
  poster: MediaAsset;
  className?: string;
}) {
  const vslContent = getVslContent(locale);
  const t = getUi(locale);
  const [started, setStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const milestones = useRef(new Set<number>());

  useEffect(() => {
    if (!started) return;
    track("vsl_start", { provider: config.configured ? config.provider : "none" });
  }, [started, config]);

  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const pct = (video.currentTime / video.duration) * 100;
    for (const mark of [25, 50, 75]) {
      if (pct >= mark && !milestones.current.has(mark)) {
        milestones.current.add(mark);
        track("vsl_progress", { percent: mark });
      }
    }
  };

  return (
    <div className={cn("bezel", className)}>
      <div className="bezel-core bezel-core-dark relative aspect-video bg-ink-strong on-photo">
        {!config.configured ? (
          <VideoPlaceholder locale={locale} />
        ) : started ? (
          config.provider === "file" && config.fileUrl ? (
            <video
              ref={videoRef}
              src={config.fileUrl}
              controls
              autoPlay
              playsInline
              onTimeUpdate={onTimeUpdate}
              onEnded={() => track("vsl_progress", { percent: 100 })}
              className="absolute inset-0 h-full w-full bg-black object-contain"
            />
          ) : config.embedUrl ? (
            <iframe
              src={`${config.embedUrl}${config.embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
              title={vslContent.headline}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <VideoPlaceholder locale={locale} />
          )
        ) : (
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="group absolute inset-0 h-full w-full"
          >
            <MediaFrame
              asset={poster}
              sizes="(max-width: 1024px) 100vw, 70vw"
              scrim="soft"
              rounded="none"
              placeholderTone="ink"
              position="fill"
            />

            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-16 items-center justify-center rounded-pill bg-lime text-ink-strong transition-transform duration-500 ease-editorial group-hover:scale-105 sm:size-20">
                <Play className="ml-0.5 size-6 sm:size-7" />
              </span>
            </span>

            <span className="type-micro absolute bottom-4 left-4 rounded-pill bg-black/40 px-3 py-1.5 text-white/90 sm:bottom-5 sm:left-5">
              {t.vslPage.playLabel}
              {vslContent.duration ? ` · ${vslContent.duration}` : ""}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

/** Branded placeholder shown until a video URL is configured. */
function VideoPlaceholder({ locale }: { locale: Locale }) {
  const vslContent = getVslContent(locale);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-pill bg-white/8 text-white/40"
      >
        <Play className="ml-0.5 size-5" />
      </span>
      <p className="type-micro text-lime">{vslContent.placeholder.heading}</p>
      <p className="max-w-[44ch] text-pretty text-[0.9375rem] leading-relaxed text-white/60">
        {vslContent.placeholder.body}
      </p>
    </div>
  );
}
