import type { Locale } from "@/lib/i18n";
import * as en from "./legal.en";
import { awaiting } from "./types";

/**
 * Legal pages — French (the reference text; see `legal.en.ts`).
 *
 * ---------------------------------------------------------------------------
 * NOT LEGAL ADVICE. Have these reviewed before launch.
 * ---------------------------------------------------------------------------
 * The text below is a good-faith, factually accurate description of what this
 * website actually does (one form, optional analytics, Supabase storage, Resend
 * email). It is written to be compatible with Québec's Law 25 and Canada's
 * PIPEDA, but a lawyer should confirm it — especially the legal-entity details
 * and the retention period, which are left as placeholders on purpose.
 */

export const legalPlaceholders = {
  legalEntity: awaiting<string>(
    "Dénomination légale de l'entreprise (ou nom personnel si entreprise individuelle)",
  ),
  businessAddress: awaiting<string>(
    "Adresse postale à laquelle les demandes d'accès aux renseignements peuvent être envoyées",
  ),
  privacyContact: awaiting<string>(
    "Personne responsable de la protection des renseignements personnels et son courriel",
  ),
  retentionPeriod: awaiting<string>(
    "Durée de conservation des candidatures non retenues (ex. 24 mois)",
  ),
  governingLaw: awaiting<string>(
    "Province / territoire dont les lois régissent les conditions (ex. Québec, Canada)",
  ),
};

export const privacyContent = {
  eyebrow: "LÉGAL",
  title: "Politique de confidentialité",
  updatedLabel: "Dernière mise à jour",
  /** Update this date whenever the policy text changes. */
  updated: "2026-01-01",
  intro:
    "Cette politique explique quels renseignements personnels sont recueillis par le site de Zlary Fitness, pourquoi ils le sont, comment ils sont utilisés et quels sont tes droits.",
  sections: [
    {
      id: "collecte",
      title: "Renseignements recueillis",
      paragraphs: [
        "Le seul formulaire du site est le formulaire de candidature au coaching. Il recueille : ton nom, ton adresse courriel, ton numéro de téléphone, ton nom d'utilisateur Instagram (facultatif), ta langue préférée, ainsi que tes réponses concernant ton objectif d'entraînement, ton niveau, ta fréquence d'entraînement actuelle, ton échéancier, tes obstacles, ta motivation, le niveau de suivi souhaité et la façon dont tu as connu Zlary Fitness.",
        "Le formulaire enregistre également des données techniques liées à ta visite : la page de provenance, les paramètres de campagne présents dans l'adresse (utm_source, utm_medium, utm_campaign, utm_content, utm_term) et la date de soumission.",
        "Aucun renseignement de santé n'est demandé : ni antécédents médicaux, ni blessures, ni médication, ni poids, ni mesures corporelles. Merci de ne pas en transmettre dans les champs de texte libre.",
      ],
    },
    {
      id: "utilisation",
      title: "Utilisation des renseignements",
      paragraphs: [
        "Tes réponses servent à évaluer ta candidature, à préparer l'appel et à te recontacter à ce sujet. Elles ne sont ni vendues, ni louées, ni échangées.",
        "Si tu as coché la case facultative de consentement marketing, ton adresse courriel peut aussi être utilisée pour t'envoyer des conseils et des nouvelles. Tu peux retirer ce consentement à tout moment : chaque envoi contient un lien de désabonnement, et une simple demande par courriel suffit également.",
      ],
    },
    {
      id: "sous-traitants",
      title: "Prestataires et hébergement",
      paragraphs: [
        "Le site est hébergé sur Vercel. Les candidatures sont enregistrées dans une base de données Supabase et une notification est envoyée par courriel via Resend. Ces prestataires traitent les données pour le compte de Zlary Fitness et peuvent héberger des données à l'extérieur du Canada, notamment aux États-Unis.",
        "Si un outil de mesure d'audience est activé (Google Analytics, Google Tag Manager ou Meta Pixel), il n'est chargé qu'après ton consentement explicite via la bannière affichée lors de ta première visite. Tant que tu n'as pas consenti, aucun script de mesure ou de publicité n'est chargé.",
      ],
    },
    {
      id: "conservation",
      title: "Conservation",
      paragraphs: [
        "Les candidatures sont conservées le temps nécessaire au suivi de la demande et à la gestion de la relation de coaching, puis supprimées.",
      ],
    },
    {
      id: "droits",
      title: "Tes droits",
      paragraphs: [
        "Tu peux demander l'accès aux renseignements personnels détenus à ton sujet, leur rectification ou leur suppression, et retirer ton consentement. Ces demandes sont traitées dans les délais prévus par la loi applicable.",
        "Pour exercer ces droits, écris à l'adresse de contact indiquée dans le pied de page du site.",
      ],
    },
    {
      id: "cookies",
      title: "Témoins (cookies)",
      paragraphs: [
        "Le site ne dépose aucun témoin publicitaire par défaut. Un seul témoin fonctionnel est utilisé pour mémoriser ton choix concernant la bannière de consentement. Si tu acceptes la mesure d'audience, les outils correspondants peuvent alors déposer leurs propres témoins.",
      ],
    },
    {
      id: "securite",
      title: "Sécurité",
      paragraphs: [
        "Les données transitent en HTTPS et sont stockées chez des prestataires appliquant des mesures de sécurité reconnues. Aucun système n'est infaillible, mais l'accès aux candidatures est restreint aux personnes qui en ont besoin.",
      ],
    },
  ],
};

