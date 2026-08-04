/**
 * Booking flow — questions, options and screen copy.
 *
 * The option `value`s are stored in the database and used by the Zod schema in
 * `lib/validation.ts`, so changing a value is a breaking change. Changing a
 * `label` is always safe.
 *
 * Deliberately NOT collected: any medical history, injuries, medication,
 * weight, body-fat or health conditions. Collecting health data creates
 * obligations we do not want and is not needed to book a call.
 */

import type { Locale } from "@/lib/i18n";
import {
  applyContent as enApplyContent,
  optionLabels as enOptionLabels,
} from "./apply.en";

export type Option = { readonly value: string; readonly label: string };

/**
 * The applicant's language.
 *
 * No longer asked in the flow — it is whatever the visitor chose in the
 * language chooser on their first visit (see `lib/language-preference.ts`), and
 * `components/form/FollowUpLanguage.tsx` shows it back to them.
 *
 * The `satisfies` clause is load-bearing: these values are the site's own
 * locales, and the flow, the database column and every outbound email all
 * assume that. Renaming a locale without renaming these would break that
 * assumption silently, so the compiler is asked to catch it instead.
 */
export const preferredLanguageOptions = [
  { value: "fr", label: "Français" },
  { value: "en", label: "Anglais" },
] as const satisfies readonly { value: Locale; label: string }[];

export const primaryGoalOptions = [
  { value: "fat_loss", label: "Perdre du gras" },
  { value: "muscle_gain", label: "Prendre du muscle" },
  { value: "recomposition", label: "Perdre du gras et gagner du muscle" },
  { value: "performance", label: "Améliorer ma performance" },
  { value: "energy_habits", label: "Retrouver de l'énergie et de la constance" },
  { value: "other", label: "Autre" },
] as const satisfies readonly Option[];

export const trainingLevelOptions = [
  { value: "beginner", label: "Débutant — je commence ou je reprends" },
  { value: "intermediate", label: "Intermédiaire — je m'entraîne depuis un moment" },
  { value: "advanced", label: "Avancé — je m'entraîne sérieusement depuis des années" },
  { value: "returning", label: "Je reprends après une longue pause" },
] as const satisfies readonly Option[];

export const obstacleOptions = [
  { value: "schedule", label: "Mon horaire est imprévisible" },
  { value: "consistency", label: "Je manque de constance" },
  { value: "knowledge", label: "Je ne sais pas quoi faire exactement" },
  { value: "nutrition", label: "La nutrition est mon point faible" },
  { value: "motivation", label: "Je perds la motivation après quelques semaines" },
  { value: "plateau", label: "Je stagne malgré mes efforts" },
  { value: "other", label: "Autre" },
] as const satisfies readonly Option[];

export const desiredTimelineOptions = [
  { value: "asap", label: "Je veux commencer tout de suite" },
  { value: "1_month", label: "Dans le prochain mois" },
  { value: "3_months", label: "Dans les trois prochains mois" },
  { value: "exploring", label: "Je m'informe pour l'instant" },
] as const satisfies readonly Option[];

export const investmentReadinessOptions = [
  { value: "ready", label: "Oui, je suis prêt à investir dans un accompagnement personnalisé" },
  { value: "depends", label: "Cela dépend de ce que l'accompagnement comprend" },
  { value: "not_yet", label: "Pas pour le moment" },
] as const satisfies readonly Option[];

/* -------------------------------------------------------------------------- */
/* Screen copy                                                                 */
/* -------------------------------------------------------------------------- */

