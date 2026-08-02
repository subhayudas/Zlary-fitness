/**
 * Shared content types for the Zlary Fitness site.
 *
 * ---------------------------------------------------------------------------
 * THE `Confirmable` PATTERN — READ THIS BEFORE EDITING CONTENT
 * ---------------------------------------------------------------------------
 * A number of facts about the business (certifications, years of experience,
 * client counts, pricing, session frequency…) are NOT known yet. We must never
 * publish an invented value, and we must never publish a visible "TODO".
 *
 * So every unknown fact is wrapped in a `Confirmable<T>`:
 *
 *   awaiting("Nom exact de la certification")   → nothing renders in production
 *   confirmed("Certification XYZ")              → the value renders normally
 *
 * In development only, an unconfirmed value renders a small dashed marker so
 * you can see what is still missing. In production it renders nothing at all.
 * Search this repo for `awaiting(` to get the full launch checklist.
 */

export type Confirmable<T> =
  | { readonly status: "confirmed"; readonly value: T }
  | { readonly status: "awaiting"; readonly note: string };

/** Wrap a real, verified value supplied by Zach. */
export function confirmed<T>(value: T): Confirmable<T> {
  return { status: "confirmed", value };
}

/**
 * Mark a fact as still missing. `note` describes exactly what Zach must send.
 * Nothing is rendered publicly until this becomes `confirmed(...)`.
 */
export function awaiting<T>(note: string): Confirmable<T> {
  return { status: "awaiting", note };
}

export function isConfirmed<T>(
  v: Confirmable<T>,
): v is { status: "confirmed"; value: T } {
  return v.status === "confirmed";
}

/** Returns the value if confirmed, otherwise `undefined`. Safe for rendering. */
export function valueOf<T>(v: Confirmable<T>): T | undefined {
  return v.status === "confirmed" ? v.value : undefined;
}

/** Keeps only confirmed entries and unwraps them. */
export function onlyConfirmed<T>(list: readonly Confirmable<T>[]): T[] {
  return list.filter(isConfirmed).map((entry) => entry.value);
}

/* -------------------------------------------------------------------------- */
/* Media                                                                       */
/* -------------------------------------------------------------------------- */

export type Orientation = "portrait" | "landscape" | "square";

/**
 * A single photograph slot.
 *
 * `src: null` means the photo has not been delivered yet. Components render an
 * art-directed placeholder card (never a broken <img>) that states the brief,
 * orientation, recommended dimensions and focal-point guidance.
 *
 * To ship a real photo: drop the file into `/public/media/` and set `src`.
 * No component code needs to change.
 */
export type MediaAsset = {
  readonly id: string;
  readonly src: string | null;
  /** French, descriptive alt text. Never decorative-empty for content images. */
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly orientation: Orientation;
  /** What to photograph. Shown inside the placeholder. */
  readonly brief: string;
  /** e.g. "2400 × 3000 px · 4:5" */
  readonly recommended: string;
  /** Human guidance, e.g. "Visage dans le tiers supérieur gauche". */
  readonly focal: string;
  /** CSS object-position applied to the real image once delivered. */
  readonly objectPosition: string;
};

/**
 * A silent, looping background video.
 *
 * Three rules, all of them load-bearing:
 *   · The encoded files carry NO audio stream at all. `muted` on the element is
 *     the second line of defence, not the first — a hero that can make noise is
 *     a hero that will eventually make noise.
 *   · `poster` must be a still lifted from the same encode, so the frame that
 *     paints before the video decodes is the frame the video starts on.
 *   · The footage is decorative. The `<MediaFrame>` underneath carries the alt
 *     text; the video itself is `aria-hidden`. Remove the video files and the
 *     hero degrades to that photograph with nothing else changed.
 *
 * `sources` are ordered best-first — the browser plays the first it supports.
 */
export type VideoAsset = {
  readonly id: string;
  readonly sources: readonly { readonly src: string; readonly type: string }[];
  /** The still that renders before playback, and instead of it below. */
  readonly poster: MediaAsset;
  readonly width: number;
  readonly height: number;
  /** What the footage is and how it was cut. Never rendered — for whoever recuts it. */
  readonly brief: string;
};

/* -------------------------------------------------------------------------- */
/* Case studies / testimonials                                                 */
/* -------------------------------------------------------------------------- */

/**
 * A client transformation.
 *
 * `approved` MUST be true before anything renders. Written consent is required
 * before publishing any client photograph, quotation or result.
 */
export type CaseStudy = {
  readonly id: string;
  /** First name or initials only, exactly as the client approved it. */
  readonly displayName: string;
  readonly context: string;
  readonly startingPoint: string;
  readonly obstacle: string;
  readonly approach: string;
  /** e.g. "6 mois" — only if factual. */
  readonly duration: string;
  /** Qualitative physical result. No invented measurements. */
  readonly physicalResult: string;
  /** Non-physical benefit: energy, confidence, structure… */
  readonly lifestyleResult: string;
  readonly quote: string;
  readonly before: MediaAsset | null;
  readonly after: MediaAsset | null;
  readonly featured: boolean;
  /** Written client consent obtained. Nothing renders while false. */
  readonly approved: boolean;
};

export type Testimonial = {
  readonly id: string;
  readonly displayName: string;
  readonly context: string;
  readonly quote: string;
  readonly approved: boolean;
};

/* -------------------------------------------------------------------------- */
/* Editorial primitives                                                        */
/* -------------------------------------------------------------------------- */

export type MethodStep = {
  readonly index: string;
  readonly title: string;
  readonly body: string;
};

export type Deliverable = {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  /** Set false until Zach confirms this is genuinely part of the offer. */
  readonly confirmedByCoach: boolean;
};

export type FaqItem = {
  readonly id: string;
  readonly question: string;
  /**
   * `awaiting(...)` questions are hidden from the page AND from FAQPage schema
   * until Zach supplies a real answer — an empty accordion row would read as a
   * broken site, and schema without a visible answer violates Google's rules.
   */
  readonly answer: Confirmable<string>;
};

export type NavLink = {
  readonly label: string;
  readonly href: string;
  /** Same-page anchor navigation from any route. */
  readonly anchor?: string;
};
