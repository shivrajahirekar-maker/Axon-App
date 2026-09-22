// Pure, unit-testable branching / navigation engine for the AXON_APP onboarding flow.
// Mirrors the behavior of the approved reference wireframe
// (axon-app-onboarding-screen-only.html) exactly — screen-stack router, branching
// rules (when.k: always|gte|eq|any), and multi-select exclusive/allOf handling.

import { D, byId, chapterOf } from "../data/questionnaire";
import type { QuestionDef } from "../data/questionnaire";

export type Answers = Record<string, number | number[]>;

export interface FlowState {
  hero: number | null;
  guide: number | null;
  name: string;
  fullname: string;
  email: string;
  authMode: "signin" | "signup";
  answers: Answers;
}

export function createInitialState(): FlowState {
  return {
    hero: null,
    guide: null,
    name: "",
    fullname: "",
    email: "",
    authMode: "signup",
    answers: {},
  };
}

export type Screen =
  | { type: "splash" }
  | { type: "auth" }
  | { type: "consent" }
  | { type: "name" }
  | { type: "storyIntro" }
  | { type: "chooseGuide" }
  | { type: "chooseHero" }
  | { type: "prologue" }
  | { type: "trailMap" }
  | { type: "chapterIntro"; idx: number }
  | { type: "question"; id: string }
  | { type: "final" };

export const ORDER: Screen["type"][] = [
  "splash",
  "auth",
  "consent",
  "name",
  "chooseGuide",
  "storyIntro",
  "chooseHero",
  "prologue",
];

export function screenKey(s: Screen): string {
  if (s.type === "chapterIntro") return `chapterIntro:${s.idx}`;
  if (s.type === "question") return `question:${s.id}`;
  return s.type;
}

/** Read a prior single-select answer's point value. Multi-select answers never
 * participate in branching (return null), matching the reference engine. */
function pointValue(id: string, answers: Answers): number | null | undefined {
  const a = answers[id];
  if (a == null) return undefined;
  const oq = byId[id];
  if (oq.multi) return null;
  const idx = a as number;
  return oq.opts[idx]?.p ?? null;
}

/** Whether a question should be shown, given the answers gathered so far. */
export function qOpen(q: QuestionDef, answers: Answers): boolean {
  const w = q.when;
  if (w.k === "always") return true;
  if (w.k === "any") {
    return w.deps.some((id) => {
      const v = pointValue(id, answers);
      return typeof v === "number" && v >= 1;
    });
  }
  const v = pointValue(w.dep, answers);
  if (v == null) return false;
  return w.k === "gte" ? v >= w.n : v === w.n;
}

/** Find the next unanswered, open question within a chapter, after `afterId`
 * (or from the start when afterId is null). */
export function nextQuestionInChapter(
  chapterIdx: number,
  afterId: string | null,
  answers: Answers,
): string | null {
  const ids = D.chapters[chapterIdx].qids;
  const start = afterId ? ids.indexOf(afterId) + 1 : 0;
  for (let i = start; i < ids.length; i++) {
    const q = byId[ids[i]];
    if (answers[q.id] == null && qOpen(q, answers)) return q.id;
  }
  return null;
}

export function nextChapterOrFinal(ci: number): Screen {
  return ci + 1 < D.chapters.length
    ? { type: "chapterIntro", idx: ci + 1 }
    : { type: "final" };
}

/** Compute the next screen from the current top-of-stack screen. Returns null
 * when there is nowhere to advance to via a simple push — this happens at the
 * end of a chapter's last question (or an already-complete chapterIntro),
 * where the caller must instead run the chapter-completion sequence
 * (celebration overlay, then Trail Map, or the final loader/popup for the
 * last chapter) rather than pushing a new screen onto the stack. */
