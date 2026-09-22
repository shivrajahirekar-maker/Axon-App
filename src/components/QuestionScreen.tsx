import { motion } from "framer-motion";
import { ScreenHead } from "./ScreenHead";
import { ANIMAL_ICON, IconGuideGeneric, IconCheck } from "../icons/icons";
import { fillText, hashStr, REACTIONS } from "../lib/text";
import { D, chapterOf } from "../data/questionnaire";
import type { QuestionDef } from "../data/questionnaire";
import placeholderImg from "../assets/placeholder.webp";

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
      <ScreenHead onBack={onBack} />
      <div className="qwrap">
        <div className="q-eyebrow">{chapter.title}</div>
        <div className="illus" aria-hidden="true">
          <img src={placeholderImg} alt="" />
        </div>
        <div className="q-text">{fillText(q.text, heroName, guideName)}</div>
        {q.multi && <p className="q-hint">Select all that apply.</p>}
        <div className="opt-col">
          {q.opts.map((o, i) => {
            const sel = selectedIndices.includes(i);
            const dim = selectedIndices.length > 0 && !sel && !q.multi;
            return (
              <motion.button
                key={i}
                type="button"
                className={
                  "opt" +
                  (q.multi ? " multi" : "") +
                  (o.all ? " opt-all" : "") +
                  (sel ? " sel" : "") +
                  (dim ? " dim" : "")
                }
                whileTap={{ scale: 0.98 }}
                onClick={() => onTapOption(i, Boolean(o.all))}
              >
                <span className="dot">{sel && <IconCheck />}</span>
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
                <GuideIcon />
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
