import type { Locale } from "@/lib/i18n";
import { bookingContent as enBookingContent } from "./booking.en";

/**
 * Booking configuration.
 *
 * The call is booked through Google Calendar Appointment Scheduling (preferred)
 * or Calendly as a temporary fallback. Set:
 *
 *   NEXT_PUBLIC_BOOKING_URL = https://calendar.app.google/xxxxxxxx
 *                           | https://calendar.google.com/calendar/appointments/schedules/...
 *                           | https://calendly.com/zlaryfitness/appel
 *
 * If it is missing, the page renders an administrator placeholder explaining
 * exactly where to add the URL — never a broken iframe.
 */

export type BookingProvider = "google" | "calendly" | "other";

export type BookingConfig =
  | { configured: false }
  | {
      configured: true;
      provider: BookingProvider;
      /** Safe, validated https URL for the "open in a new tab" button. */
      url: string;
      /** Embeddable src, or null when the provider cannot be framed. */
      embedUrl: string | null;
    };

const GOOGLE_HOSTS = ["calendar.google.com", "calendar.app.google"];
const CALENDLY_HOSTS = ["calendly.com", "www.calendly.com"];

export function getBookingConfig(): BookingConfig {
  const raw = process.env.NEXT_PUBLIC_BOOKING_URL?.trim();
  if (!raw) return { configured: false };

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { configured: false };
  }

  // Only ever frame or link an https destination.
  if (url.protocol !== "https:") return { configured: false };

  const host = url.hostname.toLowerCase();

  if (GOOGLE_HOSTS.includes(host)) {
    // Google Appointment Scheduling exposes an embeddable variant via ?gv=true.
    // Short calendar.app.google links cannot be framed reliably, so we link out.
    const embeddable = host === "calendar.google.com";
    if (embeddable) url.searchParams.set("gv", "true");
    return {
      configured: true,
      provider: "google",
      url: url.toString(),
      embedUrl: embeddable ? url.toString() : null,
    };
  }

  if (CALENDLY_HOSTS.includes(host)) {
    url.searchParams.set("hide_gdpr_banner", "1");
    return {
      configured: true,
      provider: "calendly",
      url: url.toString(),
      embedUrl: url.toString(),
    };
  }

  // Unknown provider: link out rather than gamble on X-Frame-Options.
  return {
    configured: true,
    provider: "other",
    url: url.toString(),
    embedUrl: null,
  };
}

export const bookingContent = {
  eyebrow: "ÉTAPE 2 SUR 2",
  heading: "Réserve ton appel transformation.",
  body: "Choisis le moment qui te convient pour discuter de tes objectifs, de ta situation actuelle et de la façon dont le coaching pourrait t'aider.",
  openCalendarLabel: "Ouvrir le calendrier",
  /** Important: an application is not an acceptance. Keep this wording honest. */
  reviewNotice:
    "Ta candidature a bien été enregistrée. Zach la lit avant l'appel — la réservation d'un créneau ne constitue pas une acceptation dans le programme.",
  callDetails: {
    heading: "Ce qui se passe pendant l'appel",
    items: [
      {
        index: "01",
        title: "Ta situation actuelle",
        body: "Ton point de départ, ton expérience et ce que tu as déjà essayé.",
      },
      {
        index: "02",
        title: "Ton objectif et ton horaire",
        body: "Ce que tu veux atteindre, et le temps dont tu disposes réellement.",
      },
      {
        index: "03",
        title: "Les obstacles",
        body: "Ce qui a fait dérailler tes tentatives précédentes, pour éviter de refaire la même chose.",
      },
      {
        index: "04",
        title: "La suite",
        body: "Si l'accompagnement correspond à ta situation, Zach t'explique comment il se déroulerait. Sinon, il te le dit franchement.",
      },
    ],
  },
  prepare: {
    heading: "Avant l'appel",
    items: [
      "Prévois un endroit calme où tu peux parler librement.",
      "Aie une idée du nombre de séances réaliste dans ta semaine.",
      "Note les questions que tu veux poser.",
    ],
  },
  fallback: {
    heading: "Le calendrier n'est pas encore connecté",
    body: "Le lien de réservation n'a pas été configuré. En attendant, écris à Zach sur Instagram pour convenir d'un moment — ta candidature est déjà enregistrée.",
    adminHint:
      "Administrateur : ajoutez NEXT_PUBLIC_BOOKING_URL dans les variables d'environnement (Vercel → Settings → Environment Variables), puis redéployez.",
  },
};

const dictionary: Record<Locale, typeof bookingContent> = {
  fr: bookingContent,
  en: enBookingContent,
};

export function getBookingContent(locale: Locale): typeof bookingContent {
  return dictionary[locale];
}
