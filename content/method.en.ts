import type { MethodStep } from "./types";

/** The four coaching steps — English. Order is meaningful: it drives the timeline UI. */
export const methodSteps: readonly MethodStep[] = [
  {
    index: "01",
    title: "Assessment",
    body: "We look at your goal, your experience, your schedule and what is currently stopping you from moving forward.",
  },
  {
    index: "02",
    title: "Personalized plan",
    body: "Your training and your nutrition strategy are built around your reality.",
  },
  {
    index: "03",
    title: "Follow-up and adjustments",
    body: "The plan evolves with your progress, your schedule and the difficulties you run into.",
  },
  {
    index: "04",
    title: "Independence",
    body: "You learn to make good decisions and to hold on to your results.",
  },
];
