import { useState } from 'react';
import { ScreenHead } from './ScreenHead';

interface NameScreenProps {
  name: string;
  onBack: () => void;
  onAdvance: (name: string) => void;
}

export function NameScreen({ name, onBack, onAdvance }: NameScreenProps) {
  const [val, setVal] = useState(name);
  return (
    <>
      <ScreenHead onBack={onBack} />
      <div className="center-col">
        <h2 className="screen-title">What should we call you?</h2>
        <p className="screen-sub">Just a first name is fine.</p>
        <div className="field" style={{ marginTop: 6 }}>
          <input
            type="text"
            placeholder="Your name"
            value={val}
            autoComplete="given-name"
            onChange={(e) => setVal(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn-primary"
          disabled={!val.trim()}
          onClick={() => onAdvance(val.trim())}
          style={{ marginTop: 6 }}
        >
          Continue
        </button>
      </div>
    </>
  );
}
