/**
 * Homepage copy - English.
 *
 * Mirrors `content/home.ts` key for key; the dictionary in that file type-checks
 * this one against the French shape, so a missing or renamed key is a build
 * error rather than a blank space on the page.
 *
 * Internal `href`s carry the `/en` prefix directly. That keeps the components
 * free of link-rewriting logic - a resolved dictionary already points at the
 * right language.
 */

export const hero = {
  eyebrow: "ONLINE FITNESS AND NUTRITION COACHING",
  headline: "Transform your body without putting your life on hold.",
  headlineLines: ["Transform your body", "without putting your life on hold."],
  support:
    "Personalized coaching for busy people who want to build a better physique, get their energy back and create habits that last - without extreme dieting.",
  primaryCta: { label: "Transform my body", href: "/en/#postuler" },
  // Named for what the link opens, not for the section it sounds like: the page
  // already has a "The Zlary Method" block at #methode, and calling this "See
  // the method" sent the two names to two different places.
  secondaryCta: { label: "Watch the presentation", href: "/en/vsl" },
  trustLine: "Personalized training · Flexible nutrition · One-on-one support",
  chip: {
    label: "Coach",
    value: "Zach",
    detail: "Online coaching",
  },
};

export const problem = {
  label: "01 - THE REAL PROBLEM",
  heading: "Motivation's not the problem. Having no one checking on you is.",
  subheading:
    "When it's just you and an app, skipping a day costs nothing. When someone's actually checking on you, it costs something, and that's the difference.",
  statements: [
    "You're scared to commit to another program because the last three didn't work either.",
    "You know what to do, you just don't know if you're doing it right.",
    "Every plan assumes you have 2 hours and a meal prepped fridge. You don't.",
    "You want real progress without cutting out dinners, trips, and your actual life.",
  ],
  cta: {
    label: "GET A COACH WHO CHECKS IN",
    href: "/en/#postuler",
    note: "Five questions about your week, then you pick your call slot.",
  },
};

export const offer = {
  label: "02 - WHAT YOU GET",
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
    cta: {
      label: "Get this plan built for me",
      href: "/en/#postuler",
      note: "The call is where we check it fits you. No commitment before that.",
    },
  },
};

export const resultsIntro = {
  eyebrow: "CLIENT RESULTS",
  heading: "They followed the Zlary Method.",
  body: "They all started with a free thirty-minute call.",
  cta: {
    label: "Start my own before and after",
    href: "/en/#postuler",
    note: "The form takes two minutes. Everything else happens on the call.",
  },
  galleryLink: { label: "See every transformation", href: "/en/results" },
  emptyState: {
    heading: "Client transformations will be published here.",
    body: "No transformation is shown until the client involved has given written consent. This section will fill up as those permissions come in.",
    cta: { label: "Follow the journey on Instagram", href: null },
  },
};

export const method = {
  eyebrow: "03 - THE ZLARY METHOD",
  heading: "Four steps. No surprises.",
  body: "What happens between our first call and the day you no longer need me.",
  cta: {
    label: "Start with step one",
    href: "/en/#postuler",
    note: "Step one is the call. Nothing begins before we've spoken.",
  },
};

export const about = {
  eyebrow: "ABOUT",
  heading: "Your plan should adapt to your life - not the other way around.",
  bio: "Zach coaches busy people who want to improve their physique without turning their life into a permanent diet. His approach combines personalized training, flexible nutrition, structure and accountability.",
  instagramLabel: "Follow on Instagram",
  cta: {
    label: "Work with Zach",
    href: "/en/#postuler",
    note: "Zach takes the call himself - there's no sales team.",
  },
};

export const faqIntro = {
  eyebrow: "FREQUENTLY ASKED QUESTIONS",
  heading: "What people ask before getting started.",
  body:
    "Clear answers on training, nutrition, scheduling, and what coaching with Zach is actually like.",
  cta: {
    label: "Book my free call",
    href: "/en/#postuler",
    note: "30 minutes to talk through your goals and constraints, then decide whether the coaching fits.",
  },
};

export const finalCta = {
  heading: "Ready to build a plan that works with your life?",
};
