"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "@/components/icons";
import { Rule } from "@/components/ui/typography";
import type { FaqItem } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * Accessible FAQ accordion.
 *
 * Native <button> per row with `aria-expanded` / `aria-controls`, and the panel
 * kept in the DOM so in-page search and assistive tech can reach it.
 *
 * The open/close transition animates `grid-template-rows` (0fr → 1fr) rather
 * than `height`, so there is no measurement step and no layout read on every
 * frame. Reduced-motion collapses the transition to nothing.
 *
 * Only questions with a confirmed answer are ever passed in — an accordion row
 * that opens onto nothing reads as a broken site.
 */
export function FAQAccordion({
  items,
  className,
  /** Index opened on first render. `null` opens nothing. */
  defaultOpen = 0,
}: {
  items: readonly FaqItem[];
  className?: string;
  defaultOpen?: number | null;
}) {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(
    defaultOpen !== null && items[defaultOpen] ? items[defaultOpen].id : null,
  );

  if (items.length === 0) return null;

  return (
    <div className={cn("w-full", className)}>
      {items.map((item) => {
        if (item.answer.status !== "confirmed") return null;

        const open = openId === item.id;
        const buttonId = `${baseId}-${item.id}-button`;
        const panelId = `${baseId}-${item.id}-panel`;

        return (
          <div key={item.id}>
            <Rule />
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : item.id)}
                className="group flex w-full items-start justify-between gap-6 py-6 text-left md:py-7"
              >
                <span className="text-pretty text-lg leading-snug tracking-[-0.02em] text-ink md:text-xl">
                  {item.question}
                </span>

                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-pill transition-colors duration-300 ease-editorial",
                    open
                      ? "bg-lime text-ink-strong"
                      : "bg-ink/6 text-ink/60 group-hover:bg-ink/12",
                  )}
                >
                  {open ? (
                    <Minus className="size-4" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid transition-[grid-template-rows] duration-500 ease-editorial",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p
                  className={cn(
                    "measure-lg pb-7 pr-10 text-pretty text-[0.9375rem] leading-relaxed text-ink-muted transition-opacity duration-500 ease-editorial md:text-base",
                    open ? "opacity-100" : "opacity-0",
                  )}
                >
                  {item.answer.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <Rule />
    </div>
  );
}
