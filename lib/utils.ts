/**
 * Tiny helpers. Kept dependency-free on purpose — `clsx`/`tailwind-merge`
 * would be two more packages for something a five-line function handles.
 */

export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[];

export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const value of values) {
    if (!value && value !== 0) continue;
    if (Array.isArray(value)) {
      const nested = cn(...value);
      if (nested) out.push(nested);
    } else {
      out.push(String(value));
    }
  }
  return out.join(" ");
}

/**
 * Wall-clock helpers.
 *
 * Kept here rather than inlined in components: `Date.now()` is impure, and the
 * React Compiler rightly refuses to reason about a component that calls it.
 * Both of these are only ever called from effects and event handlers.
 */
export function nowMs(): number {
  return Date.now();
}

export function elapsedSince(startMs: number | null): number | undefined {
  return startMs === null ? undefined : Date.now() - startMs;
}

/** Stable, URL-safe id. Used for the form's idempotency key. */
export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

/** Normalises an Instagram handle for display: strips @, URL, trailing slash. */
export function normalizeInstagram(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/\/+$/, "")
    .replace(/^@/, "");
}

/**
 * Formats an ISO date in the reader's language.
 *
 * UTC is pinned so the rendered string is stable: without it, the same build
 * would print a different day either side of midnight depending on the server's
 * timezone, and the prerendered HTML would disagree with the client.
 */
export function formatDate(iso: string, intlLocale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(intlLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export const isDev = process.env.NODE_ENV === "development";
