/**
 * Homepage copy — English.
 *
 * Mirrors `content/home.ts` key for key; the dictionary in that file type-checks
 * this one against the French shape, so a missing or renamed key is a build
 * error rather than a blank space on the page.
 *
 * Internal `href`s carry the `/en` prefix directly. That keeps the components
 * free of link-rewriting logic — a resolved dictionary already points at the
 * right language.
 */

export const hero = {
  eyebrow: "ONLINE FITNESS AND NUTRITION COACHING",
  headline: "Transform your body without putting your life on hold.",
  headlineLines: ["Transform your body", "without putting your life on hold."],
  support:
    "Personalized coaching for busy people who want to build a better physique, get their energy back and create habits that last — without extreme dieting.",
  primaryCta: { label: "See if coaching is right for me", href: "/en/apply" },
  secondaryCta: { label: "See the method", href: "/en/vsl" },
  trustLine: "Personalized training · Flexible nutrition · One-on-one support",
  chip: {
    label: "Coach",
    value: "Zach",
    detail: "Online coaching",
  },
};

export const problem = {
  label: "01 — THE REAL PROBLEM",
  heading: "You probably don't need more motivation.",
  subheading: "You need a system built for your actual life.",
  statements: [
    "Your schedule keeps changing.",
    "You start over after every rough patch.",
    "Plans that are too strict never last.",
    "You don't know how to make progress without giving up your social life.",
    "You work hard, but you have no structure.",
  ],
  journey: {
    label: "Journey",
    caption: "The path, step by step",
    steps: [
      { name: "Assessment", detail: "Starting point" },
      { name: "Structure", detail: "Plan built" },
      { name: "Consistency", detail: "Execution" },
      { name: "Lasting results", detail: "Independence" },
    ],
    footnote: "Conceptual representation of the coaching journey.",
  },
  asides: [
    {
      title: "A plan that holds up on a Tuesday night",
      body: "A program is only worth something if it survives a packed week, an unexpected change of plan and dinner out.",
    },
    {
      title: "Understand it, don't just follow it",
      body: "The goal is for you to know why you're doing each thing — so you never have to start from zero after the next break.",
    },
  ],
};

export const offer = {
  label: "02 — WHAT YOU GET",
  heading: "Real coaching, not just a PDF.",
  body: "A training and nutrition plan built for you, adjusted when your life changes, with a coach who answers between check-ins.",
  covers: {
    label: "The coaching covers",
    items: [
      { name: "Training", detail: "Progressive and adapted" },
      { name: "Nutrition", detail: "Flexible, nothing off-limits" },
      { name: "Habits", detail: "Built to last" },
    ],
  },
  resultCard: {
    label: "What changes",
    items: ["More energy", "More structure", "More confidence"],
  },
  closing: {
    heading: "All of it, in one coaching package.",
    cta: { label: "See if coaching is right for me", href: "/en/apply" },
  },
};

export const resultsIntro = {
  eyebrow: "CLIENT RESULTS",
  heading: "Plans built around real lives.",
  body: "Work, shifting schedules, restaurants and travel don't disappear. The strategy has to work with them.",
  cta: { label: "See every transformation", href: "/en/results" },
  emptyState: {
    heading: "Client transformations will be published here.",
    body: "No transformation is shown until the client involved has given written consent. This section will fill up as those permissions come in.",
    cta: { label: "Follow the journey on Instagram", href: null },
  },
};

export const method = {
  eyebrow: "THE ZLARY METHOD",
  heading: "The plan adapts to your life. Not the other way around.",
  body: "Four steps, in this order. Each one exists to make the next one possible.",
  cta: { label: "Start my application", href: "/en/apply" },
};

export const about = {
  eyebrow: "ABOUT",
  heading: "Your plan should adapt to your life — not the other way around.",
  bio: "Zach coaches busy people who want to improve their physique without turning their life into a permanent diet. His approach combines personalized training, flexible nutrition, structure and accountability.",
  instagramLabel: "Follow on Instagram",
};

export const vslPreview = {
  label: "PRESENTATION",
  heading: "See how the coaching works before you apply.",
  body: "A short walkthrough of the method, how the program is structured and how the follow-up actually works.",
  cta: { label: "Watch the presentation", href: "/en/vsl" },
};

export const faqIntro = {
  eyebrow: "FREQUENTLY ASKED QUESTIONS",
  heading: "What people ask before getting started.",
  body: "If your question isn't here, we'll cover it on the call.",
};

export const finalCta = {
  heading: "Ready to build a plan that works with your life?",
  body: "Answer a few questions to see whether the coaching matches your goals.",
  cta: { label: "Start my application", href: "/en/apply" },
  note: "It only takes a few minutes. No medical information is requested.",
};
