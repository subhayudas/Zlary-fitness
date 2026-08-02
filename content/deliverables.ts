import type { Locale } from "@/lib/i18n";
import { deliverablesList as en } from "./deliverables.en";
import type { Deliverable } from "./types";

/**
 * ---------------------------------------------------------------------------
 * WHAT CLIENTS RECEIVE — ⚠ CONFIRM WITH ZACH BEFORE LAUNCH
 * ---------------------------------------------------------------------------
 * This list comes from the project brief, so every item ships enabled. But the
 * descriptions underneath were written for the site, and advertising a
 * deliverable that is not actually provided is a consumer-protection problem.
 *
 * Before launch, walk this list with Zach one item at a time:
 *   · the wording matches what he really delivers → leave it as is
 *   · he does not offer it (or offers it differently) → edit the copy, or set
 *     `confirmedByCoach: false` to remove it from the site entirely
 *
 * Anything set to `false` disappears from the public page, and development
 * builds show a notice listing what is still switched off.
 */
export const deliverablesList: readonly Deliverable[] = [
  {
    id: "training-program",
    title: "Programme d'entraînement personnalisé",
    body: "Construit selon ton niveau, ton équipement et ton horaire réel.",
    confirmedByCoach: true,
  },
  {
    id: "nutrition-strategy",
    title: "Stratégie nutritionnelle flexible",
    body: "Des repères clairs sur les portions et les protéines. Aucun aliment interdit.",
    confirmedByCoach: true,
  },
  {
    id: "exercise-demos",
    title: "Démonstrations des exercices",
    body: "Une démonstration pour chaque mouvement, dès la première séance.",
    confirmedByCoach: true,
  },
  {
    id: "progress-tracking",
    title: "Suivi de la progression",
    body: "Tes charges et tes séances suivies dans le temps, pour voir les progrès.",
    confirmedByCoach: true,
  },
  {
    id: "check-ins",
    title: "Bilans réguliers",
    body: "Un point de contact structuré pour faire le bilan et décider de la suite.",
    confirmedByCoach: true,
  },
  {
    id: "adjustments",
    title: "Ajustements du programme",
    body: "Le plan change quand ton horaire, ton énergie ou tes résultats changent.",
    confirmedByCoach: true,
  },
  {
    id: "support",
    title: "Support entre les suivis",
    body: "Un canal pour poser tes questions au moment où elles se présentent.",
    confirmedByCoach: true,
  },
  {
    id: "habit-coaching",
    title: "Coaching sur les habitudes",
    body: "Sommeil, préparation des repas, semaines difficiles : c'est inclus.",
    confirmedByCoach: true,
  },
];

const dictionary: Record<Locale, readonly Deliverable[]> = {
  fr: deliverablesList,
  en,
};

export function getDeliverables(locale: Locale): readonly Deliverable[] {
  return dictionary[locale];
}

export function getConfirmedDeliverables(locale: Locale): readonly Deliverable[] {
  return dictionary[locale].filter((d) => d.confirmedByCoach);
}
