import Link from "next/link";
import Shop from "./Shop";
import Header from "./Header";
import Footer from "./Footer";
import { logout } from "@/app/login/actions";

export type AccountSection = "overview" | "orders" | "profile" | "address" | "password";

export const ACCOUNT_NAV: { id: AccountSection; href: string; label: string; hint: string }[] = [
  { id: "overview", href: "/account", label: "Overview", hint: "Your account at a glance" },
  { id: "orders", href: "/account/orders", label: "My orders", hint: "Track and review your orders" },
  { id: "profile", href: "/account/profile", label: "Profile", hint: "Your name and mobile number" },
  { id: "address", href: "/account/address", label: "Delivery address", hint: "Saved for faster checkout" },
  { id: "password", href: "/account/password", label: "Password & security", hint: "Change your password" },
];

const ICONS: Record<AccountSection, React.ReactNode> = {
  overview: <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />,
  orders: <><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  address: <><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  password: <><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
};

export function AccountIcon({ id }: { id: AccountSection }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICONS[id]}
    </svg>
  );
}

type Props = {
  active: AccountSection;
  title: string;
  lead?: string;
  name: string;
  email?: string;
  isAdmin: boolean;
  children: React.ReactNode;
};

/** Shared frame for every account page: header, section menu and sign out. */
export default function AccountShell({ active, title, lead, name, email, isAdmin, children }: Props) {
  const initial = (name || email || "?").trim().charAt(0).toUpperCase();
  return (
    <Shop>
      <Header />
      <main className="section account">
        <div className="container acc-layout">
          <aside className="acc-side">
            <div className="acc-who">
              <span className="acc-avatar" aria-hidden>{initial}</span>
              <div>
                <p className="acc-who-name">{name || "My account"}</p>
                {email && <p className="acc-who-email">{email}</p>}
              </div>
            </div>
            <nav className="acc-nav" aria-label="My account">
              {ACCOUNT_NAV.map((n) => (
                <Link key={n.id} href={n.href} className="acc-nav-link" aria-current={n.id === active ? "page" : undefined}>
                  <AccountIcon id={n.id} />
                  <span>{n.label}</span>
                </Link>
              ))}
              {isAdmin && (
                <Link href="/admin" className="acc-nav-link acc-nav-admin">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" /></svg>
                  <span>Admin dashboard</span>
                </Link>
              )}
            </nav>
            <form action={logout} className="acc-logout">
              <button type="submit" className="acc-nav-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 16l-4-4 4-4" /><path d="M6 12h10" /></svg>
                <span>Sign out</span>
              </button>
            </form>
          </aside>

          <div className="acc-main">
            <div className="acc-head">
              <p className="eyebrow">My account</p>
              <h1>{title}</h1>
              {lead && <p className="acc-lead">{lead}</p>}
            </div>
            {children}
            <form action={logout} className="acc-logout-mobile">
              <button type="submit">Sign out</button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </Shop>
  );
}
