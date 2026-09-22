import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrailMap } from "./TrailMap";
import { trailNodeStatuses, type NodeStatus } from "../lib/flowEngine";
import { D } from "../data/questionnaire";

const ALL_LOCKED_AFTER_0: NodeStatus[] = [
  "current",
  "locked",
  "locked",
  "locked",
  "locked",
  "locked",
  "locked",
  "locked",
];

describe("TrailMap", () => {
  it("renders exactly 8 chapter nodes", () => {
    render(<TrailMap statuses={ALL_LOCKED_AFTER_0} onBack={() => {}} onSelectChapter={() => {}} />);
    const nodes = screen.getAllByRole("button").filter((b) => b.className.includes("trail-node"));
    expect(nodes).toHaveLength(D.chapters.length);
    expect(D.chapters.length).toBe(8);
  });

  it("shows the correct lock/current/done state per node, matching trailNodeStatuses", () => {
    // Chapter 0 done, chapter 1 done, chapter 2 current, rest locked.
    const statuses: NodeStatus[] = ["done", "done", "current", "locked", "locked", "locked", "locked", "locked"];
    render(<TrailMap statuses={statuses} onBack={() => {}} onSelectChapter={() => {}} />);
    const nodes = screen.getAllByRole("button").filter((b) => b.className.includes("trail-node"));
    nodes.forEach((node, i) => {
      if (statuses[i] === "done") expect(node.className).toContain("trail-node-done");
      if (statuses[i] === "current") expect(node.className).toContain("trail-node-current");
      if (statuses[i] === "locked") expect(node.className).toContain("trail-node-locked");
    });
  });

  it("tapping a locked node does not call onSelectChapter", async () => {
    const user = userEvent.setup();
    const onSelectChapter = vi.fn();
    render(<TrailMap statuses={ALL_LOCKED_AFTER_0} onBack={() => {}} onSelectChapter={onSelectChapter} />);
    const nodes = screen.getAllByRole("button").filter((b) => b.className.includes("trail-node"));
    // index 1 is locked in ALL_LOCKED_AFTER_0
    await user.click(nodes[1]);
    expect(onSelectChapter).not.toHaveBeenCalled();
  });

  it("tapping the current node calls onSelectChapter with its index", async () => {
    const user = userEvent.setup();
    const onSelectChapter = vi.fn();
    render(<TrailMap statuses={ALL_LOCKED_AFTER_0} onBack={() => {}} onSelectChapter={onSelectChapter} />);
    const nodes = screen.getAllByRole("button").filter((b) => b.className.includes("trail-node"));
    await user.click(nodes[0]);
    expect(onSelectChapter).toHaveBeenCalledWith(0);
  });

  it("tapping a done node calls onSelectChapter (revisit allowed)", async () => {
    const user = userEvent.setup();
    const onSelectChapter = vi.fn();
    const statuses: NodeStatus[] = ["done", "current", "locked", "locked", "locked", "locked", "locked", "locked"];
    render(<TrailMap statuses={statuses} onBack={() => {}} onSelectChapter={onSelectChapter} />);
    const nodes = screen.getAllByRole("button").filter((b) => b.className.includes("trail-node"));
    await user.click(nodes[0]);
    expect(onSelectChapter).toHaveBeenCalledWith(0);
  });

  it("node statuses derived from real answers (trailNodeStatuses) render consistently", () => {
    // Chapter 0 complete via a low-scoring answer (no open follow-ups).
    const statuses = trailNodeStatuses({ "A-ATT-1": 0 });
    expect(statuses[0]).toBe("done");
    expect(statuses[1]).toBe("current");
    expect(statuses.slice(2)).toEqual(new Array(6).fill("locked"));
    render(<TrailMap statuses={statuses} onBack={() => {}} onSelectChapter={() => {}} />);
    const nodes = screen.getAllByRole("button").filter((b) => b.className.includes("trail-node"));
    expect(nodes).toHaveLength(8);
  });

  it("trail runs bottom-to-top: chapter 1's node sits below chapter 8's node", () => {
    render(<TrailMap statuses={ALL_LOCKED_AFTER_0} onBack={() => {}} onSelectChapter={() => {}} />);
    const wraps = Array.from(document.querySelectorAll<HTMLElement>(".trail-node-wrap"));
    expect(wraps).toHaveLength(8);
    const topOf = (idx: number) => {
      const wrap = wraps.find((w) => w.dataset.chapterIdx === String(idx));
      expect(wrap).toBeTruthy();
      return parseFloat(wrap!.style.top);
    };
    // A larger CSS "top" is lower on screen — chapter 0 (first chapter) must
    // be positioned below every later chapter, climbing to chapter 7 at top.
    const chapter0Top = topOf(0);
    for (let i = 1; i < D.chapters.length; i++) {
      expect(chapter0Top).toBeGreaterThan(topOf(i));
    }
    // And it should be strictly monotonic: each next chapter sits higher
    // (smaller top) than the one before it.
    for (let i = 0; i < D.chapters.length - 1; i++) {
      expect(topOf(i)).toBeGreaterThan(topOf(i + 1));
    }
  });

  it("auto-centers the current node in the scroll viewport on mount", () => {
    const scrollIntoViewMock = vi.fn();
    const original = window.HTMLElement.prototype.scrollIntoView;
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
    try {
      const statuses: NodeStatus[] = [
        "done",
        "current",
        "locked",
        "locked",
        "locked",
        "locked",
        "locked",
        "locked",
      ];
      render(<TrailMap statuses={statuses} onBack={() => {}} onSelectChapter={() => {}} />);
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ block: "center", behavior: "smooth" });
    } finally {
      window.HTMLElement.prototype.scrollIntoView = original;
    }
  });

  it("re-centers when the current node changes (e.g. after a chapter completes)", () => {
    const scrollIntoViewMock = vi.fn();
    const original = window.HTMLElement.prototype.scrollIntoView;
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
    try {
      const { rerender } = render(
        <TrailMap statuses={ALL_LOCKED_AFTER_0} onBack={() => {}} onSelectChapter={() => {}} />,
      );
      const callsAfterMount = scrollIntoViewMock.mock.calls.length;
      expect(callsAfterMount).toBeGreaterThan(0);

      const nextStatuses: NodeStatus[] = [
        "done",
        "current",
        "locked",
        "locked",
        "locked",
        "locked",
        "locked",
        "locked",
      ];
      rerender(<TrailMap statuses={nextStatuses} onBack={() => {}} onSelectChapter={() => {}} />);
      expect(scrollIntoViewMock.mock.calls.length).toBeGreaterThan(callsAfterMount);
    } finally {
      window.HTMLElement.prototype.scrollIntoView = original;
    }
  });
});
