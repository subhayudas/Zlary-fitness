import { awaiting, confirmed, type FaqItem } from "./types";

/**
 * FAQ — English.
 *
 * The `id`s match `faq.ts` exactly: they key the accordion, the `vslFaqIds`
 * subset and the FAQPage schema, so they are identifiers rather than copy.
 *
 * `awaiting(...)` entries carry the same pending state as the French file —
 * the note itself is an instruction to Zach and is only ever shown in
 * development, so it stays in French on purpose.
 */
export const faqItems: readonly FaqItem[] = [
  {
    id: "debutants",
    question: "Is the coaching suitable for beginners?",
    answer: confirmed(
      "Yes. The program starts from your current level, not a theoretical one. If you're just starting out, the first phase is about building correct technique and realistic consistency before adding volume or intensity.",
    ),
  },
  {
    id: "gym",
    question: "Do I need access to a gym?",
    answer: confirmed(
      "The program is built around the equipment you actually have access to. A full gym opens up more options, but a home setup with basic equipment can be enough depending on your goal. We discuss it during the assessment.",
    ),
  },
  {
    id: "frequence",
    question: "How many days a week do I need to train?",
    answer: confirmed(
      "That depends on your schedule and your goal. The number of sessions is set to be sustainable over months rather than two weeks — a three-session plan you stick to beats a six-session plan you abandon.",
    ),
  },
  {
    id: "restaurant",
    question: "Can I still eat at restaurants?",
    answer: confirmed(
      "Yes. The nutrition strategy is built to work with restaurants, travel and social events. No food is off-limits: the goal is knowing how to adjust around those moments.",
    ),
  },
  {
    id: "horaire",
    question: "Does the coaching work with a packed schedule?",
    answer: confirmed(
      "That's exactly the situation this approach is built for. Variable schedules, shift work, travel and physical jobs are factored in when the plan is built, not treated as exceptions.",
    ),
  },
  {
    id: "suivis",
    question: "How does the follow-up work?",
    answer: awaiting(
      "Décrire le déroulement réel des suivis : plateforme utilisée, fréquence des bilans, format (écrit, vidéo, appel), délai de réponse habituel.",
    ),
  },
  {
    id: "duree",
    question: "How long does the coaching last?",
    answer: awaiting(
      "Indiquer la durée réelle de l'accompagnement et s'il existe un engagement minimum.",
    ),
  },
  {
    id: "langues",
    question: "Is the coaching offered in French and English?",
    answer: confirmed(
      "Yes. You can indicate your preferred language in the application form, and the coaching is delivered in that language.",
    ),
  },
  {
    id: "appel",
    question: "What happens during the transformation call?",
    answer: confirmed(
      "It's a conversation, not a sales pitch. We go over your goal, your current situation, your schedule and what has held you back so far. By the end you'll know whether the coaching fits your situation — and if it doesn't, Zach will tell you.",
    ),
  },
  {
    id: "prix",
    question: "How much does the coaching cost?",
    answer: awaiting(
      "Indiquer la structure de prix, ou expliquer clairement pourquoi le tarif est présenté pendant l'appel. Ne rien afficher tant que ce n'est pas décidé.",
    ),
  },
];
