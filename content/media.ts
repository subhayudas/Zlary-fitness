import type { Locale } from "@/lib/i18n";
import { mediaAlt as enAlt } from "./media.en";
import type { MediaAsset, VideoAsset } from "./types";

/**
 * ---------------------------------------------------------------------------
 * CENTRALISED MEDIA CONFIGURATION
 * ---------------------------------------------------------------------------
 * Every photograph on the site is declared here — components never hard-code
 * an image path. To publish a real photo:
 *
 *   1. Export it at (or above) the `recommended` size, as .webp or .jpg
 *   2. Drop it in `/public/media/`
 *   3. Set `src: "/media/your-file.webp"` below
 *
 * Until `src` is set, `<MediaFrame>` renders an art-directed placeholder that
 * states the brief, orientation, dimensions and focal point. It never renders a
 * broken <img>, and it never fakes a photograph.
 *
 * PHOTOGRAPHY DIRECTION (applies to every slot)
 *   · Authentic images of Zach and real clients only — no stock bodybuilders.
 *   · Natural or slightly muted grade, soft warm highlights, deep but open
 *     shadows. No heavy HDR, no crushed blacks, no credibility-killing filters.
 *   · Shoot wide enough to survive a full-bleed crop on both 9:16 and 16:9.
 *   · Never composite or retouch a client transformation.
 */

const p = (a: MediaAsset): MediaAsset => a;

export const media = {
  /* ---------------------------------------------------------------- Hero */
  hero: p({
    id: "hero",
    src: "/media/hero-gym.webp",
    alt: "Zach, coach fitness en ligne, traversant la salle d'entraînement.",
    width: 1586,
    height: 992,
    orientation: "landscape",
    brief:
      "Zach en action à l'entraînement, plan large, salle réelle. Espace vide à gauche pour le titre.",
    recommended: "2880 × 1800 px · 16:10",
    focal: "Zach au centre-droit, regard hors champ. Garder le tiers inférieur gauche dégagé.",
    // Pulls the frame toward Zach and keeps his head clear of the top edge when
    // the shell crops to its tallest ratio.
    objectPosition: "63% 30%",
  }),

  /* ------------------------------------------------------------- Outcomes */
  outcomesTraining: p({
    id: "outcomes-training",
    src: "/media/outcomes-sled.webp",
    alt: "Poussée de traîneau lesté sur piste : exécution d'un mouvement de force complet.",
    width: 1586,
    height: 992,
    orientation: "landscape",
    brief:
      "Mouvement de force en pleine exécution. Lumière naturelle, environnement de gym réel.",
    recommended: "1800 × 1125 px · 16:10",
    focal: "Sujet à droite du traîneau, marge en haut pour les cartes flottantes.",
    objectPosition: "58% 46%",
  }),

  /* --------------------------------------------------------------- Method */
  methodCoaching: p({
    id: "method-coaching",
    src: "/media/method-coaching.webp",
    alt: "Zach corrigeant l'exécution d'un mouvement avec un client à la poulie.",
    width: 1536,
    height: 1024,
    orientation: "landscape",
    brief:
      "Moment de coaching : Zach explique ou corrige un mouvement. Candide, pas posé.",
    recommended: "1800 × 1200 px · 3:2",
    focal: "Deux personnes, tiers central.",
    objectPosition: "50% 42%",
  }),

  /* ---------------------------------------------------------------- Offer */
  deliverablesLifestyle: p({
    id: "deliverables-lifestyle",
    src: "/media/deliverables-lifestyle.webp",
    alt: "Zach traversant la salle entre deux séances d'entraînement.",
    width: 1003,
    height: 1568,
    orientation: "portrait",
    brief:
      "Image de vie : déplacement, travail, café, sac de sport. Montre que l'entraînement s'insère dans une journée normale.",
    recommended: "1600 × 2500 px · 2:3",
    focal: "Sujet légèrement décentré vers la droite.",
    objectPosition: "52% 34%",
  }),

  /* --------------------------------------------------------------- About */
  aboutPortrait: p({
    id: "about-portrait",
    src: "/media/about-portrait.webp",
    alt: "Portrait de Zach, coach fitness et nutrition en ligne, adossé à la baie vitrée de la salle.",
    width: 1122,
    height: 1402,
    orientation: "portrait",
    brief:
      "Portrait vertical de Zach, du buste à la tête. Regard caméra, expression posée, arrière-plan simple.",
    recommended: "2000 × 2500 px · 4:5",
    focal: "Visage dans le tiers supérieur.",
    objectPosition: "46% 24%",
  }),

  /* ----------------------------------------------------------------- VSL */
  vslPoster: p({
    id: "vsl-poster",
    src: "/media/vsl-poster.webp",
    alt: "Zach face caméra, expliquant la méthode de coaching Zlary Fitness.",
    width: 1672,
    height: 941,
    orientation: "landscape",
    brief:
      "Image fixe extraite de la vidéo de présentation, ou plan de Zach face caméra en train de parler.",
    recommended: "2560 × 1440 px · 16:9",
    focal: "Zach à droite, moitié gauche dégagée derrière le bouton lecture.",
    objectPosition: "56% 34%",
  }),

  /* ------------------------------------------------------------- Results */
  resultsHero: p({
    id: "results-hero",
    src: "/media/results-environment.webp",
    alt: "Séance collective en cours dans la salle où se déroulent les accompagnements Zlary Fitness.",
    width: 1586,
    height: 992,
    orientation: "landscape",
    brief:
      "Plan large de l'environnement d'entraînement. Sert d'introduction à la page résultats.",
    recommended: "2880 × 1800 px · 16:10",
    focal: "Composition ouverte, sujet secondaire.",
    objectPosition: "50% 48%",
  }),

  /* ---------------------------------------------------------- Open Graph */
  ogImage: p({
    id: "og-image",
    src: "/media/og-hero.webp",
    alt: "Zlary Fitness — coaching fitness et nutrition en ligne.",
    width: 1200,
    height: 630,
    orientation: "landscape",
    brief:
      "Image de partage social : photo de Zach + wordmark Zlary Fitness. Le texte doit rester lisible en petit format.",
    recommended: "1200 × 630 px · 1.91:1",
    focal: "Sujet à droite, wordmark à gauche.",
    objectPosition: "50% 40%",
  }),
} satisfies Record<string, MediaAsset>;

