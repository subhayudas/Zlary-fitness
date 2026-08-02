"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { ArrowLeft } from "@/components/icons";
import {
  CheckboxField,
  ChoiceField,
  HoneypotField,
  TextAreaField,
  TextField,
} from "@/components/form/fields";
import { FollowUpLanguage } from "@/components/form/FollowUpLanguage";
import { FormProgressPanel, ProgressBar } from "@/components/form/FormProgressPanel";
import { PillCTA } from "@/components/ui/PillCTA";
import { Rule } from "@/components/ui/typography";
import { getApplyContent, getApplyOptions } from "@/content/apply";
import { getUi } from "@/content/ui";
import { localePath, type Locale } from "@/lib/i18n";
import { captureAttribution, track } from "@/lib/analytics";
import { useLanguagePreference } from "@/lib/use-language-preference";
import {
  fitFields,
  getApplicationFormSchema,
  goalFields,
  stepFields,
  type ApplicationFormOutput,
  type ApplicationFormValues,
} from "@/lib/validation";
import { createId, elapsedSince, nowMs } from "@/lib/utils";

/**
 * The steps that ask one question at a time, and the order they ask in.
 * Anything not listed here shows all of its fields together.
 */
const questionsFor = (stepId: string) =>
  stepId === "goal" ? goalFields : stepId === "fit" ? fitFields : null;


/**
 * Four-step coaching application.
 *
 * Notes on the things that matter:
 *   · Each step is validated on its own before advancing, so a visitor never
 *     reaches step 4 to discover an error on step 1.
 *   · The goal and fit steps show exactly one question at a time — answering
 *     replaces it with the next rather than adding to it. Five radio groups at
 *     once reads as a chore; one question reads as a conversation. Choosing an
 *     option carries the visitor forward without a click on anything else.
 *   · Contact is step 3, not step 1. The questions come before the ask.
 *   · Submission is idempotent: one `submissionId` is generated per form
 *     session and sent with every attempt, so a retry after a network blip
 *     cannot create a duplicate row.
 *   · There is no optimistic success. The confirmation only happens after the
 *     API confirms the application was actually stored.
 */
