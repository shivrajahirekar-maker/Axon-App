import { ScreenHead } from "./ScreenHead";
import placeholderImg from "../assets/placeholder.webp";

interface StoryIntroProps {
  name: string;
  guideName: string;
  onBack: () => void;
  onAdvance: () => void;
}

export function StoryIntro({ name, guideName, onBack, onAdvance }: StoryIntroProps) {
  return (
    <>
      <ScreenHead onBack={onBack} />
      <div className="center-col">
        <div className="illus" aria-hidden="true">
          <img src={placeholderImg} alt="" />
        </div>
        <h2 className="screen-title">Let's build a character, {name || "friend"}</h2>
        <p className="screen-sub" style={{ maxWidth: 280 }}>
          You'll choose a character to walk a short trail. Whatever happens to them on the
          way — you'll know it's really about you.
        </p>
        <p className="screen-sub" style={{ maxWidth: 280 }}>
          {guideName} will walk alongside, and check in gently at every stretch of the trail.
        </p>
        <button type="button" className="btn-primary" style={{ marginTop: 6 }} onClick={onAdvance}>
          Let's begin
        </button>
      </div>
    </>
  );
}
