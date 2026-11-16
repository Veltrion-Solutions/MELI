import AccountShell from "@/components/AccountShell";
import { ProfileForm } from "@/components/AccountForms";
import { requireAccount } from "@/lib/account";

export const metadata = { title: "Profile - MELI" };

export default async function Page() {
  const { user, isAdmin, profile } = await requireAccount("/account/profile");
  return (
    <AccountShell
      active="profile"
      title="Profile"
      lead="Your name and mobile number are filled in for you at checkout."
      name={profile.name}
      email={user.email}
      isAdmin={isAdmin}
    >
      <div className="acc-card">
        <ProfileForm name={profile.name} phone={profile.phone} email={user.email} />
      </div>
    </AccountShell>
  );
}
