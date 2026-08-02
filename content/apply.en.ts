/**
 * Coaching application — English.
 *
 * ---------------------------------------------------------------------------
 * ONLY LABELS ARE TRANSLATED, NEVER VALUES
 * ---------------------------------------------------------------------------
 * Option `value`s are written to the database and drive the Zod enums in
 * `lib/validation.ts`, so they are identifiers shared by both languages. This
 * file supplies replacement labels keyed by those values; `apply.ts` merges
 * them, which makes it structurally impossible to translate a stored value by
 * accident.
 */

export const optionLabels = {
  preferredLanguage: {
    fr: "French",
    en: "English",
  },
  primaryGoal: {
    fat_loss: "Lose fat",
    muscle_gain: "Build muscle",
    recomposition: "Lose fat and build muscle",
    performance: "Improve my performance",
    energy_habits: "Get my energy and consistency back",
    other: "Other",
  },
  trainingLevel: {
    beginner: "Beginner — starting out or starting again",
    intermediate: "Intermediate — I've been training for a while",
    advanced: "Advanced — I've trained seriously for years",
    returning: "Coming back after a long break",
  },
  trainingFrequency: {
    "0": "No sessions right now",
    "1-2": "1 to 2 sessions a week",
    "3-4": "3 to 4 sessions a week",
    "5+": "5 or more sessions a week",
  },
  desiredTimeline: {
    asap: "I want to start right away",
    "1_month": "Within the next month",
    "3_months": "Within the next three months",
    exploring: "Just gathering information for now",
  },
  obstacle: {
    schedule: "My schedule is unpredictable",
    consistency: "I struggle with consistency",
    knowledge: "I don't know exactly what to do",
    nutrition: "Nutrition is my weak point",
    motivation: "I lose motivation after a few weeks",
    plateau: "I've plateaued despite the effort",
    other: "Other",
  },
  supportNeeded: {
    structure_only: "Mainly a clear plan to follow",
    structure_accountability: "A plan and accountability",
    close_guidance: "Close follow-up and frequent adjustments",
  },
  investmentReadiness: {
    ready: "Yes, I'm ready to invest in personalized coaching",
    depends: "It depends on what the coaching includes",
    not_yet: "Not right now",
  },
  referralSource: {
    instagram: "Instagram",
    google: "Google search",
    referral: "Someone recommended it",
    vsl: "The presentation video",
    other: "Other",
  },
};

export const applyContent = {
  eyebrow: "COACHING APPLICATION",
  heading: "Let's see whether the coaching fits your situation.",
  body: "A few questions to understand your goal, your schedule and what has held you back so far. It takes about three minutes.",
  privacyNote:
    "Your answers are used only to prepare the call. No medical information is requested.",
  /** Order must stay identical to the French list in `apply.ts`. */
  steps: [
    {
      id: "goal",
      index: "01",
      title: "Goal",
      lead: "Where you want to go",
      benefit: "Your goal and your schedule determine how the program is built.",
    },
    {
      id: "fit",
      index: "02",
      title: "Fit",
      lead: "Your situation",
      benefit:
        "These answers make it possible to see honestly whether the coaching suits you.",
    },
    {
      id: "contact",
      index: "03",
      title: "Contact",
      lead: "How to reach you",
      benefit:
        "This information is used only to get back to you about your application.",
    },
    {
      id: "consent",
      index: "04",
      title: "Confirmation",
      lead: "Last step",
      benefit: "One final check before sending.",
    },
  ],
  labels: {
    fullName: "Full name",
    email: "Email",
    phone: "Phone",
    instagramUsername: "Instagram username",
    primaryGoal: "What's your main goal?",
    trainingLevel: "What's your current level?",
    trainingFrequency: "How often are you training right now?",
    desiredTimeline: "When would you like to start?",
    biggestObstacle: "What's your biggest obstacle?",
    motivation: "Why does this goal matter now?",
    supportNeeded: "How much follow-up do you need?",
    investmentReadiness: "Are you ready to invest in personalized coaching?",
    referralSource: "How did you hear about Zlary Fitness?",
    accuracyConfirmed: "I confirm the information provided is accurate.",
    contactConsent:
      "I agree to be contacted by Zlary Fitness about my application.",
    marketingConsent:
      "I'd like to occasionally receive tips and news by email. (optional)",
  },
  followUpLanguage: {
    label: "Follow-up language",
    value: (language: string) => `Follow-up will be in ${language}.`,
    switchTo: (language: string) => `Switch to ${language}`,
    hint: "This is the language you chose when you arrived. It's used for the site as much as for email.",
  },
  hints: {
    phone: "Used only if email doesn't work.",
    instagramUsername:
      "Optional. With or without the @ — it helps Zach put a face to your application.",
    biggestObstacle:
      "Be honest: this is the most useful information in the whole form.",
    motivation:
      "Two or three sentences is enough. What changed, or what you no longer want to live with.",
    investmentReadiness:
      "Pricing is discussed on the call. This question is here so nobody wastes anybody's time.",
  },
  placeholders: {
    fullName: "First and last name",
    email: "your@email.com",
    phone: "(514) 000-0000",
    instagramUsername: "@yourhandle",
    motivation: "What's pushing you to start now…",
  },
  actions: {
    next: "Continue",
    back: "Back",
    submit: "Send my application",
    submitting: "Sending…",
  },
  errors: {
    generic:
      "We can't send your application right now. Try again in a few moments.",
    rateLimited: "Too many attempts. Wait a minute before trying again.",
    network: "The connection failed. Check your internet access and try again.",
    stepIncomplete: "Check the highlighted fields before continuing.",
  },
};