export const termsContent = {
  eyebrow: "LÉGAL",
  title: "Conditions d'utilisation",
  updatedLabel: "Dernière mise à jour",
  updated: "2026-01-01",
  intro:
    "En utilisant ce site, tu acceptes les conditions ci-dessous. Elles concernent l'utilisation du site lui-même; les modalités d'un accompagnement de coaching font l'objet d'une entente distincte.",
  sections: [
    {
      id: "objet",
      title: "Objet du site",
      paragraphs: [
        "Ce site présente les services de coaching fitness et nutrition en ligne de Zlary Fitness et permet de soumettre une candidature. Soumettre une candidature ne crée aucune obligation, ni pour toi, ni pour Zlary Fitness.",
        "Réserver un créneau d'appel ne signifie pas que ta candidature a été acceptée. Chaque candidature est lue avant l'appel, et l'accompagnement peut être refusé s'il ne correspond pas à ta situation.",
      ],
    },
    {
      id: "sante",
      title: "Avertissement santé",
      paragraphs: [
        "Les informations présentées sur ce site sont fournies à des fins éducatives générales. Le coaching fitness et nutrition ne remplace pas un diagnostic, un traitement ou un suivi médical.",
        "Consulte un professionnel de la santé avant d'entreprendre un nouveau programme d'entraînement ou de modifier ton alimentation, en particulier si tu as une condition médicale, une blessure ou si tu es enceinte.",
      ],
    },
    {
      id: "resultats",
      title: "Résultats",
      paragraphs: [
        "Aucun résultat n'est garanti. Les résultats dépendent de nombreux facteurs individuels, notamment le point de départ, l'assiduité, le sommeil, le niveau de stress et le contexte de vie.",
        "Les transformations affichées sur le site sont celles de clients réels, publiées avec leur autorisation écrite. Elles illustrent des parcours individuels et ne constituent pas une promesse de résultat.",
      ],
    },
    {
      id: "propriete",
      title: "Propriété intellectuelle",
      paragraphs: [
        "Les textes, images, vidéos, programmes et documents produits par Zlary Fitness sont protégés. Ils sont destinés à ton usage personnel et ne peuvent être revendus, redistribués ni partagés sans autorisation écrite.",
      ],
    },
    {
      id: "liens",
      title: "Liens et services externes",
      paragraphs: [
        "Le site renvoie vers des services externes, notamment Instagram et l'outil de réservation d'appel. Zlary Fitness n'est pas responsable du contenu ni des pratiques de confidentialité de ces services.",
      ],
    },
    {
      id: "responsabilite",
      title: "Limitation de responsabilité",
      paragraphs: [
        "Dans les limites permises par la loi applicable, Zlary Fitness ne peut être tenu responsable des dommages indirects découlant de l'utilisation du site ou de l'application des informations générales qui y sont présentées.",
      ],
    },
    {
      id: "modifications",
      title: "Modifications",
      paragraphs: [
        "Ces conditions peuvent être mises à jour. La date de dernière mise à jour indiquée en haut de la page fait foi.",
      ],
    },
  ],
};

