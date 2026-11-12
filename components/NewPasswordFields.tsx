"use client";

import { useEffect, useState } from "react";
import { PASSWORD_MAX, PASSWORD_RULES, STRENGTH_LABELS, passwordProblem, passwordScore } from "@/lib/password";

type Props = {
  /** Used to warn when the password contains the email name. */
  email?: string;
  label?: string;
  /** Reports whether both fields are valid, so the form can enable its submit button. */
  onValidChange?: (valid: boolean) => void;
};

/** "New password" + "Confirm password" with a live rules checklist and strength bar. */
export default function NewPasswordFields({ email, label = "Password", onValidChange }: Props) {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);

  const problem = pw ? passwordProblem(pw, email) : null;
  const score = passwordScore(pw);
  const matches = confirm.length > 0 && confirm === pw;
  const mismatch = touchedConfirm && confirm.length > 0 && !matches;

  // Re-check whenever either field or the email changes.
  const valid = !passwordProblem(pw, email) && pw === confirm;
  useEffect(() => { onValidChange?.(valid); }, [valid, onValidChange]);

  return (
    <>
      <label className="auth-field">
        <span>{label}</span>
        <span className="auth-pw">
          <input
            name="password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            required
            maxLength={PASSWORD_MAX}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            aria-describedby="pw-rules"
            aria-invalid={Boolean(pw && problem) || undefined}
          />
          <button type="button" className="auth-show" aria-pressed={show} onClick={() => setShow((s) => !s)}>{show ? "Hide" : "Show"}</button>
        </span>
      </label>

      <div className="pw-meter" aria-hidden={!pw}>
        <div className={`pw-bar s${score}`}><span /><span /><span /><span /></div>
        <span className="pw-strength">{pw ? STRENGTH_LABELS[score] : ""}</span>
      </div>

      <ul id="pw-rules" className="pw-rules" aria-live="polite">
        {PASSWORD_RULES.map((r) => {
          const ok = r.test(pw);
          return (
            <li key={r.id} className={ok ? "ok" : undefined}>
              <span aria-hidden>{ok ? "✓" : "•"}</span>
              {r.label}<span className="sr-only">{ok ? " — done" : " — missing"}</span>
            </li>
          );
        })}
      </ul>
      {pw && problem && PASSWORD_RULES.every((r) => r.test(pw)) && <p className="pw-extra" role="alert">{problem}</p>}

      <label className="auth-field">
        <span>Confirm password</span>
        <input
          name="confirm"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          required
          maxLength={PASSWORD_MAX}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={() => setTouchedConfirm(true)}
          aria-invalid={mismatch || undefined}
          aria-describedby="pw-match"
        />
        <small id="pw-match" className={mismatch ? "pw-bad" : matches ? "pw-good" : undefined} aria-live="polite">
          {mismatch ? "Passwords don't match." : matches ? "Passwords match ✓" : ""}
        </small>
      </label>
    </>
  );
}
