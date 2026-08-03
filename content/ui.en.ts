/**
 * Interface strings — English. Mirrors `ui.ts` key for key.
 */
export const ui = {
  common: {
    skipToContent: "Skip to content",
    backToSite: "Back to the site",
    back: "Back",
    seeInstagram: "See Instagram",
    writeOnInstagram: "Message on Instagram",
    homeLinkLabel: "back to home",
    startApplication: "Start my application",
  },

  nav: {
    primaryLabel: "Main navigation",
    menuLabel: "Main menu",
    openMenu: "Open the menu",
    closeMenu: "Close the menu",
    languageLabel: "Language",
    switchTo: "Switch to French",
  },

  footer: {
    navigation: "Navigation",
    coaching: "Coaching",
    legal: "Legal",
    rights: "All rights reserved.",
  },

  consent: {
    title: "Analytics",
    body: "We'd like to measure which pages get viewed so we can improve the site. No measurement tool is loaded without your agreement.",
    accept: "Accept",
    decline: "Decline",
    privacyLink: "Privacy policy",
  },

  form: {
    optional: "(optional)",
    honeypotLabel: "Do not fill in this field",
    progressLabel: "Form progress",
    stepOf: (current: number, total: number) => `Step ${current} of ${total}`,
    stepNamed: (current: number, title: string) => `Step ${current} — ${title}`,
    questionOf: (current: number, total: number) =>
      `Question ${current} / ${total}`,
    privacyLink: "Privacy policy",
  },

  results: {
    eyebrow: "TRANSFORMATIONS",
    heading: "Results achieved inside genuinely full lives.",
    body: "Every journey shown here belongs to a real person and is published with their written consent. No numbers are added, no photo is retouched.",
    featuredLabel: "Featured journey",
    othersLabel: "Other transformations",
    sectionLabel: "Transformations",
    emptyHeading: "No transformation is published yet.",
    emptyBody:
      "A client's results are only shown once written consent has been given — for the photos as much as for their words. This page will fill up as those permissions come in. In the meantime, the daily content is on Instagram.",
    ctaHeading: "The next journey could be yours.",
    ctaBody:
      "Answer a few questions to see whether the coaching fits your situation.",
    ctaLabel: "Start my application",
  },

  caseStudy: {
    before: "Before",
    after: "After",
    startingPoint: "Starting point",
    mainObstacle: "Main obstacle",
    obstacle: "Obstacle",
    approach: "Approach",
    result: "Result",
    everyday: "Day to day",
  },

  transformations: {
    sectionLabel: "Client transformations",
    before: "Before",
    after: "After",
    dragHint: "Drag to compare",
    sliderLabel: "Compare the before and after photo",
    sliderValueText: (percent: number) =>
      `${percent}% of the “before” photo visible`,
    previous: "Previous transformation",
    next: "Next transformation",
    select: (n: number) => `View transformation ${n}`,
    counter: (current: number, total: number) =>
      `Transformation ${current} of ${total}`,
    weightLabel: "Reported weight",
  },

  about: {
    cardLabel: "Coaching",
    certification: "Certification",
    languages: "Languages",
    experience: "Experience",
    platform: "Platform",
  },

  faq: {
    askOnCall: "Ask my question on the call",
  },

  vslPage: {
    playLabel: "Play the presentation",
    emptyHeading: "Transformations will be published here.",
    emptyBody:
      "No transformation is shown until the client involved has given written consent.",
    privacy: "Privacy",
    terms: "Terms",
  },

  booking: {
    newTabHeading: "Your calendar opens in a new tab.",
    newTabBody:
      "Pick a time, then come back here. You'll get an email confirmation with the link for the call.",
    iframeTitle: "Booking calendar",
    loading: "Loading the calendar…",
  },

  legalPage: {
    tableOfContents: "Contents",
  },

  notFound: {
    metaTitle: "Page not found",
  },

  breadcrumb: {
    home: "Home",
    about: "About",
    results: "Results",
    privacy: "Privacy policy",
    terms: "Terms of use",
  },

  schema: {
    jobTitle: "Online fitness and nutrition coach",
    serviceType: "Online fitness and nutrition coaching",
    applicationChannel: "Online application",
  },
};
