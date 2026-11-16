"use client";

import { useActionState } from "react";
import { saveAddress, saveProfile, type FormState } from "@/app/account/actions";
import { DISTRICTS } from "@/lib/products";

export function ProfileForm({ name, phone, email }: { name: string; phone: string; email?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProfile, undefined);
  const v = state?.fields ?? { name, phone };
  return (
    <form action={action} className="acc-form">
      {state?.error && <p className="auth-alert" role="alert">{state.error}</p>}
      <div className="co-field">
        <label htmlFor="pf-name">Full name</label>
        <input id="pf-name" name="name" autoComplete="name" defaultValue={v.name} required minLength={2} maxLength={120} />
      </div>
      <div className="co-field">
        <label htmlFor="pf-phone">Mobile number <small>Used for delivery updates</small></label>
        <input id="pf-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="077 123 4567" defaultValue={v.phone} maxLength={20} />
      </div>
      <div className="co-field">
        <label htmlFor="pf-email">Email <small>Your sign-in email can&rsquo;t be changed here</small></label>
        <input id="pf-email" type="email" value={email ?? ""} readOnly disabled />
      </div>
      <div className="acc-form-actions">
        <button type="submit" className="btn btn-solid" disabled={pending}>{pending ? "Saving…" : "Save profile"}</button>
      </div>
    </form>
  );
}

type Addr = { address: string; city: string; district: string; postcode: string };

export function AddressForm(initial: Addr) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveAddress, undefined);
  const v = (state?.fields as Addr | undefined) ?? initial;
  return (
    <form action={action} className="acc-form">
      {state?.error && <p className="auth-alert" role="alert">{state.error}</p>}
      <div className="co-field">
        <label htmlFor="ad-address">Street address</label>
        <input id="ad-address" name="address" autoComplete="street-address" placeholder="House no., street, apartment" defaultValue={v.address} required maxLength={300} />
      </div>
      <div className="co-row co-row-3">
        <div className="co-field">
          <label htmlFor="ad-city">Town / city</label>
          <input id="ad-city" name="city" autoComplete="address-level2" defaultValue={v.city} required maxLength={80} />
        </div>
        <div className="co-field">
          <label htmlFor="ad-district">District</label>
          <select id="ad-district" name="district" defaultValue={v.district} required>
            <option value="">Choose…</option>
            {DISTRICTS.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
        </div>
        <div className="co-field">
          <label htmlFor="ad-postcode">Postcode <small>Optional</small></label>
          <input id="ad-postcode" name="postcode" inputMode="numeric" autoComplete="postal-code" defaultValue={v.postcode} maxLength={12} />
        </div>
      </div>
      <div className="acc-form-actions">
        <button type="submit" className="btn btn-solid" disabled={pending}>{pending ? "Saving…" : "Save address"}</button>
      </div>
    </form>
  );
}
