/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: {
    // Allow a higher-quality render than the default (75) for the fashion photography.
    qualities: [75, 90],
    // Product photos uploaded from the admin dashboard live in Supabase Storage.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/product-images/**" },
    ],
  },
};
export default nextConfig;
