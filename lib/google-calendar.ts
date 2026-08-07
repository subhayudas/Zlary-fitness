import { createSign } from "node:crypto";

/**
 * Google Calendar, over REST.
 *
 * Two jobs, both optional:
 *
 *   · read the coach's busy times, so the calendar on the site never offers a
 *     slot he is already teaching through;
 *   · write the booked call onto his calendar, so it exists where he actually
 *     looks.
 *
 * ---------------------------------------------------------------------------
 * WHY NO SDK
 * ---------------------------------------------------------------------------
 * `googleapis` is a very large dependency for two endpoints and one signature.
 * A service-account grant is a signed JWT exchanged for an access token - about
 * forty lines with `node:crypto` - and the rest is `fetch`.
 *
 * ---------------------------------------------------------------------------
 * SETUP
 * ---------------------------------------------------------------------------
 *   1. Google Cloud console → create a service account → create a JSON key.
 *   2. Enable the Google Calendar API on that project.
 *   3. In Google Calendar → the coach's calendar → Settings → "Share with
 *      specific people" → add the service-account email with
 *      "Make changes to events".
 *   4. Set GOOGLE_CALENDAR_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL and
 *      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.
 *
 * Every function here degrades to "not configured" rather than throwing, and no
 * caller treats that as an error: a booking is stored, confirmed and emailed
 * whether or not Google is reachable. The calendar is a convenience for the
 * coach, never the record.
 *
 * ---------------------------------------------------------------------------
 * ATTENDEES
 * ---------------------------------------------------------------------------
 * A plain service account cannot add attendees to an event - Google rejects it
 * unless the account has domain-wide delegation. So the applicant is invited by
 * the `.ics` attachment on their confirmation email (see `lib/ics.ts`), which
 * works from any sender and in every mail client. On Google Workspace, setting
 * GOOGLE_IMPERSONATE_SUBJECT to the coach's address turns on real attendee
 * invitations as well.
 */

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const SCOPE = "https://www.googleapis.com/auth/calendar";
const TIMEOUT_MS = 8000;

export type GoogleCalendarConfig = {
  calendarId: string;
  clientEmail: string;
  privateKey: string;
  /** Workspace only: the user the service account acts as. Enables attendees. */
  subject: string | null;
};

/**
 * Environment variables mangle PEM newlines in two familiar ways: they arrive
 * escaped as `\n`, or the whole key is base64-encoded to avoid the question.
 * Both are accepted, because both are what people paste.
 */
