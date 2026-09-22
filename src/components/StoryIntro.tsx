import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { ScreenHead } from "./ScreenHead";
import { CHARACTER_PORTRAIT } from "../assets/characters";

interface StoryIntroProps {
  name: string;
  guideName: string;
  onBack: () => void;
  onAdvance: () => void;
}

/** Split into two sub-steps so the companion's introduction and "what's
 * next" info aren't crammed into one screen:
 *   1. Just the companion's greeting, with a quiet "Next" link up top.
 *   2. What the player should expect next, with the real "Let's begin" CTA.
 * Both share the same talking-bubble + portrait layout. */
export function StoryIntro({ name, guideName, onBack, onAdvance }: StoryIntroProps) {
  const [step, setStep] = useState<0 | 1>(0);
  const portrait = CHARACTER_PORTRAIT[guideName];
  const who = name || "friend";

  return (
    <>
      <ScreenHead title="Meet Your Companion" onBack={step === 1 ? () => setStep(0) : onBack} />
      <div className="screen-scroll" style={{ textAlign: "center" }}>
        <div style={{ margin: "auto 0" }}>
          <div className="talk-bubble">
            {step === 0 ? (
              <>
                <h2 className="talk-bubble-title">Hi {who}, I am your Companion</h2>
                <p className="talk-bubble-quote">"Let's build a character together, {who}."</p>
              </>
            ) : (
              <>
                <p className="talk-bubble-text">
                  You'll choose a character to walk a short trail. Whatever happens to them on
                  the way — you'll know it's really about you.
                </p>
                <p className="talk-bubble-text">
                  I'll walk alongside, and check in gently at every stretch of the trail.
                </p>
              </>
            )}
          </div>
          <div className="talk-bubble-portrait" aria-hidden="true">
            {portrait && <img src={portrait} alt="" />}
          </div>
        </div>
        {step === 0 ? (
          <div className="screen-footer-right">
            <button type="button" className="btn-next-secondary" onClick={() => setStep(1)}>
              Next
              <ChevronRight size={19} strokeWidth={2.25} />
            </button>
          </div>
        ) : (
          <div className="screen-footer">
            <button type="button" className="btn-primary" onClick={onAdvance}>
              Let's begin
            </button>
          </div>
        )}
      </div>
    </>
  );
}
