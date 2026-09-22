import type { ReactNode } from "react";

interface PhoneShellProps {
  children: ReactNode;
  pastelBg?: string;
  onRestart: () => void;
}

/** Rounded device-frame shell, reused proportions from the reference wireframe. */
export function PhoneShell({ children, pastelBg, onRestart }: PhoneShellProps) {
  return (
    <div className="phone-shell">
      <div className="phone">
        <div className="notch" aria-hidden="true" />
        <div className="phone-screen" style={pastelBg ? { background: pastelBg } : undefined}>
          <div className="statusbar" aria-hidden="true">
            <span>9:41</span>
            <span className="icons">●●●&nbsp;&nbsp;▂▄▆</span>
          </div>
          <div className="screens">
            <div className="screen-viewport">{children}</div>
          </div>
        </div>
      </div>
      <button type="button" className="restart-btn" onClick={onRestart}>
        Restart
      </button>
    </div>
  );
}
