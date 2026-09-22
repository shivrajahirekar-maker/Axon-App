import { ScreenHead } from "./ScreenHead";
import { ANIMAL_ICON, IconGuideGeneric } from "../icons/icons";
import { fillText } from "../lib/text";
import placeholderImg from "../assets/placeholder.webp";

interface PrologueProps {
  heroName: string;
  guideName: string;
  guideGreet: string;
  onBack: () => void;
  onAdvance: () => void;
}

export function Prologue({ heroName, guideName, guideGreet, onBack, onAdvance }: PrologueProps) {
  const GuideIcon = ANIMAL_ICON[guideName] || IconGuideGeneric;
  return (
    <>
      <ScreenHead onBack={onBack} />
      <div className="screen-scroll">
        <div className="illus" aria-hidden="true">
          <img src={placeholderImg} alt="" />
        </div>
        <div className="story-card">
          <div className="story-avatar">
            <span className="ic">
              <GuideIcon />
            </span>
            <span className="story-name">{guideName}</span>
          </div>
          <p className="story-quote">"{fillText(guideGreet, heroName, guideName)}"</p>
          <p className="story-text">
            {fillText(
              "{hero} lives on the Everyday Trail, a winding path through an ordinary day. Some stretches are easy. Others are tricky, and {hero} isn't always sure why.",
              heroName,
              guideName,
            )}
          </p>
          <p className="story-text">
            {fillText("{guide} walks beside {hero} to understand the trail, one stretch at a time.", heroName, guideName)}
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          style={{ width: "100%", marginTop: 16 }}
          onClick={onAdvance}
        >
          Start the trail
        </button>
      </div>
    </>
  );
}
