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

/* -------------------------------------------------------------------------- */
/* Booked slots                                                                */
/* -------------------------------------------------------------------------- */

/**
 * A slot is stored and transmitted as an instant, and read by a person as a
 * wall clock. These three do that conversion, and they all take the time zone
 * explicitly — never the machine's.
 *
 * That is the whole point: the appointment is at the coach's clock, and it has
 * to read identically on the confirmation screen, in the confirmation email
 * rendered on a server in another region, and on the visitor's phone abroad.
 * Passing the zone in is what makes those three agree.
 */

/** "mardi 4 août 2026" / "Tuesday, August 4, 2026". */
export function formatSlotDate(
  iso: string,
  timeZone: string,
  intlLocale: string,
): string {
  return new Intl.DateTimeFormat(intlLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(new Date(iso));
}

/** "17:00 – 17:30". */
export function formatSlotRange(
  startIso: string,
  endIso: string,
  timeZone: string,
  intlLocale: string,
): string {
  const formatter = new Intl.DateTimeFormat(intlLocale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  });
  return `${formatter.format(new Date(startIso))} – ${formatter.format(new Date(endIso))}`;
}

/**
 * The short zone name in force at that instant — "HAE", "EDT".
 *
 * Read at the instant of the slot rather than at "now", so a call booked across
 * a daylight-saving change is labelled with the offset it will actually happen
 * under.
 */
export function formatTimeZoneLabel(
  iso: string,
  timeZone: string,
  intlLocale: string,
): string {
  const parts = new Intl.DateTimeFormat(intlLocale, {
    timeZone,
    timeZoneName: "short",
  }).formatToParts(new Date(iso));

  return parts.find((part) => part.type === "timeZoneName")?.value ?? timeZone;
}

/** The visitor's own zone, or null where the browser will not say. */
export function browserTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

export const isDev = process.env.NODE_ENV === "development";
