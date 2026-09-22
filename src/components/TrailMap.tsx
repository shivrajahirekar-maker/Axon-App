import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ScreenHead } from "./ScreenHead";
import { pastelFor } from "./ChapterIntro";
import { IconCheck, IconLock } from "../icons/icons";
import placeholderImg from "../assets/placeholder.webp";
import { D } from "../data/questionnaire";
import type { NodeStatus } from "../lib/flowEngine";

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
  // chapter gets the smallest y (top). The winding x-offset is unchanged.
  const lastIdx = D.chapters.length - 1;
  const positions = D.chapters.map((_, i) => ({
    x: 50 + AMP * Math.sin((i * Math.PI) / 1.85),
    y: TOP_PAD + (lastIdx - i) * ROW_H,
  }));
  const totalHeight = TOP_PAD + lastIdx * ROW_H + BOTTOM_PAD;

  // Path is drawn following chapter order (0..last), which now naturally
  // climbs from the bottom of the SVG to the top.
  const pathD = positions.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

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
      <ScreenHead onBack={onBack} showBack />
      <div className="trailmap-header">
        <span className="trailmap-header-eyebrow">
          Chapter {headerIdx + 1} of {D.chapters.length}
        </span>
        <span className="trailmap-header-title">{headerChapter.title}</span>
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
            <path
              d={pathD}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray="0.5 7"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {D.chapters.map((chapter, i) => {
            const status = statuses[i];
            const pastel = pastelFor(i);
            const pos = positions[i];
            const nodeStyle: Record<string, string> =
              status === "done"
                ? { background: pastel.accent, color: "#fff" }
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
                  {status === "locked" && <IconLock />}
                  {status === "done" && <IconCheck />}
                  {status === "current" && (
                    <img className="trail-node-portrait" src={placeholderImg} alt="" />
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
