import "server-only";
import { headers } from "next/headers";

/**
 * Only allow redirects back into this site: a single leading "/" followed by a normal path.
 * Rejects "//evil.com", "/\evil.com" (browsers treat "\" like "/"), "/%5Cevil.com",
 * control characters and anything over 512 characters.
 */
export function safePath(n: string | null | undefined, fallback = "/account"): string {
  if (!n || n.length > 512) return fallback;
  let decoded = n;
  try { decoded = decodeURIComponent(n); } catch { return fallback; }
  for (const s of [n, decoded]) {
    if (!s.startsWith("/") || s.startsWith("//") || s.includes("\\") || /[\u0000-\u001f\u007f]/.test(s)) return fallback;
  }
  return n;
}

/**
 * The shop's public address, for links in emails. Uses NEXT_PUBLIC_SITE_URL, never the
 * request's Host/Origin headers in production — those can be forged to send people to
 * a look-alike site from a genuine MELI email.
 */
export async function siteUrl(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (env) return env;
  if (process.env.NODE_ENV === "production") {
    console.error("[site] NEXT_PUBLIC_SITE_URL is not set; email links will be wrong.");
    return "";
  }
  const h = await headers();
  return `http://${h.get("host") ?? "localhost:3000"}`;
}
