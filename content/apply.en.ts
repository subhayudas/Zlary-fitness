/**
 * Booking flow — English.
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
  obstacle: {
    schedule: "My schedule is unpredictable",
    consistency: "I struggle with consistency",
    knowledge: "I don't know exactly what to do",
    nutrition: "Nutrition is my weak point",
    motivation: "I lose motivation after a few weeks",
    plateau: "I've plateaued despite the effort",
    other: "Other",
  },
  desiredTimeline: {
    asap: "I want to start right away",
    "1_month": "Within the next month",
    "3_months": "Within the next three months",
    exploring: "Just gathering information for now",
  },
  investmentReadiness: {
    ready: "Yes, I'm ready to invest in personalized coaching",
    depends: "It depends on what the coaching includes",
    not_yet: "Not right now",
  },
};

export const applyContent = {
  eyebrow: "BOOK A CALL",
  heading: "Book your transformation call.",
  body: "Five quick questions, then you pick your time. Under two minutes — and you leave with a confirmed appointment, not an application sitting in a queue.",
  privacyNote:
    "Your answers are used only to prepare the call. No medical information is requested.",

  /** Order must stay identical to the French list in `apply.ts`. */
  phases: [
    {
      id: "questions",
      index: "01",
      title: "Your situation",
      lead: "Where you are",
      benefit:
        "Five questions so Zach arrives at the call already knowing what you'll be talking about.",
    },
    {
      id: "slot",
      index: "02",
      title: "Your time",
      lead: "When you talk",
      benefit:
        "Pick whatever suits you. The times shown are the ones genuinely free in Zach's calendar.",
    },
    {
      id: "contact",
      index: "03",
      title: "Your details",
      lead: "How to reach you",
      benefit:
        "Only to confirm the call and send it to your calendar.",
    },
  ],

  questions: {
    primaryGoal: {
      label: "What's your main goal?",
      columns: 2,
    },
    trainingLevel: {
      label: "Where are you with your training?",
      columns: 1,
    },
    biggestObstacle: {
      label: "What's held you back so far?",
      hint: "Be honest: this is the most useful answer in the whole thing.",
      columns: 2,
    },
    desiredTimeline: {
      label: "When would you like to start?",
      columns: 2,
    },
    investmentReadiness: {
      label: "Are you ready to invest in personalized coaching?",
      hint: "Pricing is discussed on the call. Your answer doesn't affect whether you can book — it only helps Zach prepare the conversation.",
      columns: 1,
    },
  },

  calendar: {
    label: "Pick your time",
    body: (minutes: number) =>
      `${minutes} minutes one-to-one with Zach, by call. Choose a date, then a time.`,
    dateLabel: "Date",
    timeLabel: "Time",
    timeZoneNote: (zone: string) => `Times shown in ${zone}.`,
    localNote: (time: string, zone: string) => `That's ${time} where you are (${zone}).`,
    loading: "Loading available times…",
    selected: (date: string, time: string) => `${date} at ${time}`,
    change: "Change",
    empty: {
      heading: "No times are available right now.",
      body: "The next few weeks are fully booked. Message Zach on Instagram and he'll find you a slot.",
    },
    failed: {
      heading: "The calendar couldn't be loaded.",
      body: "Try again in a moment. If it keeps happening, message Zach on Instagram.",
      retry: "Try again",
    },
  },

  labels: {
    fullName: "Full name",
    email: "Email",
    phone: "Phone",
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
    phone: "Zach calls you on this number. Used only for this call.",
    email: "The confirmation and the calendar invite go here.",
  },

  placeholders: {
    fullName: "First and last name",
    email: "your@email.com",
    phone: "(514) 000-0000",
  },

  consentNote: "By confirming, you agree to be contacted about this call.",

  confirmation: {
    eyebrow: "CALL CONFIRMED",
    heading: (firstName: string) => `You're booked, ${firstName}.`,
    body: (email: string) =>
      `The invitation is on its way to ${email}, and the appointment is on Zach's calendar.`,
    bodyWithoutEmail:
      "Your time is booked and on Zach's calendar. The confirmation email couldn't be sent — note the appointment down on your side.",
    summary: {
      heading: "Your appointment",
      eventTitle: "Transformation call — Zlary Fitness",
      when: "When",
      duration: "Length",
      minutes: (minutes: number) => `${minutes} minutes`,
      where: "Where",
      defaultWhere: "Phone call — Zach calls you on the number you gave.",
      who: "With",
      coach: "Zach — Zlary Fitness",
      contact: "Confirmation sent to",
    },
    addToCalendar: "Add to my calendar",
    openEvent: "View the event",
    prepare: {
      heading: "Before the call",
      items: [
        "Find somewhere quiet where you can talk freely.",
        "Have a realistic idea of how many sessions fit your week.",
        "Note down the questions you want to ask.",
      ],
    },
    notice:
      "Booking a call is not an acceptance into the program. Zach reads your answers before the call and will tell you straight whether the coaching fits your situation.",
    backHome: "Back to the site",
  },

  actions: {
    next: "Continue",
    back: "Back",
    confirm: "Confirm my appointment",
    confirming: "Confirming…",
  },

  errors: {
    generic:
      "We can't confirm your appointment right now. Try again in a few moments.",
    rateLimited: "Too many attempts. Wait a minute before trying again.",
    network: "The connection failed. Check your internet access and try again.",
    slotTaken:
      "That time was just taken. Pick another one — the calendar is up to date.",
    slotExpired:
      "That time is no longer offered. Pick another one from the calendar.",
  },
};
