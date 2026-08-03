import { NextResponse } from "next/server";
import { loadAvailability } from "@/lib/availability";
import { clientIp, hashKey, rateLimit } from "@/lib/rate-limit";

/**
 * Free slots for the booking calendar.
 *
 * Read-only, and the only endpoint the calendar screen talks to before someone
 * commits to a time. It returns instants — never wall-clock strings — plus the
 * time zone they should be read in, so the browser, the server and the calendar
 * event can never disagree about when 17:00 is.
 *
 * Nothing identifying goes in or out: no name, no email, no cookie. It is a
 * public timetable, which is exactly what an availability list should be.
 */

export const runtime = "nodejs";
/** Availability changes the moment somebody books. Never cache it. */
export const dynamic = "force-dynamic";

/** Generous — a visitor moving between weeks re-reads this legitimately. */
const RATE_LIMIT = { limit: 60, windowMs: 5 * 60 * 1000 };

export async function GET(request: Request) {
  const ip = clientIp(request.headers);
  const limit = rateLimit(`availability:${hashKey(ip)}`, RATE_LIMIT);

  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, code: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  try {
    const { config, days } = await loadAvailability();

    return NextResponse.json(
      {
        ok: true,
        timeZone: config.timeZone,
        durationMinutes: config.durationMinutes,
        location: config.location,
        days,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    // The screen has a designed failure state; it just needs to be told.
    return NextResponse.json(
      { ok: false, code: "availability_unavailable" },
      { status: 503 },
    );
  }
}

/** Anything other than GET is not a thing this endpoint does. */
export async function POST() {
  return NextResponse.json(
    { ok: false, code: "method_not_allowed" },
    { status: 405 },
  );
}
