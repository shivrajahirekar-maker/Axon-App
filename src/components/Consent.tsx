import { ScreenHead } from './ScreenHead';
import { Check } from 'lucide-react';

interface ConsentProps {
  onBack: () => void;
  onAdvance: () => void;
}

export function Consent({ onBack, onAdvance }: ConsentProps) {
  return (
    <>
      <ScreenHead title="Consent" onBack={onBack} />
      <div className="screen-scroll">
        <h2 className="screen-title" style={{ textAlign: 'left' }}>Before we begin</h2>
        <p className="screen-sub" style={{ textAlign: 'left', marginInline: 0 }}>A short note about your information.</p>
        <ul className="consent-list" style={{ marginTop: 16 }}>
          <li>
            <Check size={14} strokeWidth={3} />
            About 5 minutes of gentle questions.
          </li>
          <li>
            <Check size={14} strokeWidth={3} />
            Your answers shape your plan. They aren&rsquo;t a diagnosis.
          </li>
          <li>
            <Check size={14} strokeWidth={3} />
            Only you see them, unless you share them with your clinician.
          </li>
          <li>
            <Check size={14} strokeWidth={3} />
            Support is one tap away on every screen.
          </li>
        </ul>
        <div className="screen-footer">
          <button type="button" className="btn-primary" onClick={onAdvance}>
            I agree and continue
          </button>
          <button type="button" className="btn-quiet">
            Not now
          </button>
        </div>
      </div>
    </>
  );
}
