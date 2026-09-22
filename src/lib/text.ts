// {hero}/{guide} placeholder substitution, matching the reference wireframe's fill().

export function fillText(s: string, hero: string, guide: string): string {
  return s.replace(/\{hero\}/g, hero).replace(/\{guide\}/g, guide);
}

/** Simple deterministic string hash, used to pick a stable reaction line per question id. */
export function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h += s.charCodeAt(i);
  return h;
}

export const REACTIONS: Record<number, string[]> = {
  0: [
    "Good to hear. That part seems to go smoothly.",
    "That sounds steady.",
    "Thank you — that's one less thing to carry.",
  ],
  1: [
    "Noted. That comes and goes.",
    "Thank you, that's useful to know.",
    "Some days, then. We can work with that.",
  ],
  2: [
    "Thank you for sharing that. We'll go gently here.",
    "That sounds like a heavy stretch. Small steps from here.",
    "Noted, with care.",
  ],
};
