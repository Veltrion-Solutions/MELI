import { ShopProvider } from "./ShopProvider";
import { getProducts } from "@/lib/catalog";

/** Server wrapper: loads the live catalogue and hands it to the client-side shop state. */
export default async function Shop({ children }: { children: React.ReactNode }) {
  const products = await getProducts();
  return <ShopProvider products={products}>{children}</ShopProvider>;
}
