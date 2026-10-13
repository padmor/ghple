const isDev = process.env.NODE_ENV !== "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Never ship readable source to the browser
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compiler: {
    removeConsole: !isDev,
  },

  images: {
    // While developing, serve images straight from /public instead of through
    // Next's image cache, so a replaced picture shows up immediately.
    unoptimized: isDev,
  },

  async headers() {
    // While developing, tell browsers (including the VS Code preview) never to
    // keep a copy of images, so you always see the latest file.
    const security = [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
    if (!isDev) return security;
    // (security headers are production-only so the VS Code preview can still embed the site)
    return [
      {
        source: "/:path*.(jpg|jpeg|png|webp|svg|gif|json)",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
