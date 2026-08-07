import type { Locale } from "@/lib/i18n";
import { methodSteps as en } from "./method.en";
import type { MethodStep } from "./types";

/**
 * The four coaching steps. Order is meaningful - it drives the step row.
 *
 * One sentence each, and each one says what the step gives the client rather
 * than what the coach does with it. Four steps read side by side only work if
 * the whole row can be taken in at a glance; the paragraph each of these used
 * to carry meant the visitor read step one and skipped the rest.
 */
export const methodSteps: readonly MethodStep[] = [
  {
    index: "01",
    title: "Évaluation",
    body: "Ton objectif, ton horaire, et ce qui t'a arrêté la dernière fois.",
  },
  {
    index: "02",
    title: "Plan personnalisé",
    body: "Entraînement et nutrition construits autour de ta semaine, pas d'un modèle.",
  },
  {
    index: "03",
    title: "Suivi et ajustements",
    body: "On ajuste dès que tes progrès ou ton horaire changent.",
  },
  {
    index: "04",
    title: "Autonomie",
    body: "Tu gardes tes résultats sans avoir besoin de moi pour chaque décision.",
  },
];

const dictionary: Record<Locale, readonly MethodStep[]> = {
  fr: methodSteps,
  en,
};

export function getMethodSteps(locale: Locale): readonly MethodStep[] {
  return dictionary[locale];
}
