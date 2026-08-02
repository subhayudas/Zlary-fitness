import type { Confirmable } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * Development-only marker for a fact that is still `awaiting(...)`.
 *
 * In production this renders `null`, so an unconfirmed value is simply absent
 * from the page — never shown as if it were real, and never shown as a visible
 * "TODO" to a visitor.
 */
export function PendingNote({
  note,
  className,
}: {
  note: string;
  className?: string;
}) {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <span
      className={cn(
        "type-micro inline-flex max-w-full items-center gap-2 rounded-chip border border-dashed border-ink/25 px-2.5 py-1.5 text-left normal-case tracking-normal text-ink/45",
        className,
      )}
      data-dev-placeholder="true"
    >
      <span aria-hidden="true" className="text-ink/30">
        ⌁
      </span>
      <span className="truncate">À confirmer : {note}</span>
    </span>
  );
}

/**
 * Renders `children(value)` when the fact is confirmed, and the dev-only marker
 * otherwise. Keeps the `status === "confirmed"` check out of every call site.
 */
export function WhenConfirmed<T>({
  fact,
  children,
  className,
}: {
  fact: Confirmable<T>;
  children: (value: T) => React.ReactNode;
  className?: string;
}) {
  if (fact.status === "confirmed") return <>{children(fact.value)}</>;
  return <PendingNote note={fact.note} className={className} />;
}
