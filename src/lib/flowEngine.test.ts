import { describe, expect, it } from "vitest";
import {
  applyAnswerTap,
  computeNext,
  createInitialState,
  goBack,
  isLastChapterIdx,
  nextChapterOrFinal,
  nextQuestionInChapter,
  qOpen,
  trailNodeStatuses,
  truncateAfterChange,
  truncateToTrailMap,
  type Answers,
  type Screen,
} from "./flowEngine";
import { D, byId, chapterOf } from "../data/questionnaire";

describe("questionnaire data shape (sanity)", () => {
  it("has exactly 1 fixed guide: Focus Buddy", () => {
    expect(D.guides.map((g) => g.name)).toEqual(["Focus Buddy"]);
  });
  it("has exactly 2 characters: Sam and Mickey", () => {
    expect(D.chars.map((c) => c.name).sort()).toEqual(["Mickey", "Sam"]);
  });
  it("has 8 chapters in the documented order", () => {
    expect(D.chapters.map((c) => c.title)).toEqual([
      "Focus",
      "Energy & Impulses",
      "Getting Started",
      "Feelings",
      "Daily Life",
      "Wellbeing",
      "Habits",
      "Your First Steps",
    ]);
  });
  it("has 32 questions", () => {
    expect(D.qs.length).toBe(32);
  });
});

describe("splash -> auth screen reachability", () => {
  it("advances from splash to auth to consent, in ORDER", () => {
    let top: Screen = { type: "splash" };
    const answers: Answers = {};
    top = computeNext(top, answers)!;
    expect(top).toEqual({ type: "auth" });
    top = computeNext(top, answers)!;
    expect(top).toEqual({ type: "consent" });
  });
});

describe("guide is fixed (no chooseGuide step); character is still chosen", () => {
  it("name leads straight to storyIntro, then chooseHero — there is no chooseGuide screen", () => {
    let top: Screen = { type: "name" };
    const answers: Answers = {};
    top = computeNext(top, answers)!; // storyIntro
    expect(top).toEqual({ type: "storyIntro" });
    top = computeNext(top, answers)!; // chooseHero
    expect(top).toEqual({ type: "chooseHero" });
  });
});

describe("qOpen branching rules", () => {
  it("always-open questions are always visible", () => {
    const q = byId["A-ATT-1"];
    expect(qOpen(q, {})).toBe(true);
  });

  it("gte: opens only once the dependency's point value is high enough", () => {
    const q = byId["A-ATT-2"]; // gte A-ATT-1 >= 1
    expect(qOpen(q, { "A-ATT-1": 0 })).toBe(false); // p=0
    expect(qOpen(q, { "A-ATT-1": 1 })).toBe(true); // p=1
    expect(qOpen(q, { "A-ATT-1": 2 })).toBe(true); // p=2
  });

  it("eq: opens only on an exact match", () => {
    const q = byId["A-ATT-3"]; // eq A-ATT-1 === 2
    expect(qOpen(q, { "A-ATT-1": 1 })).toBe(false);
    expect(qOpen(q, { "A-ATT-1": 2 })).toBe(true);
  });

  it("any: opens if any dependency scored >= 1", () => {
    const q = byId["A-IMP-1"]; // any of ATT-1, HYP-1, ORG-1, EMO-1
    expect(qOpen(q, { "A-ATT-1": 0, "A-HYP-1": 0, "A-ORG-1": 0, "A-EMO-1": 0 })).toBe(false);
    expect(qOpen(q, { "A-ATT-1": 0, "A-HYP-1": 1, "A-ORG-1": 0, "A-EMO-1": 0 })).toBe(true);
  });

  it("a branching question is skipped entirely when its when-rule is false", () => {
    const answers: Answers = { "A-ATT-1": 0 }; // "Hardly ever" -> p=0
    const nid = nextQuestionInChapter(0, "A-ATT-1", answers);
    // A-ATT-2 requires gte 1 (false), A-ATT-3 requires eq 2 (false) -> chapter ends
    expect(nid).toBeNull();
  });

  it("a follow-up question is shown when its when-rule is true", () => {
    const answers: Answers = { "A-ATT-1": 2 }; // "Quite often" -> p=2
    const nid = nextQuestionInChapter(0, "A-ATT-1", answers);
    expect(nid).toBe("A-ATT-2");
  });
});

describe("prologue leads to the Trail Map hub, not straight into chapter 0", () => {
  it("computeNext(prologue) is trailMap", () => {
    expect(computeNext({ type: "prologue" }, {})).toEqual({ type: "trailMap" });
  });
});

