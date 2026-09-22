import { PickScreen } from "./PickScreen";
import { D } from "../data/questionnaire";

interface ChooseHeroProps {
  guideName: string;
  selected: number | null;
  onSelect: (i: number) => void;
  onBack: () => void;
  onAdvance: () => void;
}

/** Exactly 2 characters: Sam (turtle), Mickey (hamster). */
export function ChooseHero({ guideName, selected, onSelect, onBack, onAdvance }: ChooseHeroProps) {
  return (
    <PickScreen
      kind="hero"
      title="Choose your character"
      subtitle={`This one stands in for you. Every question from here is really about you. ${guideName} is waiting to meet them.`}
      items={D.chars}
      selected={selected}
      onSelect={onSelect}
      onBack={onBack}
      onAdvance={onAdvance}
    />
  );
}