/**
 * ---------------------------------------------------------------------------
 * MOVING BACKGROUNDS
 * ---------------------------------------------------------------------------
 * Silent, looping footage used behind copy. Same rule as the photography: the
 * page must still work with the file removed — every one of these declares a
 * `poster` that stands in on its own.
 *
 * Encoding checklist, if this footage is ever recut (`-an` is not optional):
 *   ffmpeg -ss 0 -t <window> -i source.mp4 -an -vf "…" -c:v libx264 …
 *   · strip audio at the file level, then set `muted` on the element as well
 *   · export .mp4 (H.264, +faststart) and .webm (VP9)
 *   · lift the poster from the first frame of the final loop, not the source
 */
export const videos = {
  /**
   * Hero. Sunrise beach run, shot from behind, camera tracking forward.
   *
   * Cut deliberately, not just trimmed:
   *   · MIRRORED. In the original the runner tracks up the left-centre of the
   *     frame — exactly where the headline sits. Flipped, she holds the right
   *     third and the copy column stays clear of her. Nothing in shot is
   *     handed, lettered or branded, so the flip is invisible.
   *   · Cut to the opening ~3.4s, the only window where she stays right of the
   *     copy for the whole loop; the camera closes in after that and she drifts
   *     back across the frame.
   *   · Slowed to 0.62× and re-interpolated to 30fps — reads as intent rather
   *     than as a dropped-frame stutter.
   *   · The tail cross-dissolves into the head, so the loop has no hard cut.
   */
  hero: {
    id: "hero-beach-run",
    sources: [
      { src: "/media/hero-beach-run.webm", type: "video/webm" },
      { src: "/media/hero-beach-run.mp4", type: "video/mp4" },
    ],
    width: 1280,
    height: 720,
    brief:
      "Course au lever du soleil sur une plage bordée de palmiers, caméra en travelling arrière. Sujet cadré à droite, tiers gauche dégagé pour le titre.",
    poster: p({
      id: "hero-beach-run-poster",
      src: "/media/hero-beach-run-poster.jpg",
      alt: "Coureuse à l'entraînement sur une plage au lever du soleil.",
      width: 1280,
      height: 720,
      orientation: "landscape",
      brief:
        "Première image de la boucle vidéo du hero. Doit correspondre exactement au premier plan de la vidéo.",
      recommended: "1280 × 720 px · 16:9",
      focal: "Coureuse dans le tiers droit, tiers gauche dégagé.",
      // Overridden per breakpoint by --hero-focus in EditorialHero; this is the
      // value used anywhere the variable is not set.
      objectPosition: "0% 50%",
    }),
  },
} satisfies Record<string, VideoAsset>;

/**
 * ---------------------------------------------------------------------------
 * PHOTOGRAPHIC BACKDROPS
 * ---------------------------------------------------------------------------
 * These are not content images. Each one sits *behind* a panel that would
 * otherwise be a flat field of colour, at low opacity and under a scrim, to
 * give the surface depth. They are decorative by definition — `alt` is empty
 * and `<PhotoBackdrop>` renders them `aria-hidden`.
 *
 * Three rules keep them from becoming the focus:
 *   · Nothing in them may be needed to understand the page. Remove the file and
 *     the panel goes back to flat colour with no loss of meaning.
 *   · Deep-petroleum panels only. White copy on ink has ~15:1 of contrast to
 *     spend; the light surfaces do not — `--color-ink-muted` was tuned to clear
 *     4.5:1 by a small margin, so tinting underneath it would fail AA.
 *   · They are exported small and compressed harder than content photography —
 *     at ~28% opacity behind a scrim, the extra fidelity is invisible.
 */
