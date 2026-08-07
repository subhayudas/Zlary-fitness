"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  formatWeight,
  type Transformation,
} from "@/content/transformations";
import { getUi } from "@/content/ui";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * ---------------------------------------------------------------------------
 * THE DRAGGABLE BEFORE / AFTER GALLERY
 * ---------------------------------------------------------------------------
 * One card at a time, one gesture to learn: drag across the photo and the
 * "after" wipes over the "before".
 *
 * Two decisions worth keeping:
 *
 *   · Swiping does NOT change card. The wipe already owns the horizontal drag,
 *     and two horizontal gestures stacked on the same surface means one of
 *     them always loses. Cards are changed from the thumbnail rail and the
 *     arrows instead - with four entries that is a shorter path than swiping
 *     anyway, and every target is a real button.
 *
 *   · `touch-action: pan-y` on the frame, not `none`. The page must still
 *     scroll under a thumb that happens to land on a photograph; the browser
 *     hands us horizontal movement and keeps vertical for itself, then fires
 *     `pointercancel` if it takes the gesture over.
 *
 * The divider is a real `role="slider"`, focusable and driven by the arrow
 * keys, so the comparison is available without a pointer at all.
 */

/** Divider position, as a percentage of frame width, at rest. */
const REST = 50;
/** Arrow-key step. Page Up/Down multiplies it. */
const STEP = 4;
/** Movement, in px, before a touch counts as a drag rather than a tap. */
const DRAG_THRESHOLD = 5;

const clamp = (n: number) => Math.min(100, Math.max(0, n));

/* -------------------------------------------------------------------------- */
/* Comparison frame                                                            */
/* -------------------------------------------------------------------------- */

