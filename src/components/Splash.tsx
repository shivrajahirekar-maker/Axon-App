interface SplashProps {
  onAdvance: () => void;
}

export function Splash({ onAdvance }: SplashProps) {
  return (
    <div
      className="center-col"
      onClick={onAdvance}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onAdvance();
      }}
    >
      <div className="app-logo">A</div>
      <div className="app-title">AXON_APP</div>
      <div className="app-tagline">Every trail begins with a single step.</div>
      <div className="splash-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="tap-hint">Tap anywhere to continue</div>
    </div>
  );
}
