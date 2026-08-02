import { z } from "zod";
import {
  desiredTimelineOptions,
  investmentReadinessOptions,
  obstacleOptions,
  type Option,
  preferredLanguageOptions,
  primaryGoalOptions,
  referralSourceOptions,
  supportNeededOptions,
  trainingFrequencyOptions,
  trainingLevelOptions,
} from "@/content/apply";
import { defaultLocale, type Locale } from "@/lib/i18n";

/**
 * A single schema shape, shared by the browser and the API route.
 *
 * The client uses it for inline validation; the server re-validates the exact
 * same shape, because client-side validation is a UX feature and never a
 * security boundary.
 *
 * ---------------------------------------------------------------------------
 * WHY THE SCHEMA IS BUILT RATHER THAN DECLARED
 * ---------------------------------------------------------------------------
 * Only the *messages* vary by language — the fields, the lengths and the
 * patterns are identical, and must stay identical, or the two languages would
 * accept different data. So the shape is declared once in `buildSchemas()` and
 * parameterised by a message table.
 *
 * The server keeps the default (French) messages: its validation failures are
 * answered with a generic `invalid_payload` code and the individual messages
 * are never sent to the client, so there is nothing there to translate.
 */

export type ValidationMessages = {
  required: string;
  maxChars: (max: number) => string;
  fullNameMin: string;
  emailInvalid: string;
  emailTooLong: string;
  phoneInvalid: string;
  motivationMin: string;
  accuracyRequired: string;
  contactConsentRequired: string;
  submissionIdInvalid: string;
};

const messagesByLocale: Record<Locale, ValidationMessages> = {
  fr: {
    required: "Ce champ est obligatoire.",
    maxChars: (max) => `Maximum ${max} caractères.`,
    fullNameMin: "Indique ton nom complet.",
    emailInvalid: "Cette adresse courriel n'est pas valide.",
    emailTooLong: "Adresse trop longue.",
    phoneInvalid: "Indique un numéro de téléphone valide.",
    motivationMin: "Écris quelques phrases — au moins 20 caractères.",
    accuracyRequired: "Confirme que tes informations sont exactes.",
    contactConsentRequired:
      "Ton accord est nécessaire pour pouvoir te répondre.",
    submissionIdInvalid: "Identifiant de soumission invalide.",
  },
  en: {
    required: "This field is required.",
    maxChars: (max) => `Maximum ${max} characters.`,
    fullNameMin: "Enter your full name.",
    emailInvalid: "That email address isn't valid.",
    emailTooLong: "That address is too long.",
    phoneInvalid: "Enter a valid phone number.",
    motivationMin: "Write a few sentences — at least 20 characters.",
    accuracyRequired: "Confirm that your information is accurate.",
    contactConsentRequired: "We need your agreement in order to reply to you.",
    submissionIdInvalid: "Invalid submission identifier.",
  },
};

