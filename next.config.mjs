const isDev = process.env.NODE_ENV !== "production";

// This project's Supabase address (auth, database, photo storage). Only it may be contacted from the browser.
let supabaseOrigin = "";
let supabaseHost = "";
try {
  const u = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  supabaseOrigin = u.origin;
  supabaseHost = u.hostname;
} catch { /* not configured yet */ }

/**
 * Content Security Policy: the browser only runs scripts, loads images and sends data to the
 * places listed here, which blocks most injected-script (XSS) attacks and data theft.
 * Next.js needs 'unsafe-inline' for its own bootstrapping scripts; 'unsafe-eval' and the
 * websocket are only allowed in development (hot reload).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${supabaseOrigin ? ` ${supabaseOrigin}` : ""}`,
  "font-src 'self' data:",
  `connect-src 'self'${supabaseOrigin ? ` ${supabaseOrigin} wss://${supabaseHost}` : ""}${isDev ? " ws: http://localhost:*" : ""}`,
  "media-src 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "manifest-src 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Never let another site show MELI inside a frame (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Don't let browsers guess file types (stops uploaded files being run as scripts).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send only the site name, not full page addresses, to other sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Turn off browser features the shop never uses.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Always use HTTPS once a visitor has seen the live site (ignored on localhost / plain http).
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  // Don't advertise the framework in every response.
  poweredByHeader: false,
  images: {
    // Allow a higher-quality render than the default (75) for the fashion photography.
    qualities: [75, 90],
    // Product photos uploaded from the admin dashboard — only from this project's Supabase bucket.
    remotePatterns: [
      { protocol: "https", hostname: supabaseHost || "*.supabase.co", pathname: "/storage/v1/object/public/product-images/**" },
    ],
  },
  experimental: {
    serverActions: {
      // Forms post at most a few KB; reject anything large outright.
      bodySizeLimit: "256kb",
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Signed-in pages and order details must never be stored by shared caches or the back/forward cache of others.
      ...["/account/:path*", "/orders/:path*", "/checkout", "/admin/:path*", "/login"].map((source) => ({
        source,
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      })),
    ];
  },
};
export default nextConfig;
