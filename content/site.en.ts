import { confirmed } from "./types";

/**
 * Site-level copy - English.
 *
 * Only the strings a visitor actually reads are translated. Brand name, handles,
 * URLs and the `awaiting(...)` notes (which are instructions to Zach, shown in
 * development only) stay in `site.ts` as the single source of truth.
 */
export const siteCopy = {
  positioning:
    "Online fitness and nutrition coaching for busy people who want results that last.",

  disclaimer:
    "The information on this site is provided for general educational purposes. Fitness and nutrition coaching is not a substitute for medical diagnosis, treatment or supervision.",

  serviceArea: confirmed("Online · Remote coaching"),

  languagesOffered: confirmed("French and English"),
};
