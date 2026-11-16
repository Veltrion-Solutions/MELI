import "server-only";
import { headers } from "next/headers";

/**
 * Simple fixed-window rate limiter kept in server memory.
 *
 * It stops password guessing, sign-up/reset-email spam and order flooding from one address.
 * Each server instance counts separately, so on a multi-instance host (e.g. several serverless
 * regions) swap the Map for a shared store such as Upstash Redis — the `rateLimit` API stays the same.
 */
type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();
const MAX_KEYS = 50_000;

function sweep(now: number) {
  for (const [k, b] of buckets) if (b.reset <= now) buckets.delete(k);
}

/** Returns true when allowed; false once `limit` hits within `windowMs` for this key. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > MAX_KEYS) sweep(now);
  const b = buckets.get(key);
  if (!b || b.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

/**
 * The visitor's IP address. Uses the first X-Forwarded-For hop, which the hosting
 * platform (Vercel, Netlify, a reverse proxy…) sets; falls back to X-Real-IP.
 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (fwd || h.get("x-real-ip") || "unknown").slice(0, 64);
}

const MIN = 60_000;

/** Limits per action. Each entry: [max attempts, window]. */
export const LIMITS = {
  loginIp: [20, 15 * MIN],
  loginEmail: [8, 15 * MIN],
  signupIp: [5, 60 * MIN],
  resetIp: [5, 60 * MIN],
  resetEmail: [3, 60 * MIN],
  orderUser: [10, 60 * MIN],
  orderIp: [20, 60 * MIN],
  profileUser: [20, 15 * MIN],
  passwordUser: [10, 15 * MIN],
} as const satisfies Record<string, readonly [number, number]>;

/** Checks every [key, limit] pair; all must pass. */
export async function allowed(...checks: [key: string, limit: readonly [number, number]][]): Promise<boolean> {
  let ok = true;
  // Count every bucket even after one fails, so attempts can't dodge a limit by order.
  for (const [key, [max, win]] of checks) ok = rateLimit(key, max, win) && ok;
  return ok;
}

export const TOO_MANY = "Too many attempts. Please wait a few minutes and try again.";
