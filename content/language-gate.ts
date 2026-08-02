import { localeMeta, type Locale } from "@/lib/i18n";

/**
 * First-visit language chooser — copy.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS FILE IS BILINGUAL RATHER THAN TWO DICTIONARIES
 * ---------------------------------------------------------------------------
 * Every other string on the site is resolved through `getUi(locale)`, because
 * by then the language is known. This one is asked *before* it is known, so
 * writing it in one language would mean half the visitors are asked a question
 * they cannot read. Both languages are therefore rendered side by side, and
 * each option is labelled in the language it selects — the only label that is
 * legible to the person it is aimed at.
 *
 * French is listed first throughout: it is the site's default language and its
 * primary market.
 */

type Bilingual = Record<Locale, string>;

export const languageGate = {
  /** Small technical label above the question. Identical in both languages. */
  eyebrow: "FR / EN",

  title: {
    fr: "Choisis ta langue",
    en: "Choose your language",
  } satisfies Bilingual,

  /**
   * Says both things the visitor needs to know before answering: the choice is
   * kept, and it is not a trap — the FR / EN toggle overwrites it at any time.
   */
  body: {
    fr: "On garde ton choix pour tes prochaines visites et pour le suivi par courriel. Le bouton FR / EN le change à tout moment.",
    en: "We keep your choice for your next visits and for any email follow-up. The FR / EN button changes it at any time.",
  } satisfies Bilingual,

  /** The option itself: the language's own name, then what picking it does. */
  options: {
    fr: { name: localeMeta.fr.label, action: "Continuer en français" },
    en: { name: localeMeta.en.label, action: "Continue in English" },
  } satisfies Record<Locale, { name: string; action: string }>,

  /** Accessible name for the dialog. Bilingual, for the same reason. */
  dialogLabel: "Choisis ta langue — Choose your language",
} as const;
