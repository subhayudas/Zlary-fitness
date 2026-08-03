/**
 * Calendar entries, in the one format every calendar reads.
 *
 * Two callers, two purposes:
 *
 *   · the confirmation email attaches a `REQUEST`, which is what actually puts
 *     the call in the visitor's calendar. It is not a fallback for the Google
 *     integration — it is the primary channel for the *applicant*, because a
 *     service account cannot invite anyone (see `lib/google-calendar.ts`);
 *   · the confirmation screen offers a `PUBLISH` for download, for anyone who
 *     wants the appointment before the email arrives.
 *
 * Deliberately isomorphic — no `Buffer`, no `node:` imports — so the browser can
 * build the same entry the server sends rather than a second, drifting copy of
 * it. Base64 for the mail API is done at the call site, where Node is a given.
 *
 * RFC 5545 is fussy in three ways that matter and are easy to get wrong: CRLF
 * line endings, folding at 75 octets, and escaping inside text values. All three
 * are handled here.
 */

export type IcsEvent = {
  /** Stable and globally unique. A second entry with the same UID replaces it. */
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description: string;
  location: string | null;
  /** Required for an invitation; omitted for a plain published entry. */
  organizer?: { name: string; email: string };
  attendee?: { name: string; email: string };
  /** Bumped when an event is rescheduled, so clients accept the update. */
  sequence?: number;
  /** `REQUEST` invites, `PUBLISH` merely offers, `CANCEL` withdraws. */
  method?: "REQUEST" | "PUBLISH" | "CANCEL";
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** `20260804T210000Z` — the only form every client reads the same way. */
function icsTimestamp(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

/**
 * Escapes a TEXT value. Backslash first, or it would escape the escapes added
 * after it.
 */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/**
 * Folds a content line to 75 octets, continuing with a leading space.
 *
 * Counted in octets rather than characters on purpose: an accented character is
 * two bytes in UTF-8, and a line measured in characters would exceed the limit
 * in exactly the French copy this site is written in. Multi-byte sequences are
 * never split — the break is taken before a character that would straddle it.
 */
function fold(line: string): string {
  const bytes = encoder.encode(line);
  if (bytes.length <= 75) return line;

  const parts: string[] = [];
  let cursor = 0;
  let limit = 75;

  while (cursor < bytes.length) {
    let end = Math.min(cursor + limit, bytes.length);

    // Walk back off a continuation byte (10xxxxxx) so no character is cut.
    while (end > cursor && end < bytes.length && (bytes[end] & 0xc0) === 0x80) {
      end -= 1;
    }

    parts.push(decoder.decode(bytes.subarray(cursor, end)));
    cursor = end;
    // Continuation lines carry a leading space, which counts toward the 75.
    limit = 74;
  }

  return parts.join("\r\n ");
}

export function buildIcs(event: IcsEvent): string {
  const method = event.method ?? "REQUEST";
  const status = method === "CANCEL" ? "CANCELLED" : "CONFIRMED";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Zlary Fitness//Booking//FR",
    "CALSCALE:GREGORIAN",
    `METHOD:${method}`,
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${icsTimestamp(new Date())}`,
    `DTSTART:${icsTimestamp(event.start)}`,
    `DTEND:${icsTimestamp(event.end)}`,
    `SEQUENCE:${event.sequence ?? 0}`,
    `SUMMARY:${escapeText(event.summary)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    ...(event.location ? [`LOCATION:${escapeText(event.location)}`] : []),
    ...(event.organizer
      ? [
          `ORGANIZER;CN=${escapeText(event.organizer.name)}:mailto:${event.organizer.email}`,
        ]
      : []),
    ...(event.attendee
      ? [
          `ATTENDEE;CN=${escapeText(event.attendee.name)};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${event.attendee.email}`,
        ]
      : []),
    `STATUS:${status}`,
    "TRANSP:OPAQUE",
    // A reminder the visitor did not have to set themselves.
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Rappel",
    "TRIGGER:-PT30M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // Trailing CRLF included: some parsers drop a final unterminated line.
  return `${lines.map(fold).join("\r\n")}\r\n`;
}
