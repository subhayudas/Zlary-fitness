/**
 * Call availability.
 *
 * The site owns its own calendar rather than framing somebody else's, so the
 * rules that decide which slots exist live here — in one place, readable, and
 * enforced identically by the endpoint that lists slots and by the endpoint that
 * books one. A slot the visitor can see is a slot the server will accept.
 *
 * ---------------------------------------------------------------------------
 * TIME ZONES
 * ---------------------------------------------------------------------------
 * Availability is expressed in the coach's wall clock ("Tuesday 17:00"), and a
 * booking is an instant ("2026-08-04T21:00Z"). Converting between the two is the
 * only genuinely hard part of a scheduler, and it is done here with `Intl`
 * rather than a date library: `Intl.DateTimeFormat` is the same IANA database
 * the platform uses, so it is right about DST without another dependency.
 *
 * Everything crossing a boundary — the API response, the database, the calendar
 * event — is a UTC instant. The wall clock only exists inside this module and on
 * screen.
 */

/* -------------------------------------------------------------------------- */
/* Time-zone primitives                                                        */
/* -------------------------------------------------------------------------- */

const formatters = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      // `hourCycle` rather than `hour12: false`: the latter renders midnight as
      // hour 24 in some engines, which then reads as the next day.
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

export type WallClock = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

/** What a clock in `timeZone` reads at the given instant. */
export function wallClockAt(instant: Date, timeZone: string): WallClock {
  const parts = partsFormatter(timeZone).formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    second: read("second"),
  };
}

/** How far `timeZone` is ahead of UTC at a given instant, in milliseconds. */
function offsetAt(instant: Date, timeZone: string): number {
  const clock = wallClockAt(instant, timeZone);
  const asIfUtc = Date.UTC(
    clock.year,
    clock.month - 1,
    clock.day,
    clock.hour,
    clock.minute,
    clock.second,
  );
  return asIfUtc - instant.getTime();
}

/**
 * A wall clock in `timeZone` → the instant it names.
 *
 * Resolved twice on purpose. The first pass uses the offset in force at the
 * *guessed* instant, which is wrong for the hour either side of a DST change;
 * feeding that corrected instant back in picks up the right offset. Two passes
 * are enough for every real transition (they are all ≤ 1 h, and none is
 * followed by another within a day).
 */
export function instantFromWallClock(
  year: number,
  month: number,
  day: number,
  minutesIntoDay: number,
  timeZone: string,
): Date {
  const naive = Date.UTC(year, month - 1, day) + minutesIntoDay * 60_000;
  const first = naive - offsetAt(new Date(naive), timeZone);
  return new Date(naive - offsetAt(new Date(first), timeZone));
}

/** "2026-08-04" for a civil date. */
export function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/* -------------------------------------------------------------------------- */
/* Configuration                                                               */
/* -------------------------------------------------------------------------- */

/** Minutes from midnight. `{ from: 540, to: 720 }` is 09:00–12:00. */
export type HourRange = { from: number; to: number };

/** Indexed by `Date.getUTCDay()`: 0 is Sunday. */
export type WeeklyHours = readonly (readonly HourRange[])[];

export type ScheduleConfig = {
  timeZone: string;
  /** Length of the call itself. */
  durationMinutes: number;
  /** Dead time kept either side of a call. Also spaces the generated slots. */
  bufferMinutes: number;
  /** How soon a visitor may book. Stops "in twenty minutes" bookings. */
  leadHours: number;
  /** How far ahead the calendar opens. */
  horizonDays: number;
  weekly: WeeklyHours;
  /** `YYYY-MM-DD` days closed regardless of the weekly hours. */
  blackout: ReadonlySet<string>;
  /** Where the call happens. Shown on screen, in the invite and in the event. */
  location: string | null;
};

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

/**
 * Weekly hours, as `"<days> <ranges>"` entries separated by `;`.
 *
 *   mon-fri 09:00-12:00,17:00-20:00; sat 09:00-12:00
 *
 * Days are `mon`, `mon-fri` or `mon,wed,fri`. Ranges are `HH:MM-HH:MM`.
 */
