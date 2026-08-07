"use client";

import { useEffect, useRef, useState } from "react";
import type { VideoAsset } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * A silent, looping video layered over the poster that already occupies the
 * frame. It is decoration on top of a photograph - never a replacement for one.
 *
 * Three things this deliberately does NOT do:
 *
 *   · It does not render on the server. The element only mounts once we know
 *     the visitor has not asked for reduced motion, so a visitor who has
 *     switched motion off never downloads the file, let alone plays it. The
 *     poster underneath is server-rendered, so the frame is never empty and
 *     there is no layout shift when the video arrives.
 *   · It does not carry meaning. `aria-hidden`, not focusable, and the
 *     `<MediaFrame>` beneath it holds the alt text.
 *   · It does not make noise. The encoded files have no audio stream at all;
 *     `muted` here is the second lock, and it is also what makes autoplay
 *     legal - every browser blocks an unmuted autoplay.
 *
 * It fades in on `canplay` rather than appearing mid-decode, so the cut from
 * the still to the moving frame is not visible.
 */
export function BackgroundVideo({
  asset,
  className,
  style,
}: {
  asset: VideoAsset;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAllowed(!query.matches);

    sync();
    // Tracked, not just read once: macOS and iOS let the preference change
    // while the page is open, and the video must stop when it does.
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    // Belt and braces. React sets `muted` as a property rather than an
    // attribute, and an unmuted video is one Safari refuses to autoplay.
    video.muted = true;

    // Autoplay can still be refused (low-power mode, a data saver, a browser
    // setting). That is a supported outcome, not an error: the poster stays.
    void video.play().catch(() => {});
  }, [allowed]);

  if (!allowed) return null;

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      width={asset.width}
      height={asset.height}
      onCanPlay={() => setReady(true)}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-editorial",
        ready ? "opacity-100" : "opacity-0",
        className,
      )}
      style={style}
    >
      {asset.sources.map((source) => (
        <source key={source.src} src={source.src} type={source.type} />
      ))}
    </video>
  );
}