export function MultiStepApplication({ locale }: { locale: Locale }) {
  const applyContent = getApplyContent(locale);
  const options = getApplyOptions(locale);
  const t = getUi(locale);
  const totalSteps = applyContent.steps.length;

  const router = useRouter();
  const [step, setStep] = useState(0);
  /** Which question of the current step is on screen. Reset on every step change. */
  const [questionIndex, setQuestionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Populated on mount — both are impure calls and must not run during render.
  const startedAt = useRef<number | null>(null);
  const submissionId = useRef<string | null>(null);
  const source = useRef<string | undefined>(undefined);
  const startReported = useRef(false);
  const headingRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const advanceTimer = useRef<number | null>(null);

  /**
   * The language question is not asked here any more — it was answered on the
   * first visit and is read back from storage. `locale` is the fallback for the
   * handful of visitors who never stored an answer (storage disabled, or a
   * direct link opened in a fresh browser), and it is the right fallback: the
   * language they are reading the form in.
   */
  const { preference, choose } = useLanguagePreference();
  const followUpLanguage = preference ?? locale;

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ApplicationFormValues, unknown, ApplicationFormOutput>({
    resolver: zodResolver(getApplicationFormSchema(locale)),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      instagramUsername: "",
      motivation: "",
      company: "",
      // Never left undefined: the schema requires it and nothing on screen can
      // set it, so a missing value would fail validation with no visible field
      // to blame.
      preferredLanguage: locale,
      accuracyConfirmed: false,
      contactConsent: false,
      marketingConsent: false,
    },
  });

  // Runs once storage has been read, and again if the visitor corrects it.
  useEffect(() => {
    setValue("preferredLanguage", followUpLanguage);
  }, [followUpLanguage, setValue]);

  useEffect(() => {
    if (startReported.current) return;
    startReported.current = true;

    startedAt.current = nowMs();
    submissionId.current = createId();

    const params = new URLSearchParams(window.location.search);
    source.current = params.get("source") ?? "landing";

    captureAttribution();
    track("application_start", { source: source.current });
  }, []);

  // Move focus to the new step so keyboard and screen-reader users follow along.
  useEffect(() => {
    if (step === 0) return;
    headingRef.current?.focus();
  }, [step]);

  /* ------------------------------------------------------------------------ */
  /* One question at a time                                                    */
  /* ------------------------------------------------------------------------ */

  const stepId = applyContent.steps[step].id;

  /** The current step's questions, or null if it shows all its fields at once. */
  const questions = questionsFor(stepId);

  /** Which of them is on screen. Clamped, so it can never point past the end. */
  const cursor = questions
    ? Math.min(questionIndex, questions.length - 1)
    : 0;
  const current = questions ? questions[cursor] : null;

  /* Progress counts questions, not just steps — a bar that sat still through
     five questions would read as a form that had stopped responding. */
  const progress = (step + (questions ? (cursor + 1) / questions.length : 1)) / totalSteps;

  // Keep the question on screen. Nothing stacks up any more — each question
  // replaces the last — so this only has to correct the cases where the new
  // question is taller than the old one, or the visitor had scrolled away.
  const position = `${stepId}:${cursor}`;
  const lastPosition = useRef(position);

  useEffect(() => {
    if (lastPosition.current === position) return;
    lastPosition.current = position;

    const target = formRef.current?.querySelector<HTMLElement>("[data-question]");
    if (!target) return;

    /*
     * Scrolled by hand rather than with `scrollIntoView`.
     *
     * The page sits inside `.bezel-core`, which is `overflow: hidden`. That
     * counts as a scroll container, so `scrollIntoView` measures against it —
     * finds the target already "visible" inside a box taller than the window —
     * and scrolls nothing at all.
     */
    const box = target.getBoundingClientRect();
    const margin = 24;
    const below = box.bottom + margin - window.innerHeight;
    const above = box.top - margin;

    // A question taller than the window satisfies both: aligning its top wins.
    const delta = above < 0 ? above : below > 0 ? below : 0;
    if (delta === 0) return;

    window.scrollBy({
      top: delta,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [position]);

  /** Moves to another step, landing on its first question — or its last, when
      arriving backwards, so "Retour" lands where the visitor left off. */
  const goToStep = (next: number, fromTheEnd = false) => {
    const clamped = Math.min(Math.max(next, 0), totalSteps - 1);
    const arriving = questionsFor(applyContent.steps[clamped].id);

    setFormError(null);
    setStep(clamped);
    setQuestionIndex(fromTheEnd && arriving ? arriving.length - 1 : 0);
  };

  const goNext = async () => {
    // Only what is on screen is validated: one question on the stepped steps,
    // every field on the others.
    const fields = (current ? [current] : stepFields[step]) as FieldPath<
      ApplicationFormValues
    >[];
    const valid = await trigger(fields, { shouldFocus: true });
    if (!valid) return;

    if (questions && cursor < questions.length - 1) {
      setFormError(null);
      setQuestionIndex(cursor + 1);
      return;
    }

    track("application_step_complete", {
      step: step + 1,
      step_id: stepId,
    });
    goToStep(step + 1);
  };

  const goBack = () => {
    if (questions && cursor > 0) {
      setFormError(null);
      setQuestionIndex(cursor - 1);
      return;
    }
    goToStep(step - 1, true);
  };

  /**
   * A chosen option carries the visitor forward on its own — that is the whole
   * point of asking one thing at a time.
   *
   * Only for pointer presses. Arrow keys select as they move through a radio
   * group, and a keyboard visitor pressing "down" to read the options would
   * otherwise be fired into the next question by the first one they landed on.
   * Those reach the card by bubbling from the radio and report `detail: 0`; a
   * real press on the card reports at least 1.
   */
  const onChoose = (event: ReactMouseEvent<HTMLLabelElement>) => {
    if (event.detail === 0) return;

    if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
    // Long enough to see the option fill in before the question changes.
    advanceTimer.current = window.setTimeout(() => {
      advanceTimer.current = null;
      void goNext();
    }, 320);
  };

  // A question that leaves while its timer is pending must not drag the next
  // one along with it.
  useEffect(
    () => () => {
      if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
    },
    [],
  );

  const onSubmit = async (values: ApplicationFormOutput) => {
    if (submitting) return;
    setSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          ...captureAttribution(),
          source: source.current,
          submissionId: submissionId.current ?? undefined,
          elapsedMs: elapsedSince(startedAt.current),
        }),
      });

      if (response.status === 429) {
        track("application_error", { reason: "rate_limited" });
        setFormError(applyContent.errors.rateLimited);
        return;
      }

      if (!response.ok) {
        track("application_error", { reason: `http_${response.status}` });
        setFormError(applyContent.errors.generic);
        return;
      }

      const payload = (await response.json()) as { ok?: boolean };
      if (!payload.ok) {
        track("application_error", { reason: "not_stored" });
        setFormError(applyContent.errors.generic);
        return;
      }

      track("application_submit", { source: source.current });
      // Keep the button disabled through the navigation.
      router.push(`${localePath("/book", locale)}?submitted=1`);
      return;
    } catch {
      track("application_error", { reason: "network" });
      setFormError(applyContent.errors.network);
    } finally {
      setSubmitting(false);
    }
  };

  const isLastStep = step === totalSteps - 1;

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-4">
      {/* Desktop context panel. */}
      <aside className="hidden lg:col-span-4 lg:block">
        <div className="h-full rounded-media bg-surface p-8 hairline xl:p-10">
          <FormProgressPanel
            locale={locale}
            currentStep={step}
            progress={progress}
          />
        </div>
      </aside>

      {/* Mobile progress. */}
      <div className="lg:hidden">
        <div className="flex items-baseline justify-between gap-4">
          <p className="type-micro text-ink/45">
            {applyContent.steps[step].title}
          </p>
          <p className="type-micro text-ink/35">
            {step + 1} / {totalSteps}
          </p>
        </div>
        <ProgressBar
          progress={progress}
          label={t.form.progressLabel}
          className="mt-3"
        />
      </div>

      <div className="lg:col-span-8">
        <form
          ref={formRef}
          // Built inside the event rather than during render: `onSubmit` reads
          // refs, and handing it to handleSubmit at render time would let the
          // compiler treat those reads as render-time reads.
          onSubmit={(event) => void handleSubmit(onSubmit)(event)}
          noValidate
          className="relative rounded-media bg-surface-pure p-6 hairline sm:p-8 lg:p-12"
        >
          <HoneypotField
            label={t.form.honeypotLabel}
            registration={register("company")}
          />

          <div className="flex items-baseline justify-between gap-4">
            <p
              ref={headingRef}
              tabIndex={-1}
              className="type-micro text-ink/45 outline-none"
            >
              {t.form.stepNamed(step + 1, applyContent.steps[step].title)}
            </p>
            {questions ? (
              <p className="type-micro shrink-0 text-ink/35">
                {t.form.questionOf(cursor + 1, questions.length)}
              </p>
            ) : null}
          </div>
          <Rule className="mt-5" />

          <div className="mt-8 space-y-7">
            {stepId === "goal" ? (
              <>
                <Question show={current === "primaryGoal"}>
                  <ChoiceField
                    label={applyContent.labels.primaryGoal}
                    name="primaryGoal"
                    options={options.primaryGoal}
                    columns={2}
                    error={errors.primaryGoal}
                    registration={register("primaryGoal")}
                    onChoose={onChoose}
                  />
                </Question>
                <Question show={current === "trainingLevel"}>
                  <ChoiceField
                    label={applyContent.labels.trainingLevel}
                    name="trainingLevel"
                    options={options.trainingLevel}
                    error={errors.trainingLevel}
                    registration={register("trainingLevel")}
                    onChoose={onChoose}
                  />
                </Question>
                <Question show={current === "trainingFrequency"}>
                  <ChoiceField
                    label={applyContent.labels.trainingFrequency}
                    name="trainingFrequency"
                    options={options.trainingFrequency}
                    columns={2}
                    error={errors.trainingFrequency}
                    registration={register("trainingFrequency")}
                    onChoose={onChoose}
                  />
                </Question>
                <Question show={current === "desiredTimeline"}>
                  <ChoiceField
                    label={applyContent.labels.desiredTimeline}
                    name="desiredTimeline"
                    options={options.desiredTimeline}
                    columns={2}
                    error={errors.desiredTimeline}
                    registration={register("desiredTimeline")}
                    onChoose={onChoose}
                  />
                </Question>
                <Question show={current === "biggestObstacle"}>
                  <ChoiceField
                    label={applyContent.labels.biggestObstacle}
                    name="biggestObstacle"
                    options={options.obstacle}
                    hint={applyContent.hints.biggestObstacle}
                    columns={2}
                    error={errors.biggestObstacle}
                    registration={register("biggestObstacle")}
                    onChoose={onChoose}
                  />
                </Question>
              </>
            ) : null}

            {stepId === "fit" ? (
              <>
                <Question show={current === "supportNeeded"}>
                  <ChoiceField
                    label={applyContent.labels.supportNeeded}
                    name="supportNeeded"
                    options={options.supportNeeded}
                    error={errors.supportNeeded}
                    registration={register("supportNeeded")}
                    onChoose={onChoose}
                  />
                </Question>
                <Question show={current === "investmentReadiness"}>
                  <ChoiceField
                    label={applyContent.labels.investmentReadiness}
                    name="investmentReadiness"
                    options={options.investmentReadiness}
                    hint={applyContent.hints.investmentReadiness}
                    error={errors.investmentReadiness}
                    registration={register("investmentReadiness")}
                    onChoose={onChoose}
                  />
                </Question>
                <Question show={current === "referralSource"}>
                  <ChoiceField
                    label={applyContent.labels.referralSource}
                    name="referralSource"
                    options={options.referralSource}
                    columns={2}
                    error={errors.referralSource}
                    registration={register("referralSource")}
                    onChoose={onChoose}
                  />
                </Question>
                <Question show={current === "motivation"}>
                  <TextAreaField
                    label={applyContent.labels.motivation}
                    name="motivation"
                    placeholder={applyContent.placeholders.motivation}
                    hint={applyContent.hints.motivation}
                    error={errors.motivation}
                    registration={register("motivation")}
                  />
                </Question>
              </>
            ) : null}

            {stepId === "contact" ? (
              <>
                <TextField
                  label={applyContent.labels.fullName}
                  name="fullName"
                  autoComplete="name"
                  placeholder={applyContent.placeholders.fullName}
                  error={errors.fullName}
                  registration={register("fullName")}
                />
                <TextField
                  label={applyContent.labels.email}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder={applyContent.placeholders.email}
                  error={errors.email}
                  registration={register("email")}
                />
                <TextField
                  label={applyContent.labels.phone}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={applyContent.placeholders.phone}
                  hint={applyContent.hints.phone}
                  error={errors.phone}
                  registration={register("phone")}
                />
                <TextField
                  label={applyContent.labels.instagramUsername}
                  name="instagramUsername"
                  optional
                  optionalLabel={t.form.optional}
                  autoComplete="off"
                  placeholder={applyContent.placeholders.instagramUsername}
                  hint={applyContent.hints.instagramUsername}
                  error={errors.instagramUsername}
                  registration={register("instagramUsername")}
                />
                <FollowUpLanguage
                  locale={locale}
                  value={followUpLanguage}
                  onChange={choose}
                />
              </>
            ) : null}

            {stepId === "consent" ? (
              <>
                <CheckboxField
                  label={applyContent.labels.accuracyConfirmed}
                  name="accuracyConfirmed"
                  error={errors.accuracyConfirmed}
                  registration={register("accuracyConfirmed")}
                />
                <CheckboxField
                  label={applyContent.labels.contactConsent}
                  name="contactConsent"
                  error={errors.contactConsent}
                  registration={register("contactConsent")}
                />
                <CheckboxField
                  label={applyContent.labels.marketingConsent}
                  name="marketingConsent"
                  error={errors.marketingConsent}
                  registration={register("marketingConsent")}
                />

                <p className="text-[0.8125rem] leading-relaxed text-ink-muted">
                  {applyContent.privacyNote}{" "}
                  <Link
                    href={localePath("/privacy", locale)}
                    className="link-editorial text-ink underline-offset-4"
                  >
                    {t.form.privacyLink}
                  </Link>
                </p>
              </>
            ) : null}
          </div>

          {formError ? (
            <p
              role="alert"
              className="mt-8 rounded-card bg-danger/8 p-4 text-[0.9375rem] leading-relaxed text-danger"
            >
              {formError}
            </p>
          ) : null}

          <Rule className="mt-10" />

          <div
            data-step-actions
            className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            {step > 0 || cursor > 0 ? (
              <button
                type="button"
                onClick={goBack}
                disabled={submitting}
                className="btn btn-outline w-full sm:w-auto"
              >
                <ArrowLeft className="size-4" />
                {applyContent.actions.back}
              </button>
            ) : (
              <span className="hidden sm:block" />
            )}

            {isLastStep ? (
              <PillCTA
                type="submit"
                variant="lime"
                withArrow
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting
                  ? applyContent.actions.submitting
                  : applyContent.actions.submit}
              </PillCTA>
            ) : (
              // Kept even where a chosen option advances on its own: it is the
              // only way forward for the written answer, and for anyone using
              // the keyboard, where selecting must not mean submitting.
              <PillCTA
                type="button"
                variant="lime"
                withArrow
                onClick={goNext}
                className="w-full sm:w-auto"
              >
                {applyContent.actions.next}
              </PillCTA>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * The one question currently being asked.
 *
 * Each question replaces the last rather than joining it, so the animation
 * belongs to mounting: React drops the outgoing question's element and builds
 * the incoming one, which runs `question-in` exactly once per question.
 */
function Question({ show, children }: { show: boolean; children: ReactNode }) {
  if (!show) return null;

  return (
    <div data-question className="question-reveal">
      {children}
    </div>
  );
}
