import { CHARACTER_PORTRAIT } from "../assets/characters";
import { fillText } from "../lib/text";
import { D } from "../data/questionnaire";
import type { ChapterDef } from "../data/questionnaire";

interface ChapterIntroProps {
  chapter: ChapterDef;
  idx: number;
  heroName: string;
  guideName: string;
  onAdvance: () => void;
}

const PASTEL = [
  { bg: "var(--pastel-1-bg)", accent: "var(--pastel-1-accent)" },
  { bg: "var(--pastel-2-bg)", accent: "var(--pastel-2-accent)" },
  { bg: "var(--pastel-3-bg)", accent: "var(--pastel-3-accent)" },
  { bg: "var(--pastel-4-bg)", accent: "var(--pastel-4-accent)" },
  { bg: "var(--pastel-5-bg)", accent: "var(--pastel-5-accent)" },
  { bg: "var(--pastel-6-bg)", accent: "var(--pastel-6-accent)" },
  { bg: "var(--pastel-7-bg)", accent: "var(--pastel-7-accent)" },
  { bg: "var(--pastel-8-bg)", accent: "var(--pastel-8-accent)" },
];

export function pastelFor(idx: number) {
  return PASTEL[idx % PASTEL.length];
}

/** Centered modal (no back/close chrome — dismiss only via the scrim) with
 * the same talking-bubble pattern as StoryIntro/Prologue: the companion
 * speaks the chapter's intro line directly, over their own portrait. */
export function ChapterIntro({ chapter, idx, heroName, guideName, onAdvance }: ChapterIntroProps) {
  const pastel = pastelFor(idx);
  const portrait = CHARACTER_PORTRAIT[guideName];

  return (
    <div style={{ textAlign: "center" }}>
      <div className="stop-eyebrow" style={{ color: pastel.accent }}>
        Chapter {idx + 1} of {D.chapters.length}
      </div>
      <div className="stop-name">{chapter.stop}</div>
      <div className="talk-bubble" style={{ marginTop: 14 }}>
        <p className="talk-bubble-text">{fillText(chapter.intro, heroName, guideName)}</p>
      </div>
      <div className="talk-bubble-portrait" aria-hidden="true">
        {portrait && <img src={portrait} alt="" />}
      </div>
      <div className="screen-footer">
        <button type="button" className="btn-primary" onClick={onAdvance}>
          Continue
        </button>
      </div>
    </div>
  );
}