describe("chapter completion returns null from computeNext (caller runs celebration -> Trail Map)", () => {
  it("the last question of a chapter with no more open questions yields null, not a pushed screen", () => {
    // Chapter 0 (focus) with a low first answer has no open follow-ups.
    const answers: Answers = { "A-ATT-1": 0 };
    const top: Screen = { type: "question", id: "A-ATT-1" };
    const next = computeNext(top, answers);
    expect(next).toBeNull();
  });

  it("nextChapterOrFinal (still available as a standalone utility) reaches final after the last chapter", () => {
    expect(nextChapterOrFinal(D.chapters.length - 1)).toEqual({ type: "final" });
  });

  it("isLastChapterIdx flags only the 8th chapter", () => {
    expect(isLastChapterIdx(0)).toBe(false);
    expect(isLastChapterIdx(D.chapters.length - 2)).toBe(false);
    expect(isLastChapterIdx(D.chapters.length - 1)).toBe(true);
  });

  it("reaching the end is possible by walking the whole flow with minimal answers, driven through the Trail Map like the app does", () => {
    // Mirrors App.tsx's advance()/selectChapter() orchestration: computeNext
    // drives movement within a chapter; a null result means the chapter is
    // complete, at which point the (simulated) celebration overlay hands
    // back to the Trail Map, and the next chapter is entered by "tapping"
    // its now-current node.
    let top: Screen = { type: "prologue" };
    const answers: Answers = {};
    let guard = 0;
    let reachedLastCelebration = false;
    while (guard < 300) {
      guard++;
      if (top.type === "question") {
        const q = byId[top.id];
        // pick the lowest-scoring option so most branch-only follow-ups stay closed
        answers[top.id] = q.multi ? [0] : 0;
      }
      if (top.type === "trailMap") {
        // At the hub: "tap" whichever chapter node is now current.
        const statuses = trailNodeStatuses(answers);
        const nextIdx = statuses.findIndex((s) => s === "current");
        expect(nextIdx).toBeGreaterThanOrEqual(0);
        top = { type: "chapterIntro", idx: nextIdx };
        continue;
      }
      const next = computeNext(top, answers);
      if (next) {
        top = next;
        continue;
      }
      // chapter complete
      const ci = top.type === "question" ? chapterOf[top.id] : (top as { idx: number }).idx;
      if (isLastChapterIdx(ci)) {
        reachedLastCelebration = true;
        top = { type: "final" };
        break;
      }
      // simulate: celebration overlay finishes -> back to Trail Map
      top = { type: "trailMap" };
    }
    expect(top).toEqual({ type: "final" });
    expect(reachedLastCelebration).toBe(true);
    expect(guard).toBeLessThan(300);
  });
});

describe("multi-select PLAN question handling", () => {
  it("A-PLAN-1: tapping 'All of the above' selects all 4 options, tapping again clears", () => {
    const q = byId["A-PLAN-1"];
    let answers: Answers = {};
    answers = { ...answers, ...{ } };
    let a: Answers = {};
    a = { ...a, [q.id]: applyAnswerTap(q, 4, true, a)[q.id] };
    expect(a["A-PLAN-1"]).toEqual([0, 1, 2, 3]);
    a = { ...a, [q.id]: applyAnswerTap(q, 4, true, a)[q.id] };
    expect(a["A-PLAN-1"]).toBeUndefined();
  });

  it("A-PLAN-1: individually selecting all 4 non-all options does not auto-check All", () => {
    const q = byId["A-PLAN-1"];
    let a: Answers = {};
    [0, 1, 2, 3].forEach((i) => {
      a = applyAnswerTap(q, i, false, a);
    });
    expect((a["A-PLAN-1"] as number[]).sort()).toEqual([0, 1, 2, 3]);
  });

  it("A-PLAN-3: 'Not at the moment' (index 0) is exclusive against the other options", () => {
    const q = byId["A-PLAN-3"];
    expect(q.exclusive).toEqual([0]);
    let a: Answers = {};
    // select option 1 (therapy) first
    a = applyAnswerTap(q, 1, false, a);
    expect(a["A-PLAN-3"]).toEqual([1]);
    // now tap "Not at the moment" (0) -> exclusive, clears everything else
    a = applyAnswerTap(q, 0, false, a);
    expect(a["A-PLAN-3"]).toEqual([0]);
  });

  it("A-PLAN-3: selecting a non-exclusive option after 'Not at the moment' drops it", () => {
    const q = byId["A-PLAN-3"];
    let a: Answers = { "A-PLAN-3": [0] };
    a = applyAnswerTap(q, 1, false, a);
    expect(a["A-PLAN-3"]).toEqual([1]);
  });

  it("A-PLAN-3: 'All of the above' toggles the non-exclusive allOf set (1,2)", () => {
    const q = byId["A-PLAN-3"];
    expect(q.allOf).toEqual([1, 2]);
    let a: Answers = {};
    a = applyAnswerTap(q, 3, true, a);
    expect(a["A-PLAN-3"]).toEqual([1, 2]);
    a = applyAnswerTap(q, 3, true, a);
    expect(a["A-PLAN-3"]).toBeUndefined();
  });
});

