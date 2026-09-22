// Inline SVG icons only — no icon packages. Phosphor-ish outline style, currentColor.

import type { ReactElement, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export function IconTurtle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <ellipse cx="12" cy="13" rx="8" ry="6" />
      <path d="M12 8v10M7 10l-3-2M17 10l3-2M7 17l-3 2M17 17l3 2" />
      <circle cx="12" cy="6" r="2" />
    </svg>
  );
}

export function IconHamster(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="13" r="7" />
      <circle cx="8" cy="7" r="2.4" />
      <circle cx="16" cy="7" r="2.4" />
      <circle cx="9.5" cy="13" r="0.6" fill="currentColor" />
      <circle cx="14.5" cy="13" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function IconCat(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 4l2 4M18 4l-2 4" />
      <circle cx="12" cy="13" r="7" />
      <circle cx="9.5" cy="13" r="0.6" fill="currentColor" />
      <circle cx="14.5" cy="13" r="0.6" fill="currentColor" />
      <path d="M10.5 16c.5.6 2.5.6 3 0" />
    </svg>
  );
}

export function IconDog(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6L4 3M18 6l2-3" />
      <circle cx="12" cy="13" r="7" />
      <circle cx="9.5" cy="12" r="0.6" fill="currentColor" />
      <circle cx="14.5" cy="12" r="0.6" fill="currentColor" />
      <ellipse cx="12" cy="15.5" rx="1.4" ry="1" fill="currentColor" />
    </svg>
  );
}

export function IconGuideGeneric(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3a5 5 0 015 5c0 3-2 4-2 6H9c0-2-2-3-2-6a5 5 0 015-5z" />
      <path d="M9.5 17h5M10 20h4" />
    </svg>
  );
}

export function IconHeroGeneric(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}

export function IconEye(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconEyeOff(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A11 11 0 0123 12s-1 1.8-2.8 3.5M6.4 6.4C3.7 8 1 12 1 12s4 7 11 7c1.6 0 3-.3 4.3-.8" />
      <path d="M9.6 9.6a3 3 0 004.2 4.2" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 2.4, ...props })}>
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

export function IconLock(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </svg>
  );
}

export function IconBack(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 2, ...props })}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 2, ...props })}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconBadge(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="9" r="5" />
      <path d="M9 13.5L7 21l5-2.5L17 21l-2-7.5" />
    </svg>
  );
}

export function IconFacebook(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        fill="#fff"
        d="M13.6 21v-7.3h2.4l.4-2.8h-2.8v-1.8c0-.8.2-1.3 1.4-1.3h1.5V5.2c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.6v2h-2.4v2.8h2.4V21h3.8z"
      />
    </svg>
  );
}

export function IconLinkedIn(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="12" fill="#0A66C2" />
      <text
        x="12"
        y="16.3"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="10.5"
        fontWeight="700"
        fill="#fff"
      >
        in
      </text>
    </svg>
  );
}

export function IconGoogle(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="12" fill="#fff" stroke="var(--color-border)" strokeWidth="1" />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.4-1.1 2.6-2.4 3.4v2.9h3.9c2.2-2.1 3.5-5.1 3.5-8.5z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-2.9c-1.1.7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9H1.4v3C3.4 21.3 7.4 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.4c-.2-.7-.4-1.4-.4-2.4s.1-1.6.4-2.4v-3H1.4C.5 8.3 0 10.1 0 12s.5 3.7 1.4 5.4l4-3z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.6l4 3c.9-2.8 3.5-4.8 6.6-4.8z"
      />
    </svg>
  );
}

// One icon per chapter key, echoing the reference wireframe's chapter glyphs.
export function IconChapterFocus(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
export function IconChapterEnergy(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M13 2L3 14h7l-1 8 11-14h-7l1-6z" />
    </svg>
  );
}
export function IconChapterStarting(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 22V4" />
      <path d="M4 4h13l-2.5 4L17 12H4" />
    </svg>
  );
}
export function IconChapterFeelings(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0112 6a5.5 5.5 0 019.5 6c-2.5 4.4-9.5 9-9.5 9z" />
    </svg>
  );
}
export function IconChapterDaily(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 4l6 2 6-2v14l-6 2-6-2-6 2V6z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}
export function IconChapterWellbeing(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
    </svg>
  );
}
export function IconChapterHabits(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 8h16l-1.5 12h-13z" />
      <path d="M8 8a4 4 0 018 0" />
    </svg>
  );
}
export function IconChapterFirstSteps(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 21l3-8 4 3 3-8 4 12" />
    </svg>
  );
}

export const CHAPTER_ICON: Record<string, (props: IconProps) => ReactElement> = {
  focus: IconChapterFocus,
  energy: IconChapterEnergy,
  starting: IconChapterStarting,
  feelings: IconChapterFeelings,
  daily: IconChapterDaily,
  wellbeing: IconChapterWellbeing,
  habits: IconChapterHabits,
  firststeps: IconChapterFirstSteps,
};

export const ANIMAL_ICON: Record<string, (props: IconProps) => ReactElement> = {
  Sam: IconTurtle,
  Mickey: IconHamster,
};
