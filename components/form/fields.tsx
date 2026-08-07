"use client";

import type { MouseEventHandler, ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Check } from "@/components/icons";
import type { Option } from "@/content/apply";
import { cn } from "@/lib/utils";

/**
 * Form controls.
 *
 * Labels are always above the input - floating labels disappear the moment a
 * field has a value, which is exactly when someone reviewing a long form needs
 * them. Errors are announced with `role="alert"` and wired to the input through
 * `aria-describedby` + `aria-invalid`.
 */

/**
 * react-hook-form widens an error to `Merge<FieldError, FieldErrorsImpl>` for
 * fields built with `preprocess`/enum schemas, so the concrete `FieldError`
 * type does not fit every field. All these components need is the message.
 */
export type FieldErrorLike = { message?: unknown } | undefined;

function ErrorText({ id, error }: { id: string; error?: FieldErrorLike }) {
  const message = typeof error?.message === "string" ? error.message : null;
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-[0.8125rem] text-danger">
      {message}
    </p>
  );
}

function Hint({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-2 text-[0.8125rem] leading-relaxed text-ink-strong">
      {children}
    </p>
  );
}

type BaseFieldProps = {
  label: string;
  name: string;
  hint?: ReactNode;
  error?: FieldErrorLike;
  optional?: boolean;
  /**
   * Rendered beside the label when `optional` is set. Passed in rather than
   * read from a dictionary here so these controls stay language-agnostic - they
   * already receive every other string from their caller.
   */
  optionalLabel?: string;
};

export function TextField({
  label,
  name,
  hint,
  error,
  optional,
  optionalLabel,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  registration,
}: BaseFieldProps & {
  type?: "text" | "email" | "tel";
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel";
  registration: UseFormRegisterReturn;
}) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  return (
    <div>
      <FieldLabel htmlFor={name} optional={optional} optionalLabel={optionalLabel}>
        {label}
      </FieldLabel>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hint ? hintId : null, error ? errorId : null) || undefined}
        className="field-input mt-2.5"
        {...registration}
      />
      <Hint id={hintId}>{hint}</Hint>
      <ErrorText id={errorId} error={error} />
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  hint,
  error,
  optional,
  optionalLabel,
  placeholder,
  rows = 5,
  registration,
}: BaseFieldProps & {
  placeholder?: string;
  rows?: number;
  registration: UseFormRegisterReturn;
}) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  return (
    <div>
      <FieldLabel htmlFor={name} optional={optional} optionalLabel={optionalLabel}>
        {label}
      </FieldLabel>
      <textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hint ? hintId : null, error ? errorId : null) || undefined}
        className="field-input mt-2.5 resize-y"
        {...registration}
      />
      <Hint id={hintId}>{hint}</Hint>
      <ErrorText id={errorId} error={error} />
    </div>
  );
}

/**
 * Radio group rendered as large selectable cards.
 * A real <fieldset>/<legend> with native radios - keyboard arrow navigation and
 * screen-reader grouping come for free.
 */
export function ChoiceField({
  label,
  name,
  hint,
  error,
  options,
  registration,
  columns = 1,
  onChoose,
}: BaseFieldProps & {
  options: readonly Option[];
  registration: UseFormRegisterReturn;
  columns?: 1 | 2;
  /**
   * Fired on the option card rather than on change, so the caller can tell a
   * pointer press from a keyboard one and only carry the visitor forward on the
   * first. Selecting with the keyboard has to stay separate from moving on, or
   * arrowing through the options to read them would fire you past them.
   *
   * The card, not the radio: the radio is `sr-only`, so the element a press
   * actually lands on is this label. Keyboard activation still reaches it, by
   * bubbling up from the radio, and is told apart by `detail` - 0 from the
   * keyboard, 1 or more from a pointer.
   */
  onChoose?: MouseEventHandler<HTMLLabelElement>;
}) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  return (
    <fieldset
      aria-invalid={error ? true : undefined}
      aria-describedby={cn(hint ? hintId : null, error ? errorId : null) || undefined}
    >
      <legend className="type-micro text-ink-strong">{label}</legend>
      <Hint id={hintId}>{hint}</Hint>

      <div
        className={cn(
          "mt-4 grid gap-2.5",
          columns === 2 ? "sm:grid-cols-2" : "grid-cols-1",
        )}
      >
        {options.map((option) => (
          <label key={option.value} className="choice-card" onClick={onChoose}>
            <input
              type="radio"
              value={option.value}
              className="sr-only"
              {...registration}
            />
            <span aria-hidden="true" className="choice-marker" />
            <span className="text-[0.9375rem] leading-snug text-ink-strong">
              {option.label}
            </span>
          </label>
        ))}
      </div>

      <ErrorText id={errorId} error={error} />
    </fieldset>
  );
}

/** Single consent checkbox, styled as a card so it is impossible to miss. */
export function CheckboxField({
  label,
  name,
  error,
  registration,
  children,
}: {
  label: ReactNode;
  name: string;
  error?: FieldErrorLike;
  registration: UseFormRegisterReturn;
  children?: ReactNode;
}) {
  const errorId = `${name}-error`;

  return (
    <div>
      <label className="choice-card">
        <input
          type="checkbox"
          className="sr-only"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...registration}
        />
        <span
          aria-hidden="true"
          className="choice-marker choice-marker-square flex items-center justify-center"
        >
          <Check className="choice-check size-3 text-lime" />
        </span>
        <span className="text-[0.9375rem] leading-relaxed text-ink-strong">
          {label}
          {children}
        </span>
      </label>
      <ErrorText id={errorId} error={error} />
    </div>
  );
}

export function FieldLabel({
  htmlFor,
  children,
  optional,
  optionalLabel,
}: {
  htmlFor: string;
  children: ReactNode;
  optional?: boolean;
  optionalLabel?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="type-micro flex gap-2 text-ink-strong">
      <span>{children}</span>
      {optional && optionalLabel ? (
        <span className="text-ink-strong">{optionalLabel}</span>
      ) : null}
    </label>
  );
}

/**
 * Honeypot.
 *
 * Hidden from sight, from the tab order and from assistive tech - a human
 * cannot fill it, so any value means the submission is automated.
 * Not `display:none`: some bots skip fields that are display-none.
 */
export function HoneypotField({
  label,
  registration,
}: {
  label: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden opacity-0"
    >
      <label htmlFor="company">{label}</label>
      <input
        id="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...registration}
      />
    </div>
  );
}
