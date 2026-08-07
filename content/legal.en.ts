/**
 * Legal pages - English.
 *
 * ---------------------------------------------------------------------------
 * NOT LEGAL ADVICE. HAVE BOTH LANGUAGE VERSIONS REVIEWED BEFORE LAUNCH.
 * ---------------------------------------------------------------------------
 * This is a faithful translation of `legal.ts`, describing the same facts about
 * what the site actually does. The French version remains the reference text:
 * the business operates in Québec, and Law 25 / PIPEDA compliance is assessed
 * against it. If a lawyer changes one version, the other must be changed to
 * match - a privacy policy that says two different things in two languages is
 * worse than one that only exists in one.
 *
 * Section `id`s are shared with the French file: they anchor the table of
 * contents and any link ever shared, so they are identifiers, not copy.
 */

export const privacyContent = {
  eyebrow: "LEGAL",
  title: "Privacy policy",
  updatedLabel: "Last updated",
  updated: "2026-01-01",
  intro:
    "This policy explains what personal information the Zlary Fitness website collects, why it is collected, how it is used and what your rights are.",
  sections: [
    {
      id: "collecte",
      title: "Information collected",
      paragraphs: [
        "The only form on the site is the call booking form. It collects: your name, your email address, your phone number, the language you chose for follow-up, the time slot you pick, and your answers to five questions - your main goal, where you are with your training, what has held you back so far, when you would like to start, and whether you are ready to invest in personalized coaching.",
        "The form also records technical data related to your visit: the referring page, the campaign parameters present in the address (utm_source, utm_medium, utm_campaign, utm_content, utm_term), which page you started the booking from, and the submission date.",
        "No health information is requested: no medical history, no injuries, no medication, no weight, no body measurements. There is no free-text field in the form.",
      ],
    },
    {
      id: "utilisation",
      title: "Use of the information",
      paragraphs: [
        "Your answers are used to prepare the call, to confirm the appointment and to get back to you about it. They are not sold, rented or traded.",
        "If you ticked the optional marketing consent box, your email address may also be used to send you tips and news. You can withdraw that consent at any time: every message contains an unsubscribe link, and a simple request by email is equally sufficient.",
      ],
    },
    {
      id: "sous-traitants",
      title: "Service providers and hosting",
      paragraphs: [
        "The site is hosted on Vercel. Bookings are stored in a Supabase database, the appointment is added to Zach's Google Calendar, and the confirmation and notification emails are sent through Resend. These providers process the data on behalf of Zlary Fitness and may host data outside Canada, including in the United States.",
        "If an analytics tool is enabled (Google Analytics, Google Tag Manager or Meta Pixel), it is loaded only after your explicit consent through the banner shown on your first visit. Until you have consented, no measurement or advertising script is loaded.",
      ],
    },
    {
      id: "conservation",
      title: "Retention",
      paragraphs: [
        "Bookings are kept for as long as necessary to follow up on the request and manage the coaching relationship, then deleted.",
      ],
    },
    {
      id: "droits",
      title: "Your rights",
      paragraphs: [
        "You may request access to the personal information held about you, its correction or its deletion, and withdraw your consent. These requests are handled within the timeframes set by applicable law.",
        "To exercise these rights, write to the contact address shown in the site footer.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies",
      paragraphs: [
        "The site sets no advertising cookies by default. A single functional cookie is used to remember your choice regarding the consent banner. If you accept analytics, the corresponding tools may then set their own cookies.",
      ],
    },
    {
      id: "securite",
      title: "Security",
      paragraphs: [
        "Data travels over HTTPS and is stored with providers applying recognised security measures. No system is infallible, but access to bookings is restricted to the people who need it.",
      ],
    },
  ],
};

export const termsContent = {
  eyebrow: "LEGAL",
  title: "Terms of use",
  updatedLabel: "Last updated",
  updated: "2026-01-01",
  intro:
    "By using this site, you accept the terms below. They concern the use of the site itself; the terms of a coaching engagement are covered by a separate agreement.",
  sections: [
    {
      id: "objet",
      title: "Purpose of the site",
      paragraphs: [
        "This site presents the online fitness and nutrition coaching services of Zlary Fitness and allows you to book an introductory call. Booking a call creates no obligation, either for you or for Zlary Fitness.",
        "Booking a call is not an acceptance into the program. Your answers are read before the call, and coaching may be declined if it does not suit your situation.",
      ],
    },
    {
      id: "sante",
      title: "Health notice",
      paragraphs: [
        "The information on this site is provided for general educational purposes. Fitness and nutrition coaching is not a substitute for medical diagnosis, treatment or supervision.",
        "Consult a health professional before starting a new training program or changing your diet, particularly if you have a medical condition or an injury, or if you are pregnant.",
      ],
    },
    {
      id: "resultats",
      title: "Results",
      paragraphs: [
        "No result is guaranteed. Results depend on many individual factors, including the starting point, consistency, sleep, stress levels and life circumstances.",
        "The transformations shown on the site are those of real clients, published with their written permission. They illustrate individual journeys and do not constitute a promise of results.",
      ],
    },
    {
      id: "propriete",
      title: "Intellectual property",
      paragraphs: [
        "The text, images, videos, programs and documents produced by Zlary Fitness are protected. They are intended for your personal use and may not be resold, redistributed or shared without written permission.",
      ],
    },
    {
      id: "liens",
      title: "External links and services",
      paragraphs: [
        "The site links to external services, including Instagram. Zlary Fitness is not responsible for the content or the privacy practices of those services.",
      ],
    },
    {
      id: "responsabilite",
      title: "Limitation of liability",
      paragraphs: [
        "To the extent permitted by applicable law, Zlary Fitness cannot be held liable for indirect damages arising from the use of the site or from applying the general information presented on it.",
      ],
    },
    {
      id: "modifications",
      title: "Changes",
      paragraphs: [
        "These terms may be updated. The last-updated date shown at the top of the page is authoritative.",
      ],
    },
  ],
};

export const notFoundContent = {
  code: "404",
  eyebrow: "PAGE NOT FOUND",
  heading: "This page doesn't exist.",
  body: "The link may be wrong, or the page may have moved. Here's where to go next.",
  links: [
    { label: "Back to home", href: "/en" },
    { label: "Watch the presentation", href: "/en/vsl" },
    { label: "Book a call", href: "/en/#postuler" },
  ],
};

export const thankYouContent = {
  eyebrow: "CALL BOOKED",
  heading: "That's booked. Here's what happens next.",
  body: "Your answers are on file. Zach reads them before the call so he arrives prepared.",
  confirmation: {
    label: "Status",
    value: "Call booked",
  },
  nextSteps: {
    heading: "What happens now",
    items: [
      {
        index: "01",
        title: "Zach reads your answers",
        body: "What you said about your goal, your schedule and your obstacles is reviewed before the call.",
      },
      {
        index: "02",
        title: "Add the call to your calendar",
        body: "Your confirmation email carries the appointment as an attachment - open it to add the call to your calendar. Check your spam folder if you don't see it.",
      },
      {
        index: "03",
        title: "The transformation call",
        body: "Zach calls you on the number you gave, at the time you picked, to talk through your situation and how a plan could be built around it.",
      },
    ],
  },
  prepare: {
    heading: "To prepare for the call",
    items: [
      "Find a quiet place where you can speak freely.",
      "Think about how many sessions realistically fit your week.",
      "Note what derailed your previous attempts.",
    ],
  },
  /* Not "haven't booked yet - that's the last step". Picking a time is step 2
     of 3, and nothing is booked at all until the whole flow is finished, so the
     only person who reaches this page unbooked is someone who left partway. */
  notBooked: {
    heading: "Left before choosing a time?",
    body: "Nothing is booked until you've picked a time and confirmed. It takes under two minutes to finish.",
    cta: { label: "Pick a time", href: "/en/#postuler" },
  },
  instagram: {
    heading: "In the meantime",
    body: "You can follow the daily content on Instagram.",
  },
};
