import { ScreenHead } from './ScreenHead';

interface ConsentProps {
  onBack: () => void;
  onAdvance: () => void;
}

export function Consent({ onBack, onAdvance }: ConsentProps) {
  return (
    <>
      <ScreenHead onBack={onBack} />
      <div className="screen-scroll">
        <h2 className="screen-title" style={{ textAlign: 'left' }}>Before we begin</h2>
        <p className="screen-sub" style={{ textAlign: 'left', marginInline: 0 }}>A short note about your information.</p>
        <div className="consent-list" style={{ marginTop: 16 }}>
          <li>About 5 minutes of gentle questions.</li>
          <li>Your answers shape your plan. They aren&rsquo;t a diagnosis.</li>
          <li>Only you see them, unless you share them with your clinician.</li>
          <li>Support is one tap away on every screen.</li>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={onAdvance}
          style={{ width: '100%', marginTop: 16 }}
        >
          I agree and continue
        </button>
        <button type="button" className="btn-quiet" style={{ margin: '8px auto 0', display: 'block' }}>
          Not now
        </button>
      </div>
    </>
  );
}
