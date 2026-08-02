"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { ArrowLeft } from "@/components/icons";
import {
  CheckboxField,
  ChoiceField,
  HoneypotField,
  TextAreaField,
  TextField,
} from "@/components/form/fields";
import { FormProgressPanel, ProgressBar } from "@/components/form/FormProgressPanel";
import { PillCTA } from "@/components/ui/PillCTA";
import { Rule } from "@/components/ui/typography";
import { getApplyContent, getApplyOptions } from "@/content/apply";
import { getUi } from "@/content/ui";
import { localePath, type Locale } from "@/lib/i18n";
import { captureAttribution, track } from "@/lib/analytics";
import {
  getApplicationFormSchema,
  stepFields,
  type ApplicationFormOutput,
  type ApplicationFormValues,
} from "@/lib/validation";
import { createId, elapsedSince, nowMs } from "@/lib/utils";

/**
 * Four-step coaching application.
 *
 * Notes on the things that matter:
 *   · Each step is validated on its own before advancing, so a visitor never
 *     reaches step 4 to discover an error on step 1.
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
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Populated on mount — both are impure calls and must not run during render.
  const startedAt = useRef<number | null>(null);
  const submissionId = useRef<string | null>(null);
  const source = useRef<string | undefined>(undefined);
  const startReported = useRef(false);
  const headingRef = useRef<HTMLParagraphElement>(null);

  const {
    register,
    handleSubmit,
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
      accuracyConfirmed: false,
      contactConsent: false,
      marketingConsent: false,
    },
  });

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

  const goNext = async () => {
    const fields = stepFields[step] as FieldPath<ApplicationFormValues>[];
    const valid = await trigger(fields, { shouldFocus: true });
    if (!valid) return;

    track("application_step_complete", {
      step: step + 1,
      step_id: applyContent.steps[step].id,
    });
    setFormError(null);
    setStep((current) => Math.min(current + 1, totalSteps - 1));
  };

  const goBack = () => {
    setFormError(null);
    setStep((current) => Math.max(current - 1, 0));
  };

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
          <FormProgressPanel locale={locale} currentStep={step} />
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
          progress={(step + 1) / totalSteps}
          label={t.form.progressLabel}
          className="mt-3"
        />
      </div>

      <div className="lg:col-span-8">
        <form
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

          <p
            ref={headingRef}
            tabIndex={-1}
            className="type-micro text-ink/45 outline-none"
          >
            {t.form.stepNamed(step + 1, applyContent.steps[step].title)}
          </p>
          <Rule className="mt-5" />

          <div className="mt-8 space-y-7">
            {step === 0 ? (
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
                <ChoiceField
                  label={applyContent.labels.preferredLanguage}
                  name="preferredLanguage"
                  options={options.preferredLanguage}
                  columns={2}
                  error={errors.preferredLanguage}
                  registration={register("preferredLanguage")}
                />
              </>
            ) : null}

            {step === 1 ? (
              <>
                <ChoiceField
                  label={applyContent.labels.primaryGoal}
                  name="primaryGoal"
                  options={options.primaryGoal}
                  columns={2}
                  error={errors.primaryGoal}
                  registration={register("primaryGoal")}
                />
                <ChoiceField
                  label={applyContent.labels.trainingLevel}
                  name="trainingLevel"
                  options={options.trainingLevel}
                  error={errors.trainingLevel}
                  registration={register("trainingLevel")}
                />
                <ChoiceField
                  label={applyContent.labels.trainingFrequency}
                  name="trainingFrequency"
                  options={options.trainingFrequency}
                  columns={2}
                  error={errors.trainingFrequency}
                  registration={register("trainingFrequency")}
                />
                <ChoiceField
                  label={applyContent.labels.desiredTimeline}
                  name="desiredTimeline"
                  options={options.desiredTimeline}
                  columns={2}
                  error={errors.desiredTimeline}
                  registration={register("desiredTimeline")}
                />
                <ChoiceField
                  label={applyContent.labels.biggestObstacle}
                  name="biggestObstacle"
                  options={options.obstacle}
                  hint={applyContent.hints.biggestObstacle}
                  columns={2}
                  error={errors.biggestObstacle}
                  registration={register("biggestObstacle")}
                />
              </>
            ) : null}

            {step === 2 ? (
              <>
                <TextAreaField
                  label={applyContent.labels.motivation}
                  name="motivation"
                  placeholder={applyContent.placeholders.motivation}
                  hint={applyContent.hints.motivation}
                  error={errors.motivation}
                  registration={register("motivation")}
                />
                <ChoiceField
                  label={applyContent.labels.supportNeeded}
                  name="supportNeeded"
                  options={options.supportNeeded}
                  error={errors.supportNeeded}
                  registration={register("supportNeeded")}
                />
                <ChoiceField
                  label={applyContent.labels.investmentReadiness}
                  name="investmentReadiness"
                  options={options.investmentReadiness}
                  hint={applyContent.hints.investmentReadiness}
                  error={errors.investmentReadiness}
                  registration={register("investmentReadiness")}
                />
                <ChoiceField
                  label={applyContent.labels.referralSource}
                  name="referralSource"
                  options={options.referralSource}
                  columns={2}
                  error={errors.referralSource}
                  registration={register("referralSource")}
                />
              </>
            ) : null}

            {step === 3 ? (
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

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {step > 0 ? (
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