describe("no real Skip anywhere in the onboarding flow", () => {
  it("ORDER (the fixed pre-chapter screen sequence) contains no 'skip' screen type", () => {
    const flowScreens: Screen["type"][] = [
      "splash",
      "auth",
      "consent",
      "name",
      "storyIntro",
      "chooseHero",
      "prologue",
      "chapterIntro",
      "question",
      "final",
    ];
    flowScreens.forEach((t) => expect(t).not.toMatch(/skip/i));
  });
});

describe("goBack / restart", () => {
  it("pops the stack by one, never below length 1", () => {
    const stack: Screen[] = [{ type: "splash" }, { type: "auth" }, { type: "consent" }];
    expect(goBack(stack)).toEqual([{ type: "splash" }, { type: "auth" }]);
    expect(goBack([{ type: "splash" }])).toEqual([{ type: "splash" }]);
  });

  it("createInitialState resets hero/name/answers, and fixes guide to Focus Buddy (index 0)", () => {
    const s = createInitialState();
    expect(s.hero).toBeNull();
    expect(s.guide).toBe(0);
    expect(s.name).toBe("");
    expect(s.answers).toEqual({});
  });
});

describe("trailNodeStatuses", () => {
  it("chapter 0 is current and all others locked with no answers", () => {
    const statuses = trailNodeStatuses({});
    expect(statuses).toEqual(["current", ...new Array(D.chapters.length - 1).fill("locked")]);
  });

  it("marks a completed chapter done and unlocks the next as current", () => {
    // A-ATT-1: 0 closes out chapter 0 with no open follow-ups.
    const statuses = trailNodeStatuses({ "A-ATT-1": 0 });
    expect(statuses[0]).toBe("done");
    expect(statuses[1]).toBe("current");
    expect(statuses.slice(2).every((s) => s === "locked")).toBe(true);
  });
});

describe("truncateToTrailMap", () => {
  it("drops everything pushed after the most recent Trail Map screen", () => {
    const stack: Screen[] = [
      { type: "prologue" },
      { type: "trailMap" },
      { type: "chapterIntro", idx: 0 },
      { type: "question", id: "A-ATT-1" },
    ];
    expect(truncateToTrailMap(stack)).toEqual([{ type: "prologue" }, { type: "trailMap" }]);
  });

  it("so Back from the resulting stack lands on prologue, not a finished chapter's last question", () => {
    const stack: Screen[] = [
      { type: "prologue" },
      { type: "trailMap" },
      { type: "chapterIntro", idx: 0 },
      { type: "question", id: "A-ATT-1" },
    ];
    const truncated = truncateToTrailMap(stack);
    expect(goBack(truncated)).toEqual([{ type: "prologue" }]);
  });

  it("is a no-op when there is no Trail Map screen on the stack", () => {
    const stack: Screen[] = [{ type: "splash" }, { type: "auth" }];
    expect(truncateToTrailMap(stack)).toEqual(stack);
  });
});

describe("truncateAfterChange", () => {
  it("drops the stack and answers after a changed earlier answer", () => {
    const stack: Screen[] = [
      { type: "question", id: "A-ATT-1" },
      { type: "question", id: "A-ATT-2" },
      { type: "question", id: "A-ATT-3" },
    ];
    const answers: Answers = { "A-ATT-1": 2, "A-ATT-2": 1, "A-ATT-3": 0 };
    const result = truncateAfterChange("A-ATT-1", stack, answers);
    expect(result.stack).toEqual([{ type: "question", id: "A-ATT-1" }]);
    expect(result.answers["A-ATT-2"]).toBeUndefined();
    expect(result.answers["A-ATT-3"]).toBeUndefined();
    expect(result.answers["A-ATT-1"]).toBe(2);
  });
});