export function computeNext(top: Screen, answers: Answers): Screen | null {
  if (top.type === "prologue") return { type: "trailMap" };
  const orderIdx = ORDER.indexOf(top.type);
  if (orderIdx >= 0) {
    return { type: ORDER[orderIdx + 1] } as Screen;
  }
  if (top.type === "trailMap") return null;
  if (top.type === "chapterIntro") {
    const qid = nextQuestionInChapter(top.idx, null, answers);
    return qid ? { type: "question", id: qid } : null;
  }
  if (top.type === "question") {
    const ci = chapterOf[top.id];
    const nid = nextQuestionInChapter(ci, top.id, answers);
    return nid ? { type: "question", id: nid } : null;
  }
  return null;
}

export function goBack(stack: Screen[]): Screen[] {
  if (stack.length <= 1) return stack;
  return stack.slice(0, -1);
}

/** When an earlier single-select answer changes, drop everything on the stack
 * (and in answers) that came after it, since branching may now differ. */
export function truncateAfterChange(
  qid: string,
  stack: Screen[],
  answers: Answers,
): { stack: Screen[]; answers: Answers } {
  let idx = -1;
  for (let i = stack.length - 1; i >= 0; i--) {
    const s = stack[i];
    if (s.type === "question" && s.id === qid) {
      idx = i;
      break;
    }
  }
  const newStack = idx >= 0 ? stack.slice(0, idx + 1) : stack;
  const order = D.qs.map((q) => q.id);
  const pos = order.indexOf(qid);
  const newAnswers = { ...answers };
  order.slice(pos + 1).forEach((id) => {
    delete newAnswers[id];
  });
  return { stack: newStack, answers: newAnswers };
}

/** Apply a tap on option `i` of question `q` (isAll = the "All of the above"
 * pill was tapped). Returns a new Answers object; pure. */
export function applyAnswerTap(
  q: QuestionDef,
  i: number,
  isAll: boolean,
  answers: Answers,
): Answers {
  const next = { ...answers };
  if (q.multi) {
    let cur = ((answers[q.id] as number[]) || []).slice();
    if (isAll) {
      const haveAll = q.allOf.every((x) => cur.indexOf(x) >= 0);
      cur = haveAll ? [] : q.allOf.slice();
    } else {
      const p = cur.indexOf(i);
      if (p >= 0) {
        cur.splice(p, 1);
      } else {
        cur.push(i);
        if (q.exclusive.indexOf(i) >= 0) {
          cur = [i];
        } else {
          cur = cur.filter((x) => q.exclusive.indexOf(x) < 0);
        }
      }
    }
    cur.sort((a, b) => a - b);
    if (cur.length) next[q.id] = cur;
    else delete next[q.id];
    return next;
  }
  next[q.id] = i;
  return next;
}

/** True once every open question in `answers` for chapter idx has a value. */
export function isChapterComplete(idx: number, answers: Answers): boolean {
  return nextQuestionInChapter(idx, null, answers) == null;
}

export function trailStates(
  activeIdx: number,
): { done: boolean; now: boolean }[] {
  return D.chapters.map((_, i) => ({
    done: i < activeIdx,
    now: i === activeIdx,
  }));
}

export type NodeStatus = "locked" | "current" | "done";

/** Per-chapter Trail Map node status, derived purely from answers so far.
 * Chapters must be completed in order: the first not-yet-complete chapter is
 * "current" (tappable, next to do), every chapter before it is "done"
 * (tappable, revisitable), and every chapter after it is "locked" (not
 * tappable). */
export function trailNodeStatuses(answers: Answers): NodeStatus[] {
  const result: NodeStatus[] = [];
  let foundCurrent = false;
  for (let i = 0; i < D.chapters.length; i++) {
    if (foundCurrent) {
      result.push("locked");
      continue;
    }
    if (isChapterComplete(i, answers)) {
      result.push("done");
    } else {
      result.push("current");
      foundCurrent = true;
    }
  }
  return result;
}

export function isLastChapterIdx(idx: number): boolean {
  return idx === D.chapters.length - 1;
}

/** Drop everything on the stack after (and not including) the most recent
 * Trail Map screen. Used when a chapter's celebration overlay finishes, so
 * Back from the Trail Map goes to Prologue, never back into a finished
 * chapter's last question. */
export function truncateToTrailMap(stack: Screen[]): Screen[] {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i].type === "trailMap") return stack.slice(0, i + 1);
  }
  return stack;
}
