/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: {
    // Allow a higher-quality render than the default (75) for the fashion photography.
    qualities: [75, 90],
  },
};
export default nextConfig;
