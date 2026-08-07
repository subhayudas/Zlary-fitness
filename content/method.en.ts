import type { MethodStep } from "./types";

/** The four coaching steps - English. Order is meaningful: it drives the step row. */
export const methodSteps: readonly MethodStep[] = [
  {
    index: "01",
    title: "Assessment",
    body: "Your goal, your schedule, and what stopped you the last time.",
  },
  {
    index: "02",
    title: "Personalized plan",
    body: "Training and nutrition built around your week, not around a template.",
  },
  {
    index: "03",
    title: "Follow-up and adjustments",
    body: "We adjust as soon as your progress or your schedule changes.",
  },
  {
    index: "04",
    title: "Independence",
    body: "You keep your results without needing me for every decision.",
  },
];
