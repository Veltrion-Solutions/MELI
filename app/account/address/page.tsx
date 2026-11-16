import AccountShell from "@/components/AccountShell";
import { AddressForm } from "@/components/AccountForms";
import { hasAddress, requireAccount } from "@/lib/account";
import { removeAddress } from "@/app/account/actions";

export const metadata = { title: "Delivery address - MELI" };

export default async function Page() {
  const { user, isAdmin, profile: p } = await requireAccount("/account/address");
  const saved = hasAddress(p);
  return (
    <AccountShell
      active="address"
      title="Delivery address"
      lead="Save where you'd like your orders delivered and we'll fill it in for you at checkout. You can still change it for any order."
      name={p.name}
      email={user.email}
      isAdmin={isAdmin}
    >
      {saved && (
        <div className="acc-card acc-addr-saved">
          <div>
            <p className="acc-label">Saved address</p>
            <p className="acc-addr">{p.name && <>{p.name}<br /></>}{p.address}, {p.city}<br />{p.district}{p.postcode && ` ${p.postcode}`}{p.phone && <><br />{p.phone}</>}</p>
          </div>
          <form action={removeAddress}>
            <button type="submit" className="auth-link">Remove</button>
          </form>
        </div>
      )}
      <div className="acc-card">
        <p className="acc-label">{saved ? "Edit address" : "Add an address"}</p>
        <AddressForm address={p.address} city={p.city} district={p.district} postcode={p.postcode} />
      </div>
    </AccountShell>
  );
}
