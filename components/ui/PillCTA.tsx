"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "@/components/icons";
import { track, type AnalyticsEvent, type AnalyticsProps } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * The site's single button component.
 *
 * Renders as <Link> when `href` is set and <button> otherwise, so semantics
 * always match behaviour - a navigation is never a button, and an action is
 * never a link.
 *
 * It is a client component because CTAs are the site's conversion instruments
 * and every one of them reports to analytics. The rendered markup is tiny.
 */

export type PillVariant = "lime" | "white" | "ink" | "glass" | "outline" | "outline-light";

const VARIANT_CLASS: Record<PillVariant, string> = {
  lime: "btn-lime",
  white: "btn-white",
  ink: "btn-ink",
  glass: "btn-glass",
  outline: "btn-outline",
  "outline-light": "btn-outline-light",
};

/** Colour of the small circular island holding the arrow. */
const ISLAND_TONE: Record<PillVariant, string> = {
  lime: "text-ink",
  white: "text-ink",
  ink: "text-white",
  glass: "text-ink",
  outline: "text-ink",
  "outline-light": "text-white",
};

const ISLAND_GLYPH: Record<PillVariant, string> = {
  lime: "text-lime",
  white: "text-white",
  ink: "text-ink",
  glass: "text-white",
  outline: "text-white",
  "outline-light": "text-ink",
};

export function ArrowIsland({
  variant = "lime",
  className,
}: {
  variant?: PillVariant;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("arrow-island", ISLAND_TONE[variant], className)}
    >
      <ArrowUpRight className={ISLAND_GLYPH[variant]} />
      <ArrowUpRight className={ISLAND_GLYPH[variant]} />
    </span>
  );
}

type BaseProps = {
  children: ReactNode;
  variant?: PillVariant;
  className?: string;
  /** Adds the trailing circular arrow island. */
  withArrow?: boolean;
  /** Fires once on click, before navigation. */
  event?: AnalyticsEvent;
  eventProps?: AnalyticsProps;
  full?: boolean;
};

type LinkProps = BaseProps & {
  href: string;
  external?: boolean;
  onClick?: never;
} & Omit<ComponentProps<typeof Link>, "href" | "children" | "className" | "onClick">;

type ButtonProps = BaseProps & {
  href?: undefined;
  external?: never;
} & Omit<ComponentProps<"button">, "children" | "className">;

export function PillCTA(props: LinkProps | ButtonProps) {
  const {
    children,
    variant = "lime",
    className,
    withArrow = false,
    event,
    eventProps,
    full = false,
    ...rest
  } = props;

  const classes = cn(
    "btn",
    VARIANT_CLASS[variant],
    withArrow && "pr-2.5",
    full && "w-full",
    className,
  );

  const content = (
    <>
      {/* Tailwind's preflight sets `svg { display: block }`, so a leading icon
          would stack above the label. The label track is its own flex row. */}
      <span className="inline-flex items-center gap-2.5">{children}</span>
      {withArrow ? <ArrowIsland variant={variant} /> : null}
    </>
  );

  const report = () => {
    if (event) track(event, eventProps);
  };

  if ("href" in props && props.href) {
    const { href, external, ...linkRest } = rest as LinkProps;

    if (external) {
      return (
        <a
          href={href}
          className={classes}
          onClick={report}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} onClick={report} {...linkRest}>
        {content}
      </Link>
    );
  }

  const { onClick, type = "button", ...buttonRest } = rest as ButtonProps;

  return (
    <button
      type={type}
      className={classes}
      onClick={(nativeEvent) => {
        report();
        onClick?.(nativeEvent);
      }}
      {...buttonRest}
    >
      {content}
    </button>
  );
}

/**
 * A plain <Link> that reports one analytics event on click.
 *
 * For cases where the click target is a whole card rather than a button, so
 * the surrounding section can stay a Server Component.
 */
export function TrackedLink({
  href,
  children,
  className,
  event,
  eventProps,
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  event: AnalyticsEvent;
  eventProps?: AnalyticsProps;
  ariaLabel?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={className}
      onClick={() => track(event, eventProps)}
    >
      {children}
    </Link>
  );
}

/**
 * Text link with the precise underline reveal. Used where a pill would be too
 * loud - never styled as a generic blue link.
 */
export function EditorialLink({
  href,
  children,
  className,
  external = false,
  event,
  eventProps,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
  event?: AnalyticsEvent;
  eventProps?: AnalyticsProps;
}) {
  const report = () => {
    if (event) track(event, eventProps);
  };

  const classes = cn("link-editorial type-micro-lg", className);

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        onClick={report}
      >
        {children}
        <ArrowUpRight className="size-3.5" />
      </a>
    );
  }

  return (
    <Link href={href} className={classes} onClick={report}>
      {children}
      <ArrowUpRight className="size-3.5" />
    </Link>
  );
}
