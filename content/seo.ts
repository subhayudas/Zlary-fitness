import type { Locale } from "@/lib/i18n";
import {
  routeSeoCopy as enRouteSeoCopy,
  seoKeywords as enSeoKeywords,
} from "./seo.en";

/**
 * Per-route SEO copy — French.
 *
 * Titles stay under ~60 characters where possible, descriptions under ~155.
 * Keyword themes are woven into real sentences — no stuffing, no hidden text,
 * no location claims that have not been verified.
 *
 * English titles and descriptions live in `seo.en.ts`. Everything structural
 * (path, noindex, sitemap hints) is declared once here and shared by both
 * languages via `getRouteSeo(locale)`.
 */

export const seoKeywords = [
  "coach fitness en ligne",
  "coaching fitness personnalisé",
  "coach nutrition en ligne",
  "transformation physique",
  "perdre du gras sans régime extrême",
  "programme fitness pour personne occupée",
  "coach fitness francophone",
  "coaching remise en forme en ligne",
];

type RouteSeo = {
  path: string;
  title: string;
  description: string;
  /** Excluded from the sitemap and marked noindex when true. */
  noindex?: boolean;
  /** Sitemap hints. */
  priority?: number;
  changeFrequency?: "daily" | "weekly" | "monthly" | "yearly";
};

export const routeSeo = {
  home: {
    path: "/",
    title:
      "Coach Fitness en Ligne | Entraînement et Nutrition | Zlary Fitness",
    description:
      "Coaching fitness et nutrition personnalisé pour les personnes occupées. Transforme ton physique avec une approche flexible, durable et adaptée à ta vie.",
    priority: 1,
    changeFrequency: "monthly",
  },
  vsl: {
    path: "/vsl",
    title: "Transformer son physique sans régime extrême | Zlary Fitness",
    description:
      "Découvre la méthode de coaching en ligne utilisée pour construire un plan d'entraînement et de nutrition autour de ton horaire et de ta vraie vie.",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  apply: {
    path: "/apply",
    title: "Candidature Coaching | Zlary Fitness",
    description:
      "Remplis ta candidature pour le coaching fitness et nutrition en ligne de Zlary Fitness. Quelques questions pour vérifier si l'accompagnement te convient.",
    priority: 0.9,
    changeFrequency: "yearly",
  },
  results: {
    path: "/results",
    title: "Transformations Clients | Zlary Fitness",
    description:
      "Des transformations physiques obtenues avec un coaching en ligne construit autour d'horaires chargés. Résultats publiés avec l'accord des clients.",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  book: {
    path: "/book",
    title: "Réserver un appel | Zlary Fitness",
    description:
      "Choisis un moment pour discuter de tes objectifs, de ta situation actuelle et de la façon dont le coaching pourrait t'aider.",
    noindex: true,
  },
  thankYou: {
    path: "/thank-you",
    title: "Candidature confirmée | Zlary Fitness",
    description: "Ta candidature au coaching Zlary Fitness a bien été reçue.",
    noindex: true,
  },
  privacy: {
    path: "/privacy",
    title: "Politique de confidentialité | Zlary Fitness",
    description:
      "Comment Zlary Fitness recueille, utilise et protège les renseignements personnels transmis par le formulaire de candidature.",
    priority: 0.3,
    changeFrequency: "yearly",
  },
  terms: {
    path: "/terms",
    title: "Conditions d'utilisation | Zlary Fitness",
    description:
      "Conditions d'utilisation du site Zlary Fitness et avis concernant les informations fitness et nutrition qui y sont présentées.",
    priority: 0.3,
    changeFrequency: "yearly",
  },
} satisfies Record<string, RouteSeo>;

/* -------------------------------------------------------------------------- */
/* Locale dictionary                                                           */
/* -------------------------------------------------------------------------- */

export type RouteKey = keyof typeof routeSeo;

/** Every route, with the title and description resolved for `locale`. */
export function getRouteSeo(locale: Locale): Record<RouteKey, RouteSeo> {
  if (locale === "fr") return routeSeo;

  const out = {} as Record<RouteKey, RouteSeo>;
  for (const key of Object.keys(routeSeo) as RouteKey[]) {
    out[key] = { ...routeSeo[key], ...enRouteSeoCopy[key] };
  }
  return out;
}

export function getSeoKeywords(locale: Locale): string[] {
  return locale === "en" ? enSeoKeywords : seoKeywords;
}

/** Routes that belong in the sitemap. Identical in both languages. */
export const indexableRoutes = Object.values(routeSeo).filter(
  (r) => !("noindex" in r && r.noindex),
);
