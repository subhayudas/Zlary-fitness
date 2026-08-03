import type { Locale } from "@/lib/i18n";

/**
 * Transactional email copy.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS IS SEPARATE FROM THE PAGE DICTIONARIES
 * ---------------------------------------------------------------------------
 * Everything in `/content` is read on a page, where the language is decided by
 * the URL. An email has no URL: it is written from a server, days later, and the
 * only thing that can tell it which language to use is the choice stored against
 * the applicant (`preferred_language`).
 *
 * That is the whole point of asking on the first visit. The visitor picks once,
 * and every message they get afterwards — this one, and anything added later —
 * is written in that language.
 *
 * The confirmation is deliberately short. It states the appointment, carries the
 * calendar invitation, and repeats the same honest caveat as the flow itself: a
 * booked call is not an acceptance.
 */

export type EmailCopy = {
  /** Subject line. Kept short so it survives mobile inboxes. */
  subject: (date: string) => string;
  eyebrow: string;
  greeting: (firstName: string) => string;
  intro: string;
  detailsLabel: string;
  whenLabel: string;
  durationLabel: string;
  minutes: (count: number) => string;
  whereLabel: string;
  withLabel: string;
  coach: string;
  /** Explains the `.ics` attachment, which most people will not expect. */
  inviteNote: string;
  prepareLabel: string;
  prepareItems: readonly string[];
  rescheduleLabel: string;
  rescheduleBody: string;
  notice: string;
  signoff: string;
  /** Why this email exists. Required of transactional mail, and simply fair. */
  legal: (host: string) => string;
};

const fr: EmailCopy = {
  subject: (date) => `Ton appel est confirmé — ${date}`,
  eyebrow: "APPEL CONFIRMÉ",
  greeting: (firstName) => `C'est réservé, ${firstName}.`,
  intro:
    "Ton appel transformation est confirmé. Zach lit tes réponses avant de t'appeler — ceci est le seul message automatique que tu recevras.",
  detailsLabel: "Ton rendez-vous",
  whenLabel: "Quand",
  durationLabel: "Durée",
  minutes: (count) => `${count} minutes`,
  whereLabel: "Où",
  withLabel: "Avec",
  coach: "Zach — Zlary Fitness",
  inviteNote:
    "L'invitation est jointe à ce courriel : ouvre-la pour ajouter l'appel à ton calendrier.",
  prepareLabel: "Avant l'appel",
  prepareItems: [
    "Prévois un endroit calme où tu peux parler librement.",
    "Aie une idée du nombre de séances réaliste dans ta semaine.",
    "Note les questions que tu veux poser.",
  ],
  rescheduleLabel: "Un empêchement?",
  rescheduleBody:
    "Réponds simplement à ce courriel et on trouve un autre moment. Prévenir vaut mieux que ne pas se présenter.",
  notice:
    "Réserver un créneau ne constitue pas une acceptation dans le programme.",
  signoff: "Zach — Zlary Fitness",
  legal: (host) =>
    `Tu reçois ce courriel parce qu'un appel a été réservé depuis ${host} avec cette adresse.`,
};

const en: EmailCopy = {
  subject: (date) => `Your call is confirmed — ${date}`,
  eyebrow: "CALL CONFIRMED",
  greeting: (firstName) => `You're booked, ${firstName}.`,
  intro:
    "Your transformation call is confirmed. Zach reads your answers before he calls — this is the only automated message you'll get.",
  detailsLabel: "Your appointment",
  whenLabel: "When",
  durationLabel: "Length",
  minutes: (count) => `${count} minutes`,
  whereLabel: "Where",
  withLabel: "With",
  coach: "Zach — Zlary Fitness",
  inviteNote:
    "The invitation is attached to this email — open it to add the call to your calendar.",
  prepareLabel: "Before the call",
  prepareItems: [
    "Find somewhere quiet where you can talk freely.",
    "Have a realistic idea of how many sessions fit your week.",
    "Note down the questions you want to ask.",
  ],
  rescheduleLabel: "Something came up?",
  rescheduleBody:
    "Just reply to this email and we'll find another time. Telling us beats not showing up.",
  notice: "Booking a call is not an acceptance into the program.",
  signoff: "Zach — Zlary Fitness",
  legal: (host) =>
    `You're receiving this because a call was booked from ${host} using this address.`,
};

const dictionary: Record<Locale, EmailCopy> = { fr, en };

export function getEmailCopy(locale: Locale): EmailCopy {
  return dictionary[locale];
}
