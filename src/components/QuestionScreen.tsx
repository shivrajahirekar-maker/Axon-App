import { motion } from "framer-motion";
import { ChevronLeft, Check } from "lucide-react";
import { ANIMAL_ICON, IconGuideGeneric } from "../icons/icons";
import { CHARACTER_PORTRAIT } from "../assets/characters";
import { fillText, hashStr, REACTIONS } from "../lib/text";
import { D, chapterOf } from "../data/questionnaire";
import type { QuestionDef } from "../data/questionnaire";

interface QuestionScreenProps {
  question: QuestionDef;
  answer: number | number[] | undefined;
  heroName: string;
  guideName: string;
  onTapOption: (i: number, isAll: boolean) => void;
  onBack: () => void;
  onAdvance: () => void;
}

/** Handles both single-select (auto-highlight, explicit Continue) and multi-select
 * (checkboxes, persistent Next, exclusive/allOf handling done upstream in flowEngine). */
export function QuestionScreen({
  question: q,
  answer,
  heroName,
  guideName,
  onTapOption,
  onBack,
  onAdvance,
}: QuestionScreenProps) {
  const ci = chapterOf[q.id];
  const chapter = D.chapters[ci];
  const GuideIcon = ANIMAL_ICON[guideName] || IconGuideGeneric;
  const guidePortrait = CHARACTER_PORTRAIT[guideName];

  const answered = q.multi ? Array.isArray(answer) && answer.length > 0 : answer != null;
  const selectedIndices: number[] = q.multi
    ? ((answer as number[]) || [])
    : answer != null
      ? [answer as number]
      : [];

  let reactionText: string | null = null;
  if (!q.multi && answer != null) {
    const p = q.opts[answer as number]?.p;
    const pool = (p != null && REACTIONS[p]) || REACTIONS[1];
    reactionText = fillText(pool[hashStr(q.id) % pool.length], heroName, guideName);
  }

  return (
    <>
      <div className="q-head-row">
        <button type="button" className="back-btn" aria-label="Back" onClick={onBack}>
          <ChevronLeft size={20} strokeWidth={2.25} />
        </button>
        <span className="q-eyebrow">{chapter.title}</span>
      </div>
      <div className="qwrap">
        <div className="q-ask-row">
          <span className="q-ask-avatar">
            {guidePortrait ? <img src={guidePortrait} alt="" /> : <GuideIcon />}
          </span>
          <div className="q-ask-bubble">{fillText(q.text, heroName, guideName)}</div>
        </div>
        {q.multi && <p className="q-hint">Select all that apply.</p>}
        <div className="opt-col">
          {q.opts.map((o, i) => {
            const sel = selectedIndices.includes(i);
            return (
              <motion.button
                key={i}
                type="button"
                className={
                  "opt" +
                  (q.multi ? " multi" : "") +
                  (o.all ? " opt-all" : "") +
                  (sel ? " sel" : "")
                }
                whileTap={{ scale: 0.98 }}
                onClick={() => onTapOption(i, Boolean(o.all))}
              >
                <span className="dot">{sel && <Check size={12} strokeWidth={3} />}</span>
                <span>{fillText(o.t, heroName, guideName)}</span>
              </motion.button>
            );
          })}
        </div>
        {q.note && <p className="q-note">{fillText(q.note, heroName, guideName)}</p>}
        <div>
          {reactionText && (
            <div className="q-reaction">
              <span className="ic">
                {guidePortrait ? <img src={guidePortrait} alt="" /> : <GuideIcon />}
              </span>
              <p>
                {guideName}: {reactionText}
              </p>
            </div>
          )}
        </div>
        <div className="q-footer">
          <button type="button" className="btn-primary" disabled={!answered} onClick={onAdvance}>
            {q.multi ? "Next" : "Continue"}
          </button>
        </div>
      </div>
    </>
  );
}
