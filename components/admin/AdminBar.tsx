import Link from "next/link";
import { adminLogout } from "@/app/admin/actions";

export default function AdminBar({ email }: { email?: string }) {
  return (
    <header className="admin-bar">
      <Link href="/admin" className="admin-brand">MELI <span>Admin</span></Link>
      <nav className="admin-nav">
        <Link href="/" target="_blank">View shop ↗</Link>
        {email && <span className="admin-who">{email}</span>}
        {email && (
          <form action={adminLogout}>
            <button type="submit" className="admin-text-btn">Sign out</button>
          </form>
        )}
      </nav>
    </header>
  );
}
