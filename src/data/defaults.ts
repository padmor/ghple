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

export interface CEOInfo {
  name: string;
  title: string;
  bio: string;
  quote: string;
  photoPath: string;
}

export interface SiteSettings {
  tradeEmail: string;
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
    image: "/images/products/bottle-500ml.jpg",
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
    image: "/images/products/bottle-1000ml.jpg",
    inStock: true,
    description:
      "Family size. Ideal for daily cooking and wellness routines. Same premium quality, more for your money.",
  },
  // NOTE: the four products below are placeholders — edit sizes, prices and descriptions in the manager portal.
  {
    id: "250ml",
    name: "Gid's Apple Cider Vinegar",
    size: "250 ml",
    volumeMl: 250,
    price: 60,
    badge: "Starter",
    image: "/images/products/bottle-500ml.jpg",
    inStock: true,
    description:
      "A small bottle to try our raw, unfiltered apple cider vinegar with the mother culture.",
  },
  {
    id: "750ml",
    name: "Gid's Apple Cider Vinegar",
    size: "750 ml",
    volumeMl: 750,
    price: 135,
    image: "/images/products/bottle-500ml.jpg",
    inStock: true,
    description:
      "A mid-size bottle for weekly use in cooking, dressings and your daily wellness routine.",
  },
  {
    id: "2000ml",
    name: "Gid's Apple Cider Vinegar",
    size: "2 L",
    volumeMl: 2000,
    price: 310,
    badge: "Bulk",
    image: "/images/products/bottle-1000ml.jpg",
    inStock: true,
    description:
      "A large container for busy kitchens and regular users. The same raw, unfiltered quality.",
  },
  {
    id: "gift-set",
    name: "Gid's Apple Cider Vinegar",
    size: "Gift Set",
    volumeMl: 1000,
    price: 240,
    badge: "Gift",
    image: "/images/products/bottle-1000ml.jpg",
    inStock: true,
    description:
      "Two bottles presented together, ready to give to someone who cares about natural health.",
  },
];

// ── CEO / Founder ─────────────────────────────
export const DEFAULT_CEO: CEOInfo = {
  name: "Gideon Hanson",
  title: "Founder & CEO, GBHPL",
  bio: "Gideon founded Gid's Beverages & Health Products Ltd with one goal: to produce the highest-quality, naturally-made health beverages in Ghana. Starting in a small facility in Cape Coast, he has grown the brand through an unwavering commitment to quality and transparency.",
  quote:
    "We don't cut corners. Every bottle carries our name, and that means something to us.",
  photoPath: "/founder/ceo.jpg",
};

// ── Site Settings ─────────────────────────────
export const DEFAULT_SETTINGS: SiteSettings = {
  tradeEmail: "trade@gbhpl.com",
  whatsappNumber: "+233507154818",
  phone: "+233507154818",
  address: "Cape Coast, Central Region, Ghana",
};
