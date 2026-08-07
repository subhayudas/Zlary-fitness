/**
 * Homepage copy - French.
 *
 * The English translation lives in `home.en.ts` and is resolved through
 * `getHome(locale)` at the bottom of this file. That dictionary is typed
 * against the French shape, so the two files cannot drift: rename a key here
 * and the English file stops compiling.
 *
 * Note the deliberate absence of `as const` - the literal types it produces
 * would force the English strings to equal the French ones.
 */

import type { Locale } from "@/lib/i18n";

export const hero = {
  eyebrow: "COACHING FITNESS ET NUTRITION EN LIGNE",
  headline: "Transforme ton corps sans mettre ta vie sur pause.",
  /** Rendered as separate lines for editorial line breaks on large screens. */
  headlineLines: ["Transforme ton corps", "sans mettre ta vie sur pause."],
  support:
    "Un accompagnement personnalisé pour les personnes occupées qui veulent construire un meilleur physique, retrouver leur énergie et créer des habitudes durables - sans régimes extrêmes.",
  primaryCta: { label: "Voir si le coaching me convient", href: "/#postuler" },
  secondaryCta: { label: "Voir la méthode", href: "/vsl" },
  trustLine: "Entraînement personnalisé · Nutrition flexible · Suivi individuel",
  chip: {
    label: "Coach",
    value: "Zach",
    detail: "Accompagnement en ligne",
  },
};

/**
 * The problem - and only the problem.
 *
 * This block names the friction and stops there. The answer to it belongs to
 * the offer and the method sections further down the page; anything that
 * describes the coaching, the steps or the philosophy has been moved out
 * deliberately, so the visitor recognises themselves here before being sold
 * anything.
 */
export const problem = {
  label: "01 - LE VRAI PROBLÈME",
  heading: "Tu ne manques pas de volonté. Ton plan ne survit pas aux semaines chargées.",
  subheading:
    "Les plans rigides fonctionnent quand tout va bien. Le vrai test, c'est une réunion tardive, un resto ou une mauvaise nuit - quand tu dois quand même savoir quoi faire ensuite.",
  statements: [
    "Tu manques une séance, puis toute ta semaine te semble perdue.",
    "Tu manges parfaitement… jusqu'au premier imprévu.",
    "Tu changes de programme parce que tu ne sais pas si le tien fonctionne.",
    "Tu veux progresser sans dire non aux soupers, aux voyages et à ta vraie vie.",
  ],
  /**
   * The CTA answers the block it closes, and nothing else on the page repeats
   * it. Here the visitor has just recognised their own week in four lines, so
   * the click is about that week - not about the coaching, which they have not
   * read about yet.
   */
  cta: {
    label: "Construire un plan qui tient les semaines chargées",
    href: "/#postuler",
    note: "Cinq questions sur ta semaine, puis tu choisis ton créneau d'appel.",
  },
};

/**
 * The offer - a single section that replaces the former "what you build" and
 * "what you receive" blocks.
 *
 * One heading, one promise, one list. Everything a visitor needs to understand
 * what they are buying should be readable without scrolling twice.
 */
export const offer = {
  label: "02 - CE QUE TU REÇOIS",
  heading: "Un coaching complet, pas simplement un PDF.",
  body: "Un plan d'entraînement et de nutrition construit pour toi, ajusté quand ta vie change, avec un coach qui répond entre les suivis.",
  covers: {
    label: "Le coaching couvre",
    items: [
      { name: "Entraînement", detail: "Progressif et adapté" },
      { name: "Nutrition", detail: "Flexible, sans interdits" },
      { name: "Habitudes", detail: "Construites pour durer" },
    ],
  },
  resultCard: {
    label: "Ce qui change",
    items: ["Plus d'énergie", "Plus de structure", "Plus de confiance"],
  },
  closing: {
    heading: "Tout ça, dans un seul accompagnement.",
    cta: {
      label: "Obtenir ce plan pour moi",
      href: "/#postuler",
      note: "L'appel sert à vérifier que c'est adapté à toi. Aucun engagement avant.",
    },
  },
};

