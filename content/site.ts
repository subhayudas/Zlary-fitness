import { localeMeta, type Locale } from "@/lib/i18n";
import { siteCopy as enCopy } from "./site.en";
import { awaiting, confirmed, type Confirmable } from "./types";

/**
 * Global site settings.
 * Everything a non-developer might reasonably want to change lives in /content.
 *
 * The handful of strings here that a visitor actually reads (positioning,
 * disclaimer, service area, languages offered) are translated in `site.en.ts`
 * and resolved through `getSiteCopy(locale)` at the bottom of this file.
 */

export const site = {
  brand: "Zlary Fitness",
  /** Rendered as the wordmark. Kept separate so it can be styled in two tones. */
  wordmark: { primary: "Zlary", secondary: "Fitness" },
  coachFirstName: "Zach",
  coachFullName: "Zach",

  /** Used for canonical URLs, sitemap, Open Graph. Override with NEXT_PUBLIC_SITE_URL. */
  fallbackUrl: "https://zlaryfitness.com",

  locale: "fr-CA",
  htmlLang: "fr",

  positioning:
    "Coaching fitness et nutrition en ligne pour les personnes occupées qui veulent des résultats durables.",

  /**
   * REPLACE BEFORE LAUNCH - this address is shown publicly in the footer and
   * used as the reply-to for application notifications.
   */
  email: awaiting<string>("Adresse courriel publique de Zach") as Confirmable<string>,

  instagramHandle: "zlaryfitness",
  instagramUrl: "https://www.instagram.com/zlaryfitness/",

  /** Service area. Do not claim a physical location that has not been verified. */
  serviceArea: confirmed("En ligne · Coaching à distance"),

  /** Legally required health disclaimer, shown in the footer and on legal pages. */
  disclaimer:
    "Les informations présentées sur ce site sont fournies à des fins éducatives générales. Le coaching fitness et nutrition ne remplace pas un diagnostic, un traitement ou un suivi médical.",

  /**
   * PENDING BUSINESS FACTS - nothing below renders publicly until confirmed.
   * Send these to the developer (or edit here directly) before launch.
   */
  facts: {
    yearsOfExperience: awaiting<string>(
      "Nombre d'années d'expérience en coaching",
    ),
    clientsCoached: awaiting<string>(
      "Nombre de clients accompagnés (chiffre vérifiable uniquement)",
    ),
    coachingPlatform: awaiting<string>(
      "Plateforme utilisée pour le coaching (ex. application de suivi)",
    ),
    checkInFrequency: awaiting<string>(
      "Fréquence des bilans (ex. hebdomadaire, bimensuel)",
    ),
    programDuration: awaiting<string>("Durée minimale d'un accompagnement"),
    pricing: awaiting<string>(
      "Structure de prix - ne rien afficher tant que ce n'est pas confirmé",
    ),
    personalStory: awaiting<string>(
      "Parcours personnel de Zach - 2 à 4 phrases, à sa voix",
    ),
    languagesOffered: confirmed("Français et anglais"),
  },
} as const;

/**
 * Certifications.
 *
 * Legally sensitive: never publish a credential that has not been verified.
 * Add one `awaiting(...)` entry per real certification, then swap to
 * `confirmed({ name, issuer, year })` once you have the document.
 */
export type Certification = {
  name: string;
  issuer: string;
  /** Optional - omit rather than guess. */
  year?: string;
};

export const certifications: readonly Confirmable<Certification>[] = [
  awaiting<Certification>(
    "Certification principale - nom exact, organisme émetteur, année",
  ),
  awaiting<Certification>(
    "Certification nutrition (si applicable) - nom exact et organisme",
  ),
];

/* -------------------------------------------------------------------------- */
/* Locale dictionary                                                           */
/* -------------------------------------------------------------------------- */

export type SiteCopy = {
  positioning: string;
  disclaimer: string;
  serviceArea: Confirmable<string>;
  languagesOffered: Confirmable<string>;
};

const copyDictionary: Record<Locale, SiteCopy> = {
  fr: {
    positioning: site.positioning,
    disclaimer: site.disclaimer,
    serviceArea: site.serviceArea,
    languagesOffered: site.facts.languagesOffered,
  },
  en: enCopy,
};

export function getSiteCopy(locale: Locale): SiteCopy {
  return copyDictionary[locale];
}

/** `Intl` locale used for date formatting. */
export function intlLocale(locale: Locale): string {
  return localeMeta[locale].intlLocale;
}

export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const raw = fromEnv && fromEnv.length > 0 ? fromEnv : site.fallbackUrl;
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path = "/"): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