export const applyContent = {
  eyebrow: "RÉSERVER UN APPEL",
  heading: "Réserve ton appel transformation.",
  privacyNote:
    "Tes réponses servent uniquement à préparer l'appel. Aucune information médicale n'est demandée.",

  /**
   * The three phases shown in the side panel and the mobile header.
   *
   * The five questions are one phase, not five steps: a progress list that
   * counted every question would make a ninety-second flow look like a form.
   * The questions still advance the bar individually — see `BookingFlow`.
   *
   * Contact is last on purpose, and after the calendar. Asking for a name and a
   * phone number before anything else is the highest-friction way to open a
   * flow; asking once someone has already picked a time is the lowest.
   */
  phases: [
    {
      id: "questions",
      index: "01",
      title: "Ta situation",
      lead: "Où tu en es",
      benefit:
        "Cinq questions pour que Zach arrive à l'appel en sachant déjà de quoi vous allez parler.",
    },
    {
      id: "slot",
      index: "02",
      title: "Ton créneau",
      lead: "Quand vous parlez",
      benefit:
        "Choisis le moment qui te convient. Les créneaux affichés sont ceux réellement libres dans l'agenda de Zach.",
    },
    {
      id: "contact",
      index: "03",
      title: "Tes coordonnées",
      lead: "Pour te joindre",
      benefit:
        "Uniquement pour confirmer l'appel et te l'envoyer dans ton calendrier.",
    },
  ],

  /**
   * The qualifying questions, keyed by the field they fill. The *order* they are
   * asked in lives in `questionFields` in `lib/validation.ts` — one list, so the
   * order and the validation can never drift apart.
   */
  questions: {
    primaryGoal: {
      label: "Quel est ton objectif principal?",
      columns: 2,
    },
    trainingLevel: {
      label: "Où en es-tu dans ton entraînement?",
      columns: 1,
    },
    biggestObstacle: {
      label: "Qu'est-ce qui t'a bloqué jusqu'ici?",
      hint: "Sois honnête : c'est l'information la plus utile de tout le questionnaire.",
      columns: 2,
    },
    desiredTimeline: {
      label: "Quand souhaites-tu commencer?",
      columns: 2,
    },
    investmentReadiness: {
      label: "Es-tu prêt à investir dans un accompagnement personnalisé?",
      /**
       * The reassurance is the point of the question. It tags the lead so Zach
       * knows which conversation he is walking into — it does not decide who
       * gets to book, and saying so out loud is what keeps the honest answer
       * honest.
       */
      hint: "Le tarif est présenté pendant l'appel. Ta réponse ne change rien à ta possibilité de réserver — elle aide seulement Zach à préparer la discussion.",
      columns: 1,
    },
  },

  /** The calendar screen. */
  calendar: {
    label: "Choisis ton créneau",
    body: (minutes: number) =>
      `${minutes} minutes en tête-à-tête avec Zach, par appel. Choisis une date, puis une heure.`,
    dateLabel: "Date",
    timeLabel: "Heure",
    /** Named on screen so nobody books 17:00 in the wrong time zone. */
    timeZoneNote: (zone: string) => `Heures affichées en ${zone}.`,
    localNote: (time: string, zone: string) => `Soit ${time} chez toi (${zone}).`,
    loading: "Chargement des disponibilités…",
    selected: (date: string, time: string) => `${date} à ${time}`,
    change: "Changer",
    empty: {
      heading: "Aucun créneau disponible pour le moment.",
      body: "L'agenda des prochaines semaines est complet. Écris à Zach sur Instagram et il te trouvera un moment.",
    },
    failed: {
      heading: "Le calendrier n'a pas pu être chargé.",
      body: "Réessaie dans un instant. Si ça persiste, écris à Zach sur Instagram.",
      retry: "Réessayer",
    },
  },

  labels: {
    fullName: "Nom complet",
    email: "Courriel",
    phone: "Téléphone",
    marketingConsent:
      "Je souhaite recevoir occasionnellement des conseils et des nouvelles par courriel. (facultatif)",
  },

  /**
   * Replaces the old "Langue préférée" question. The language is already known
   * — it is the one chosen on the first visit — so it is stated, not asked.
   * `{language}` arrives already translated, from `languageLabel()`.
   */
  followUpLanguage: {
    label: "Langue de suivi",
    value: (language: string) => `Le suivi se fera en ${language.toLowerCase()}.`,
    switchTo: (language: string) => `Plutôt en ${language.toLowerCase()}`,
    hint: "C'est la langue choisie à ton arrivée sur le site. Elle sert autant à l'affichage qu'aux courriels.",
  },

  hints: {
    phone: "Zach t'appelle à ce numéro. Utilisé uniquement pour cet appel.",
    email: "La confirmation et l'invitation calendrier y sont envoyées.",
  },

  placeholders: {
    fullName: "Prénom et nom",
    email: "ton@courriel.com",
    phone: "(514) 000-0000",
  },

  /** Shown under the confirm button rather than as a checkbox to tick. */
  consentNote: "En confirmant, tu acceptes d'être contacté au sujet de cet appel.",

  /** The final screen. Not a step — the flow is over by the time it appears. */
  confirmation: {
    eyebrow: "APPEL CONFIRMÉ",
    heading: (firstName: string) => `C'est réservé, ${firstName}.`,
    body: (email: string) =>
      `L'invitation est partie vers ${email} et le rendez-vous est inscrit dans l'agenda de Zach.`,
    /** When the confirmation email could not go out, the screen says so. */
    bodyWithoutEmail:
      "Ton créneau est réservé et inscrit dans l'agenda de Zach. La confirmation par courriel n'a pas pu partir — note le rendez-vous de ton côté.",
    summary: {
      heading: "Ton rendez-vous",
      /** Title of the entry the visitor downloads into their own calendar. */
      eventTitle: "Appel transformation — Zlary Fitness",
      when: "Quand",
      duration: "Durée",
      minutes: (minutes: number) => `${minutes} minutes`,
      where: "Où",
      defaultWhere: "Appel téléphonique — Zach t'appelle au numéro fourni.",
      who: "Avec",
      coach: "Zach — Zlary Fitness",
      contact: "Confirmation envoyée à",
    },
    addToCalendar: "Ajouter à mon calendrier",
    openEvent: "Voir l'événement",
    prepare: {
      heading: "Avant l'appel",
      items: [
        "Prévois un endroit calme où tu peux parler librement.",
        "Aie une idée du nombre de séances réaliste dans ta semaine.",
        "Note les questions que tu veux poser.",
      ],
    },
    /** Important: booking a call is not an acceptance. Keep this wording honest. */
    notice:
      "Réserver un créneau ne constitue pas une acceptation dans le programme. Zach lit tes réponses avant l'appel et te dira franchement si l'accompagnement correspond à ta situation.",
    backHome: "Retour au site",
  },

  actions: {
    next: "Continuer",
    back: "Retour",
    confirm: "Confirmer mon rendez-vous",
    confirming: "Confirmation en cours…",
  },

  errors: {
    generic:
      "Impossible de confirmer ton rendez-vous pour le moment. Réessaie dans quelques instants.",
    rateLimited: "Trop de tentatives. Attends une minute avant de réessayer.",
    network: "La connexion a échoué. Vérifie ton accès Internet et réessaie.",
    /** The one error the visitor can actually fix, so it says what to do. */
    slotTaken:
      "Ce créneau vient d'être réservé. Choisis-en un autre — le calendrier est à jour.",
    slotExpired:
      "Ce créneau n'est plus proposé. Choisis-en un autre dans le calendrier.",
  },
};

