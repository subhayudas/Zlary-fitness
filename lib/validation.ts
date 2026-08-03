import { z } from "zod";
import {
  desiredTimelineOptions,
  investmentReadinessOptions,
  obstacleOptions,
  type Option,
  preferredLanguageOptions,
  primaryGoalOptions,
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
  slotRequired: string;
  slotInvalid: string;
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
    slotRequired: "Choisis un créneau pour continuer.",
    slotInvalid: "Ce créneau n'est plus disponible. Choisis-en un autre.",
    submissionIdInvalid: "Identifiant de soumission invalide.",
  },
  en: {
    required: "This field is required.",
    maxChars: (max) => `Maximum ${max} characters.`,
    fullNameMin: "Enter your full name.",
    emailInvalid: "That email address isn't valid.",
    emailTooLong: "That address is too long.",
    phoneInvalid: "Enter a valid phone number.",
    slotRequired: "Pick a time to continue.",
    slotInvalid: "That time is no longer available. Please pick another.",
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
  /* Per-section schemas — the flow validates one screen at a time             */
  /* ------------------------------------------------------------------------ */

  /**
   * The five qualifying questions, in the order they are asked.
   *
   * `investmentReadiness` is here like any other answer and, deliberately, is
   * not a gate: whatever it says, the visitor reaches the calendar. It tags the
   * lead so the coach can prepare — it does not decide who gets to talk to him.
   */
  const questions = z.object({
    primaryGoal: enumField(primaryGoalOptions),
    trainingLevel: enumField(trainingLevelOptions),
    biggestObstacle: enumField(obstacleOptions),
    desiredTimeline: enumField(desiredTimelineOptions),
    investmentReadiness: enumField(investmentReadinessOptions),
  });

  const contact = z.object({
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
    preferredLanguage: enumField(preferredLanguageOptions),
    /** Opt-in only, and separate from the booking itself. */
    marketingConsent: z.boolean().default(false),
  });

  /**
   * The chosen slot, as the instant it starts.
   *
   * Normalised to `toISOString()` form so the value that reaches the database is
   * the same string the availability endpoint generated, whatever the browser
   * sent. Being a real, free, offered slot is checked in the route against
   * `lib/schedule.ts` — a shape check cannot know what is still available.
   */
  const slot = z.object({
    slotStart: z.preprocess(
      cleanText,
      z
        .string()
        .min(1, m.slotRequired)
        .refine((value) => !Number.isNaN(Date.parse(value)), m.slotInvalid)
        .transform((value) => new Date(value).toISOString()),
    ),
  });

  const attributionShape = {
    utm_source: optionalString(180),
    utm_medium: optionalString(180),
    utm_campaign: optionalString(180),
    utm_content: optionalString(180),
    utm_term: optionalString(180),
    referrer: optionalString(500),
    /** Which funnel the booking came from: "landing" | "vsl" | … */
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
    questions,
    contact,
    slot,

    /** What the API route accepts. */
    booking: z.object({
      ...questions.shape,
      ...slot.shape,
      ...contact.shape,
      ...attributionShape,
      ...antiSpamShape,
    }),

    /**
     * Client-side form shape.
     *
     * The slot is absent on purpose: it is chosen through a calendar rather than
     * typed into a field, so the flow holds it in component state and sends it
     * alongside these values. Attribution is injected at submit time.
     */
    form: z.object({
      ...questions.shape,
      ...contact.shape,
      company: antiSpamShape.company,
    }),
  };
}

const schemasByLocale = {
  fr: buildSchemas(messagesByLocale.fr),
  en: buildSchemas(messagesByLocale.en),
} satisfies Record<Locale, ReturnType<typeof buildSchemas>>;

/** The form schema whose messages are in the reader's language. */
export function getBookingFormSchema(locale: Locale) {
  return schemasByLocale[locale].form;
}

/** Messages the flow needs outside a field — the calendar's own errors. */
export function getValidationMessages(locale: Locale): ValidationMessages {
  return messagesByLocale[locale];
}

/* -------------------------------------------------------------------------- */
/* Server-side entry points                                                    */
/* -------------------------------------------------------------------------- */

const serverSchemas = schemasByLocale[defaultLocale];

export const bookingSchema = serverSchemas.booking;
export const bookingFormSchema = serverSchemas.form;

export type BookingInput = z.input<typeof bookingSchema>;
export type BookingData = z.output<typeof bookingSchema>;

export type BookingFormValues = z.input<typeof bookingFormSchema>;
export type BookingFormOutput = z.output<typeof bookingFormSchema>;

/* -------------------------------------------------------------------------- */
/* Flow composition                                                            */
/* -------------------------------------------------------------------------- */

/**
 * The qualifying questions, in the order they are asked.
 *
 * This array *is* the order of the flow's first phase — one question per
 * screen — and `applyContent.questions` in `content/apply.ts` is keyed by the
 * same names, so adding a question means adding it in both places.
 */
export const questionFields = [
  "primaryGoal",
  "trainingLevel",
  "biggestObstacle",
  "desiredTimeline",
  "investmentReadiness",
] as const satisfies readonly (keyof BookingFormValues)[];

export type QuestionField = (typeof questionFields)[number];

/**
 * The contact screen has no list of its own: it shows every one of its fields at
 * once, so react-hook-form validates the whole form on submit and there is
 * nothing to step through.
 *
 * `preferredLanguage` is not among them. It is set from the visitor's stored
 * language rather than answered here, so there is no control to focus and
 * nothing a visitor could do about an error on it — it is still validated at
 * submit, along with every other field.
 */
