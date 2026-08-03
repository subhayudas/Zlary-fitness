import type { Locale } from "@/lib/i18n";
import { ui as en } from "./ui.en";

/**
 * Interface strings — French.
 *
 * Everything a visitor can read that is not page copy: accessible labels,
 * button text, table headers, empty states. Before the English version existed
 * these lived inline in the components; they are collected here so a component
 * still contains no hard-coded text, which is the rule the rest of `/content`
 * already followed.
 *
 * Deliberately NOT in here: strings that only ever appear in development —
 * `<PendingNote>`, the `<MediaFrame>` placeholder card, the disabled-deliverable
 * notice and the booking admin hint. Those address whoever is building the site,
 * not whoever is visiting it, and they stay in French.
 */
export const ui = {
  common: {
    skipToContent: "Aller au contenu",
    backToSite: "Retour au site",
    back: "Retour",
    seeInstagram: "Voir Instagram",
    writeOnInstagram: "Écrire sur Instagram",
    homeLinkLabel: "retour à l'accueil",
    startApplication: "Commencer ma candidature",
  },

  nav: {
    primaryLabel: "Navigation principale",
    menuLabel: "Menu principal",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    /** Accessible name for the language switch itself. */
    languageLabel: "Langue",
    /** Announced on the control that leaves the current language. */
    switchTo: "Passer en anglais",
  },

  footer: {
    navigation: "Navigation",
    coaching: "Coaching",
    legal: "Légal",
    rights: "Tous droits réservés.",
  },

  consent: {
    title: "Mesure d'audience",
    body: "On aimerait mesurer les pages consultées pour améliorer le site. Aucun outil de mesure n'est chargé sans ton accord.",
    accept: "Accepter",
    decline: "Refuser",
    privacyLink: "Politique de confidentialité",
  },

  form: {
    optional: "(facultatif)",
    honeypotLabel: "Ne pas remplir ce champ",
    progressLabel: "Progression du formulaire",
    /** Rendered as "Étape 2 sur 4". */
    stepOf: (current: number, total: number) => `Étape ${current} sur ${total}`,
    /** Rendered as "Étape 2 — Objectif". */
    stepNamed: (current: number, title: string) => `Étape ${current} — ${title}`,
    /** Rendered as "Question 2 / 5" on the steps that ask one at a time. */
    questionOf: (current: number, total: number) =>
      `Question ${current} / ${total}`,
    privacyLink: "Politique de confidentialité",
  },

  results: {
    eyebrow: "TRANSFORMATIONS",
    heading: "Des résultats obtenus dans des vies bien remplies.",
    body: "Chaque parcours présenté ici est celui d'une personne réelle, publié avec son accord écrit. Aucun chiffre n'est ajouté, aucune photo n'est retouchée.",
    featuredLabel: "Parcours en vedette",
    othersLabel: "Autres transformations",
    sectionLabel: "Transformations",
    emptyHeading: "Aucune transformation n'est publiée pour le moment.",
    emptyBody:
      "Les résultats d'un client ne sont affichés qu'après avoir obtenu son accord écrit — pour les photos comme pour ses mots. Cette page se remplira à mesure que ces autorisations sont recueillies. En attendant, le contenu quotidien se trouve sur Instagram.",
    ctaHeading: "Le prochain parcours pourrait être le tien.",
    ctaBody:
      "Réponds à quelques questions pour vérifier si l'accompagnement correspond à ta situation.",
    ctaLabel: "Commencer ma candidature",
  },

  caseStudy: {
    before: "Avant",
    after: "Après",
    startingPoint: "Point de départ",
    mainObstacle: "Obstacle principal",
    obstacle: "Obstacle",
    approach: "Approche",
    result: "Résultat",
    everyday: "Au quotidien",
  },

  /** The draggable before/after gallery. */
  transformations: {
    sectionLabel: "Transformations clients",
    before: "Avant",
    after: "Après",
    /** Teaches the gesture. Sits under the frame, next to the counter. */
    dragHint: "Glisse pour comparer",
    /** Accessible name of the divider, which is a real range control. */
    sliderLabel: "Comparer la photo avant et la photo après",
    /** `aria-valuetext`: a bare percentage would announce nothing useful. */
    sliderValueText: (percent: number) =>
      `${percent} % de la photo « avant » visible`,
    previous: "Transformation précédente",
    next: "Transformation suivante",
    select: (n: number) => `Voir la transformation ${n}`,
    counter: (current: number, total: number) =>
      `Transformation ${current} sur ${total}`,
    weightLabel: "Poids rapporté",
  },

  about: {
    cardLabel: "Accompagnement",
    certification: "Certification",
    languages: "Langues",
    experience: "Expérience",
    platform: "Plateforme",
  },

  faq: {
    askOnCall: "Poser ma question pendant l'appel",
  },

  vslPage: {
    playLabel: "Lire la présentation",
    emptyHeading: "Les transformations seront publiées ici.",
    emptyBody:
      "Aucune transformation n'est affichée tant que le client concerné n'a pas donné son accord écrit.",
    privacy: "Confidentialité",
    terms: "Conditions",
  },

  booking: {
    newTabHeading: "Ton calendrier s'ouvre dans un nouvel onglet.",
    newTabBody:
      "Choisis un créneau, puis reviens ici. Tu recevras une confirmation par courriel avec le lien de l'appel.",
    iframeTitle: "Calendrier de réservation",
    loading: "Chargement du calendrier…",
  },

  legalPage: {
    tableOfContents: "Sommaire",
  },

  notFound: {
    metaTitle: "Page introuvable",
  },

  breadcrumb: {
    home: "Accueil",
    about: "À propos",
    results: "Résultats",
    privacy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
  },

  /** Strings that end up inside JSON-LD rather than on screen. */
  schema: {
    jobTitle: "Coach fitness et nutrition en ligne",
    serviceType: "Coaching fitness et nutrition en ligne",
    applicationChannel: "Candidature en ligne",
  },
};

export type Ui = typeof ui;

const dictionary: Record<Locale, Ui> = { fr: ui, en };

export function getUi(locale: Locale): Ui {
  return dictionary[locale];
}