/* -------------------------------------------------------------------------- */
/* Locale dictionary                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Swaps in translated labels while keeping every `value` exactly as declared
 * above. An unknown key falls back to the French label rather than rendering an
 * empty option — a blank radio is worse than an untranslated one.
 */
function localizeOptions(
  options: readonly Option[],
  labels: Record<string, string>,
): readonly Option[] {
  return options.map((option) => ({
    value: option.value,
    label: labels[option.value] ?? option.label,
  }));
}

export type ApplyOptions = {
  preferredLanguage: readonly Option[];
  primaryGoal: readonly Option[];
  trainingLevel: readonly Option[];
  biggestObstacle: readonly Option[];
  desiredTimeline: readonly Option[];
  investmentReadiness: readonly Option[];
};

const frOptions: ApplyOptions = {
  preferredLanguage: preferredLanguageOptions,
  primaryGoal: primaryGoalOptions,
  trainingLevel: trainingLevelOptions,
  biggestObstacle: obstacleOptions,
  desiredTimeline: desiredTimelineOptions,
  investmentReadiness: investmentReadinessOptions,
};

const enOptions: ApplyOptions = {
  preferredLanguage: localizeOptions(
    preferredLanguageOptions,
    enOptionLabels.preferredLanguage,
  ),
  primaryGoal: localizeOptions(primaryGoalOptions, enOptionLabels.primaryGoal),
  trainingLevel: localizeOptions(
    trainingLevelOptions,
    enOptionLabels.trainingLevel,
  ),
  biggestObstacle: localizeOptions(obstacleOptions, enOptionLabels.obstacle),
  desiredTimeline: localizeOptions(
    desiredTimelineOptions,
    enOptionLabels.desiredTimeline,
  ),
  investmentReadiness: localizeOptions(
    investmentReadinessOptions,
    enOptionLabels.investmentReadiness,
  ),
};

export function getApplyOptions(locale: Locale): ApplyOptions {
  return locale === "en" ? enOptions : frOptions;
}

const contentDictionary: Record<Locale, typeof applyContent> = {
  fr: applyContent,
  en: enApplyContent,
};

export function getApplyContent(locale: Locale): typeof applyContent {
  return contentDictionary[locale];
}

/**
 * The name of a language, written in the reader's language.
 *
 *   languageLabel("fr", "en") → "Anglais"
 *   languageLabel("en", "en") → "English"
 *
 * Reuses the option labels rather than a second table, so the language named on
 * screen and the language stored in `preferred_language` can never drift apart.
 */
export function languageLabel(readIn: Locale, language: Locale): string {
  const options = getApplyOptions(readIn).preferredLanguage;
  return options.find((option) => option.value === language)?.label ?? language;
}
