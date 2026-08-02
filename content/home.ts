/**
 * Homepage copy — French.
 *
 * The English translation lives in `home.en.ts` and is resolved through
 * `getHome(locale)` at the bottom of this file. That dictionary is typed
 * against the French shape, so the two files cannot drift: rename a key here
 * and the English file stops compiling.
 *
 * Note the deliberate absence of `as const` — the literal types it produces
 * would force the English strings to equal the French ones.
 */

import type { Locale } from "@/lib/i18n";

export const hero = {
  eyebrow: "COACHING FITNESS ET NUTRITION EN LIGNE",
  headline: "Transforme ton corps sans mettre ta vie sur pause.",
  /** Rendered as separate lines for editorial line breaks on large screens. */
  headlineLines: ["Transforme ton corps", "sans mettre ta vie sur pause."],
  support:
    "Un accompagnement personnalisé pour les personnes occupées qui veulent construire un meilleur physique, retrouver leur énergie et créer des habitudes durables — sans régimes extrêmes.",
  primaryCta: { label: "Voir si le coaching me convient", href: "/apply" },
  secondaryCta: { label: "Voir la méthode", href: "/vsl" },
  trustLine: "Entraînement personnalisé · Nutrition flexible · Suivi individuel",
  chip: {
    label: "Coach",
    value: "Zach",
    detail: "Accompagnement en ligne",
  },
};

export const problem = {
  label: "01 — LE VRAI PROBLÈME",
  heading: "Tu n'as probablement pas besoin de plus de motivation.",
  subheading: "Tu as besoin d'un système adapté à ta vraie vie.",
  statements: [
    "Ton horaire change constamment.",
    "Tu recommences après chaque période difficile.",
    "Les plans trop stricts ne durent jamais.",
    "Tu ne sais pas comment progresser sans sacrifier ta vie sociale.",
    "Tu travailles fort, mais tu manques de structure.",
  ],
  /**
   * Conceptual coaching journey. Deliberately abstract — this is NOT a client
   * dashboard and must never be presented as live data or a health score.
   */
  journey: {
    label: "Parcours",
    caption: "Le chemin, étape par étape",
    steps: [
      { name: "Évaluation", detail: "Point de départ" },
      { name: "Structure", detail: "Plan construit" },
      { name: "Constance", detail: "Application" },
      { name: "Résultats durables", detail: "Autonomie" },
    ],
    footnote: "Représentation conceptuelle du parcours de coaching.",
  },
  asides: [
    {
      title: "Un plan qui tient debout le mardi soir",
      body: "Un programme n'a de valeur que s'il survit à une semaine chargée, à un imprévu et à un souper au restaurant.",
    },
    {
      title: "Comprendre, pas seulement suivre",
      body: "L'objectif est que tu saches pourquoi tu fais chaque chose — pour ne plus repartir de zéro à la prochaine pause.",
    },
  ],
};

export const outcomes = {
  label: "02 — CE QUE TU CONSTRUIS",
  heading: "Une transformation que tu peux maintenir.",
  body: "Pas une privation de huit semaines. Une structure d'entraînement et de nutrition assez souple pour tenir dans ton horaire réel, et assez précise pour te faire progresser.",
  cta: { label: "Découvrir la méthode", targetId: "methode" },
  imageIndex: "01/04",
  resultCard: {
    label: "Ce qui change",
    items: ["Plus d'énergie", "Plus de structure", "Plus de confiance"],
  },
  routineCard: {
    label: "Les trois leviers",
    items: [
      { name: "Entraînement", detail: "Progressif et adapté" },
      { name: "Nutrition", detail: "Flexible, sans interdits" },
      { name: "Habitudes", detail: "Construites pour durer" },
    ],
  },
};

export const resultsIntro = {
  eyebrow: "RÉSULTATS CLIENTS",
  heading: "Des plans construits autour de vraies vies.",
  body: "Le travail, les horaires variables, les restaurants et les voyages ne disparaissent pas. La stratégie doit fonctionner avec eux.",
  cta: { label: "Voir toutes les transformations", href: "/results" },
  emptyState: {
    heading: "Les transformations clients seront publiées ici.",
    body: "Aucune transformation n'est affichée tant que le client concerné n'a pas donné son accord écrit. Cette section se remplira au fur et à mesure des autorisations.",
    cta: { label: "Suivre le parcours sur Instagram", href: null },
  },
};

