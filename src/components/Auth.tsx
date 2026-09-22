import { useState } from "react";
import {
  IconEye,
  IconEyeOff,
  IconFacebook,
  IconLinkedIn,
  IconGoogle,
} from "../icons/icons";

export interface AuthResult {
  fullname: string;
  email: string;
}

interface AuthProps {
  authMode: "signin" | "signup";
  onToggleMode: () => void;
  onSignUpSuccess: (result: AuthResult) => void;
}

/** Auth screen. Only Sign Up is functional. Sign In's submit, Forgot password,
 * social icons, and "Skip now" are all present but inert — hard product rule:
 * no real skip out of onboarding is ever possible from here. */
export function Auth({ authMode, onToggleMode, onSignUpSuccess }: AuthProps) {
  const isUp = authMode === "signup";
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [err, setErr] = useState("");

  function handleSubmit() {
    if (authMode === "signin") {
      setErr("Sign In isn't available in this preview yet.");
      return;
    }
    setErr("");
    onSignUpSuccess({ fullname: fullname.trim(), email: email.trim() });
  }

  return (
    <>
      <div className="screen-head">
        <button type="button" className="back-btn" hidden aria-label="Back" />
      </div>
      <div className="screen-scroll auth2">
        <h2 className="auth-title">{isUp ? "Sign Up" : "Sign In"}</h2>
        <p className="auth-sub">{isUp ? "First, create your account." : "Enter your email and password."}</p>

        <div className="line-fields">
          {isUp && (
            <div className="line-field">
              <input
                type="text"
                placeholder="Full name"
                value={fullname}
                autoComplete="off"
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>
          )}
          <div className="line-field">
            <input
              type="email"
              placeholder="Email"
              value={email}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={"line-field" + (isUp ? " with-icon" : "")}>
            <input
              type={isUp ? (showPass ? "text" : "password") : "password"}
              placeholder="Password"
              value={password}
              autoComplete="off"
              onChange={(e) => setPassword(e.target.value)}
            />
            {isUp && (
              <button
                type="button"
                className="eye-btn"
                aria-label={showPass ? "Hide password" : "Show password"}
                onClick={() => setShowPass((v) => !v)}
              >
                {showPass ? <IconEyeOff /> : <IconEye />}
              </button>
            )}
            {!isUp && (
              <button
                type="button"
                className="inline-link"
                onClick={() => setErr("Not available in this preview.")}
              >
                Forgot password?
              </button>
            )}
          </div>
          {isUp && (
            <div className="line-field with-icon">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirm}
                autoComplete="off"
                onChange={(e) => setConfirm(e.target.value)}
              />
              <button
                type="button"
                className="eye-btn"
                aria-label={showConfirm ? "Hide password" : "Show password"}
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          )}
        </div>

        <p className="field err">{err}</p>

        <button type="button" className="btn-ink" onClick={handleSubmit}>
          {isUp ? "Sign Up" : "Login"}
        </button>

        <p className="auth-toggle">
          {isUp ? "Already have an account? " : "Don't have an account? "}
          <button type="button" className="link-accent" onClick={onToggleMode}>
            {isUp ? "Login" : "Sign up"}
          </button>
        </p>

        {!isUp && (
          <>
            <p className="divider-line">Sign in with</p>
            <div className="social-circles">
              <button
                type="button"
                className="circle-btn"
                aria-label="Continue with Facebook"
                onClick={() => setErr("Coming soon.")}
              >
                <IconFacebook />
              </button>
              <button
                type="button"
                className="circle-btn"
                aria-label="Continue with LinkedIn"
                onClick={() => setErr("Coming soon.")}
              >
                <IconLinkedIn />
              </button>
              <button
                type="button"
                className="circle-btn"
                aria-label="Continue with Google"
                onClick={() => setErr("Coming soon.")}
              >
                <IconGoogle />
              </button>
            </div>
          </>
        )}

        <button
          type="button"
          className="skip-link"
          onClick={() =>
            setErr("Skip isn't available in this preview — Sign Up is the only working path.")
          }
        >
          Skip now &rarr;
        </button>
      </div>
    </>
  );
}
