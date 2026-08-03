"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { ArrowLeft } from "@/components/icons";
import {
  BookingConfirmation,
  type ConfirmedBooking,
} from "@/components/form/BookingConfirmation";
import {
  CheckboxField,
  ChoiceField,
  HoneypotField,
  TextField,
} from "@/components/form/fields";
import { FollowUpLanguage } from "@/components/form/FollowUpLanguage";
import { FormProgressPanel, ProgressBar } from "@/components/form/FormProgressPanel";
import { SlotPicker, type SelectedSlot } from "@/components/form/SlotPicker";
import { PillCTA } from "@/components/ui/PillCTA";
import { Rule } from "@/components/ui/typography";
import { getApplyContent, getApplyOptions } from "@/content/apply";
import { getUi } from "@/content/ui";
import { localePath, type Locale } from "@/lib/i18n";
import { captureAttribution, track } from "@/lib/analytics";
import { useLanguagePreference } from "@/lib/use-language-preference";
import {
  getBookingFormSchema,
  getValidationMessages,
  questionFields,
  type BookingFormOutput,
  type BookingFormValues,
  type QuestionField,
} from "@/lib/validation";
import { createId, elapsedSince, nowMs } from "@/lib/utils";

/**
 * Book a call, end to end, on one page.
 *
 *   1–5. one qualifying question per screen
 *   6.   the calendar
 *   7.   name, email, phone
 *   8.   the confirmation
 *
 * Notes on the things that matter:
 *
 *   · The questions come before the calendar and the calendar comes before the
 *     contact details. Someone who has answered five questions and picked a time
 *     has already invested enough that typing a phone number is the small ask —
 *     the same three fields at the top of the page would be the large one.
 *   · The five questions ask one thing at a time. Answering replaces the
 *     question rather than adding to it, and choosing an option carries the
 *     visitor forward without a click on anything else.
 *   · `investmentReadiness` is asked, tagged and stored — and never gates
 *     anything. Whatever the answer, the calendar comes next.
 *   · Submission is idempotent: one `submissionId` is generated per session and
 *     sent with every attempt, so a retry after a network blip cannot book two
 *     slots.
 *   · There is no optimistic success. The confirmation screen only appears once
 *     the API says the slot was actually reserved.
 */

type Stage = "questions" | "slot" | "contact" | "done";

const STAGE_ORDER: readonly Stage[] = ["questions", "slot", "contact"];

type Result = {
  booking: ConfirmedBooking;
  inviteSent: boolean;
  fullName: string;
  email: string;
};

