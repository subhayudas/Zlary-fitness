"use client";

import { useEffect, useRef, useState } from "react";
import { Rule } from "@/components/ui/typography";

/**
 * The friction statements, with a spotlight that follows the reader.
 *
 * Which row is live is decided by geometry rather than by a scroll listener: a
 * single IntersectionObserver watches a thin band across the middle of the
 * viewport, and whenever a row crosses it the row nearest the centre takes
 * over. Scrolling the section therefore walks the list, one statement at a
 * time, at whatever pace the visitor reads. A mouse overrides that for as long
 * as it is inside the list - pointing at a row always beats where the page
 * happens to sit.
 *
 * Every moving part is absolutely positioned or transform-only, so the list
 * occupies exactly the box it occupied before any of it could move. The rail
 * and the indices ride in the empty column-7 gutter, which is why they only
 * appear once that gutter exists (lg and up); below it the ink rule, the tint
 * and the copy carry the same state.
 */
export function ProblemStatements({
  statements,
}: {
  statements: readonly string[];
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);

  /** Row nearest the middle of the viewport. */
  const [reading, setReading] = useState(0);
  /** Row under the pointer. Wins while there is one. */
  const [pointed, setPointed] = useState<number | null>(null);
  /** Centre of the active row, in pixels down the list. */
  const [markerY, setMarkerY] = useState<number | null>(null);

  const active = pointed ?? reading;
  const count = statements.length;

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const rows = rowRefs.current.slice(0, count).filter(Boolean) as HTMLLIElement[];
    if (rows.length === 0) return;

    const nearestToCentre = () => {
      const centre = window.innerHeight / 2;
      let best = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      rows.forEach((row, index) => {
        const box = row.getBoundingClientRect();
        const distance = Math.abs(box.top + box.height / 2 - centre);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });

      setReading(best);
    };

    const observer = new IntersectionObserver(
      // The entries are only the trigger; the winner is always measured. Two
      // adjacent rows can sit in the band at once, and a row *leaving* it is
      // just as much a handover as a row entering - an earlier version that
      // only recomputed on `isIntersecting` left the last statement dark,
      // because the row above it exits the band alone.
      () => nearestToCentre(),
      // A razor-thin band across the middle of the viewport: a row reports in
      // only as it crosses the reader's eye line.
      { rootMargin: "-46% 0px -46% 0px", threshold: 0 },
    );

    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [count]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    let frame = 0;
    const place = () => {
      const row = rowRefs.current[active];
      if (row) setMarkerY(row.offsetTop + row.offsetHeight / 2);
    };

    place();

    // Row heights change with the viewport and again once the webfont lands,
    // and the marker is placed in pixels - remeasure rather than assume.
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    });
    observer.observe(list);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [active]);

  return (
    <ul
      ref={listRef}
      className="statement-list"
      onPointerLeave={() => setPointed(null)}
    >
      <li aria-hidden="true" className="statement-rail" />
      <li
        aria-hidden="true"
        className="statement-marker"
        data-ready={markerY === null ? "false" : "true"}
        style={{ transform: `translate3d(0, ${markerY ?? 0}px, 0) translateY(-50%)` }}
      />

      {statements.map((statement, index) => (
        <li
          key={statement}
          ref={(node) => {
            rowRefs.current[index] = node;
          }}
          className="statement-row"
          data-active={index === active ? "true" : "false"}
          onPointerEnter={(event) => {
            // Touch fires this on tap and never fires the matching leave, so a
            // finger would pin a row permanently. Pointers that can hover only.
            if (event.pointerType !== "touch") setPointed(index);
          }}
        >
          <div className="relative">
            <Rule />
            <span aria-hidden="true" className="statement-line" />
          </div>

          <span aria-hidden="true" className="statement-index type-index">
            {String(index + 1).padStart(2, "0")}
          </span>

          <p className="statement-copy py-4 text-pretty text-[0.9375rem] leading-relaxed md:py-5 md:text-base">
            {statement}
          </p>
        </li>
      ))}

      <li aria-hidden="true">
        <Rule />
      </li>
    </ul>
  );
}
