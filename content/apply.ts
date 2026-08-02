/**
 * Coaching application — questions, options and step copy.
 *
 * The option `value`s are stored in the database and used by the Zod schema in
 * `lib/validation.ts`, so changing a value is a breaking change. Changing a
 * `label` is always safe.
 *
 * Deliberately NOT collected: any medical history, injuries, medication,
 * weight, body-fat or health conditions. Collecting health data creates
 * obligations we do not want and is not needed to qualify an application.
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
 * No longer asked in the form — it is whatever the visitor chose in the
 * language chooser on their first visit (see `lib/language-preference.ts`), and
 * `components/form/FollowUpLanguage.tsx` shows it back to them.
 *
 * The `satisfies` clause is load-bearing: these values are the site's own
 * locales, and the form, the database column and every outbound email all
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

export const trainingFrequencyOptions = [
  { value: "0", label: "Aucune séance actuellement" },
  { value: "1-2", label: "1 à 2 séances par semaine" },
  { value: "3-4", label: "3 à 4 séances par semaine" },
  { value: "5+", label: "5 séances et plus par semaine" },
] as const satisfies readonly Option[];

export const desiredTimelineOptions = [
  { value: "asap", label: "Je veux commencer tout de suite" },
  { value: "1_month", label: "Dans le prochain mois" },
  { value: "3_months", label: "Dans les trois prochains mois" },
  { value: "exploring", label: "Je m'informe pour l'instant" },
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

export const supportNeededOptions = [
  { value: "structure_only", label: "Surtout un plan clair à suivre" },
  { value: "structure_accountability", label: "Un plan et de la responsabilisation" },
  { value: "close_guidance", label: "Un suivi rapproché et des ajustements fréquents" },
] as const satisfies readonly Option[];

export const investmentReadinessOptions = [
  { value: "ready", label: "Oui, je suis prêt à investir dans un accompagnement personnalisé" },
  { value: "depends", label: "Cela dépend de ce que l'accompagnement comprend" },
  { value: "not_yet", label: "Pas pour le moment" },
] as const satisfies readonly Option[];

export const referralSourceOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "google", label: "Recherche Google" },
  { value: "referral", label: "Recommandation d'une connaissance" },
  { value: "vsl", label: "La vidéo de présentation" },
  { value: "other", label: "Autre" },
] as const satisfies readonly Option[];

export const values = <T extends readonly Option[]>(options: T) =>
  options.map((o) => o.value) as unknown as [string, ...string[]];

/* -------------------------------------------------------------------------- */
/* Step copy                                                                   */
/* -------------------------------------------------------------------------- */

