import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Check,
  Lock,
  Crosshair,
  Zap,
  Rocket,
  Heart,
  Sun,
  Sparkles,
  Repeat,
  Footprints,
  type LucideIcon,
} from "lucide-react";
import { D } from "../data/questionnaire";
import type { NodeStatus } from "../lib/flowEngine";

/** One relevant lucide icon per chapter category — shown on its locked node
 * instead of a generic padlock, so each category reads as itself even
 * before it unlocks. */
const CHAPTER_ICON: Record<string, LucideIcon> = {
  focus: Crosshair,
  energy: Zap,
  starting: Rocket,
  feelings: Heart,
  daily: Sun,
  wellbeing: Sparkles,
  habits: Repeat,
  firststeps: Footprints,
};

interface TrailMapProps {
  statuses: NodeStatus[];
  onBack: () => void;
  onSelectChapter: (idx: number) => void;
}

const ROW_H = 104;
const TOP_PAD = 46;
const BOTTOM_PAD = 64;
const AMP = 30; // horizontal swing, in viewBox % units

/** Duolingo-style winding trail hub: one circular node per chapter, connected
 * by a curving path. Chapter 1 sits at the BOTTOM and the trail winds UPWARD
 * toward the final chapter — climbing a mountain, like Duolingo's bottom-to-top
 * skill path. This screen IS the progress indicator, so ScreenHead's linear
 * bar is intentionally not shown here. */
export function TrailMap({ statuses, onBack, onSelectChapter }: TrailMapProps) {
  const [shakeIdx, setShakeIdx] = useState<number | null>(null);
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shakeIdx == null) return;
    const t = setTimeout(() => setShakeIdx(null), 420);
    return () => clearTimeout(t);
  }, [shakeIdx]);

  const currentIdx = statuses.findIndex((s) => s === "current");
  const headerIdx = currentIdx >= 0 ? currentIdx : D.chapters.length - 1;
  const headerChapter = D.chapters[headerIdx];

  // i = 0 (chapter 1) gets the LARGEST y (bottom of the trail); the last
  // chapter gets the smallest y (top). The x-offset steps through a fixed
  // 4-step cycle (center, right, center, left, ...) so every consecutive
  // node moves by exactly AMP horizontally — combined with the constant
  // ROW_H vertical step, this keeps the node-to-node distance perfectly
  // even instead of varying like a smooth sine wave would.
  const SIDE = [0, 1, 0, -1];
  const lastIdx = D.chapters.length - 1;
  const positions = D.chapters.map((_, i) => ({
    x: 50 + AMP * SIDE[i % SIDE.length],
    y: TOP_PAD + (lastIdx - i) * ROW_H,
  }));
  const totalHeight = TOP_PAD + lastIdx * ROW_H + BOTTOM_PAD;

  // Path is drawn as individual curved segments (one per consecutive node
  // pair) rather than a single straight stroke, so each segment can be
  // colored on its own: a segment is "walked" (solid progress green) once
  // its lower chapter is done, and stays the default dashed gray otherwise.
  // Each curve is a rounded L: it leaves the lower node travelling straight
  // UP (control point shares the lower node's x), then bends to arrive at
  // the upper node travelling straight SIDEWAYS, level with that node's own
  // center (control point shares the upper node's y). Arriving level (not
  // from below) means the curve never dips into the label sitting directly
  // under the upper node — it only crosses that x-column well above the
  // label, and it never dwells at the lower node's x below y0 either.
  const segments = positions.slice(0, -1).map((p, i) => {
    const next = positions[i + 1];
    return {
      d: `M ${p.x} ${p.y} Q ${p.x} ${next.y} ${next.x} ${next.y}`,
      walked: statuses[i] === "done",
    };
  });

  // Auto-center the current node in the scroll viewport whenever the Trail
  // Map mounts, or whenever which node is "current" changes (e.g. returning
  // from a chapter celebration with a new current node).
  useEffect(() => {
    if (currentIdx < 0) return;
    const el = nodeRefs.current[currentIdx];
    if (!el || typeof el.scrollIntoView !== "function") return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [currentIdx]);

  function handleTap(i: number) {
    if (statuses[i] === "locked") {
      setShakeIdx(i);
      return;
    }
    onSelectChapter(i);
  }

  return (
    <div className="trailmap-screen">
      <div className="trailmap-header-row">
        <button type="button" className="back-btn" aria-label="Back" onClick={onBack}>
          <ChevronLeft size={20} strokeWidth={2.25} />
        </button>
        <div className="trailmap-header">
          <span className="trailmap-header-eyebrow">
            Chapter {headerIdx + 1} of {D.chapters.length}
          </span>
          <span className="trailmap-header-title">{headerChapter.title}</span>
        </div>
      </div>
      <motion.div
        className="trailmap-scroll"
        ref={scrollRef}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
      >
        <div className="trailmap-path-wrap" style={{ height: totalHeight }}>
          <svg
            className="trailmap-svg"
            viewBox={`0 0 100 ${totalHeight}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {segments.map((seg, i) => (
              <path
                key={i}
                d={seg.d}
                fill="none"
                stroke={seg.walked ? "var(--color-progress)" : "var(--color-border)"}
                strokeWidth={seg.walked ? "2" : "1.6"}
                strokeLinecap="round"
                strokeDasharray={seg.walked ? undefined : "0.5 7"}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
          {D.chapters.map((chapter, i) => {
            const status = statuses[i];
            const pos = positions[i];
            const CategoryIcon = CHAPTER_ICON[chapter.key];
            const nodeStyle: Record<string, string> =
              status === "done"
                ? { background: "var(--color-progress)", color: "#fff" }
                : status === "current"
                  ? { background: "var(--color-cta)", color: "var(--color-cta-text)" }
                  : { background: "var(--color-border)", color: "var(--color-ink-muted)" };
            return (
              <div
                key={chapter.key}
                className="trail-node-wrap"
                data-chapter-idx={i}
                style={{ left: `${pos.x}%`, top: pos.y }}
              >
                <motion.button
                  type="button"
                  ref={(el) => {
                    nodeRefs.current[i] = el;
                  }}
                  className={
                    "trail-node" +
                    (status === "locked" ? " trail-node-locked" : "") +
                    (status === "current" ? " trail-node-current" : "") +
                    (status === "done" ? " trail-node-done" : "") +
                    (shakeIdx === i ? " trail-node-shake" : "")
                  }
                  style={nodeStyle}
                  aria-label={`${chapter.title} — ${status === "locked" ? "locked" : status === "current" ? "next chapter, tap to start" : "complete, tap to revisit"}`}
                  aria-disabled={status === "locked"}
                  onClick={() => handleTap(i)}
                  initial={status === "current" ? { scale: 0.55, opacity: 0 } : false}
                  animate={status === "current" ? { scale: 1, opacity: 1 } : {}}
                  transition={{ type: "spring", stiffness: 320, damping: 16 }}
                  whileTap={status !== "locked" ? { scale: 0.94 } : undefined}
                >
                  {status === "locked" && (
                    <>
                      {CategoryIcon && <CategoryIcon size={24} strokeWidth={1.8} />}
                      <span className="trail-node-lock-badge" aria-hidden="true">
                        <Lock size={11} strokeWidth={2.5} />
                      </span>
                    </>
                  )}
                  {status === "done" && <Check size={26} strokeWidth={2.5} />}
                  {status === "current" && CategoryIcon && (
                    <CategoryIcon size={28} strokeWidth={2} />
                  )}
                </motion.button>
                <span className="trail-node-label">{chapter.title}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