export function BookingFlow({ locale }: { locale: Locale }) {
  const content = getApplyContent(locale);
  const options = getApplyOptions(locale);
  const messages = getValidationMessages(locale);
  const t = getUi(locale);

  const [stage, setStage] = useState<Stage>("questions");
  /** Which of the five questions is on screen. */
  const [questionIndex, setQuestionIndex] = useState(0);
  const [slot, setSlot] = useState<SelectedSlot | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  /** Bumped to make the picker re-read availability after a lost race. */
  const [reloadToken, setReloadToken] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  // Populated on mount — both are impure calls and must not run during render.
  const startedAt = useRef<number | null>(null);
  const submissionId = useRef<string | null>(null);
  const source = useRef<string | undefined>(undefined);
  const startReported = useRef(false);
  const headingRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const advanceTimer = useRef<number | null>(null);

  /**
   * The language question is not asked here — it was answered on the first visit
   * and is read back from storage. `locale` is the fallback for the handful of
   * visitors who never stored an answer (storage disabled, or a direct link
   * opened in a fresh browser), and it is the right fallback: the language they
   * are reading the flow in.
   */
  const { preference, choose } = useLanguagePreference();
  const followUpLanguage = preference ?? locale;

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<BookingFormValues, unknown, BookingFormOutput>({
    resolver: zodResolver(getBookingFormSchema(locale)),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      company: "",
      // Never left undefined: the schema requires it and nothing on screen can
      // set it, so a missing value would fail validation with no visible field
      // to blame.
      preferredLanguage: locale,
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
    track("booking_start", { source: source.current });
  }, []);

  // Move focus to the new screen so keyboard and screen-reader users follow along.
  useEffect(() => {
    if (stage === "questions" && questionIndex === 0) return;
    headingRef.current?.focus();
  }, [stage, questionIndex]);

  /* ------------------------------------------------------------------------ */
  /* Where we are                                                              */
  /* ------------------------------------------------------------------------ */

  const stageIndex = STAGE_ORDER.indexOf(stage);
  const onQuestions = stage === "questions";

  /** Clamped, so it can never point past the end. */
  const cursor = Math.min(questionIndex, questionFields.length - 1);
  const current: QuestionField = questionFields[cursor];

  /*
   * Progress counts questions, not just phases — a bar that sat still through
   * five questions would read as a flow that had stopped responding. The
   * calendar counts as half its phase until a time is actually chosen.
   */
  const filled = onQuestions
    ? (cursor + 1) / questionFields.length
    : stage === "slot"
      ? slot
        ? 1
        : 0.5
      : 1;
  const progress = (Math.max(stageIndex, 0) + filled) / STAGE_ORDER.length;

  // Keep the current question on screen. Nothing stacks up — each question
  // replaces the last — so this only has to correct the cases where the new
  // screen is taller than the old one, or the visitor had scrolled away.
  const position = `${stage}:${cursor}`;
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

    // A screen taller than the window satisfies both: aligning its top wins.
    const delta = above < 0 ? above : below > 0 ? below : 0;
    if (delta === 0) return;

    window.scrollBy({
      top: delta,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [position]);

  /* ------------------------------------------------------------------------ */
  /* Moving between screens                                                    */
  /* ------------------------------------------------------------------------ */

  const goToStage = (next: Stage) => {
    setFormError(null);
    setStage(next);
    if (next === "questions") setQuestionIndex(questionFields.length - 1);
  };

  const goNext = async () => {
    if (onQuestions) {
      const valid = await trigger([current] as FieldPath<BookingFormValues>[], {
        shouldFocus: true,
      });
      if (!valid) return;

      if (cursor < questionFields.length - 1) {
        setFormError(null);
        setQuestionIndex(cursor + 1);
        return;
      }

      track("booking_step_complete", { step: 1, step_id: "questions" });
      setFormError(null);
      setQuestionIndex(0);
      setStage("slot");
      return;
    }

    if (stage === "slot") {
      if (!slot) {
        setSlotError(messages.slotRequired);
        return;
      }

      setSlotError(null);
      track("booking_step_complete", { step: 2, step_id: "slot" });
      goToStage("contact");
    }
  };

  const goBack = () => {
    if (onQuestions) {
      if (cursor === 0) return;
      setFormError(null);
      setQuestionIndex(cursor - 1);
      return;
    }

    if (stage === "slot") {
      goToStage("questions");
      return;
    }

    goToStage("slot");
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

  /** Stable, so choosing a time never re-runs the picker's availability read. */
  const onSlotChange = useCallback((next: SelectedSlot | null) => {
    setSlot(next);
    setSlotError(null);
  }, []);

  /** Sends the visitor back to the calendar with a reason and a fresh list. */
  const returnToCalendar = (message: string) => {
    setSlot(null);
    setSlotError(message);
    setFormError(null);
    setStage("slot");
    setReloadToken((token) => token + 1);
  };

  /* ------------------------------------------------------------------------ */
  /* Booking                                                                   */
  /* ------------------------------------------------------------------------ */

  const onSubmit = async (values: BookingFormOutput) => {
    if (submitting) return;

    if (!slot) {
      returnToCalendar(messages.slotRequired);
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          slotStart: slot.start,
          ...captureAttribution(),
          source: source.current,
          submissionId: submissionId.current ?? undefined,
          elapsedMs: elapsedSince(startedAt.current),
        }),
      });

      if (response.status === 429) {
        track("booking_error", { reason: "rate_limited" });
        setFormError(content.errors.rateLimited);
        return;
      }

      /* The one failure the visitor can do something about: the slot went while
         they were typing. Say so, reload the calendar, and put them back on it. */
      if (response.status === 409) {
        const payload = (await response.json().catch(() => null)) as {
          code?: string;
        } | null;

        track("booking_error", { reason: payload?.code ?? "slot_conflict" });
        returnToCalendar(
          payload?.code === "slot_unavailable"
            ? content.errors.slotExpired
            : content.errors.slotTaken,
        );
        return;
      }

      if (!response.ok) {
        track("booking_error", { reason: `http_${response.status}` });
        setFormError(content.errors.generic);
        return;
      }

      const payload = (await response.json()) as {
        ok?: boolean;
        booking?: ConfirmedBooking;
        inviteSent?: boolean;
      };

      if (!payload.ok || !payload.booking) {
        track("booking_error", { reason: "not_stored" });
        setFormError(content.errors.generic);
        return;
      }

      track("booking_complete", { source: source.current });

      setResult({
        booking: payload.booking,
        inviteSent: Boolean(payload.inviteSent),
        fullName: values.fullName,
        email: values.email,
      });
      setStage("done");
    } catch {
      track("booking_error", { reason: "network" });
      setFormError(content.errors.network);
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------ */

  if (stage === "done" && result) {
    return (
      <BookingConfirmation
        locale={locale}
        booking={result.booking}
        fullName={result.fullName}
        email={result.email}
        inviteSent={result.inviteSent}
      />
    );
  }

  const phase = content.phases[Math.max(stageIndex, 0)];
  const isLastStage = stage === "contact";
  const canGoBack = !onQuestions || cursor > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-4">
      {/* Desktop context panel. */}
      <aside className="hidden lg:col-span-4 lg:block">
        <div className="h-full rounded-media bg-surface p-8 hairline xl:p-10">
          <FormProgressPanel
            locale={locale}
            currentPhase={Math.max(stageIndex, 0)}
            progress={progress}
          />
        </div>
      </aside>

      {/* Mobile progress. */}
      <div className="lg:hidden">
        <div className="flex items-baseline justify-between gap-4">
          <p className="type-micro text-ink/45">{phase.title}</p>
          <p className="type-micro text-ink/35">
            {stageIndex + 1} / {STAGE_ORDER.length}
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
              {t.form.stepNamed(stageIndex + 1, phase.title)}
            </p>
            {onQuestions ? (
              <p className="type-micro shrink-0 text-ink/35">
                {t.form.questionOf(cursor + 1, questionFields.length)}
              </p>
            ) : null}
          </div>
          <Rule className="mt-5" />

          <div className="mt-8 space-y-7">
            {/* 1–5 · one question at a time. */}
            {onQuestions
              ? questionFields.map((field) => {
                  const question = content.questions[field];

                  return (
                    <Screen key={field} show={current === field}>
                      <ChoiceField
                        label={question.label}
                        name={field}
                        options={options[field]}
                        hint={"hint" in question ? question.hint : undefined}
                        columns={question.columns === 2 ? 2 : 1}
                        error={errors[field]}
                        registration={register(field)}
                        onChoose={onChoose}
                      />
                    </Screen>
                  );
                })
              : null}

            {/* 6 · the calendar. */}
            {stage === "slot" ? (
              <Screen show>
                {/* Keyed on the reload token: losing a slot to somebody faster
                    mounts a fresh picker, which reads availability again. */}
                <SlotPicker
                  key={reloadToken}
                  locale={locale}
                  value={slot}
                  onChange={onSlotChange}
                  error={slotError}
                />
              </Screen>
            ) : null}

            {/* 7 · contact, once the slot is theirs. */}
            {stage === "contact" ? (
              <Screen show>
                <div className="space-y-7">
                  <TextField
                    label={content.labels.fullName}
                    name="fullName"
                    autoComplete="name"
                    placeholder={content.placeholders.fullName}
                    error={errors.fullName}
                    registration={register("fullName")}
                  />
                  <TextField
                    label={content.labels.email}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder={content.placeholders.email}
                    hint={content.hints.email}
                    error={errors.email}
                    registration={register("email")}
                  />
                  <TextField
                    label={content.labels.phone}
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={content.placeholders.phone}
                    hint={content.hints.phone}
                    error={errors.phone}
                    registration={register("phone")}
                  />

                  <FollowUpLanguage
                    locale={locale}
                    value={followUpLanguage}
                    onChange={choose}
                  />

                  <CheckboxField
                    label={content.labels.marketingConsent}
                    name="marketingConsent"
                    error={errors.marketingConsent}
                    registration={register("marketingConsent")}
                  />

                  {/* Contact consent is stated rather than ticked: the visitor is
                      asking to be called, so a checkbox confirming they may be
                      called is a hoop, not a choice. Marketing above is the
                      genuine choice, and stays opt-in. */}
                  <p className="text-[0.8125rem] leading-relaxed text-ink-muted">
                    {content.consentNote} {content.privacyNote}{" "}
                    <Link
                      href={localePath("/privacy", locale)}
                      className="link-editorial text-ink underline-offset-4"
                    >
                      {t.form.privacyLink}
                    </Link>
                  </p>
                </div>
              </Screen>
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
            {canGoBack ? (
              <button
                type="button"
                onClick={goBack}
                disabled={submitting}
                className="btn btn-outline w-full sm:w-auto"
              >
                <ArrowLeft className="size-4" />
                {content.actions.back}
              </button>
            ) : (
              <span className="hidden sm:block" />
            )}

            {isLastStage ? (
              <PillCTA
                type="submit"
                variant="lime"
                withArrow
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting
                  ? content.actions.confirming
                  : content.actions.confirm}
              </PillCTA>
            ) : (
              // Kept even where a chosen option advances on its own: it is the
              // only way forward from the calendar, and for anyone using the
              // keyboard, where selecting must not mean submitting.
              <PillCTA
                type="button"
                variant="lime"
                withArrow
                onClick={goNext}
                className="w-full sm:w-auto"
              >
                {content.actions.next}
              </PillCTA>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * The one screen currently on show.
 *
 * Each screen replaces the last rather than joining it, so the animation belongs
 * to mounting: React drops the outgoing element and builds the incoming one,
 * which runs `question-in` exactly once per screen.
 */
function Screen({ show, children }: { show: boolean; children: ReactNode }) {
  if (!show) return null;

  return (
    <div data-question className="question-reveal">
      {children}
    </div>
  );
}
