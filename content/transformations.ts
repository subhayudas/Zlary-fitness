import type { Locale } from "@/lib/i18n";
import { transformationAlt as enAlt } from "./transformations.en";
import type { MediaAsset } from "./types";

/**
 * ---------------------------------------------------------------------------
 * CLIENT TRANSFORMATION PHOTOGRAPHY
 * ---------------------------------------------------------------------------
 * These are real client photos supplied by Zach. Two rules govern this file:
 *
 *   1. `approved` must be true before an entry renders anywhere. It is the
 *      switch that records that the client agreed, in writing, to their photos
 *      being published. Flip it to false and the entry disappears from the
 *      site with no other change.
 *
 *   2. Nothing here may be invented. There are no names, no durations and no
 *      measurements, because none were supplied - the only figure in the file
 *      is the one the client printed on their own photograph (see `t04`).
 *      A number nobody stated is a number nobody said.
 *
 * ---------------------------------------------------------------------------
 * THE SOURCE FILES AND HOW THESE CROPS WERE MADE
 * ---------------------------------------------------------------------------
 * Most of Zach's originals are single composite images with the before and
 * after already side by side. The comparison slider needs them as two separate
 * frames, so each composite was split and re-cropped to an identical 4:5 box
 * with the subject scaled to match across the pair - otherwise dragging the
 * divider would make the person appear to grow or shrink for reasons that have
 * nothing to do with training, which is exactly the kind of comparison that
 * turns a transformation photo into a misleading one.
 *
 *   t01 ← PHOTO-2026-08-03-17-59-53.jpg / PHOTO-2026-08-03-18-00-27.jpg
 *   t02 ← AC7E1F86-…jpg   (front view)
 *   t03 ← B183DAEE-…jpg
 *   t04 ← IMG_0283.PNG
 *
 * t01 is the exception to the composite rule: it arrived as two separate
 * photographs, an outdoor full-body shot and a locker-room mirror selfie. They
 * were cropped so the head and the waistband land at the same height in both
 * frames - the same scale-matching the split composites get, done across two
 * shots taken in different places rather than within one image.
 *
 * `7109218C-…jpg` is the SAME client as t02 photographed from the side. It is
 * exported as `t02-alt-side-*.webp` and deliberately not listed as its own
 * entry: four cards that include the same person twice would read as four
 * different clients. Swap the two `t02` frames for the `-alt-side-` pair to
 * show the profile instead.
 *
 * `IMG_8898.PNG` was the previous `t01` and is no longer used - it was
 * replaced, at Zach's request, by the client above.
 *
 * `IMG_0333.PNG` (the January/July collage) is not included. It is a
 * four-panel Instagram story whose quadrants do not pair into a matching
 * before/after - the two halves show different body parts at different
 * distances, under arrows and captions that cannot be cropped away.
 */

/** Every frame is the same 4:5 export, so the slider never has to letterbox. */
const frame = (id: string, alt: string): MediaAsset => ({
  id,
  src: `/media/transformations/${id}.webp`,
  alt,
  width: 800,
  height: 1000,
  orientation: "portrait",
  brief:
    "Photo client fournie par Zach, recadrée en 4:5 avec le sujet à la même échelle que la photo jumelle.",
  recommended: "800 × 1000 px · 4:5",
  focal: "Sujet centré. Le cadrage doit rester identique aux deux photos.",
  // The crop is already 4:5 and the frame is 4:5, so `cover` is a no-op here.
  objectPosition: "50% 50%",
});

export type Transformation = {
  readonly id: string;
  readonly before: MediaAsset;
  readonly after: MediaAsset;
  /**
   * Body weight in pounds - set ONLY where the client printed the figure on
   * their own photograph. Formatted per locale at render time.
   */
  readonly weight: { readonly from: number; readonly to: number } | null;
  /** Written client consent obtained. Nothing renders while false. */
  readonly approved: boolean;
};

export const transformations: readonly Transformation[] = [
  {
    id: "t01",
    before: frame("t01-before", "Client de Zlary Fitness avant l'accompagnement, debout torse nu à l'extérieur."),
    after: frame("t01-after", "Le même client après l'accompagnement, photo prise devant un miroir de vestiaire : épaules, bras et abdominaux nettement plus développés."),
    weight: null,
    approved: true,
  },
  {
    id: "t02",
    before: frame("t02-before", "Client de Zlary Fitness avant l'accompagnement, debout de face, torse nu."),
    after: frame("t02-after", "Le même client après l'accompagnement, de face : masse musculaire et définition abdominale visibles."),
    weight: null,
    approved: true,
  },
  {
    id: "t03",
    before: frame("t03-before", "Client de Zlary Fitness avant l'accompagnement, debout de profil."),
    after: frame("t03-after", "Le même client après l'accompagnement : silhouette plus sèche et plus dessinée."),
    weight: null,
    approved: true,
  },
  {
    id: "t04",
    before: frame("t04-before", "Client de Zlary Fitness avant l'accompagnement, photo prise devant un miroir."),
    after: frame("t04-after", "Le même client après l'accompagnement, devant un miroir : épaules et bras plus développés."),
    // The only figures anywhere in this file: both are printed on the client's
    // own before/after image.
    weight: { from: 183.6, to: 191 },
    approved: true,
  },
];

/** Only approved entries ever reach a component. */
export const approvedTransformations = transformations.filter((t) => t.approved);

function translate(asset: MediaAsset, locale: Locale): MediaAsset {
  if (locale === "fr") return asset;
  const alt = enAlt[asset.id as keyof typeof enAlt];
  return alt ? { ...asset, alt } : asset;
}

export function getTransformations(locale: Locale): readonly Transformation[] {
  if (locale === "fr") return approvedTransformations;

  return approvedTransformations.map((t) => ({
    ...t,
    before: translate(t.before, locale),
    after: translate(t.after, locale),
  }));
}

/**
 * Formats a weight for display. Kept here rather than in the component so the
 * French decimal comma and the pound abbreviation stay with the data.
 */
export function formatWeight(pounds: number, locale: Locale): string {
  const value = pounds.toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return locale === "fr" ? `${value} lb` : `${value} lbs`;
}
