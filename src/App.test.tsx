import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "./App";
import { D } from "./data/questionnaire";

/** Click the single "Continue"-style button currently on screen. Waits until
 * exactly one match exists, since AnimatePresence can briefly mount two
 * screens during a transition. */
async function clickButton(name: string | RegExp) {
  const btn = await waitFor(() => {
    const matches = screen.getAllByRole("button", { name });
    expect(matches).toHaveLength(1);
    return matches[0];
  });
  fireEvent.click(btn);
}

function trailNodes(): HTMLElement[] {
  return Array.from(document.querySelectorAll(".trail-node"));
}

/** Wait briefly for the next question's option buttons to mount (AnimatePresence
 * transitions are async). Returns null once the chapter has no more open
 * questions and has moved on (celebration overlay, Trail Map, etc). */
async function waitForOpt(): Promise<HTMLButtonElement | null> {
  try {
    return await waitFor(
      () => {
        const el = document.querySelector<HTMLButtonElement>(".opt");
        if (!el) throw new Error("no option yet");
        return el;
      },
      { timeout: 1500, interval: 25 },
    );
  } catch {
    return null;
  }
}

describe("App: onboarding through the Trail Map to Final (real component wiring)", () => {
  it(
    "prologue leads to the Trail Map; completing a chapter celebrates then returns to the map; completing the 8th chapter shows the loader, the popup, then Final",
    async () => {
      render(<App />);

      // Splash (whole screen is a click target)
      fireEvent.click(screen.getByText(/Tap anywhere to continue/i));

      // Auth: sign up (the only functional path)
      await screen.findByPlaceholderText("Full name");
      fireEvent.change(screen.getByPlaceholderText("Full name"), { target: { value: "Test User" } });
      fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "test@example.com" } });
      fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "password1" } });
      fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
        target: { value: "password1" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

      // Consent
      await screen.findByText("Before we begin");
      await clickButton("I agree and continue");

      // Name
      await screen.findByPlaceholderText("Your name");
      fireEvent.change(screen.getByPlaceholderText("Your name"), { target: { value: "Rae" } });
      await clickButton("Continue");

      // StoryIntro (guide selection has been removed — Focus Buddy is the fixed, default guide)
      // — split into two sub-steps: the greeting (with a quiet "Next" link),
      // then the what's-next info with the real "Let's begin" CTA.
      await clickButton("Next");
      await clickButton("Let's begin");

      // ChooseHero
      const heroHeading = await screen.findByText("Choose your character");
      const heroEl = heroHeading.closest(".screen-scroll") as HTMLElement;
      const heroScope = within(heroEl);
      await waitFor(() => expect(heroScope.getAllByRole("button")).toHaveLength(3));
      fireEvent.click(heroEl.querySelectorAll(".pick")[0]);
      await waitFor(() => expect(heroScope.getByText("Continue")).not.toBeDisabled());
      fireEvent.click(heroScope.getByText("Continue"));

      // Prologue -> Trail Map (not straight into chapter 0)
      await clickButton("Start the trail");
      await waitFor(() => expect(trailNodes()).toHaveLength(D.chapters.length));
      expect(D.chapters.length).toBe(8);
      expect(trailNodes()[0].className).toContain("trail-node-current");
      expect(trailNodes()[1].className).toContain("trail-node-locked");

      // Tapping a locked node (chapter 2) does not navigate away from the Trail Map.
      fireEvent.click(trailNodes()[1]);
      expect(trailNodes()).toHaveLength(D.chapters.length);

      // Walk every chapter via whichever node the Trail Map currently marks
      // "current" — some chapters have no open questions once earlier answers
      // are all the lowest score (branch-only questions stay closed), so they
      // complete themselves and the map can jump ahead by more than one node.
      // This is existing branching behavior (unchanged by this feature), not
      // something this test should assume away.
      let rounds = 0;
      let sawLastChapter = false;
      while (rounds < D.chapters.length + 2) {
        rounds++;
        const ci = trailNodes().findIndex((n) => n.className.includes("trail-node-current"));
        expect(ci).toBeGreaterThanOrEqual(0);

        fireEvent.click(trailNodes()[ci]);
        await clickButton("Continue"); // ChapterIntro -> first question (or straight to completion)

        // Answer every open question in this chapter with the lowest-scoring
        // option, same convention as the flowEngine walk test.
        let guard = 0;
        while (guard < 20) {
          guard++;
          // The celebration overlay layers on top of the stack without
          // unmounting the last question screen underneath it, so check for
          // it first and stop — otherwise this loop would keep re-clicking
          // the same stale (already-answered) options.
          if (document.querySelector(".overlay-scrim")) break;
          const opt = await waitForOpt();
          if (!opt) break;
          const prevText = document.querySelector(".q-ask-bubble")?.textContent ?? null;
          fireEvent.click(opt);
          const cta = await waitFor(() => {
            const el = document.querySelector<HTMLButtonElement>(".q-footer .btn-primary");
            expect(el).not.toBeNull();
            expect(el!.disabled).toBe(false);
            return el!;
          });
          fireEvent.click(cta);
          // AnimatePresence (mode="wait") keeps the outgoing question screen
          // mounted, mid-exit-animation, for a beat — its stale "Continue"
          // handler still closes over the old `top`, so re-querying `.opt`
          // immediately would click through it again. Wait for the screen to
          // actually change (new question text, or celebration/overlay) first.
          await waitFor(() => {
            const stillSame = document.querySelector(".q-ask-bubble")?.textContent === prevText;
            const overlayUp = document.querySelector(".overlay-scrim") != null;
            const noMoreOpts = document.querySelector(".opt") == null;
            expect(stillSame && !overlayUp && !noMoreOpts).toBe(false);
          });
        }

        const isLast = ci === D.chapters.length - 1;
        // Celebration overlay appears first, either way.
        await screen.findByText(new RegExp(`${D.chapters[ci].title} complete`));

        if (!isLast) {
          // ...then auto-dismisses back to the Trail Map, with this chapter
          // now "done". The Trail Map stays mounted (dimmed) behind the
          // celebration the whole time now that chapters are answered in a
          // drawer rather than by navigating away from the map, so wait for
          // the celebration overlay to actually clear (not just for trail
          // nodes to exist, which is now always true) before the next round
          // taps another node — tapping while the overlay is still up is a
          // no-op by design.
          await waitFor(() => expect(document.querySelector(".overlay-scrim")).toBeNull(), {
            timeout: 4000,
          });
          expect(trailNodes()).toHaveLength(D.chapters.length);
          expect(trailNodes()[ci].className).toContain("trail-node-done");
        } else {
          sawLastChapter = true;
          // ...then the loader, then the popup, then Final.
          await screen.findByText(/setting up your first steps/i, undefined, { timeout: 4000 });
          await screen.findByText(/ready for what's next/i, undefined, { timeout: 4000 });
          break;
        }
      }
      expect(sawLastChapter).toBe(true);
    },
    30000,
  );
});

