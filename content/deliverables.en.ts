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
    body: "Built around your level, your equipment and your real schedule.",
    confirmedByCoach: true,
  },
  {
    id: "nutrition-strategy",
    title: "Flexible nutrition strategy",
    body: "Clear benchmarks for portions and protein. No food off-limits.",
    confirmedByCoach: true,
  },
  {
    id: "exercise-demos",
    title: "Exercise demonstrations",
    body: "A demonstration for every movement, from the very first session.",
    confirmedByCoach: true,
  },
  {
    id: "progress-tracking",
    title: "Progress tracking",
    body: "Your loads and sessions tracked over time, so progress is visible.",
    confirmedByCoach: true,
  },
  {
    id: "check-ins",
    title: "Regular check-ins",
    body: "A structured point of contact to review and decide what comes next.",
    confirmedByCoach: true,
  },
  {
    id: "adjustments",
    title: "Program adjustments",
    body: "The plan changes when your schedule, energy or results change.",
    confirmedByCoach: true,
  },
  {
    id: "support",
    title: "Support between check-ins",
    body: "A channel to ask your questions the moment they come up.",
    confirmedByCoach: true,
  },
  {
    id: "habit-coaching",
    title: "Habit coaching",
    body: "Sleep, meal prep and hard weeks: all part of the coaching.",
    confirmedByCoach: true,
  },
];
