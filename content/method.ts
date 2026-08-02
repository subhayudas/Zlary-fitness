import type { Locale } from "@/lib/i18n";
import { methodSteps as en } from "./method.en";
import type { MethodStep } from "./types";

/** The four coaching steps. Order is meaningful — it drives the timeline UI. */
export const methodSteps: readonly MethodStep[] = [
  {
    index: "01",
    title: "Évaluation",
    body: "On analyse ton objectif, ton expérience, ton horaire et ce qui t'empêche actuellement d'avancer.",
  },
  {
    index: "02",
    title: "Plan personnalisé",
    body: "Ton entraînement et ta stratégie nutritionnelle sont construits autour de ta réalité.",
  },
  {
    index: "03",
    title: "Suivi et ajustements",
    body: "Le plan évolue selon tes progrès, ton emploi du temps et les difficultés rencontrées.",
  },
  {
    index: "04",
    title: "Autonomie",
    body: "Tu apprends à prendre de bonnes décisions et à conserver tes résultats.",
  },
];

const dictionary: Record<Locale, readonly MethodStep[]> = {
  fr: methodSteps,
  en,
};

export function getMethodSteps(locale: Locale): readonly MethodStep[] {
  return dictionary[locale];
}
