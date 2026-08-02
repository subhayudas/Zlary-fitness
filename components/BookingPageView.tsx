"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Reports the booking page view.
 *
 * A separate one-line client component so `/book` itself can stay a Server
 * Component — the alternative is marking the whole page `"use client"` to fire
 * a single event.
 */
export function BookingPageView({ configured }: { configured: boolean }) {
  useEffect(() => {
    track("booking_page_view", { calendar_configured: configured });
  }, [configured]);

  return null;
}