export const notFoundContent = {
  code: "404",
  eyebrow: "PAGE INTROUVABLE",
  heading: "Cette page n'existe pas.",
  body: "Le lien est peut-être erroné, ou la page a été déplacée. Voici où aller ensuite.",
  links: [
    { label: "Retour à l'accueil", href: "/" },
    { label: "Voir la présentation", href: "/vsl" },
    { label: "Commencer ma candidature", href: "/#postuler" },
  ],
};

export const thankYouContent = {
  eyebrow: "CANDIDATURE REÇUE",
  heading: "C'est envoyé. Voici la suite.",
  body: "Ta candidature est enregistrée. Zach la lit avant l'appel afin d'arriver préparé.",
  confirmation: {
    label: "Statut",
    value: "Candidature reçue",
  },
  nextSteps: {
    heading: "Ce qui se passe maintenant",
    items: [
      {
        index: "01",
        title: "Zach lit ta candidature",
        body: "Tes réponses sur ton objectif, ton horaire et tes obstacles sont revues avant l'appel.",
      },
      {
        index: "02",
        title: "Ajoute l'appel à ton calendrier",
        body: "Si tu as réservé un créneau, la confirmation contient un lien pour l'ajouter à ton agenda. Vérifie tes courriels indésirables si tu ne la vois pas.",
      },
      {
        index: "03",
        title: "L'appel transformation",
        body: "Une conversation d'environ trente minutes sur ta situation et sur la façon dont un plan pourrait être construit autour d'elle.",
      },
    ],
  },
  prepare: {
    heading: "Pour bien préparer l'appel",
    items: [
      "Prévois un endroit calme où tu peux parler librement.",
      "Réfléchis au nombre de séances réaliste dans ta semaine.",
      "Note ce qui a fait dérailler tes tentatives précédentes.",
    ],
  },
  notBooked: {
    heading: "Tu n'as pas encore réservé ton appel?",
    body: "C'est la dernière étape. Choisis le moment qui te convient.",
    cta: { label: "Choisir un créneau", href: "/book" },
  },
  instagram: {
    heading: "En attendant",
    body: "Tu peux suivre le contenu quotidien sur Instagram.",
  },
};

/* -------------------------------------------------------------------------- */
/* Locale dictionaries                                                         */
/* -------------------------------------------------------------------------- */

export type LegalDocument = typeof privacyContent;

const privacyDictionary: Record<Locale, LegalDocument> = {
  fr: privacyContent,
  en: en.privacyContent,
};

const termsDictionary: Record<Locale, typeof termsContent> = {
  fr: termsContent,
  en: en.termsContent,
};

const notFoundDictionary: Record<Locale, typeof notFoundContent> = {
  fr: notFoundContent,
  en: en.notFoundContent,
};

const thankYouDictionary: Record<Locale, typeof thankYouContent> = {
  fr: thankYouContent,
  en: en.thankYouContent,
};

export function getPrivacyContent(locale: Locale): LegalDocument {
  return privacyDictionary[locale];
}

export function getTermsContent(locale: Locale): typeof termsContent {
  return termsDictionary[locale];
}

export function getNotFoundContent(locale: Locale): typeof notFoundContent {
  return notFoundDictionary[locale];
}

export function getThankYouContent(locale: Locale): typeof thankYouContent {
  return thankYouDictionary[locale];
}