const DEFAULT_HOURS = "mon-fri 09:00-12:00,17:00-20:00; sat 09:00-12:00";

function parseDays(spec: string): number[] {
  const index = (token: string) =>
    DAY_KEYS.indexOf(token.trim().slice(0, 3).toLowerCase() as (typeof DAY_KEYS)[number]);

  const days = new Set<number>();

  for (const group of spec.split(",")) {
    const [rawStart, rawEnd] = group.split("-");
    const start = index(rawStart ?? "");
    if (start < 0) continue;

    if (rawEnd === undefined) {
      days.add(start);
      continue;
    }

    const end = index(rawEnd);
    if (end < 0) continue;

    // Wraps around the week, so `fri-mon` means Fri, Sat, Sun, Mon.
    for (let step = 0; step <= (end - start + 7) % 7; step += 1) {
      days.add((start + step) % 7);
    }
  }

  return [...days];
}

function parseMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 24 || minutes > 59) return null;

  return hours * 60 + minutes;
}

function parseRanges(spec: string): HourRange[] {
  const ranges: HourRange[] = [];

  for (const part of spec.split(",")) {
    const [rawFrom, rawTo] = part.split("-");
    if (rawFrom === undefined || rawTo === undefined) continue;

    const from = parseMinutes(rawFrom);
    const to = parseMinutes(rawTo);
    // A backwards or empty range is a typo, not an overnight shift.
    if (from === null || to === null || to <= from) continue;

    ranges.push({ from, to });
  }

  return ranges;
}

function parseWeekly(spec: string): WeeklyHours | null {
  const weekly: HourRange[][] = [[], [], [], [], [], [], []];
  let matched = 0;

  for (const entry of spec.split(";")) {
    const trimmed = entry.trim();
    if (!trimmed) continue;

    const split = trimmed.indexOf(" ");
    if (split < 0) continue;

    const days = parseDays(trimmed.slice(0, split));
    const ranges = parseRanges(trimmed.slice(split + 1));
    if (!days.length || !ranges.length) continue;

    for (const day of days) weekly[day].push(...ranges);
    matched += 1;
  }

  // Nothing understood: the caller falls back rather than opening no hours at
  // all, which would present an empty calendar as if the coach were fully booked.
  return matched > 0 ? weekly : null;
}

function positiveInt(raw: string | undefined, fallback: number): number {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function nonNegativeInt(raw: string | undefined, fallback: number): number {
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;
}

/** Rejects a mistyped zone rather than throwing on the first format call. */
function safeTimeZone(raw: string | undefined, fallback: string): string {
  const candidate = raw?.trim();
  if (!candidate) return fallback;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: candidate });
    return candidate;
  } catch {
    return fallback;
  }
}

let cachedConfig: ScheduleConfig | null = null;

export function getScheduleConfig(): ScheduleConfig {
  if (cachedConfig) return cachedConfig;

  const weekly =
    parseWeekly(process.env.BOOKING_HOURS?.trim() || DEFAULT_HOURS) ??
    parseWeekly(DEFAULT_HOURS)!;

  const blackout = new Set(
    (process.env.BOOKING_BLACKOUT_DATES ?? "")
      .split(",")
      .map((day) => day.trim())
      .filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day)),
  );

  cachedConfig = {
    timeZone: safeTimeZone(process.env.BOOKING_TIMEZONE, "America/Toronto"),
    durationMinutes: positiveInt(process.env.BOOKING_DURATION_MINUTES, 30),
    bufferMinutes: nonNegativeInt(process.env.BOOKING_BUFFER_MINUTES, 15),
    leadHours: nonNegativeInt(process.env.BOOKING_LEAD_HOURS, 12),
    // Capped: a year-long calendar is a year of slots to render and to keep free.
    horizonDays: Math.min(positiveInt(process.env.BOOKING_HORIZON_DAYS, 21), 120),
    weekly,
    blackout,
    location: process.env.BOOKING_LOCATION?.trim() || null,
  };

  return cachedConfig;
}

