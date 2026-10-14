import type { MetadataRoute } from "next";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/products", "/returns"].map((path) => ({
    url: `${site}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
