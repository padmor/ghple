// ─────────────────────────────────────────────
// src/data/defaults.ts
// Single source of truth for all site content.
// Manager panel reads and writes from this via ManagerContext.
// ─────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  size: string;
  volumeMl: number;
  price: number;
  badge?: string;
  image?: string;
  inStock: boolean;
  description: string;
}

export interface Benefit {
  id: string;
  icon: string;   // lucide icon name as string
  title: string;
  description: string;
}

export interface ProcessStep {
  id: string;
  number: number;
  title: string;
  description: string;
}

export interface TradeTier {
  id: string;
  size: string;
  minOrder: number;
  bulkPrice: number;
}

export interface CEOInfo {
  name: string;
  title: string;
  bio: string;
  quote: string;
  photoPath: string;
}

export interface SiteSettings {
  tradeEmail: string;
  deliveryZones: string[];
  whatsappNumber: string;
  phone: string;
  address: string;
}

// ── Products ──────────────────────────────────
export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "500ml",
    name: "Gid's Apple Cider Vinegar",
    size: "500 ml",
    volumeMl: 500,
    price: 105,
    badge: "Most Popular",
    image: "/products/bottle-500ml.jpg",
    inStock: true,
    description:
      "Raw, unfiltered apple cider vinegar with the mother culture. Cold-pressed and handcrafted in Cape Coast, Ghana.",
  },
  {
    id: "1000ml",
    name: "Gid's Apple Cider Vinegar",
    size: "1000 ml",
    volumeMl: 1000,
    price: 170,
    badge: "Best Value",
    image: "/products/bottle-1000ml.jpg",
    inStock: true,
    description:
      "Family size. Ideal for daily cooking and wellness routines. Same premium quality, more for your money.",
  },
];

// ── Benefits ──────────────────────────────────
export const DEFAULT_BENEFITS: Benefit[] = [
  {
    id: "b1",
    icon: "Leaf",
    title: "100% Natural",
    description:
      "No artificial additives, preservatives, or colouring. What you see is what it is.",
  },
  {
    id: "b2",
    icon: "FlaskConical",
    title: "With The Mother",
    description:
      "Contains live cultures and enzymes — the sign of a raw, unfiltered, quality vinegar.",
  },
  {
    id: "b3",
    icon: "ShieldCheck",
    title: "Quality Tested",
    description:
      "Every batch is tested for acidity, purity and clarity before it leaves our facility.",
  },
  {
    id: "b4",
    icon: "Flame",
    title: "Versatile in the Kitchen",
    description:
      "Use it in salad dressings, marinades, sauces or as a daily health tonic.",
  },
  {
    id: "b5",
    icon: "MapPin",
    title: "Made in Ghana",
    description:
      "Proudly produced in Cape Coast by Gid's Beverages & Health Products Ltd.",
  },
  {
    id: "b6",
    icon: "Timer",
    title: "18-Month Shelf Life",
    description:
      "Naturally stable. Store in a cool, dry place. No refrigeration required.",
  },
];

// ── Production Process ────────────────────────
export const DEFAULT_PROCESS_STEPS: ProcessStep[] = [
  {
    id: "s1",
    number: 1,
    title: "Source Harvesting",
    description:
      "The production process starts with sourcing the fruit selected for Gid's cider.",
  },
  {
    id: "s2",
    number: 2,
    title: "Cold Press Extraction",
    description:
      "The apples are pressed to extract their juice before fermentation begins.",
  },
  {
    id: "s3",
    number: 3,
    title: "Oak Barrel Fermentation",
    description:
      "The juice goes through two fermentation stages, developing the cider's acidity and natural mother culture.",
  },
  {
    id: "s4",
    number: 4,
    title: "Mature Cider Bottling",
    description:
      "After maturation and quality checks, the cider is bottled unfiltered and prepared for customers.",
  }
];

// ── CEO / Founder ─────────────────────────────
export const DEFAULT_CEO: CEOInfo = {
  name: "Gideon Hanson",
  title: "Founder & CEO, GBHPL",
  bio: "Gideon founded Gid's Beverages & Health Products Ltd with one goal: to produce the highest-quality, naturally-made health beverages in Ghana. Starting in a small facility in Cape Coast, he has grown the brand through an unwavering commitment to quality and transparency.",
  quote:
    "We don't cut corners. Every bottle carries our name, and that means something to us.",
  photoPath: "https://slmnzdpvbjesuwwqvcfi.supabase.co/storage/v1/object/public/site_content/Screenshot%202025-12-04%20012847.png",
};

// ── Trade Tiers ───────────────────────────────
export const DEFAULT_TRADE_TIERS: TradeTier[] = [
  { id: "t1", size: "500 ml", minOrder: 50, bulkPrice: 88 },
  { id: "t2", size: "1000 ml", minOrder: 30, bulkPrice: 145 },
];

// ── Site Settings ─────────────────────────────
export const DEFAULT_SETTINGS: SiteSettings = {
  tradeEmail: "trade@gbhpl.com",
  deliveryZones: ["Accra", "Kumasi", "Cape Coast", "Takoradi", "Tamale"],
  whatsappNumber: "+233 XX XXX XXXX",
  phone: "+233 XX XXX XXXX",
  address: "Cape Coast, Central Region, Ghana",
};
