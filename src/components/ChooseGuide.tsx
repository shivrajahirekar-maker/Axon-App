import { PickScreen } from "./PickScreen";
import { D } from "../data/questionnaire";

interface ChooseGuideProps {
  selected: number | null;
  onSelect: (i: number) => void;
  onBack: () => void;
  onAdvance: () => void;
}

/** Guide is chosen BEFORE character, per product rule. Exactly 2 guides: Kitty, Doggo. */
export function ChooseGuide({ selected, onSelect, onBack, onAdvance }: ChooseGuideProps) {
  return (
    <PickScreen
      kind="guide"
      title="Choose your guide"
      subtitle="Someone to walk beside you and check in gently along the way."
      items={D.guides}
      selected={selected}
      onSelect={onSelect}
      onBack={onBack}
      onAdvance={onAdvance}
    />
  );
}