function normalizePrivateKey(raw: string): string | null {
  const value = raw.trim().replace(/^["']|["']$/g, "");
  if (!value) return null;

  const unescaped = value.replace(/\\n/g, "\n");
  if (unescaped.includes("BEGIN")) return unescaped;

  try {
    const decoded = Buffer.from(value, "base64").toString("utf8");
    return decoded.includes("BEGIN") ? decoded : null;
  } catch {
    return null;
  }
}

export function getGoogleCalendarConfig(): GoogleCalendarConfig | null {
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim();
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!calendarId || !clientEmail || !rawKey) return null;

  const privateKey = normalizePrivateKey(rawKey);
  if (!privateKey) return null;

  return {
    calendarId,
    clientEmail,
    privateKey,
    subject: process.env.GOOGLE_IMPERSONATE_SUBJECT?.trim() || null,
  };
}

/* -------------------------------------------------------------------------- */
/* Authentication                                                              */
/* -------------------------------------------------------------------------- */

const base64url = (input: string | Buffer) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

/** Tokens last an hour; re-signing one per request would be pure waste. */
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(
  config: GoogleCalendarConfig,
): Promise<string | null> {
  // A minute of slack, so a token cannot expire between this check and its use.
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const claim = {
    iss: config.clientEmail,
    scope: SCOPE,
    aud: TOKEN_ENDPOINT,
    iat: issuedAt,
    exp: issuedAt + 3600,
    ...(config.subject ? { sub: config.subject } : {}),
  };

  const unsigned = `${base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${base64url(
    JSON.stringify(claim),
  )}`;

  let assertion: string;
  try {
    const signature = createSign("RSA-SHA256")
      .update(unsigned)
      .sign(config.privateKey);
    assertion = `${unsigned}.${base64url(signature)}`;
  } catch {
    // A malformed key is a configuration problem, not a request problem.
    return null;
  }

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!payload.access_token) return null;

    cachedToken = {
      value: payload.access_token,
      expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000,
    };

    return cachedToken.value;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Busy times                                                                  */
/* -------------------------------------------------------------------------- */

export type BusyInterval = { start: number; end: number };

/**
 * The coach's committed time between two instants.
 *
 * Returns `null` - not `[]` - when Google cannot be reached. The difference
 * matters: an empty array means "free all week", and a network blip must never
 * be allowed to say that. Callers fall back to the bookings table alone and
 * accept the small risk of a clash over the certainty of an empty calendar.
 */
export async function fetchBusyIntervals(
  from: Date,
  to: Date,
): Promise<BusyInterval[] | null> {
  const config = getGoogleCalendarConfig();
  if (!config) return null;

  const token = await getAccessToken(config);
  if (!token) return null;

  try {
    const response = await fetch(`${CALENDAR_API}/freeBusy`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin: from.toISOString(),
        timeMax: to.toISOString(),
        items: [{ id: config.calendarId }],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      calendars?: Record<
        string,
        { busy?: { start: string; end: string }[]; errors?: unknown[] }
      >;
    };

    const calendar = payload.calendars?.[config.calendarId];
    if (!calendar || calendar.errors?.length) return null;

    return (calendar.busy ?? []).flatMap((period) => {
      const start = Date.parse(period.start);
      const end = Date.parse(period.end);
      return Number.isNaN(start) || Number.isNaN(end) ? [] : [{ start, end }];
    });
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Event creation                                                              */
/* -------------------------------------------------------------------------- */

export type CalendarEvent = {
  summary: string;
  description: string;
  location: string | null;
  start: Date;
  end: Date;
  timeZone: string;
  attendee: { email: string; name: string } | null;
  /**
   * Stable id derived from the booking, so a retried booking updates the same
   * event instead of putting a second copy on the calendar.
   */
  requestId: string;
};

export type CreatedEvent = { id: string; htmlLink: string | null };

export async function createCalendarEvent(
  event: CalendarEvent,
): Promise<{ created: CreatedEvent } | { created: null; reason: string }> {
  const config = getGoogleCalendarConfig();
  if (!config) return { created: null, reason: "Google Agenda non configuré." };

  const token = await getAccessToken(config);
  if (!token) {
    return { created: null, reason: "Authentification Google refusée." };
  }

  // Only a delegated account may invite anyone; a plain service account is
  // rejected outright for the whole request if attendees are present.
  const canInvite = Boolean(config.subject) && Boolean(event.attendee);

  const url = new URL(
    `${CALENDAR_API}/calendars/${encodeURIComponent(config.calendarId)}/events`,
  );
  url.searchParams.set("sendUpdates", canInvite ? "all" : "none");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: event.summary,
        description: event.description,
        ...(event.location ? { location: event.location } : {}),
        start: {
          dateTime: event.start.toISOString(),
          timeZone: event.timeZone,
        },
        end: { dateTime: event.end.toISOString(), timeZone: event.timeZone },
        ...(canInvite && event.attendee
          ? {
              attendees: [
                {
                  email: event.attendee.email,
                  displayName: event.attendee.name,
                },
              ],
            }
          : {}),
        // Carried on the event so a booking can be found from the calendar side.
        extendedProperties: { private: { zlaryBookingId: event.requestId } },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 30 },
          ],
        },
        source: { title: "Zlary Fitness", url: "https://zlaryfitness.com" },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      // Status only: the body echoes the event, which carries a real name.
      return { created: null, reason: `Google a répondu ${response.status}.` };
    }

    const payload = (await response.json()) as {
      id?: string;
      htmlLink?: string;
    };
    if (!payload.id) {
      return { created: null, reason: "Réponse Google sans identifiant." };
    }

    return { created: { id: payload.id, htmlLink: payload.htmlLink ?? null } };
  } catch (error) {
    return {
      created: null,
      reason: error instanceof Error ? error.name : "Erreur inconnue.",
    };
  }
}
