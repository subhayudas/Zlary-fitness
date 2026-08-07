import type { BookingData } from "@/lib/validation";

/**
 * Lead quality.
 *
 * ---------------------------------------------------------------------------
 * THIS TAGS, IT DOES NOT GATE
 * ---------------------------------------------------------------------------
 * Nothing here can stop a booking. The investment-readiness question exists so
 * the coach knows what conversation he is walking into, not so the site can
 * decide who deserves one - someone who answers "not right now" and books
 * anyway is often exactly the person worth half an hour.
 *
 * The value is stored on the row and printed in the internal notification, so a
 * morning of bookings can be read in priority order without opening each one.
 */

export type LeadQuality = "hot" | "warm" | "cold";

/**
 * Readiness first, timing second - in that order, because money is the harder
 * of the two to change and timing moves on its own.
 *
 *   ready    + within a month  → hot
 *   ready    + later           → warm
 *   depends  + within a month  → warm
 *   depends  + later           → cold
 *   not yet  + anything        → cold
 */
export function leadQuality(
  data: Pick<BookingData, "investmentReadiness" | "desiredTimeline">,
): LeadQuality {
  const soon =
    data.desiredTimeline === "asap" || data.desiredTimeline === "1_month";

  if (data.investmentReadiness === "ready") return soon ? "hot" : "warm";
  if (data.investmentReadiness === "depends") return soon ? "warm" : "cold";
  return "cold";
}

/** Written into the notification subject, where an emoji reads faster than a word. */
export const leadQualityMark: Record<LeadQuality, string> = {
  hot: "🔥",
  warm: "◆",
  cold: "◇",
};
