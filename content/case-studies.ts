import type { Locale } from "@/lib/i18n";
import { resultsDisclaimer as enResultsDisclaimer } from "./case-studies.en";
import type { CaseStudy, Testimonial } from "./types";

/**
 * ---------------------------------------------------------------------------
 * CLIENT RESULTS — NOTHING IS PUBLISHED WITHOUT WRITTEN CONSENT
 * ---------------------------------------------------------------------------
 * The array below is intentionally EMPTY. No case study has been supplied and
 * none may be invented: fabricated transformations are both a legal risk and
 * the fastest way to lose a prospect's trust.
 *
 * To publish a real transformation:
 *
 *   1. Obtain written consent from the client for the photos AND the quote.
 *   2. Add an entry using the shape documented in `content/types.ts`.
 *   3. Attach the before/after `MediaAsset`s (see `clientMedia` in media.ts).
 *   4. Set `approved: true` — this is the switch that makes it render.
 *
 * Anything with `approved: false` is filtered out everywhere on the site, so a
 * draft entry can safely live in this file while consent is being collected.
 *
 * Rules for the copy:
 *   · No invented measurements, percentages or weights.
 *   · No timeframe that was not actually the case.
 *   · No "guaranteed" language, no medical claims.
 *   · Quote the client verbatim — do not rewrite them.
 *
 * Reference entry (kept commented out as a template):
 *
 * {
 *   id: "marc",
 *   displayName: "Marc",
 *   context: "Travailleur de la construction, horaire variable",
 *   startingPoint: "…",
 *   obstacle: "…",
 *   approach: "…",
 *   duration: "…",
 *   physicalResult: "…",
 *   lifestyleResult: "…",
 *   quote: "…",
 *   before: clientMedia.placeholderBefore("Marc"),
 *   after: clientMedia.placeholderAfter("Marc"),
 *   featured: true,
 *   approved: false,
 * }
 */
export const caseStudies: readonly CaseStudy[] = [];

/** Only approved entries ever reach a component. */
export const approvedCaseStudies = caseStudies.filter((c) => c.approved);

export const featuredCaseStudy =
  approvedCaseStudies.find((c) => c.featured) ?? approvedCaseStudies[0] ?? null;

export const supportingCaseStudies = approvedCaseStudies.filter(
  (c) => c.id !== featuredCaseStudy?.id,
);

/**
 * Short written testimonials (no photography).
 * Same rule: `approved` must be true, and the quote must be verbatim.
 */
export const testimonials: readonly Testimonial[] = [];

export const approvedTestimonials = testimonials.filter((t) => t.approved);

export const resultsDisclaimer =
  "Les résultats présentés sont ceux de clients réels et sont publiés avec leur autorisation. Les résultats varient d'une personne à l'autre selon le point de départ, l'assiduité et le contexte de vie.";

export function getResultsDisclaimer(locale: Locale): string {
  return locale === "en" ? enResultsDisclaimer : resultsDisclaimer;
}
