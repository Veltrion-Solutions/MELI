import Link from "next/link";
import { redirect } from "next/navigation";
import AdminBar from "@/components/admin/AdminBar";
import PriceCell from "@/components/admin/PriceCell";
import Photo from "@/components/Photo";
import { getAdmin } from "@/lib/admin";
import { PRODUCT_COLUMNS, type ProductRow } from "@/lib/catalog";

export const metadata = { title: "Products - MELI Admin" };

export default async function Page() {
  const admin = await getAdmin();
  if (!admin) redirect("/login?next=/admin");

  const { data, error } = await admin.supabase.from("products").select(PRODUCT_COLUMNS).order("sort").order("name");
  const rows = (data ?? []) as ProductRow[];

  return (
    <>
      <AdminBar email={admin.user.email} />
      <main className="admin-main">
        <div className="admin-head">
          <div>
            <h1>Products</h1>
            <p className="admin-sub">{rows.length} products · {rows.filter((r) => r.active).length} visible in the shop</p>
          </div>
        </div>

        {error && <p className="auth-alert" role="alert">Couldn&rsquo;t load products. Has the database migration been run?</p>}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Category</th>
                <th scope="col">Sizes in stock</th>
                <th scope="col">Status</th>
                <th scope="col">Price (Rs)</th>
                <th scope="col"><span className="sr-only">Edit</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={r.active ? undefined : "is-hidden"}>
                  <th scope="row">
                    <div className="admin-product">
                      <div className="admin-thumb"><Photo src={r.image ?? undefined} alt="" sizes="48px" /></div>
                      <div>
                        <p className="admin-name">{r.name}</p>
                        {r.badge && <p className="admin-badge">{r.badge}</p>}
                      </div>
                    </div>
                  </th>
                  <td className="admin-cap">{r.category}</td>
                  <td>{r.in_stock.length ? r.in_stock.join(", ") : <span className="admin-warn">Sold out</span>}</td>
                  <td>{r.active ? <span className="admin-pill on">Visible</span> : <span className="admin-pill">Hidden</span>}</td>
                  <td><PriceCell id={r.id} price={r.price} name={r.name} /></td>
                  <td><Link href={`/admin/products/${r.id}`} className="admin-text-btn">Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
