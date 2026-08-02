import type { Locale } from "@/lib/i18n";
import { vslContent as enVslContent } from "./vsl.en";

/**
 * VSL (video sales letter) configuration.
 *
 * The video itself is configured through environment variables so it can be
 * swapped without a code change:
 *
 *   NEXT_PUBLIC_VSL_PROVIDER = youtube | vimeo | wistia | file
 *   NEXT_PUBLIC_VSL_URL      = the video id or, for `file`, a full/relative URL
 *
 * If either is missing, the page renders a polished branded placeholder
 * ("Présentation bientôt disponible") — never a broken iframe.
 */

export type VslProvider = "youtube" | "vimeo" | "wistia" | "file";

export type VslConfig =
  | { configured: false }
  | {
      configured: true;
      provider: VslProvider;
      /** Raw value from the environment (id or URL). */
      id: string;
      /** Ready-to-use embed src for iframe providers. */
      embedUrl: string | null;
      /** Ready-to-use file URL for the native <video> provider. */
      fileUrl: string | null;
    };

const PROVIDERS: readonly VslProvider[] = ["youtube", "vimeo", "wistia", "file"];

function isProvider(v: string): v is VslProvider {
  return (PROVIDERS as readonly string[]).includes(v);
}

/**
 * Accepts either a bare id or a full share URL and returns the id.
 * Keeps the content team from having to know which format is expected.
 */
function extractId(provider: VslProvider, raw: string): string {
  const value = raw.trim();
  if (provider === "file") return value;
  if (!value.includes("/")) return value;

  try {
    const url = new URL(value);
    if (provider === "youtube") {
      const v = url.searchParams.get("v");
      if (v) return v;
      return url.pathname.split("/").filter(Boolean).pop() ?? value;
    }
    return url.pathname.split("/").filter(Boolean).pop() ?? value;
  } catch {
    return value;
  }
}

export function getVslConfig(): VslConfig {
  const providerRaw = process.env.NEXT_PUBLIC_VSL_PROVIDER?.trim().toLowerCase();
  const urlRaw = process.env.NEXT_PUBLIC_VSL_URL?.trim();

  if (!providerRaw || !urlRaw || !isProvider(providerRaw)) {
    return { configured: false };
  }

  const provider = providerRaw;
  const id = extractId(provider, urlRaw);
  if (!id) return { configured: false };

  // `rel=0` and `dnt=1` keep the embed as privacy-respecting as each provider allows.
  const embedUrl =
    provider === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0&modestbranding=1&playsinline=1`
      : provider === "vimeo"
        ? `https://player.vimeo.com/video/${encodeURIComponent(id)}?dnt=1&title=0&byline=0&portrait=0`
        : provider === "wistia"
          ? `https://fast.wistia.net/embed/iframe/${encodeURIComponent(id)}?videoFoam=true`
          : null;

  return {
    configured: true,
    provider,
    id,
    embedUrl,
    fileUrl: provider === "file" ? id : null,
  };
}

/* -------------------------------------------------------------------------- */
/* Copy                                                                        */
/* -------------------------------------------------------------------------- */

export const vslContent = {
  eyebrow: "PRÉSENTATION · ZLARY FITNESS",
  headline:
    "Comment transformer ton physique sans suivre un régime impossible à maintenir.",
  headlineLines: [
    "Comment transformer ton physique",
    "sans suivre un régime impossible à maintenir.",
  ],
  support:
    "Découvre l'approche utilisée pour construire une stratégie autour de ton travail, de ton horaire et de ta vraie vie.",
  backLabel: "Retour",
  cta: { label: "Postuler pour le coaching", href: "/apply?source=vsl" },
  placeholder: {
    heading: "Présentation bientôt disponible",
    body: "La vidéo est en préparation. En attendant, tu peux déjà remplir la candidature — elle prend quelques minutes et permet de vérifier si l'accompagnement correspond à ta situation.",
  },
  /**
   * Only rendered when the real runtime is known. Leave `null` rather than
   * inventing a duration — a wrong number is an easy credibility loss.
   */
  duration: null as string | null,
  takeaways: {
    heading: "Ce que tu vas comprendre",
    items: [
      {
        index: "01",
        title: "Pourquoi les plans stricts échouent",
        body: "Ce n'est presque jamais un manque de discipline. C'est une structure qui ne supporte aucune semaine imparfaite.",
      },
      {
        index: "02",
        title: "Comment le plan est construit",
        body: "Ton horaire, ton équipement et ton niveau réel déterminent le programme — pas un modèle générique.",
      },
      {
        index: "03",
        title: "Ce que la nutrition flexible veut dire",
        body: "Des repères clairs sur les portions et les protéines, sans menu imposé ni aliment interdit.",
      },
      {
        index: "04",
        title: "Comment les résultats se maintiennent",
        body: "L'objectif final est l'autonomie : savoir décider seul une fois l'accompagnement terminé.",
      },
    ],
  },
  proof: {
    heading: "Ce que ça donne concrètement",
    body: "Les transformations publiées le sont uniquement avec l'accord écrit du client.",
  },
  faqHeading: "Questions fréquentes",
  finalCta: {
    heading: "Ton plan commence par une conversation.",
    body: "Réponds à quelques questions. Si l'accompagnement ne correspond pas à ta situation, Zach te le dira.",
  },
};

const dictionary: Record<Locale, typeof vslContent> = {
  fr: vslContent,
  en: enVslContent,
};

export function getVslContent(locale: Locale): typeof vslContent {
  return dictionary[locale];
}
