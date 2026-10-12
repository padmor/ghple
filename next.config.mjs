/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Deliver AVIF/WebP where supported to reduce image transfer sizes.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "slmnzdpvbjesuwwqvcfi.supabase.co",
        pathname: "/storage/v1/object/public/site_content/**",
      },
    ],
  },
  async headers() {
    // Keep page HTML fresh after site content/UI updates. Optimised images
    // and Next's content-hashed static bundles retain their own caching.
    const freshPageHeaders = [
      {
        key: "Cache-Control",
        value: "no-store, no-cache, must-revalidate, max-age=0",
      },
    ];
    return [
      { source: "/", headers: freshPageHeaders },
      { source: "/about", headers: freshPageHeaders },
      { source: "/products", headers: freshPageHeaders },
      { source: "/trade", headers: freshPageHeaders },
      { source: "/manager", headers: freshPageHeaders },
      { source: "/manager/:path*", headers: freshPageHeaders },
    ];
  },
};

export default nextConfig;
