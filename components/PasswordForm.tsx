"use client";

import { useActionState, useState } from "react";
import { updatePassword, type PwState } from "@/app/account/password/actions";
import NewPasswordFields from "./NewPasswordFields";

export default function PasswordForm({ email }: { email?: string }) {
  const [state, action, pending] = useActionState<PwState, FormData>(updatePassword, undefined);
  const [valid, setValid] = useState(false);
  return (
    <div className="auth-card">
      <h1 className="auth-title">Set a new password</h1>
      <p className="auth-lead">Choose a strong password you don&rsquo;t use anywhere else.</p>
      {state?.error && <p className="auth-alert" role="alert">{state.error}</p>}
      <form action={action} className="auth-form">
        <NewPasswordFields email={email} label="New password" onValidChange={setValid} />
        <button type="submit" className="btn btn-solid auth-submit" disabled={pending || !valid}>{pending ? "Saving…" : "Save password"}</button>
      </form>
    </div>
  );
}
