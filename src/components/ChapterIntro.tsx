import { motion } from "framer-motion";
import { ScreenHead } from "./ScreenHead";
import { ANIMAL_ICON, IconGuideGeneric } from "../icons/icons";
import placeholderImg from "../assets/placeholder.webp";
import { fillText } from "../lib/text";
import { D } from "../data/questionnaire";
import type { ChapterDef } from "../data/questionnaire";

interface ChapterIntroProps {
  chapter: ChapterDef;
  idx: number;
  heroName: string;
  guideName: string;
  onBack: () => void;
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

/** Cream-background "what's next" screen — the ONLY screen between chapters.
 * A chapter's pastel accent is still used sparingly (icon tint, trail dots). */
export function ChapterIntro({ chapter, idx, heroName, guideName, onBack, onAdvance }: ChapterIntroProps) {
  const pastel = pastelFor(idx);
  const GuideIcon = ANIMAL_ICON[guideName] || IconGuideGeneric;

  return (
    <div className="chapter-screen" style={{ background: "var(--color-bg)", color: "var(--color-ink)" }}>
      <ScreenHead onBack={onBack} />
      <motion.div
        className="screen-scroll"
        style={{ textAlign: "center" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        <div className="chapter-hero">
          <div className="stop-illus" style={{ background: pastel.bg }}>
            <img className="stop-illus-portrait" src={placeholderImg} alt="" />
          </div>
          <div className="stop-eyebrow" style={{ color: pastel.accent }}>
            Chapter {idx + 1} of {D.chapters.length}
          </div>
          <div className="stop-name">{chapter.stop}</div>
          <div className="trail-full">
            {D.chapters.map((c, i) => {
              const done = i < idx;
              const now = i === idx;
              const stoneStyle = {
                background: done || now ? pastel.accent : "rgba(43,32,19,0.18)",
                boxShadow: now ? `0 0 0 4px rgba(255,255,255,0.55)` : undefined,
              };
              return (
                <span key={c.key}>
                  <span className="stone" style={stoneStyle} />
                  {i < D.chapters.length - 1 && (
                    <span
                      className="ln"
                      style={{ background: i < idx ? pastel.accent : "rgba(43,32,19,0.18)" }}
                    />
                  )}
                </span>
              );
            })}
          </div>
        </div>
        <div className="story-card" style={{ marginTop: 16 }}>
          <div className="story-avatar">
            <span className="ic" style={{ background: pastel.bg }}>
              <GuideIcon />
            </span>
            <span className="story-name" style={{ color: pastel.accent }}>{guideName}</span>
          </div>
          <p className="story-text">{fillText(chapter.intro, heroName, guideName)}</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          style={{ width: "100%", marginTop: 16 }}
          onClick={onAdvance}
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
}