function ComparisonFrame({
  locale,
  item,
  active,
  /** The first card teaches the gesture by sweeping itself once. */
  hint,
  priority,
}: {
  locale: Locale;
  item: Transformation;
  active: boolean;
  hint: boolean;
  priority: boolean;
}) {
  const t = getUi(locale).transformations;
  const frameRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(REST);
  // Transitions are on for keyboard steps, taps and the hint sweep, and off
  // while a pointer is down - an eased divider lagging behind the cursor feels
  // broken rather than smooth.
  const [eased, setEased] = useState(true);

  const dragging = useRef(false);
  const moved = useRef(false);
  const startX = useRef(0);

  const pctFromClientX = useCallback((clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return REST;
    return clamp(((clientX - rect.left) / rect.width) * 100);
  }, []);

  /* ---- The one-time hint sweep ---------------------------------------- */
  useEffect(() => {
    if (!hint) return;

    const node = frameRef.current;
    if (!node) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let timers: ReturnType<typeof setTimeout>[] = [];

    const sweep = () => {
      // Far enough to read as a reveal, short enough not to look like a demo
      // that is running the interaction for you.
      timers = [
        setTimeout(() => setPosition(74), 420),
        setTimeout(() => setPosition(28), 1180),
        setTimeout(() => setPosition(REST), 1940),
      ];
    };

    if (typeof IntersectionObserver === "undefined") {
      sweep();
      return () => timers.forEach(clearTimeout);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          sweep();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [hint]);

  /* ---- Pointer ---------------------------------------------------------- */

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!active) return;
    frameRef.current?.setPointerCapture(event.pointerId);
    dragging.current = true;
    moved.current = false;
    startX.current = event.clientX;

    // A mouse is already precise, so it grabs the divider immediately. A touch
    // waits: the same press might turn out to be the start of a page scroll.
    if (event.pointerType === "mouse") {
      setEased(false);
      setPosition(pctFromClientX(event.clientX));
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    if (
      !moved.current &&
      Math.abs(event.clientX - startX.current) < DRAG_THRESHOLD
    ) {
      return;
    }
    moved.current = true;
    setEased(false);
    setPosition(pctFromClientX(event.clientX));
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    dragging.current = false;
    // A tap that never became a drag glides the divider to where it landed.
    if (!moved.current) {
      setEased(true);
      setPosition(pctFromClientX(event.clientX));
    }
  }

  function onPointerCancel() {
    dragging.current = false;
  }

  /* ---- Keyboard --------------------------------------------------------- */

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const step =
      event.key === "PageUp" || event.key === "PageDown" ? STEP * 4 : STEP;

    let next: number | null = null;
    if (event.key === "ArrowLeft" || event.key === "PageDown") {
      next = position - step;
    } else if (event.key === "ArrowRight" || event.key === "PageUp") {
      next = position + step;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = 100;
    }

    if (next === null) return;
    event.preventDefault();
    setEased(true);
    setPosition(clamp(next));
  }

  const rounded = Math.round(position);
  const easeClass = eased
    ? "transition-[clip-path,left] duration-500 ease-editorial"
    : "";

  return (
    <div
      ref={frameRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className={cn(
        "relative isolate aspect-4/5 w-full select-none overflow-hidden rounded-media bg-canvas",
        // Vertical scrolling still belongs to the page; only horizontal
        // movement is ours.
        "touch-pan-y",
        active ? "cursor-ew-resize" : "cursor-default",
      )}
    >
      {/* Base layer - the "before", always fully painted underneath. */}
      <Image
        src={item.before.src as string}
        alt={item.before.alt}
        fill
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 60vw, 30vw"
        quality={82}
        className="object-cover"
        style={{ objectPosition: item.before.objectPosition }}
        draggable={false}
      />

      {/* Reveal layer - the "after", clipped to everything right of the
          divider. Both frames are the same 4:5 crop at the same subject
          scale, so the two bodies stay registered as the divider moves. */}
      <div
        className={cn("absolute inset-0", easeClass)}
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <Image
          src={item.after.src as string}
          alt={item.after.alt}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 60vw, 30vw"
          quality={82}
          className="object-cover"
          style={{ objectPosition: item.after.objectPosition }}
          draggable={false}
        />
      </div>

      {/* Labels. Each fades as its own side is squeezed out, so the pair never
          claims to show something that is no longer on screen. */}
      <span
        aria-hidden="true"
        className="type-micro pointer-events-none absolute left-3 top-3 rounded-pill bg-surface-pure/92 px-2.5 py-1.5 text-ink-strong transition-opacity duration-300 sm:left-4 sm:top-4"
        style={{ opacity: position < 14 ? 0 : 1 }}
      >
        {t.before}
      </span>
      <span
        aria-hidden="true"
        className="type-micro pointer-events-none absolute right-3 top-3 rounded-pill bg-lime px-2.5 py-1.5 text-ink-strong transition-opacity duration-300 sm:right-4 sm:top-4"
        style={{ opacity: position > 86 ? 0 : 1 }}
      >
        {t.after}
      </span>

      {/* The divider. */}
      <div
        role="slider"
        tabIndex={active ? 0 : -1}
        aria-label={t.sliderLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rounded}
        aria-valuetext={t.sliderValueText(rounded)}
        onKeyDown={onKeyDown}
        className={cn(
          "absolute inset-y-0 z-10 w-11 -translate-x-1/2 cursor-ew-resize",
          easeClass,
        )}
        style={{ left: `${position}%` }}
      >
        {/* Hairline. */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-surface-pure/90"
        />
        {/* Knob. The centring translate and the idle nudge live on separate
            elements - Tailwind v4 centres with the `translate` property and the
            animation drives `transform`, and stacking both on one node makes
            the offset depend on which of the two happens to win. */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <span className="ta-knob flex h-11 w-11 items-center justify-center rounded-pill bg-surface-pure text-ink-strong">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <path
                d="M9.5 8 5.5 12l4 4M14.5 8l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Thumbnail rail                                                              */
/* -------------------------------------------------------------------------- */

function RailThumb({
  item,
  index,
  selected,
  label,
  onSelect,
}: {
  item: Transformation;
  index: number;
  selected: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      // `aria-pressed` rather than tab semantics: a real tablist owes the
      // reader roving tabindex and arrow-key navigation between tabs, and the
      // arrows here already move between cards. This matches `.slot-day`.
      aria-pressed={selected}
      aria-label={label}
      onClick={onSelect}
      className={cn(
        "group relative aspect-square w-full overflow-hidden rounded-chip bg-canvas",
        "transition-transform duration-500 ease-editorial",
        selected ? "scale-100" : "hover:scale-[1.04]",
      )}
    >
      {/* The thumb is itself a miniature before/after: left half before,
          right half after, split down the middle. */}
      <Image
        src={item.before.src as string}
        alt=""
        fill
        loading="lazy"
        sizes="(max-width: 640px) 22vw, 8vw"
        quality={82}
        className="object-cover"
        style={{ objectPosition: item.before.objectPosition }}
      />
      <div className="absolute inset-0" style={{ clipPath: "inset(0 0 0 50%)" }}>
        <Image
          src={item.after.src as string}
          alt=""
          fill
          loading="lazy"
          sizes="(max-width: 640px) 22vw, 8vw"
          quality={82}
          className="object-cover"
          style={{ objectPosition: item.after.objectPosition }}
        />
      </div>

      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-surface-pure/70"
      />

      {/* Unselected thumbs sit back behind a wash; the selected one is clear
          and carries the lime ring. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 rounded-[inherit] transition-opacity duration-500 ease-editorial",
          selected
            ? "bg-ink-strong/0 opacity-0"
            : "bg-ink-strong/45 opacity-100 group-hover:opacity-40",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 rounded-[inherit] transition-all duration-500 ease-editorial",
          selected
            ? "shadow-[inset_0_0_0_2.5px_var(--color-lime),inset_0_0_0_4px_var(--color-ink-strong)]"
            : "shadow-[inset_0_0_0_1px_var(--color-line-strong)]",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "type-micro absolute bottom-1 left-1/2 -translate-x-1/2 tabular-nums transition-colors duration-500",
          selected ? "text-lime" : "text-white/75",
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Gallery                                                                     */
/* -------------------------------------------------------------------------- */

export function TransformationGallery({
  locale,
  items,
  className,
}: {
  locale: Locale;
  items: readonly Transformation[];
  className?: string;
}) {
  const t = getUi(locale).transformations;
  const [index, setIndex] = useState(0);

  if (items.length === 0) return null;

  const total = items.length;
  const current = items[index];
  const go = (next: number) => setIndex((next + total) % total);

  return (
    <div
      className={cn(
        "grid items-center gap-8 lg:grid-cols-12 lg:gap-12 xl:gap-16",
        className,
      )}
    >
      {/* ---- The deck --------------------------------------------------- */}
      <div className="lg:col-span-6 xl:col-span-5">
        <div className="mx-auto w-full max-w-[26rem] lg:max-w-none">
          <div className="rounded-[calc(var(--radius-media)+5px)] bg-canvas-deep p-[5px] hairline-bezel">
            {/* One stacking context holding every card. They all share the
                4:5 ratio, so the frame never resizes as cards change and the
                page below it never jumps. */}
            <div className="relative aspect-4/5 w-full overflow-hidden rounded-media">
              {items.map((item, i) => {
                const active = i === index;
                return (
                  <div
                    key={item.id}
                    aria-hidden={!active}
                    className={cn(
                      "absolute inset-0 transition-[opacity,transform] duration-700 ease-editorial",
                      active
                        ? "z-10 scale-100 opacity-100"
                        : "pointer-events-none z-0 scale-[1.04] opacity-0",
                    )}
                  >
                    <ComparisonFrame
                      locale={locale}
                      item={item}
                      active={active}
                      hint={i === 0}
                      priority={i === 0}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ---- Meta and controls ------------------------------------------ */}
      <div className="lg:col-span-6 lg:col-start-7 xl:col-span-6 xl:col-start-7">
        {/* Counter. The active number is the only large figure on the card,
            so it carries the section's rhythm. */}
        <div className="flex items-baseline gap-3">
          <span
            key={index}
            className="type-card type-index block text-ink-strong ta-count-in"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="type-micro text-ink/35">
            / {String(total).padStart(2, "0")}
          </span>
        </div>

        {/* Live region: the counter is the only thing that changes when a
            different card is chosen, so it is what gets announced. */}
        <p className="sr-only" aria-live="polite">
          {t.counter(index + 1, total)}
        </p>

        <div className="mt-5 flex items-center gap-2.5 text-ink-muted">
          <svg viewBox="0 0 24 24" className="h-4 w-4 flex-none" fill="none" aria-hidden="true">
            <path
              d="M9.5 8 5.5 12l4 4M14.5 8l4 4-4 4M12 5.5v13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-[0.9375rem] leading-snug">{t.dragHint}</p>
        </div>

        {/* The one figure anywhere in the data, and only for the client who
            printed it on their own photo. */}
        {current.weight ? (
          <dl className="mt-7 inline-flex items-center gap-3 rounded-pill bg-surface px-4 py-2.5 hairline">
            <dt className="type-micro text-ink/40">{t.weightLabel}</dt>
            <dd className="flex items-center gap-2 text-[0.9375rem] tabular-nums text-ink-strong">
              <span className="text-ink/45">
                {formatWeight(current.weight.from, locale)}
              </span>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-ink/30" fill="none" aria-hidden="true">
                <path
                  d="M5 12h14m-5-5 5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{formatWeight(current.weight.to, locale)}</span>
            </dd>
          </dl>
        ) : null}

        {/* Rail + arrows. */}
        <div className="mt-9 flex items-center gap-4 sm:gap-5">
          <div
            role="group"
            aria-label={t.sectionLabel}
            className="grid flex-1 grid-cols-4 gap-2 sm:max-w-[22rem] sm:gap-2.5"
          >
            {items.map((item, i) => (
              <RailThumb
                key={item.id}
                item={item}
                index={i}
                selected={i === index}
                label={t.select(i + 1)}
                onSelect={() => setIndex(i)}
              />
            ))}
          </div>

          <div className="flex flex-none gap-2">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label={t.previous}
              className="flex h-11 w-11 items-center justify-center rounded-pill bg-surface text-ink-strong transition-colors duration-300 ease-editorial hairline hover:bg-surface-pure active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path
                  d="M14 6l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label={t.next}
              className="flex h-11 w-11 items-center justify-center rounded-pill bg-ink text-surface-pure transition-colors duration-300 ease-editorial hover:bg-ink-strong active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path
                  d="M10 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