export const method = {
  eyebrow: "LA MÉTHODE ZLARY",
  heading: "Le plan s'adapte à ta vie. Pas l'inverse.",
  body: "Quatre étapes, dans cet ordre. Chacune existe pour rendre la suivante possible.",
  cta: { label: "Commencer ma candidature", href: "/apply" },
};

export const nutrition = {
  eyebrow: "NUTRITION",
  heading: "Un plan alimentaire est un outil, pas une prison.",
  body: "Le but n'est pas que tu dépendes d'un menu rigide pour toujours. Tu apprendras à mieux comprendre tes portions, tes protéines et les choix qui te permettent de progresser.",
  secondary:
    "Restaurants, voyages et vacances font partie de la vie. La stratégie doit fonctionner dans ces situations aussi.",
  cta: { label: "Découvrir le coaching", href: "/apply" },
  pillars: [
    { name: "Portions", detail: "Repères concrets, pas de balance obligatoire" },
    { name: "Protéines", detail: "La base de chaque repas" },
    { name: "Flexibilité", detail: "Aucun aliment interdit" },
  ],
};

export const deliverables = {
  eyebrow: "CE QUE TU REÇOIS",
  heading: "Un accompagnement, pas simplement un PDF.",
  body: "Le programme est le point de départ. Ce qui fait la différence, c'est ce qui se passe entre les séances.",
  featured: {
    title: "Un plan qui change quand ta vie change",
    body: "Ton programme n'est pas figé. Il est ajusté selon tes progrès, ton horaire et les obstacles que tu rencontres réellement.",
  },
};

export const fit = {
  eyebrow: "POUR QUI",
  goodFit: {
    heading: "Ce coaching est pour toi si…",
    items: [
      "Tu veux une approche durable.",
      "Tu es prêt à appliquer un plan.",
      "Tu veux de la structure et du suivi.",
      "Tu as une vie chargée, mais tu veux arrêter de te négliger.",
      "Tu veux comprendre ce que tu fais.",
    ],
  },
  notFit: {
    heading: "Ce n'est probablement pas pour toi si…",
    items: [
      "Tu cherches une transformation immédiate.",
      "Tu veux une diète extrême.",
      "Tu n'es prêt à modifier aucune habitude.",
      "Tu attends des résultats sans engagement personnel.",
    ],
  },
};

export const about = {
  eyebrow: "À PROPOS",
  heading: "Ton plan doit s'adapter à ta vie — pas l'inverse.",
  bio: "Zach accompagne les personnes occupées qui veulent améliorer leur physique sans transformer leur vie en régime permanent. Son approche combine entraînement personnalisé, nutrition flexible, structure et responsabilisation.",
  instagramLabel: "Suivre sur Instagram",
};

export const vslPreview = {
  label: "PRÉSENTATION",
  heading: "Découvre comment le coaching fonctionne avant de postuler.",
  body: "Une explication courte de la méthode, de la structure du programme et de la façon dont le suivi se déroule.",
  cta: { label: "Regarder la présentation", href: "/vsl" },
};

export const faqIntro = {
  eyebrow: "QUESTIONS FRÉQUENTES",
  heading: "Ce que les gens demandent avant de commencer.",
  body: "Si ta question n'est pas ici, elle sera abordée pendant l'appel.",
};

export const finalCta = {
  heading: "Prêt à construire un plan qui fonctionne avec ta vie?",
  body: "Réponds à quelques questions pour vérifier si l'accompagnement correspond à tes objectifs.",
  cta: { label: "Commencer ma candidature", href: "/apply" },
  note: "Quelques minutes suffisent. Aucune information médicale n'est demandée.",
};

/* -------------------------------------------------------------------------- */
/* Locale dictionary                                                           */
/* -------------------------------------------------------------------------- */

import * as en from "./home.en";

export type HomeContent = {
  hero: typeof hero;
  problem: typeof problem;
  outcomes: typeof outcomes;
  resultsIntro: typeof resultsIntro;
  method: typeof method;
  nutrition: typeof nutrition;
  deliverables: typeof deliverables;
  fit: typeof fit;
  about: typeof about;
  vslPreview: typeof vslPreview;
  faqIntro: typeof faqIntro;
  finalCta: typeof finalCta;
};

const dictionary: Record<Locale, HomeContent> = {
  fr: {
    hero,
    problem,
    outcomes,
    resultsIntro,
    method,
    nutrition,
    deliverables,
    fit,
    about,
    vslPreview,
    faqIntro,
    finalCta,
  },
  en,
};

export function getHome(locale: Locale): HomeContent {
  return dictionary[locale];
}
