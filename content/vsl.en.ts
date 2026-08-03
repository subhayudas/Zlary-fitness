/**
 * VSL copy — English.
 *
 * The video configuration itself (`getVslConfig`) is language-independent: the
 * same file is served in both languages. If a separate English cut is ever
 * produced, add a second environment variable and branch there, not here.
 */

export const vslContent = {
  eyebrow: "PRESENTATION · ZLARY FITNESS",
  headline:
    "How to transform your physique without following a diet you can't sustain.",
  headlineLines: [
    "How to transform your physique",
    "without following a diet you can't sustain.",
  ],
  support:
    "Discover the approach used to build a strategy around your work, your schedule and your real life.",
  backLabel: "Back",
  cta: { label: "Book my call", href: "/en/?source=vsl#postuler" },
  placeholder: {
    heading: "Presentation coming soon",
    body: "The video is being prepared. In the meantime you can already book your call — five questions and a time slot, under two minutes, and Zach will tell you on the call whether the coaching fits your situation.",
  },
  duration: null as string | null,
  takeaways: {
    heading: "What you'll understand",
    items: [
      {
        index: "01",
        title: "Why strict plans fail",
        body: "It's almost never a lack of discipline. It's a structure that can't survive a single imperfect week.",
      },
      {
        index: "02",
        title: "How the plan is built",
        body: "Your schedule, your equipment and your actual level determine the program — not a generic template.",
      },
      {
        index: "03",
        title: "What flexible nutrition means",
        body: "Clear benchmarks for portions and protein, with no imposed menu and no forbidden foods.",
      },
      {
        index: "04",
        title: "How results are maintained",
        body: "The end goal is independence: knowing how to decide for yourself once the coaching is over.",
      },
    ],
  },
  proof: {
    heading: "What it looks like in practice",
    body: "Transformations are published only with the client's written consent.",
  },
  faqHeading: "Frequently asked questions",
  finalCta: {
    heading: "Your plan starts with a conversation.",
    body: "Answer a few questions. If the coaching isn't right for your situation, Zach will tell you.",
  },
};