/** Strips control characters and collapses whitespace to a single space. */
const cleanText = (value: unknown) =>
  typeof value === "string"
    ? value
        .replace(/[\u0000-\u001F\u007F]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : value;

/** Same, but keeps newlines so long-form answers retain their paragraphs. */
const cleanMultiline = (value: unknown) =>
  typeof value === "string"
    ? value
        .replace(/\r\n?/g, "\n")
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    : value;

function buildSchemas(m: ValidationMessages) {
  const optionalString = (max: number) =>
    z.preprocess(
      cleanText,
      z
        .string()
        .max(max, m.maxChars(max))
        .optional()
        .transform((v) => (v && v.length > 0 ? v : undefined)),
    );

  /** Builds a zod enum from an option list while preserving literal value types. */
  const enumField = <T extends readonly Option[]>(options: T) =>
    z.enum(
      options.map((o) => o.value) as unknown as [
        T[number]["value"],
        ...T[number]["value"][],
      ],
      { error: m.required },
    );

  /* ------------------------------------------------------------------------ */
  /* Per-step schemas — the multi-step form validates one step at a time       */
  /* ------------------------------------------------------------------------ */

  const contactStep = z.object({
    fullName: z.preprocess(
      cleanText,
      z.string().min(2, m.fullNameMin).max(120, m.maxChars(120)),
    ),
    email: z.preprocess(
      cleanText,
      z.email({ error: m.emailInvalid }).max(254, m.emailTooLong),
    ),
    phone: z.preprocess(
      cleanText,
      z
        .string()
        .min(1, m.required)
        .max(32, m.maxChars(32))
        .regex(/^[+(\d][\d\s\-().]{6,}$/, m.phoneInvalid),
    ),
    instagramUsername: optionalString(64),
    preferredLanguage: enumField(preferredLanguageOptions),
  });

  const goalStep = z.object({
    primaryGoal: enumField(primaryGoalOptions),
    trainingLevel: enumField(trainingLevelOptions),
    trainingFrequency: enumField(trainingFrequencyOptions),
    desiredTimeline: enumField(desiredTimelineOptions),
    biggestObstacle: enumField(obstacleOptions),
  });

  const fitStep = z.object({
    motivation: z.preprocess(
      cleanMultiline,
      z.string().min(20, m.motivationMin).max(1500, m.maxChars(1500)),
    ),
    supportNeeded: enumField(supportNeededOptions),
    investmentReadiness: enumField(investmentReadinessOptions),
    referralSource: enumField(referralSourceOptions),
  });

  /**
   * Consent uses `boolean().refine(...)` rather than `literal(true)` so the
   * *input* type stays `boolean` — a checkbox has to be able to start unchecked.
   */
  const consentStep = z.object({
    accuracyConfirmed: z.boolean().refine((value) => value === true, {
      error: m.accuracyRequired,
    }),
    contactConsent: z.boolean().refine((value) => value === true, {
      error: m.contactConsentRequired,
    }),
    marketingConsent: z.boolean().default(false),
  });

  const attributionShape = {
    utm_source: optionalString(180),
    utm_medium: optionalString(180),
    utm_campaign: optionalString(180),
    utm_content: optionalString(180),
    utm_term: optionalString(180),
    referrer: optionalString(500),
    /** Which funnel the application came from: "landing" | "vsl" | … */
    source: optionalString(60),
  };

  const antiSpamShape = {
    /**
     * Honeypot. Real users never see this field, so any value means a bot.
     * The API still returns 200 so the bot learns nothing from the response.
     */
    company: z.string().max(200).optional(),
    /**
     * Milliseconds between form mount and submit. Sub-second submissions are
     * effectively always automated.
     */
    elapsedMs: z.number().int().nonnegative().max(86_400_000).optional(),
    /** Idempotency key generated once per form session. */
    submissionId: z
      .string()
      .regex(/^[a-zA-Z0-9_-]{8,64}$/, m.submissionIdInvalid)
      .optional(),
  };

  return {
    contactStep,
    goalStep,
    fitStep,
    consentStep,

    /** What the API route accepts. */
    application: z.object({
      ...contactStep.shape,
      ...goalStep.shape,
      ...fitStep.shape,
      ...consentStep.shape,
      ...attributionShape,
      ...antiSpamShape,
    }),

    /**
     * Client-side form shape.
     *
     * Includes the honeypot so it can be registered like any other field; the
     * attribution fields are injected at submit time rather than rendered.
     */
    form: z.object({
      ...contactStep.shape,
      ...goalStep.shape,
      ...fitStep.shape,
      ...consentStep.shape,
      company: antiSpamShape.company,
    }),
  };
}

const schemasByLocale = {
  fr: buildSchemas(messagesByLocale.fr),
  en: buildSchemas(messagesByLocale.en),
} satisfies Record<Locale, ReturnType<typeof buildSchemas>>;

/** The form schema whose messages are in the reader's language. */
export function getApplicationFormSchema(locale: Locale) {
  return schemasByLocale[locale].form;
}

/** Per-step schemas in the order the steps are rendered. */
export function getStepSchemas(locale: Locale) {
  const s = schemasByLocale[locale];
  return [s.goalStep, s.fitStep, s.contactStep, s.consentStep] as const;
}

/* -------------------------------------------------------------------------- */
/* Server-side entry points                                                    */
/* -------------------------------------------------------------------------- */

const serverSchemas = schemasByLocale[defaultLocale];

export const applicationSchema = serverSchemas.application;
export const applicationFormSchema = serverSchemas.form;

export type ApplicationInput = z.input<typeof applicationSchema>;
export type ApplicationData = z.output<typeof applicationSchema>;

export type ApplicationFormValues = z.input<typeof applicationFormSchema>;
export type ApplicationFormOutput = z.output<typeof applicationFormSchema>;

/* -------------------------------------------------------------------------- */
/* Step composition                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Field names per step, in render order.
 *
 * Used to validate and focus one step at a time, and — for the two steps that
 * reveal their questions one after another — to decide which question comes
 * next. The order inside `goalFields` and `fitFields` is therefore the order the
 * visitor is asked, not just the order errors are reported in.
 */
export const goalFields = [
  "primaryGoal",
  "trainingLevel",
  "trainingFrequency",
  "desiredTimeline",
  "biggestObstacle",
] as const satisfies readonly (keyof ApplicationFormValues)[];

/**
 * `motivation` is last on purpose: it opens the step with three quick taps
 * rather than with a blank text box, which is the highest-friction way to ask
 * someone for anything. It is also the only question here that cannot carry the
 * visitor forward on its own, so it is the natural place to hand over to the
 * "Continue" button.
 */
export const fitFields = [
  "supportNeeded",
  "investmentReadiness",
  "referralSource",
  "motivation",
] as const satisfies readonly (keyof ApplicationFormValues)[];

/**
 * `preferredLanguage` is deliberately absent: it is set from the visitor's
 * stored language rather than answered here, so there is no control to focus
 * and nothing a visitor could do about an error on it. It is still validated at
 * submit, along with every other field.
 */
export const contactFields = [
  "fullName",
  "email",
  "phone",
  "instagramUsername",
] as const satisfies readonly (keyof ApplicationFormValues)[];

export const consentFields = [
  "accuracyConfirmed",
  "contactConsent",
  "marketingConsent",
] as const satisfies readonly (keyof ApplicationFormValues)[];

/**
 * Indexed by step number, so this order must match `applyContent.steps` in
 * `content/apply.ts`. Contact sits third: the questions come before the ask.
 */
export const stepFields: readonly (readonly (keyof ApplicationFormValues)[])[] =
  [goalFields, fitFields, contactFields, consentFields];
