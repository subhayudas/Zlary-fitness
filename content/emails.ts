import type { Locale } from "@/lib/i18n";

/**
 * Transactional email copy.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS IS SEPARATE FROM THE PAGE DICTIONARIES
 * ---------------------------------------------------------------------------
 * Everything in `/content` is read on a page, where the language is decided by
 * the URL. An email has no URL: it is written days later, from a server, and
 * the only thing that can tell it which language to use is the choice stored
 * against the applicant (`preferred_language`).
 *
 * That is the whole point of asking on the first visit. The visitor picks once,
 * and every message they get afterwards — this one, and anything added later —
 * is written in that language.
 *
 * The confirmation is deliberately short. It confirms receipt, points at the
 * one next step, and repeats the same honest caveat as the booking page: a
 * booked call is not an acceptance.
 */

export type EmailCopy = {
  /** Subject line. Kept under ~50 characters so it survives mobile inboxes. */
  subject: string;
  eyebrow: string;
  greeting: (firstName: string) => string;
  intro: string;
  nextStepLabel: string;
  nextStepBody: string;
  cta: string;
  /** Same link, spelled out — the plain-text part has no anchors. */
  ctaFallback: (url: string) => string;
  notice: string;
  signoff: string;
  /** Why this email exists. Required of transactional mail, and simply fair. */
  legal: (host: string) => string;
};

const fr: EmailCopy = {
  subject: "Ta candidature est bien reçue",
  eyebrow: "CANDIDATURE REÇUE",
  greeting: (firstName) => `Merci ${firstName}.`,
  intro:
    "Ta candidature est enregistrée. Zach la lit lui-même — ceci est le seul message automatique que tu recevras.",
  nextStepLabel: "Prochaine étape",
  nextStepBody:
    "Réserve ton appel transformation. Vous ferez le tour de ton objectif, de ton horaire et de ce qui t'a bloqué jusqu'ici. Si l'accompagnement ne correspond pas à ta situation, Zach te le dira franchement.",
  cta: "Réserver mon appel",
  ctaFallback: (url) => `Réserver ton appel : ${url}`,
  notice:
    "Réserver un créneau ne constitue pas une acceptation dans le programme.",
  signoff: "Zach — Zlary Fitness",
  legal: (host) =>
    `Tu reçois ce courriel parce qu'une candidature a été envoyée depuis ${host} avec cette adresse.`,
};

const en: EmailCopy = {
  subject: "We've received your application",
  eyebrow: "APPLICATION RECEIVED",
  greeting: (firstName) => `Thanks ${firstName}.`,
  intro:
    "Your application is in. Zach reads it himself — this is the only automated message you'll get.",
  nextStepLabel: "Next step",
  nextStepBody:
    "Book your transformation call. You'll go through your goal, your schedule and what has stopped you so far. If the coaching doesn't fit your situation, Zach will tell you straight.",
  cta: "Book my call",
  ctaFallback: (url) => `Book your call: ${url}`,
  notice: "Booking a slot is not an acceptance into the program.",
  signoff: "Zach — Zlary Fitness",
  legal: (host) =>
    `You're receiving this because an application was sent from ${host} using this address.`,
};

const dictionary: Record<Locale, EmailCopy> = { fr, en };

export function getEmailCopy(locale: Locale): EmailCopy {
  return dictionary[locale];
}
