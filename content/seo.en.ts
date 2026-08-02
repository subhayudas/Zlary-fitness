/**
 * Per-route SEO copy — English.
 *
 * Only the title and description are translated. `path`, `noindex`, `priority`
 * and `changeFrequency` describe the route rather than the language and live in
 * `seo.ts`; `getRouteSeo(locale)` merges the two so a route can never end up
 * indexable in one language and not the other.
 */

export const seoKeywords = [
  "online fitness coach",
  "personalized fitness coaching",
  "online nutrition coach",
  "body transformation",
  "lose fat without extreme dieting",
  "fitness program for busy people",
  "english speaking fitness coach",
  "online fitness coaching",
];

export const routeSeoCopy = {
  home: {
    title: "Online Fitness Coach | Training and Nutrition | Zlary Fitness",
    description:
      "Personalized fitness and nutrition coaching for busy people. Transform your physique with a flexible, sustainable approach built around your life.",
  },
  vsl: {
    title: "Transform your physique without extreme dieting | Zlary Fitness",
    description:
      "Discover the online coaching method used to build a training and nutrition plan around your schedule and your real life.",
  },
  apply: {
    title: "Coaching Application | Zlary Fitness",
    description:
      "Complete your application for Zlary Fitness online fitness and nutrition coaching. A few questions to check whether the coaching is right for you.",
  },
  results: {
    title: "Client Transformations | Zlary Fitness",
    description:
      "Physical transformations achieved with online coaching built around packed schedules. Results published with client permission.",
  },
  book: {
    title: "Book a call | Zlary Fitness",
    description:
      "Pick a time to talk through your goals, where you are now and how the coaching could help.",
  },
  thankYou: {
    title: "Application confirmed | Zlary Fitness",
    description: "Your Zlary Fitness coaching application has been received.",
  },
  privacy: {
    title: "Privacy policy | Zlary Fitness",
    description:
      "How Zlary Fitness collects, uses and protects the personal information submitted through the application form.",
  },
  terms: {
    title: "Terms of use | Zlary Fitness",
    description:
      "Terms of use for the Zlary Fitness website and notice regarding the fitness and nutrition information presented on it.",
  },
};
