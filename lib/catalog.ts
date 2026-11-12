import "server-only";
import { createClient as createPublicClient } from "@supabase/supabase-js";
import { PRODUCTS, SIZES, type Category, type Colour, type Product, type Size } from "./products";
import { SUPABASE_KEY, SUPABASE_URL, supabaseReady } from "./supabase/config";

/** Row shape of public.products. */
export type ProductRow = {
  id: string;
  name: string;
  price: number;
  category: Category;
  badge: "New" | "Best seller" | null;
  image: string | null;
  hover_image: string | null;
  gallery: string[];
  description: string;
  details: string[];
  colours: Colour[];
  in_stock: string[];
  active: boolean;
  sort: number;
  updated_at: string;
};

export const PRODUCT_COLUMNS = "id,name,price,category,badge,image,hover_image,gallery,description,details,colours,in_stock,active,sort,updated_at";

export function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    price: r.price,
    category: r.category,
    badge: r.badge ?? undefined,
    image: r.image ?? undefined,
    hoverImage: r.hover_image ?? undefined,
    gallery: r.gallery?.length ? r.gallery : r.image ? [r.image] : [],
    description: r.description ?? "",
    details: r.details ?? [],
    colours: r.colours?.length ? r.colours : [{ name: "One colour", hex: "#e6e6e6" }],
    inStock: (r.in_stock ?? []).filter((s): s is Size => (SIZES as readonly string[]).includes(s)),
  };
}

/**
 * Products shown in the shop. Reads public.products when Supabase is connected;
 * otherwise (or if the read fails) uses the built-in list in lib/products.ts.
 * No cookies are read, so pages stay cacheable; admin saves call revalidatePath.
 */
export async function getProducts(): Promise<Product[]> {
  if (!supabaseReady) return PRODUCTS;
  try {
    const supabase = createPublicClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("active", true)
      .order("sort")
      .order("name");
    if (error || !data) throw error ?? new Error("No data");
    return (data as ProductRow[]).map(rowToProduct);
  } catch (e) {
    console.error("[catalog] Falling back to built-in products:", e);
    return PRODUCTS;
  }
}
