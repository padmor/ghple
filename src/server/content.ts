import { query } from "@/server/db";
import { toFounder, toProduct, toSettings } from "@/server/mappers";
import type { CEOInfo, Product, SiteSettings } from "@/data/defaults";

export interface StoreContent {
  products: Product[];
  settings: SiteSettings;
  founder: CEOInfo;
}

/**
 * Products, contact details and founder profile for the storefront, read on the
 * server so the page arrives with them already filled in. Returns null when there
 * is no database (or it is unreachable), and the site falls back to its built-in content.
 */
export async function getStoreContent(): Promise<StoreContent | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const [products, settings, founder] = await Promise.all([
      query("select * from products order by sort, created_at"),
      query("select * from settings where id = 1"),
      query("select * from founder where id = 1"),
    ]);
    if (!settings[0] || !founder[0] || products.length === 0) return null;
    return { products: products.map(toProduct), settings: toSettings(settings[0]), founder: toFounder(founder[0]) };
  } catch {
    return null;
  }
}
