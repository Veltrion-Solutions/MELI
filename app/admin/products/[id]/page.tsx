import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AdminBar from "@/components/admin/AdminBar";
import ProductEditor from "@/components/admin/ProductEditor";
import { getAdmin } from "@/lib/admin";
import { PRODUCT_COLUMNS, type ProductRow } from "@/lib/catalog";

export const metadata = { title: "Edit product - MELI Admin" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await getAdmin();
  if (!admin) redirect(`/login?next=/admin/products/${encodeURIComponent(id)}`);

  const { data } = await admin.supabase.from("products").select(PRODUCT_COLUMNS).eq("id", id).maybeSingle();
  if (!data) notFound();
  const product = data as ProductRow;

  return (
    <>
      <AdminBar email={admin.user.email} />
      <main className="admin-main">
        <Link href="/admin" className="admin-text-btn admin-back">← All products</Link>
        <div className="admin-head">
          <div>
            <h1>{product.name}</h1>
            <p className="admin-sub">Last updated {new Date(product.updated_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
          </div>
        </div>
        <ProductEditor product={product} />
      </main>
    </>
  );
}
