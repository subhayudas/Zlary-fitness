/**
 * Photography alt text — English.
 *
 * Only `alt` is translated. `brief`, `recommended` and `focal` are production
 * notes for whoever shoots or re-crops the photography — they are shown in the
 * development-only placeholder card and never to a visitor, so they stay in
 * French alongside the rest of the shoot direction.
 *
 * Backdrops are decorative (`alt: ""`, rendered `aria-hidden`) and so have
 * nothing to translate.
 *
 * Keys are `MediaAsset.id` values, which `media.ts` checks exhaustively.
 */
export const mediaAlt = {
  hero: "Zach, online fitness coach, walking across the training floor.",
  "outcomes-training":
    "Weighted sled push on a track: a full-body strength movement in execution.",
  "method-coaching":
    "Zach correcting a client's form on the cable machine.",
  "deliverables-lifestyle":
    "Zach crossing the gym floor between two training sessions.",
  "about-portrait":
    "Portrait of Zach, online fitness and nutrition coach, leaning against the gym's window wall.",
  "vsl-poster":
    "Zach facing the camera, explaining the Zlary Fitness coaching method.",
  "results-hero":
    "A group session underway in the gym where Zlary Fitness coaching takes place.",
  "og-image": "Zlary Fitness — online fitness and nutrition coaching.",
  "hero-beach-run-poster": "A runner training on a beach at sunrise.",
};