export const applyContent = {
  eyebrow: "CANDIDATURE COACHING",
  heading: "Voyons si l'accompagnement correspond à ta situation.",
  body: "Quelques questions pour comprendre ton objectif, ton horaire et ce qui t'a bloqué jusqu'ici. Compte environ trois minutes.",
  privacyNote:
    "Tes réponses servent uniquement à préparer l'appel. Aucune information médicale n'est demandée.",
  /**
   * Step order. This array *is* the order of the form — `stepFields` in
   * `lib/validation.ts` is indexed by the same positions, so the two must be
   * reordered together.
   *
   * Contact comes third on purpose: asking for a name and a phone number before
   * anything else is the highest-friction way to open a form. The visitor first
   * answers questions about themselves, and only hands over contact details once
   * they have already invested a couple of minutes.
   */
  steps: [
    {
      id: "goal",
      index: "01",
      title: "Objectif",
      lead: "Où tu veux aller",
      benefit:
        "Ton objectif et ton horaire déterminent la structure du programme.",
    },
    {
      id: "fit",
      index: "02",
      title: "Compatibilité",
      lead: "Ta situation",
      benefit:
        "Ces réponses permettent de voir honnêtement si l'accompagnement te convient.",
    },
    {
      id: "contact",
      index: "03",
      title: "Contact",
      lead: "Pour te joindre",
      benefit:
        "Ces informations servent uniquement à te recontacter au sujet de ta candidature.",
    },
    {
      id: "consent",
      index: "04",
      title: "Confirmation",
      lead: "Dernière étape",
      benefit: "Une dernière vérification avant l'envoi.",
    },
  ],
  labels: {
    fullName: "Nom complet",
    email: "Courriel",
    phone: "Téléphone",
    instagramUsername: "Nom d'utilisateur Instagram",
    primaryGoal: "Quel est ton objectif principal?",
    trainingLevel: "Quel est ton niveau actuel?",
    trainingFrequency: "À quelle fréquence t'entraînes-tu en ce moment?",
    desiredTimeline: "Quand souhaites-tu commencer?",
    biggestObstacle: "Quel est ton plus grand obstacle?",
    motivation: "Pourquoi cet objectif est-il important maintenant?",
    supportNeeded: "De quel niveau de suivi as-tu besoin?",
    investmentReadiness:
      "Es-tu prêt à investir dans un accompagnement personnalisé?",
    referralSource: "Comment as-tu connu Zlary Fitness?",
    accuracyConfirmed: "Je confirme que les informations fournies sont exactes.",
    contactConsent:
      "J'accepte d'être contacté par Zlary Fitness au sujet de ma candidature.",
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
    phone: "Utilisé uniquement si le courriel ne fonctionne pas.",
    instagramUsername:
      "Facultatif. Avec ou sans le @ — cela aide Zach à mettre un visage sur ta candidature.",
    biggestObstacle:
      "Sois honnête : c'est l'information la plus utile de tout le formulaire.",
    motivation:
      "Deux ou trois phrases suffisent. Ce qui a changé, ou ce que tu ne veux plus vivre.",
    investmentReadiness:
      "Le tarif est présenté pendant l'appel. Cette question sert à ne faire perdre de temps à personne.",
  },
  placeholders: {
    fullName: "Prénom et nom",
    email: "ton@courriel.com",
    phone: "(514) 000-0000",
    instagramUsername: "@tonpseudo",
    motivation: "Ce qui te pousse à t'y mettre maintenant…",
  },
  actions: {
    next: "Continuer",
    back: "Retour",
    submit: "Envoyer ma candidature",
    submitting: "Envoi en cours…",
  },
  errors: {
    generic:
      "Impossible d'envoyer ta candidature pour le moment. Réessaie dans quelques instants.",
    rateLimited:
      "Trop de tentatives. Attends une minute avant de réessayer.",
    network:
      "La connexion a échoué. Vérifie ton accès Internet et réessaie.",
    stepIncomplete: "Vérifie les champs indiqués avant de continuer.",
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
  trainingFrequency: readonly Option[];
  desiredTimeline: readonly Option[];
  obstacle: readonly Option[];
  supportNeeded: readonly Option[];
  investmentReadiness: readonly Option[];
  referralSource: readonly Option[];
};

const frOptions: ApplyOptions = {
  preferredLanguage: preferredLanguageOptions,
  primaryGoal: primaryGoalOptions,
  trainingLevel: trainingLevelOptions,
  trainingFrequency: trainingFrequencyOptions,
  desiredTimeline: desiredTimelineOptions,
  obstacle: obstacleOptions,
  supportNeeded: supportNeededOptions,
  investmentReadiness: investmentReadinessOptions,
  referralSource: referralSourceOptions,
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
  trainingFrequency: localizeOptions(
    trainingFrequencyOptions,
    enOptionLabels.trainingFrequency,
  ),
  desiredTimeline: localizeOptions(
    desiredTimelineOptions,
    enOptionLabels.desiredTimeline,
  ),
  obstacle: localizeOptions(obstacleOptions, enOptionLabels.obstacle),
  supportNeeded: localizeOptions(
    supportNeededOptions,
    enOptionLabels.supportNeeded,
  ),
  investmentReadiness: localizeOptions(
    investmentReadinessOptions,
    enOptionLabels.investmentReadiness,
  ),
  referralSource: localizeOptions(
    referralSourceOptions,
    enOptionLabels.referralSource,
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