export const resultsIntro = {
  eyebrow: "RÉSULTATS CLIENTS",
  heading: "Ils ont suivi la Méthode Zlary.",
  body: "Tous ont commencé par un appel gratuit de trente minutes.",
  /**
   * The section CTA points at the application, not at `/results`: someone who
   * has just dragged through four before/after comparisons has seen the proof,
   * and sending them to a page of more of it costs the conversion. The link to
   * the full page stays underneath as a text link - subordinate, not a second
   * button.
   */
  cta: {
    label: "Commencer mon propre avant/après",
    href: "/#postuler",
    note: "Le formulaire prend deux minutes. Le reste se passe pendant l'appel.",
  },
  galleryLink: { label: "Voir toutes les transformations", href: "/results" },
  emptyState: {
    heading: "Les transformations clients seront publiées ici.",
    body: "Aucune transformation n'est affichée tant que le client concerné n'a pas donné son accord écrit. Cette section se remplira au fur et à mesure des autorisations.",
    cta: { label: "Suivre le parcours sur Instagram", href: null },
  },
};

/**
 * The method - four steps, read in one pass.
 *
 * The heading no longer repeats "ton plan s'adapte à ta vie", which the results
 * intro and the about block already say. What this section sells is certainty:
 * the visitor is about to hand over money and time to someone they have never
 * met, so the block answers the only question left - what actually happens, and
 * where it ends.
 */
export const method = {
  eyebrow: "03 - LA MÉTHODE ZLARY",
  heading: "Quatre étapes. Aucune surprise.",
  body: "Ce qui se passe entre notre premier appel et le jour où tu n'as plus besoin de moi.",
  cta: {
    label: "Commencer par l'étape 1",
    href: "/#postuler",
    note: "L'étape 1, c'est l'appel. Rien ne démarre avant qu'on se soit parlé.",
  },
};

export const about = {
  eyebrow: "À PROPOS",
  heading: "Ton plan doit s'adapter à ta vie - pas l'inverse.",
  bio: "Zach accompagne les personnes occupées qui veulent améliorer leur physique sans transformer leur vie en régime permanent. Son approche combine entraînement personnalisé, nutrition flexible, structure et responsabilisation.",
  instagramLabel: "Suivre sur Instagram",
  cta: {
    label: "Travailler avec Zach",
    href: "/#postuler",
    note: "C'est Zach qui prend l'appel - pas une équipe de vente.",
  },
};

export const faqIntro = {
  eyebrow: "QUESTIONS FRÉQUENTES",
  heading: "Ce que les gens demandent avant de commencer.",
  body:
    "Des réponses claires sur l'entraînement, la nutrition, l'horaire et le fonctionnement du coaching avec Zach.",
  cta: {
    label: "Réserver mon appel gratuit",
    href: "/#postuler",
    note: "30 minutes pour parler de tes objectifs et contraintes, puis décider si le coaching te convient.",
  },
};

/**
 * The closing block, which now introduces the application form itself rather
 * than sending the visitor to another page for it. No `cta` any more: the form
 * is directly underneath this copy, and a button pointing at it would be a
 * click that scrolls one screen.
 */
export const finalCta = {
  heading: "Prêt à construire un plan qui fonctionne avec ta vie?",
};

/* -------------------------------------------------------------------------- */
/* Locale dictionary                                                           */
/* -------------------------------------------------------------------------- */

import * as en from "./home.en";

export type HomeContent = {
  hero: typeof hero;
  problem: typeof problem;
  offer: typeof offer;
  resultsIntro: typeof resultsIntro;
  method: typeof method;
  about: typeof about;
  faqIntro: typeof faqIntro;
  finalCta: typeof finalCta;
};

const dictionary: Record<Locale, HomeContent> = {
  fr: {
    hero,
    problem,
    offer,
    resultsIntro,
    method,
    about,
    faqIntro,
    finalCta,
  },
  en,
};

export function getHome(locale: Locale): HomeContent {
  return dictionary[locale];
}
