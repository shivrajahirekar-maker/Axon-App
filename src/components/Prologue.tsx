import { ScreenHead } from "./ScreenHead";
import { CHARACTER_PORTRAIT } from "../assets/characters";

interface PrologueProps {
  guideName: string;
  onBack: () => void;
  onAdvance: () => void;
}

/** Same talking-bubble pattern as StoryIntro: the companion speaks directly
 * to the player, with a downward-pointing bubble over their own portrait.
 * No re-introduction ("Hello, I'm Doggo...") here — that already happened
 * on the "Let's begin" screen; repeating it here would be redundant. */
export function Prologue({ guideName, onBack, onAdvance }: PrologueProps) {
  const portrait = CHARACTER_PORTRAIT[guideName];
  return (
    <>
      <ScreenHead title="Your Trail" onBack={onBack} />
      <div className="screen-scroll" style={{ textAlign: "center" }}>
        <div style={{ margin: "auto 0" }}>
          <div className="talk-bubble">
            <p className="talk-bubble-text">
              You live on the Everyday Trail, a winding path through an ordinary day. Some
              stretches are easy. Others are tricky, and you aren't always sure why.
            </p>
            <p className="talk-bubble-text">
              I'll walk beside you to understand the trail, one stretch at a time.
            </p>
          </div>
          <div className="talk-bubble-portrait" aria-hidden="true">
            {portrait && <img src={portrait} alt="" />}
          </div>
        </div>
        <div className="screen-footer">
          <button type="button" className="btn-primary" onClick={onAdvance}>
            Start the trail
          </button>
        </div>
      </div>
    </>
  );
}
