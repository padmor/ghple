import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Products — Gid's Apple Cider Vinegar",
  description:
    "Choose your size of raw, unfiltered apple cider vinegar with the mother. Handcrafted in Cape Coast, delivered across Ghana.",
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
