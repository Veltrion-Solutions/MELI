import Link from "next/link";
import { redirect } from "next/navigation";
import AdminBar from "@/components/admin/AdminBar";
import ProductEditor from "@/components/admin/ProductEditor";
import { getAdmin } from "@/lib/admin";

export const metadata = { title: "Add product - MELI Admin" };

export default async function Page() {
  const admin = await getAdmin();
  if (!admin) redirect("/login?next=/admin/products/new");

  return (
    <>
      <AdminBar email={admin.user.email} />
      <main className="admin-main">
        <Link href="/admin" className="admin-text-btn admin-back">← All products</Link>
        <div className="admin-head">
          <div>
            <h1>Add product</h1>
            <p className="admin-sub">New dresses and tops appear in the shop as soon as you add them, unless you untick &ldquo;Show in shop&rdquo;.</p>
          </div>
        </div>
        <ProductEditor />
      </main>
    </>
  );
}
