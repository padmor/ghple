const isDev = process.env.NODE_ENV !== "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Never ship readable source to the browser
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compiler: {
    removeConsole: isDev ? false : { exclude: ["error", "warn"] },
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
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=(), usb=(), interest-cohort=()" },
          // Always use HTTPS (two years), including subdomains
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // Only this site's own code may run or load, and nothing may frame the site.
          // 'unsafe-inline' is needed by Next.js's own bootstrap scripts and styles.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-src https://www.google.com", // the map on the Locations section
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
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
