import type { Locale } from "@/lib/i18n";
import { faqItems as enFaqItems } from "./faq.en";
import { awaiting, confirmed, type FaqItem } from "./types";

/**
 * FAQ — French. The English mirror is `faq.en.ts`.
 *
 * Questions whose answer is `awaiting(...)` are hidden from the page and from
 * the FAQPage structured data until a real answer is supplied — an empty
 * accordion row reads as a broken site, and Google requires that schema-marked
 * answers be visible on the page.
 *
 * Answers must stay descriptive. No guarantees, no timeframes, no medical or
 * clinical nutrition claims.
 */
export const faqItems: readonly FaqItem[] = [
  {
    id: "debutants",
    question: "Est-ce que le coaching convient aux débutants?",
    answer: confirmed(
      "Oui. Le programme part de ton niveau actuel, pas d'un niveau théorique. Si tu débutes, la première phase sert à construire une technique correcte et une régularité réaliste avant d'augmenter le volume ou l'intensité.",
    ),
  },
  {
    id: "gym",
    question: "Dois-je avoir accès à un gym?",
    answer: confirmed(
      "Le programme est construit autour de l'équipement auquel tu as réellement accès. Un gym complet ouvre plus d'options, mais un espace à la maison avec du matériel de base peut suffire selon ton objectif. On en discute pendant l'évaluation.",
    ),
  },
  {
    id: "frequence",
    question: "Combien de jours par semaine dois-je m'entraîner?",
    answer: confirmed(
      "Cela dépend de ton horaire et de ton objectif. Le nombre de séances est fixé pour être tenable sur plusieurs mois plutôt que pendant deux semaines — un plan de trois séances respecté vaut mieux qu'un plan de six abandonné.",
    ),
  },
  {
    id: "restaurant",
    question: "Est-ce que je peux encore manger au restaurant?",
    answer: confirmed(
      "Oui. La stratégie nutritionnelle est construite pour fonctionner avec les restaurants, les voyages et les événements sociaux. Aucun aliment n'est interdit : l'objectif est de savoir comment ajuster autour de ces moments.",
    ),
  },
  {
    id: "horaire",
    question: "Le coaching fonctionne-t-il avec un horaire chargé?",
    answer: confirmed(
      "C'est précisément le cas de figure pour lequel l'approche est construite. Horaires variables, quarts de travail, déplacements et travail physique sont pris en compte au moment de bâtir le plan, pas traités comme des exceptions.",
    ),
  },
  {
    id: "suivis",
    question: "Comment fonctionnent les suivis?",
    answer: awaiting(
      "Décrire le déroulement réel des suivis : plateforme utilisée, fréquence des bilans, format (écrit, vidéo, appel), délai de réponse habituel.",
    ),
  },
  {
    id: "duree",
    question: "Combien de temps dure l'accompagnement?",
    answer: awaiting(
      "Indiquer la durée réelle de l'accompagnement et s'il existe un engagement minimum.",
    ),
  },
  {
    id: "langues",
    question: "Le coaching est-il offert en français et en anglais?",
    answer: confirmed(
      "Oui. La langue choisie à ton arrivée sur le site est celle utilisée pour le suivi et pour l'accompagnement — tu peux la changer avec le bouton FR / EN, ou à la dernière étape du formulaire de réservation.",
    ),
  },
  {
    id: "appel",
    question: "Que se passe-t-il pendant l'appel transformation?",
    answer: confirmed(
      "C'est une conversation, pas une présentation de vente. On revoit ton objectif, ta situation actuelle, ton horaire et ce qui a bloqué jusqu'ici. À la fin, tu sais si l'accompagnement correspond à ta situation — et si ce n'est pas le cas, Zach te le dira.",
    ),
  },
  {
    id: "prix",
    question: "Combien coûte le coaching?",
    answer: awaiting(
      "Indiquer la structure de prix, ou expliquer clairement pourquoi le tarif est présenté pendant l'appel. Ne rien afficher tant que ce n'est pas décidé.",
    ),
  },
];

const dictionary: Record<Locale, readonly FaqItem[]> = {
  fr: faqItems,
  en: enFaqItems,
};

export function getFaqItems(locale: Locale): readonly FaqItem[] {
  return dictionary[locale];
}

/** Only questions with a real, visible answer. Used by the UI and by schema. */
export function getVisibleFaqItems(locale: Locale): readonly FaqItem[] {
  return dictionary[locale].filter((item) => item.answer.status === "confirmed");
}

/** A shorter set for the VSL page — keeps that funnel focused. */
export const vslFaqIds = ["debutants", "gym", "horaire", "restaurant", "appel"];

export function getVslFaqItems(locale: Locale): readonly FaqItem[] {
  return getVisibleFaqItems(locale).filter((item) => vslFaqIds.includes(item.id));
}
