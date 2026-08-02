import type { SVGProps } from "react";

/**
 * Local ultra-light icon set, drawn in the Phosphor "Light" idiom:
 * 24×24 grid, 1.25 stroke, round caps and joins, no fills.
 *
 * Deliberately hand-rolled rather than pulled from `@phosphor-icons/react`:
 * the site needs eleven glyphs, and the package ships every icon as a client
 * component — a real cost against the Server-Components-by-default and
 * minimal-dependency goals. Same visual language, none of the weight.
 *
 * Every icon is decorative by default (`aria-hidden`). Pass a `title` only when
 * an icon is the sole content of a control.
 */

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function Icon({ title, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function ArrowUpRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 17 17 7" />
      <path d="M8.5 7H17v8.5" />
    </Icon>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 12h16" />
      <path d="m13.5 5.5 6.5 6.5-6.5 6.5" />
    </Icon>
  );
}

export function ArrowLeft(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 12H4" />
      <path d="m10.5 18.5-6.5-6.5 6.5-6.5" />
    </Icon>
  );
}

export function ArrowDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4v16" />
      <path d="m5.5 13.5 6.5 6.5 6.5-6.5" />
    </Icon>
  );
}

export function Play(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8.5 5.6a.7.7 0 0 1 1.06-.6l9 6.4a.7.7 0 0 1 0 1.2l-9 6.4a.7.7 0 0 1-1.06-.6Z" />
    </Icon>
  );
}

export function Plus(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Icon>
  );
}

export function Minus(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
    </Icon>
  );
}

export function Check(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4.5 12.5 5 5 10-11" />
    </Icon>
  );
}

export function Close(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </Icon>
  );
}

export function MenuLines(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 8h16" />
      <path d="M4 16h16" />
    </Icon>
  );
}

export function Instagram(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function Envelope(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="3" />
      <path d="m4.5 8 6.7 4.8a1.4 1.4 0 0 0 1.6 0L19.5 8" />
    </Icon>
  );
}

/* ---- Thin linework glyphs for the deliverables / method sections ---------- */

export function Barbell(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 12h8" />
      <rect x="5" y="8.5" width="3" height="7" rx="1.2" />
      <rect x="16" y="8.5" width="3" height="7" rx="1.2" />
      <path d="M2.75 10.5v3" />
      <path d="M21.25 10.5v3" />
    </Icon>
  );
}

export function Target(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function Calendar(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3.5" />
      <path d="M3.5 9.75h17" />
      <path d="M8.25 3.5v3" />
      <path d="M15.75 3.5v3" />
    </Icon>
  );
}

export function Clock(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.25V12l3.25 2" />
    </Icon>
  );
}

export function ChatCircle(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 20.5a8.5 8.5 0 1 0-7.6-4.7L3.5 20.5l4.7-.9a8.5 8.5 0 0 0 3.8.9Z" />
    </Icon>
  );
}

export function Notebook(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="3.5" width="15" height="17" rx="3" />
      <path d="M9 3.5v17" />
      <path d="M12.5 9h4" />
      <path d="M12.5 13h4" />
    </Icon>
  );
}

export function Sparkle(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5c.6 4.4 4.1 7.9 8.5 8.5-4.4.6-7.9 4.1-8.5 8.5-.6-4.4-4.1-7.9-8.5-8.5 4.4-.6 7.9-4.1 8.5-8.5Z" />
    </Icon>
  );
}

export function Repeat(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 9.5A5 5 0 0 1 9.5 5H19" />
      <path d="m16 2 3 3-3 3" />
      <path d="M19.5 14.5A5 5 0 0 1 14.5 19H5" />
      <path d="m8 22-3-3 3-3" />
    </Icon>
  );
}

export function ShieldCheck(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3 5 5.75v5.4c0 4.2 2.85 7.6 7 9.35 4.15-1.75 7-5.15 7-9.35v-5.4Z" />
      <path d="m9 12 2.25 2.25L15.25 10" />
    </Icon>
  );
}

/** Maps a deliverable id to its glyph. Keeps the icon choice out of the JSX. */
export const deliverableIcons = {
  "training-program": Barbell,
  "nutrition-strategy": Sparkle,
  "exercise-demos": Play,
  "progress-tracking": Target,
  "check-ins": Calendar,
  adjustments: Repeat,
  support: ChatCircle,
  "habit-coaching": Notebook,
} as const;
