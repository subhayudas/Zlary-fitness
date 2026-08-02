import type { Deliverable } from "./types";

/**
 * What clients receive — English.
 *
 * `id` and `confirmedByCoach` are shared control values, not copy: the id picks
 * the icon, and the flag is the switch that publishes an item. Both must stay
 * identical to `deliverables.ts` — flipping one language on and the other off
 * would advertise a deliverable to half the audience only.
 */
export const deliverablesList: readonly Deliverable[] = [
  {
    id: "training-program",
    title: "Personalized training program",
    body: "Built around your level, the equipment you have and the number of sessions that realistically fit your week.",
    confirmedByCoach: true,
  },
  {
    id: "nutrition-strategy",
    title: "Flexible nutrition strategy",
    body: "Clear benchmarks for portions and protein, with no forbidden foods and no imposed menu.",
    confirmedByCoach: true,
  },
  {
    id: "exercise-demos",
    title: "Exercise demonstrations",
    body: "Every movement comes with a demonstration so your execution is right from the very first session.",
    confirmedByCoach: true,
  },
  {
    id: "progress-tracking",
    title: "Progress tracking",
    body: "Your loads, your sessions and your benchmarks are tracked over time to make progress visible.",
    confirmedByCoach: true,
  },
  {
    id: "check-ins",
    title: "Regular check-ins",
    body: "A structured point of contact to review the period behind you and decide what comes next.",
    confirmedByCoach: true,
  },
  {
    id: "adjustments",
    title: "Program adjustments",
    body: "The plan is changed when your schedule, your energy or your results change.",
    confirmedByCoach: true,
  },
  {
    id: "support",
    title: "Support between check-ins",
    body: "A channel to ask your questions when they come up, not two weeks later.",
    confirmedByCoach: true,
  },
  {
    id: "habit-coaching",
    title: "Habit coaching",
    body: "Work on sleep, meal preparation and getting through hard weeks is part of the coaching.",
    confirmedByCoach: true,
  },
];