export const backdrops = {
  /** Footer, site-wide. Open horizon; warm light at the close of every page. */
  horizon: p({
    id: "backdrop-horizon",
    src: "/media/backdrop-horizon.webp",
    alt: "",
    width: 1280,
    height: 854,
    orientation: "landscape",
    brief: "Plan large en extérieur, horizon dégagé, lumière rasante.",
    recommended: "1280 × 854 px · 3:2",
    focal: "Ligne d'horizon dans la moitié haute.",
    objectPosition: "50% 42%",
  }),

  /** Nutrition statement panel — a coach explaining, not a plate of food. */
  coaching: p({
    id: "backdrop-coaching",
    src: "/media/backdrop-coaching.webp",
    alt: "",
    width: 1280,
    height: 854,
    orientation: "landscape",
    brief: "Coaching en cours avec une cliente, salle réelle.",
    recommended: "1280 × 854 px · 3:2",
    focal: "Deux personnes, tiers central.",
    objectPosition: "55% 45%",
  }),

  /** Full-screen mobile menu — portrait, to match a phone viewport. */
  guidance: p({
    id: "backdrop-guidance",
    src: "/media/backdrop-guidance.webp",
    alt: "",
    width: 900,
    height: 1407,
    orientation: "portrait",
    brief: "Coaching au sol, explication calme d'un mouvement.",
    recommended: "900 × 1407 px · 2:3",
    focal: "Deux personnes, moitié basse.",
    objectPosition: "50% 55%",
  }),

  /** Booking panel — what a one-to-one session actually looks like. */
  session: p({
    id: "backdrop-session",
    src: "/media/backdrop-session.webp",
    alt: "",
    width: 900,
    height: 1407,
    orientation: "portrait",
    brief: "Séance individuelle, coach en retrait derrière le client.",
    recommended: "900 × 1407 px · 2:3",
    focal: "Sujets au centre.",
    objectPosition: "50% 40%",
  }),
} satisfies Record<string, MediaAsset>;

/* -------------------------------------------------------------------------- */
/* Locale dictionary                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Alt text is the only translated field on an asset — the file, its dimensions
 * and its focal point are identical in both languages. Swapping just that one
 * string keeps a single source of truth for the photography itself.
 *
 * The `Record` is keyed by every id in `media` plus the hero poster, so adding
 * a photograph without an English alt is a type error, not a French alt quietly
 * shipping on the English page.
 */
type TranslatableAssetId =
  | (typeof media)[keyof typeof media]["id"]
  | (typeof videos)["hero"]["poster"]["id"];

const altDictionary: Record<Locale, Record<TranslatableAssetId, string>> = {
  fr: {
    hero: media.hero.alt,
    "outcomes-training": media.outcomesTraining.alt,
    "method-coaching": media.methodCoaching.alt,
    "deliverables-lifestyle": media.deliverablesLifestyle.alt,
    "about-portrait": media.aboutPortrait.alt,
    "vsl-poster": media.vslPoster.alt,
    "results-hero": media.resultsHero.alt,
    "og-image": media.ogImage.alt,
    "hero-beach-run-poster": videos.hero.poster.alt,
  },
  en: enAlt,
};

function translate(asset: MediaAsset, locale: Locale): MediaAsset {
  const alt = altDictionary[locale][asset.id as TranslatableAssetId];
  return alt ? { ...asset, alt } : asset;
}

export function getMedia(locale: Locale): typeof media {
  if (locale === "fr") return media;

  const out = {} as Record<string, MediaAsset>;
  for (const [key, asset] of Object.entries(media)) {
    out[key] = translate(asset, locale);
  }
  return out as typeof media;
}

export function getVideos(locale: Locale): typeof videos {
  if (locale === "fr") return videos;

  return {
    hero: { ...videos.hero, poster: translate(videos.hero.poster, locale) },
  };
}

/**
 * Client transformation photography.
 *
 * NEVER populate these without written client consent. Before/after pairs must
 * be shot in comparable lighting, distance and posture — no flexing versus
 * slouching, no different lenses. Misleading comparisons are a legal risk.
 */
export const clientMedia = {
  placeholderBefore: (name: string): MediaAsset => ({
    id: `before-${name}`,
    src: null,
    alt: `Photo avant l'accompagnement — ${name}.`,
    width: 1200,
    height: 1500,
    orientation: "portrait",
    brief: `Photo « avant » approuvée par ${name}. Même distance, même éclairage et même posture que la photo « après ».`,
    recommended: "1200 × 1500 px · 4:5",
    focal: "Sujet centré, cadrage identique aux deux photos.",
    objectPosition: "50% 40%",
  }),
  placeholderAfter: (name: string): MediaAsset => ({
    id: `after-${name}`,
    src: null,
    alt: `Photo après l'accompagnement — ${name}.`,
    width: 1200,
    height: 1500,
    orientation: "portrait",
    brief: `Photo « après » approuvée par ${name}. Cadrage strictement identique à la photo « avant ».`,
    recommended: "1200 × 1500 px · 4:5",
    focal: "Sujet centré, cadrage identique aux deux photos.",
    objectPosition: "50% 40%",
  }),
};
