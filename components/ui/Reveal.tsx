"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Fade-and-rise entrance driven by a single IntersectionObserver per element.
 *
 * No scroll listeners, no animation library, and only `opacity`/`transform` are
 * animated. The observer disconnects after the first reveal so nothing keeps
 * running as the visitor scrolls.
 *
 * `prefers-reduced-motion` is handled purely in CSS (see `.reveal` in
 * globals.css) so content is visible from the very first paint.
 */

type RevealProps = {
  children: ReactNode;
  /** Stagger, in ms. Use small increments (60–120) between siblings. */
  delay?: number;
  className?: string;
  as?: ElementType;
  /** Fraction of the element that must be visible before revealing. */
  threshold?: number;
  id?: string;
};

export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
  threshold = 0.15,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Fallback for browsers without IntersectionObserver: reveal on the next
    // frame rather than synchronously, so this never cascades a render.
    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // `isIntersecting` alone is not enough. An anchor jump (#methode),
          // a restored scroll position or a very fast scroll can take an
          // element from below the viewport to above it without ever producing
          // an intersecting frame — it would then stay invisible forever.
          // Anything already past the top counts as revealed.
          const alreadyPassed = entry.boundingClientRect.bottom < 0;

          if (entry.isIntersecting || alreadyPassed) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      id={id}
      className={cn("reveal", className)}
      data-visible={visible ? "true" : "false"}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
