const isDev = process.env.NODE_ENV !== "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    // While developing, serve images straight from /public instead of through
    // Next's image cache, so a replaced picture shows up immediately.
    unoptimized: isDev,
  },

  async headers() {
    // While developing, tell browsers (including the VS Code preview) never to
    // keep a copy of images, so you always see the latest file.
    if (!isDev) return [];
    return [
      {
        source: "/:path*.(jpg|jpeg|png|webp|svg|gif|json)",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
