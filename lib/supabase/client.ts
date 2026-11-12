import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

/** Browser client; shares the signed-in session cookie with the server. */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}

export const PRODUCT_BUCKET = "product-images";
