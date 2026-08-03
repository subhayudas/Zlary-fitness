import { fetchBusyIntervals } from "@/lib/google-calendar";
import {
  availabilityWindow,
  generateAvailability,
  getScheduleConfig,
  type DayAvailability,
  type Interval,
  type ScheduleConfig,
} from "@/lib/schedule";
import {
  APPLICATIONS_TABLE,
  LIVE_BOOKING_STATUSES,
  getSupabaseAdmin,
} from "@/lib/supabase";

/**
 * What is actually free.
 *
 * `lib/schedule.ts` knows the rules and `lib/google-calendar.ts` knows the
 * coach's diary; this is the one place that puts them together, so the endpoint
 * that lists slots and the endpoint that books one are answering the same
 * question. Two implementations of "is this free?" is how a booking system ends
 * up double-booking somebody.
 */

export type AvailabilitySources = {
  /** Calls already booked through the site. */
  bookings: Interval[];
  /** The coach's own calendar, or null when Google is unconfigured/unreachable. */
  calendar: Interval[] | null;
};

/**
 * Busy time between two instants, from every source that has an opinion.
 *
 * The two are fetched together: neither depends on the other, and the visitor is
 * waiting for a calendar to render.
 */
export async function loadBusy(window: Interval): Promise<AvailabilitySources> {
  const from = new Date(window.start);
  const to = new Date(window.end);

  const [bookings, calendar] = await Promise.all([
    loadBookedIntervals(from, to),
    fetchBusyIntervals(from, to),
  ]);

  return { bookings, calendar };
}

/**
 * Slots already taken through the site.
 *
 * A read failure returns `[]` rather than throwing, and that is a deliberate
 * trade: an empty list can offer a slot that is in fact taken, and the unique
 * index in migration 0002 will refuse the second booking with a message the
 * visitor can act on. Throwing would instead show an empty calendar, which
 * reads as "no availability at all" and loses the lead outright.
 */
async function loadBookedIntervals(from: Date, to: Date): Promise<Interval[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase.configured) return [];

  const { data, error } = await supabase.client
    .from(APPLICATIONS_TABLE)
    .select("slot_start, slot_end")
    .gte("slot_start", from.toISOString())
    .lte("slot_start", to.toISOString())
    .in("status", [...LIVE_BOOKING_STATUSES]);

  if (error || !data) return [];

  return data.flatMap((row: { slot_start: string | null; slot_end: string | null }) => {
    if (!row.slot_start || !row.slot_end) return [];

    const start = Date.parse(row.slot_start);
    const end = Date.parse(row.slot_end);
    return Number.isNaN(start) || Number.isNaN(end) ? [] : [{ start, end }];
  });
}

export type Availability = {
  config: ScheduleConfig;
  days: DayAvailability[];
  busy: Interval[];
};

/** Everything the calendar screen needs, in one call. */
export async function loadAvailability(now = new Date()): Promise<Availability> {
  const config = getScheduleConfig();
  const sources = await loadBusy(availabilityWindow(config, now));
  const busy = [...sources.bookings, ...(sources.calendar ?? [])];

  return {
    config,
    busy,
    days: generateAvailability({ config, busy, now }),
  };
}
