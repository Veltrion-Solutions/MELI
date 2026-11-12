"use client";

import { useActionState, useState } from "react";
import { forgotPassword, login, signup, type AuthState } from "@/app/login/actions";
import NewPasswordFields from "./NewPasswordFields";

type Mode = "login" | "signup" | "forgot";

const COPY: Record<Mode, { title: string; lead: string; submit: string; busy: string }> = {
  login: { title: "Welcome back", lead: "Sign in to see your orders and check out faster.", submit: "Sign in", busy: "Signing in…" },
  signup: { title: "Create account", lead: "Join MELI for faster checkout and early access to new drops.", submit: "Create account", busy: "Creating account…" },
  forgot: { title: "Reset password", lead: "Enter your email and we'll send you a link to set a new password.", submit: "Send reset link", busy: "Sending…" },
};

type Props = { initialMode: "login" | "signup"; next: string; linkError: boolean; ready: boolean; notice?: string };

export default function AuthForm({ initialMode, next, linkError, ready, notice }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  // Remount the form per mode so each keeps its own result message.
  return <ModeForm key={mode} mode={mode} setMode={setMode} next={next} linkError={linkError} ready={ready} notice={notice} />;
}

function ModeForm({ mode, setMode, next, linkError, ready, notice }: { mode: Mode; setMode: (m: Mode) => void; next: string; linkError: boolean; ready: boolean; notice?: string }) {
  const action = mode === "login" ? login : mode === "signup" ? signup : forgotPassword;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, undefined);
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState(state?.email ?? "");
  const [pwValid, setPwValid] = useState(false);
  const c = COPY[mode];
  const sent = Boolean(state?.message);

  return (
    <div className="auth-card">
      {mode !== "forgot" && (
        <div className="auth-tabs" role="tablist" aria-label="Account">
          <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => setMode("login")}>Sign in</button>
          <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => setMode("signup")}>Create account</button>
        </div>
      )}

      <h1 className="auth-title">{c.title}</h1>
      <p className="auth-lead">{c.lead}</p>

      {notice && !state && mode !== "forgot" && <p className="auth-notice" role="status">{notice}</p>}
      {!ready && <p className="auth-alert" role="status">Customer accounts aren&rsquo;t connected yet. Add the Supabase keys to <code>.env.local</code> to turn them on.</p>}
      {linkError && mode === "login" && !state && <p className="auth-alert" role="alert">That link has expired or was already used. Please sign in, or request a new link.</p>}
      {state?.error && <p className="auth-alert" role="alert">{state.error}</p>}

      {sent ? (
        <div className="auth-sent" role="status">
          <p className="auth-sent-title">Check your email</p>
          <p>{state!.message}</p>
          <button type="button" className="auth-link" onClick={() => setMode("login")}>Back to sign in</button>
        </div>
      ) : (
        <form action={formAction} className="auth-form">
          <input type="hidden" name="next" value={next} />
          {mode === "signup" && (
            <label className="auth-field">
              <span>Full name</span>
              <input name="name" type="text" autoComplete="name" required maxLength={80} defaultValue={state?.name} />
            </label>
          )}
          <label className="auth-field">
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" required defaultValue={state?.email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {mode === "signup" && <NewPasswordFields email={email} onValidChange={setPwValid} />}
          {mode === "login" && (
            <label className="auth-field">
              <span className="auth-field-row">
                Password
                <button type="button" className="auth-link" onClick={() => setMode("forgot")}>Forgot password?</button>
              </span>
              <span className="auth-pw">
                <input name="password" type={showPw ? "text" : "password"} autoComplete="current-password" required />
                <button type="button" className="auth-show" aria-pressed={showPw} onClick={() => setShowPw((s) => !s)}>{showPw ? "Hide" : "Show"}</button>
              </span>
            </label>
          )}
          <button type="submit" className="btn btn-solid auth-submit" disabled={pending || !ready || (mode === "signup" && !pwValid)}>{pending ? c.busy : c.submit}</button>
          {mode === "forgot" && <button type="button" className="auth-link auth-back" onClick={() => setMode("login")}>Back to sign in</button>}
        </form>
      )}
    </div>
  );
}