describe("App: Trail Map drawer interaction", () => {
  /** Drive the app from splash through to the Trail Map, the fast way, so
   * each test below can start fresh from there without repeating the whole
   * sign-up flow. */
  async function getToTrailMap() {
    render(<App />);
    fireEvent.click(screen.getByText(/Tap anywhere to continue/i));
    await screen.findByPlaceholderText("Full name");
    fireEvent.change(screen.getByPlaceholderText("Full name"), { target: { value: "Test User" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "password1" } });
    fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
      target: { value: "password1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await screen.findByText("Before we begin");
    await clickButton("I agree and continue");

    await screen.findByPlaceholderText("Your name");
    fireEvent.change(screen.getByPlaceholderText("Your name"), { target: { value: "Rae" } });
    await clickButton("Continue");

    await clickButton("Next");
    await clickButton("Let's begin");

    const heroHeading = await screen.findByText("Choose your character");
    const heroEl = heroHeading.closest(".screen-scroll") as HTMLElement;
    await waitFor(() => expect(within(heroEl).getAllByRole("button")).toHaveLength(3));
    fireEvent.click(heroEl.querySelectorAll(".pick")[0]);
    await waitFor(() => expect(within(heroEl).getByText("Continue")).not.toBeDisabled());
    fireEvent.click(within(heroEl).getByText("Continue"));

    await clickButton("Start the trail");
    await waitFor(() => expect(trailNodes()).toHaveLength(D.chapters.length));
  }

  it("tapping a locked node does not open the chapter-intro modal", async () => {
    await getToTrailMap();
    expect(trailNodes()[1].className).toContain("trail-node-locked");
    fireEvent.click(trailNodes()[1]);
    expect(document.querySelector(".chapter-modal")).toBeNull();
    // Trail Map is untouched — still the only thing on screen.
    expect(trailNodes()).toHaveLength(D.chapters.length);
  });

  it("tapping the current node opens a centered chapter-intro modal (no back/close button) over a dimmed Trail Map, and Continue swaps it for a FULL SCREEN question (not a modal)", async () => {
    await getToTrailMap();
    expect(trailNodes()[0].className).toContain("trail-node-current");

    fireEvent.click(trailNodes()[0]);
    expect(await screen.findByText(D.chapters[0].stop)).toBeInTheDocument();
    expect(document.querySelector(".chapter-modal-scrim")).not.toBeNull();
    expect(document.querySelector(".chapter-modal")).not.toBeNull();
    // No back or close button anywhere in the modal.
    expect(document.querySelector(".chapter-modal")!.querySelector("button.back-btn")).toBeNull();
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
    // Trail Map stays mounted (dimmed) behind the modal, not replaced.
    expect(trailNodes()).toHaveLength(D.chapters.length);

    await clickButton("Continue");
    // The modal is gone; the question renders full screen instead.
    await waitFor(() => expect(document.querySelector(".chapter-modal")).toBeNull());
    const opt = await waitFor(() => {
      const el = document.querySelector<HTMLButtonElement>(".question-fullscreen .opt");
      expect(el).not.toBeNull();
      return el!;
    });
    expect(opt).toBeInTheDocument();
  });

  it("tapping the scrim on the chapter-intro modal closes it without marking the chapter done", async () => {
    await getToTrailMap();
    fireEvent.click(trailNodes()[0]);
    await screen.findByText(D.chapters[0].stop);

    fireEvent.click(document.querySelector(".chapter-modal-scrim")!);
    await waitFor(() => expect(document.querySelector(".chapter-modal")).toBeNull());
    expect(trailNodes()[0].className).toContain("trail-node-current");
    expect(trailNodes()[0].className).not.toContain("trail-node-done");
  });

  it(
    "answering through the full-screen question flow runs the celebration and returns to an updated Trail Map",
    async () => {
      await getToTrailMap();
      fireEvent.click(trailNodes()[0]);
      await clickButton("Continue");

      let guard = 0;
      while (guard < 20) {
        guard++;
        if (document.querySelector(".overlay-scrim")) break;
        const opt = await waitFor(
          () => {
            const el = document.querySelector<HTMLButtonElement>(".question-fullscreen .opt");
            if (!el) throw new Error("no option yet");
            return el;
          },
          { timeout: 1500 },
        ).catch(() => null);
        if (!opt) break;
        fireEvent.click(opt);
        const cta = await waitFor(() => {
          const el = document.querySelector<HTMLButtonElement>(".question-fullscreen .q-footer .btn-primary");
          expect(el).not.toBeNull();
          expect(el!.disabled).toBe(false);
          return el!;
        });
        fireEvent.click(cta);
        await waitFor(() => {
          const overlayUp = document.querySelector(".overlay-scrim") != null;
          const gone = document.querySelector(".question-fullscreen") == null;
          expect(overlayUp || gone || document.querySelector(".question-fullscreen .opt") != null).toBe(
            true,
          );
        });
      }

      // The full-screen question flow closes and the celebration overlay runs...
      await screen.findByText(new RegExp(`${D.chapters[0].title} complete`));
      // The exit spring animation takes a beat to finish and unmount in
      // jsdom, so allow a little slack here (unlike the overlay check below,
      // this isn't racing against a real 1400ms feature timer).
      await waitFor(() => expect(document.querySelector(".question-fullscreen")).toBeNull(), {
        timeout: 2000,
      });

      // ...then auto-dismisses back to the Trail Map, with chapter 0 now done.
      await waitFor(() => expect(document.querySelector(".overlay-scrim")).toBeNull(), { timeout: 4000 });
      expect(trailNodes()[0].className).toContain("trail-node-done");
    },
    15000,
  );
});
