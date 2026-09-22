import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

interface ScreenHeadProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  /** An optional non-CTA control pinned to the header's right edge — e.g.
   * a quiet "Next" link for a screen that's split into sub-steps. */
  right?: ReactNode;
}

/** Back button + the current page's name, sharing one header band. The
 * Trail Map (winding path) is the app's only progress indicator — this
 * header no longer renders a linear progress bar. */
export function ScreenHead({ title, onBack, showBack = true, right }: ScreenHeadProps) {
  return (
    <div className="screen-head">
      <button
        type="button"
        className="back-btn"
        hidden={!showBack}
        aria-label="Back"
        onClick={onBack}
      >
        <ChevronLeft size={20} strokeWidth={2.25} />
      </button>
      {title && <span className="screen-head-title">{title}</span>}
      {right && <div className="screen-head-right">{right}</div>}
    </div>
  );
}
