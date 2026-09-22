import { IconBack } from "../icons/icons";

interface ScreenHeadProps {
  onBack?: () => void;
  showBack?: boolean;
}

/** Back button. The Trail Map (winding path) is the app's only progress
 * indicator — this header no longer renders a linear progress bar. */
export function ScreenHead({ onBack, showBack = true }: ScreenHeadProps) {
  return (
    <div className="screen-head">
      <button
        type="button"
        className="back-btn"
        hidden={!showBack}
        aria-label="Back"
        onClick={onBack}
      >
        <IconBack />
      </button>
    </div>
  );
}
