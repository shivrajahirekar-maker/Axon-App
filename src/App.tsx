import { useEffect, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { PhoneShell } from "./components/PhoneShell";
import { Splash } from "./components/Splash";
import { Auth } from "./components/Auth";
import { Consent } from "./components/Consent";
import { NameScreen } from "./components/NameScreen";
import { StoryIntro } from "./components/StoryIntro";
import { ChooseGuide } from "./components/ChooseGuide";
import { ChooseHero } from "./components/ChooseHero";
import { Prologue } from "./components/Prologue";
import { TrailMap } from "./components/TrailMap";
import { ChapterIntro } from "./components/ChapterIntro";
import { QuestionScreen } from "./components/QuestionScreen";
import { ChapterCelebration } from "./components/ChapterCelebration";
import { PlanLoader } from "./components/PlanLoader";
import { Final } from "./components/Final";
import { IconClose } from "./icons/icons";
import {
  createInitialState,
  computeNext,
  goBack as goBackFn,
  truncateAfterChange,
  applyAnswerTap,
  screenKey,
  trailNodeStatuses,
  isLastChapterIdx,
  type Screen,
} from "./lib/flowEngine";
import { D, byId, chapterOf } from "./data/questionnaire";

type Overlay =
  | { kind: "celebrate"; chapterIdx: number; isLast: boolean }
  | { kind: "loader" }
  | { kind: "popup" }
  | null;

/** A chapter's questions, answered inside the bottom-drawer opened from a
 * Trail Map node tap. `stack` is a small mirror of the app's own screen-stack
 * model (chapterIntro -> question -> question -> ...), scoped to this one
 * chapter attempt, so the existing flowEngine helpers (computeNext, goBack,
 * truncateAfterChange) can be reused unchanged. */
interface Drawer {
  idx: number;
  stack: Screen[];
}

const CELEBRATE_MS = 1400;
const LOADER_MS = 1300;
const POPUP_MS = 1500;

function App() {
  const [flow, setFlow] = useState(createInitialState());
  const [stack, setStack] = useState<Screen[]>([{ type: "splash" }]);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [drawer, setDrawer] = useState<Drawer | null>(null);
  const drawerDragControls = useDragControls();

  const top = stack[stack.length - 1];
  const drawerTop = drawer ? drawer.stack[drawer.stack.length - 1] : null;
  const heroName = flow.hero != null ? D.chars[flow.hero].name : "your character";
  const guideName = flow.guide != null ? D.guides[flow.guide].name : "your guide";

  // Drives the transient, un-pushed overlay sequence: chapter-complete
  // celebration -> (last chapter only) loader -> popup -> Final.
  useEffect(() => {
    if (!overlay) return;
    if (overlay.kind === "celebrate") {
      const t = setTimeout(() => {
        if (overlay.isLast) {
          setOverlay({ kind: "loader" });
        } else {
          setOverlay(null);
        }
      }, CELEBRATE_MS);
      return () => clearTimeout(t);
    }
    if (overlay.kind === "loader") {
      const t = setTimeout(() => setOverlay({ kind: "popup" }), LOADER_MS);
      return () => clearTimeout(t);
    }
    if (overlay.kind === "popup") {
      const t = setTimeout(() => {
        setStack((s) => [...s, { type: "final" }]);
        setOverlay(null);
      }, POPUP_MS);
      return () => clearTimeout(t);
    }
  }, [overlay]);

  function advance() {
    if (overlay) return;
    if (top.type === "trailMap") return; // navigation here is via node taps only
    const next = computeNext(top, flow.answers);
    if (next) {
      setStack((s) => [...s, next]);
    }
  }

  /** Tapping a Trail Map node opens the bottom-drawer for that chapter,
   * starting at its intro. Locked nodes are rejected here too, mirroring
   * TrailMap's own guard (belt-and-braces — TrailMap already refuses to call
   * this for a locked node). */
  function selectChapter(idx: number) {
    if (overlay) return;
    const statuses = trailNodeStatuses(flow.answers);
    if (statuses[idx] === "locked") return;
    setDrawer({ idx, stack: [{ type: "chapterIntro", idx }] });
  }

  /** Advance within the drawer's own mini-stack. When the chapter's
   * questions are all answered (computeNext returns null, same completion
   * condition as before), close the drawer and run the existing
   * chapter-celebration overlay -> Trail Map update sequence. */
  function drawerAdvance() {
    if (!drawer) return;
    const dTop = drawer.stack[drawer.stack.length - 1];
    const next = computeNext(dTop, flow.answers);
    if (next) {
      setDrawer((d) => (d ? { ...d, stack: [...d.stack, next] } : d));
      return;
    }
    const ci = dTop.type === "question" ? chapterOf[dTop.id] : (dTop as { idx: number }).idx;
    setDrawer(null);
    setOverlay({ kind: "celebrate", chapterIdx: ci, isLast: isLastChapterIdx(ci) });
  }

  /** Back within the drawer steps back through its mini-stack; from the
   * chapter's intro (nothing earlier to go back to) it closes the drawer
   * instead, returning to the Trail Map. */
  function drawerBack() {
    if (!drawer) return;
    if (drawer.stack.length <= 1) {
      closeDrawer();
      return;
    }
    setDrawer((d) => (d ? { ...d, stack: goBackFn(d.stack) } : d));
  }

  /** Close the drawer without marking the chapter complete. Answers already
   * given so far are kept (harmless: a chapter only ever shows as "done" once
   * every one of its open questions has an answer), but no completion
   * overlay runs and the drawer's own mini-stack is discarded. */
  function closeDrawer() {
    setDrawer(null);
  }

  function back() {
    if (overlay) return;
    setStack((s) => goBackFn(s));
  }

  function restart() {
    setFlow(createInitialState());
    setStack([{ type: "splash" }]);
    setDrawer(null);
    setOverlay(null);
  }

  function answerSingle(qid: string, i: number) {
    const changed = flow.answers[qid] !== i;
    const nextAnswers = { ...flow.answers, [qid]: i };
    if (changed && drawer) {
      const { stack: newDrawerStack, answers: truncatedAnswers } = truncateAfterChange(
        qid,
        drawer.stack,
        nextAnswers,
      );
      setDrawer((d) => (d ? { ...d, stack: newDrawerStack } : d));
      setFlow((f) => ({ ...f, answers: truncatedAnswers }));
    } else {
      setFlow((f) => ({ ...f, answers: nextAnswers }));
    }
  }

  function answerMulti(qid: string, i: number, isAll: boolean) {
    const q = byId[qid];
    const nextAnswers = applyAnswerTap(q, i, isAll, flow.answers);
    setFlow((f) => ({ ...f, answers: nextAnswers }));
  }

  return (
    <PhoneShell onRestart={restart}>
      <AnimatePresence mode="wait">
        <motion.div
          key={screenKey(top)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          {top.type === "splash" && <Splash onAdvance={advance} />}

          {top.type === "auth" && (
            <Auth
              authMode={flow.authMode}
              onToggleMode={() =>
                setFlow((f) => ({ ...f, authMode: f.authMode === "signup" ? "signin" : "signup" }))
              }
              onSignUpSuccess={({ fullname, email }) => {
                setFlow((f) => ({ ...f, fullname, email, name: f.name || fullname }));
                advance();
              }}
            />
          )}

          {top.type === "consent" && <Consent onBack={back} onAdvance={advance} />}

          {top.type === "name" && (
            <NameScreen
              name={flow.name}
              onBack={back}
              onAdvance={(name) => {
                setFlow((f) => ({ ...f, name }));
                advance();
              }}
            />
          )}

          {top.type === "storyIntro" && (
            <StoryIntro name={flow.name} guideName={guideName} onBack={back} onAdvance={advance} />
          )}

          {top.type === "chooseGuide" && (
            <ChooseGuide
              selected={flow.guide}
              onSelect={(i) => setFlow((f) => ({ ...f, guide: i }))}
              onBack={back}
              onAdvance={advance}
            />
          )}

          {top.type === "chooseHero" && (
            <ChooseHero
              guideName={guideName}
              selected={flow.hero}
              onSelect={(i) => setFlow((f) => ({ ...f, hero: i }))}
              onBack={back}
              onAdvance={advance}
            />
          )}

          {top.type === "prologue" && flow.guide != null && (
            <Prologue
              heroName={heroName}
              guideName={guideName}
              guideGreet={D.guides[flow.guide].greet}
              onBack={back}
              onAdvance={advance}
            />
          )}

          {top.type === "trailMap" && (
            <TrailMap
              statuses={trailNodeStatuses(flow.answers)}
              onBack={back}
              onSelectChapter={selectChapter}
            />
          )}

          {top.type === "final" && <Final heroName={heroName} guideName={guideName} />}
        </motion.div>
      </AnimatePresence>

      {/* Bottom-drawer: a chapter's intro + questions, opened from a Trail Map
          node tap. Slides up over the (dimmed) Trail Map instead of pushing a
          new full screen. */}
      <AnimatePresence>
        {drawer && (
          <motion.div
            key="drawer-scrim"
            className="drawer-scrim"
            onClick={closeDrawer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {drawer && drawerTop && (
          <motion.div
            key="drawer-sheet"
            className="drawer-sheet"
            drag="y"
            dragControls={drawerDragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) closeDrawer();
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div
              className="drawer-handle-row"
              onPointerDown={(e) => drawerDragControls.start(e)}
            >
              <span className="drawer-handle" aria-hidden="true" />
              <button type="button" className="drawer-close" aria-label="Close" onClick={closeDrawer}>
                <IconClose />
              </button>
            </div>
            <div className="drawer-content" style={{ background: "var(--color-bg)" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={screenKey(drawerTop)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{ height: "100%", display: "flex", flexDirection: "column" }}
                >
                  {drawerTop.type === "chapterIntro" && (
                    <ChapterIntro
                      chapter={D.chapters[drawerTop.idx]}
                      idx={drawerTop.idx}
                      heroName={heroName}
                      guideName={guideName}
                      onBack={drawerBack}
                      onAdvance={drawerAdvance}
                    />
                  )}

                  {drawerTop.type === "question" &&
                    (() => {
                      const q = byId[drawerTop.id];
                      return (
                        <QuestionScreen
                          question={q}
                          answer={flow.answers[drawerTop.id]}
                          heroName={heroName}
                          guideName={guideName}
                          onTapOption={(i, isAll) =>
                            q.multi ? answerMulti(drawerTop.id, i, isAll) : answerSingle(drawerTop.id, i)
                          }
                          onBack={drawerBack}
                          onAdvance={drawerAdvance}
                        />
                      );
                    })()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {overlay?.kind === "celebrate" && (
          <ChapterCelebration key="celebrate" chapterTitle={D.chapters[overlay.chapterIdx].title} />
        )}
        {(overlay?.kind === "loader" || overlay?.kind === "popup") && (
          <PlanLoader key="planloader" stage={overlay.kind} />
        )}
      </AnimatePresence>
    </PhoneShell>
  );
}

export default App;
