import { ScreenHead } from "./ScreenHead";
import { CHARACTER_PORTRAIT } from "../assets/characters";

interface PickItem {
  name: string;
  trait: string;
}

interface PickScreenProps {
  kind: "guide" | "hero";
  title: string;
  subtitle: string;
  items: PickItem[];
  selected: number | null;
  onSelect: (i: number) => void;
  onBack: () => void;
  onAdvance: () => void;
}

/** Shared card-grid picker used by both ChooseGuide and ChooseHero — exactly 2
 * cards each, guide chosen before hero. */
export function PickScreen({
  title,
  subtitle,
  items,
  selected,
  onSelect,
  onBack,
  onAdvance,
}: PickScreenProps) {
  return (
    <>
      <ScreenHead onBack={onBack} />
      <div className="screen-scroll">
        <h2 className="screen-title" style={{ textAlign: "left" }}>{title}</h2>
        <p className="screen-sub" style={{ textAlign: "left", marginInline: 0, maxWidth: "none" }}>
          {subtitle}
        </p>
        <div className="pick-grid" style={{ marginTop: 14 }}>
          {items.map((item, i) => {
            const portrait = CHARACTER_PORTRAIT[item.name];
            const on = selected === i;
            return (
              <button
                key={item.name}
                type="button"
                className={"pick" + (on ? " on" : "")}
                onClick={() => onSelect(i)}
              >
                <span className="pick-ic pick-ic-photo">
                  {portrait && <img src={portrait} alt="" />}
                </span>
                <span className="pick-name">{item.name}</span>
                <span className="pick-trait">{item.trait}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="btn-primary"
          disabled={selected == null}
          style={{ width: "100%", marginTop: 16 }}
          onClick={onAdvance}
        >
          Continue
        </button>
      </div>
    </>
  );
}