/* -------------------------------------------------------------------------- */
/* Slot generation                                                             */
/* -------------------------------------------------------------------------- */

/** A half-open interval of instants, in epoch milliseconds. */
export type Interval = { start: number; end: number };

export type Slot = {
  /** ISO instant — what the browser sends back and what the database stores. */
  start: string;
  end: string;
};

export type DayAvailability = {
  /** `YYYY-MM-DD` in the coach's time zone. */
  date: string;
  slots: Slot[];
};

/**
 * Every slot the schedule allows between now and the horizon, minus the ones
 * something is already occupying.
 *
 * `busy` carries confirmed bookings and, when the integration is configured, the
 * coach's real calendar. Both are widened by the buffer so a call never starts
 * the minute another one ends.
 */
export function generateAvailability({
  config,
  busy = [],
  now = new Date(),
}: {
  config: ScheduleConfig;
  busy?: readonly Interval[];
  now?: Date;
}): DayAvailability[] {
  const bufferMs = config.bufferMinutes * 60_000;
  const durationMs = config.durationMinutes * 60_000;
  const earliest = now.getTime() + config.leadHours * 3_600_000;

  const blocked = busy.map((interval) => ({
    start: interval.start - bufferMs,
    end: interval.end + bufferMs,
  }));

  const today = wallClockAt(now, config.timeZone);
  const days: DayAvailability[] = [];

  for (let offset = 0; offset <= config.horizonDays; offset += 1) {
    // Civil-date arithmetic: adding to the day field of a UTC date rolls months
    // and years correctly, and never touches a clock.
    const civil = new Date(
      Date.UTC(today.year, today.month - 1, today.day + offset),
    );
    const year = civil.getUTCFullYear();
    const month = civil.getUTCMonth() + 1;
    const day = civil.getUTCDate();
    const key = dateKey(year, month, day);

    if (config.blackout.has(key)) continue;

    const ranges = config.weekly[civil.getUTCDay()];
    if (!ranges?.length) continue;

    const slots: Slot[] = [];

    for (const range of ranges) {
      const step = config.durationMinutes + config.bufferMinutes;

      for (let at = range.from; at + config.durationMinutes <= range.to; at += step) {
        const start = instantFromWallClock(year, month, day, at, config.timeZone);
        const startMs = start.getTime();
        const endMs = startMs + durationMs;

        if (startMs < earliest) continue;
        if (blocked.some((b) => startMs < b.end && endMs > b.start)) continue;

        slots.push({
          start: start.toISOString(),
          end: new Date(endMs).toISOString(),
        });
      }
    }

    if (slots.length) days.push({ date: key, slots });
  }

  return days;
}

/** The window the availability query covers, used to fetch busy intervals. */
export function availabilityWindow(
  config: ScheduleConfig,
  now = new Date(),
): Interval {
  const today = wallClockAt(now, config.timeZone);
  const end = instantFromWallClock(
    today.year,
    today.month,
    today.day + config.horizonDays + 1,
    0,
    config.timeZone,
  );

  return { start: now.getTime(), end: end.getTime() };
}

/**
 * Whether a specific instant is a slot this schedule offers.
 *
 * The booking endpoint asks this before it writes anything: the browser sends
 * back a start time it was given, and "was given" is not a guarantee — the page
 * may have been open for an hour, or the value may have been edited by hand.
 */
export function isBookableSlot({
  startIso,
  config,
  busy = [],
  now = new Date(),
}: {
  startIso: string;
  config: ScheduleConfig;
  busy?: readonly Interval[];
  now?: Date;
}): boolean {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return false;

  const days = generateAvailability({ config, busy, now });
  const target = start.toISOString();

  return days.some((day) => day.slots.some((slot) => slot.start === target));
}

/** End of the call that starts at `startIso`. */
export function slotEnd(startIso: string, config: ScheduleConfig): Date {
  return new Date(
    new Date(startIso).getTime() + config.durationMinutes * 60_000,
  );
}
