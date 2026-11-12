"use client";

import { useActionState } from "react";
import { updatePassword, type PwState } from "@/app/account/password/actions";

export default function PasswordForm() {
  const [state, action, pending] = useActionState<PwState, FormData>(updatePassword, undefined);
  return (
    <div className="auth-card">
      <h1 className="auth-title">Set a new password</h1>
      <p className="auth-lead">Choose a password with at least 8 characters.</p>
      {state?.error && <p className="auth-alert" role="alert">{state.error}</p>}
      <form action={action} className="auth-form">
        <label className="auth-field"><span>New password</span><input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
        <label className="auth-field"><span>Confirm password</span><input name="confirm" type="password" autoComplete="new-password" minLength={8} required /></label>
        <button type="submit" className="btn btn-solid auth-submit" disabled={pending}>{pending ? "Saving…" : "Save password"}</button>
      </form>
    </div>
  );
}
