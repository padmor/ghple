"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Mail, MapPin, Minus, Phone, Plus, Search, ShoppingCart, Star, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useManager } from "@/context/manager-context";
import { Navbar } from "@/components/navbar";
import { CartDrawer } from "@/components/cart-drawer";
import { CheckoutDialog } from "@/components/checkout-dialog";
import { BottleIllustration } from "@/components/bottle-illustration";
import { formatGHS } from "@/lib/utils";

type Sort = "featured" | "price-asc" | "price-desc";

const ASSURANCES = [
  { src: "/icons/delivery.svg", label: "Nationwide delivery across Ghana" },
  { src: "/icons/quality.svg", label: "Quality & acidity tested" },
  { src: "/icons/packing.svg", label: "Secure glass bottle packing" },
];

export default function ProductsPage() {
  const { addToCart } = useCart();
  const { products } = useManager();

  const [query, setQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = inStockOnly ? products.filter((p) => p.inStock) : [...products];
    if (sizeFilter !== "all") list = list.filter((p) => p.size === sizeFilter);
    if (q) {
      list = list.filter((p) =>
        [p.name, p.size, p.description, p.badge ?? ""].join(" ").toLowerCase().includes(q)
      );
    }
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, sort, inStockOnly, query, sizeFilter]);

  const sizes = useMemo(() => Array.from(new Set(products.map((p) => p.size))), [products]);
  const clearAll = () => {
    setQuery("");
    setSizeFilter("all");
    setInStockOnly(false);
  };

  const getQty = (id: string) => qty[id] ?? 1;
  const setQtyFor = (id: string, n: number) =>
    setQty((q) => ({ ...q, [id]: Math.min(99, Math.max(1, n)) }));

  const handleAdd = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product || !product.inStock) return;
    addToCart(product, getQty(id));
    setJustAdded(id);
    setTimeout(() => setJustAdded((cur) => (cur === id ? null : cur)), 1800);
  };

  return (
    <>
      <Navbar />
      <CartDrawer />
      <CheckoutDialog />

      <main className="min-h-screen bg-brand-ivory">
        {/* Page header */}
        <section className="relative overflow-hidden bg-brand-forest pb-4 pt-[88px]">
          <div className="section-container relative">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <nav aria-label="Breadcrumb">
                <ol className="flex items-center gap-2 text-sm">
                  <li>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-white/80 transition-colors hover:border-brand-gold hover:text-brand-gold focus-ring"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Home
                    </Link>
                  </li>
                  <li aria-hidden="true" className="text-white/30">
                    /
                  </li>
                  <li aria-current="page" className="font-semibold text-white">
                    Products
                  </li>
                </ol>
              </nav>

              <div className="relative w-full sm:max-w-sm">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-forest/50" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, sizes…"
                  aria-label="Search products"
                  className="w-full rounded-full border border-white/20 bg-white py-2 pl-10 pr-9 text-sm text-brand-forest outline-none placeholder:text-brand-forest/40 focus:ring-4 focus:ring-brand-gold/40"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-brand-forest/60 hover:bg-brand-forest/10"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Toolbar */}
        <section className="sticky top-[72px] z-30 border-b border-brand-forest/10 bg-brand-ivory/90 backdrop-blur-md">
          <div className="section-container flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex flex-wrap items-center gap-2">
              {["all", ...sizes].map((sz) => {
                const active = sizeFilter === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSizeFilter(sz)}
                    aria-pressed={active}
                    className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors focus-ring ${
                      active
                        ? "border-brand-forest bg-brand-forest text-brand-gold"
                        : "border-brand-forest/15 bg-white text-brand-forest/70 hover:border-brand-forest/40"
                    }`}
                  >
                    {sz === "all" ? "All sizes" : sz}
                  </button>
                );
              })}
              <span className="ml-1 text-sm text-brand-forest/60">
                <span className="font-bold text-brand-forest">{visible.length}</span>{" "}
                {visible.length === 1 ? "product" : "products"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-forest/80">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-brand-forest/30 accent-brand-forest"
                />
                In stock only
              </label>

              <label className="flex items-center gap-2 text-sm text-brand-forest/80">
                <span className="hidden sm:inline">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="rounded-full border border-brand-forest/15 bg-white px-4 py-2 text-sm text-brand-forest outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </select>
              </label>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="section-container py-10 sm:py-14">
          {visible.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-brand-forest/20 bg-white py-20 text-center">
              <p className="font-bold text-brand-forest">
                {query ? `No products match “${query}”` : "No products match your filters"}
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-4 text-sm font-semibold text-brand-gold hover:underline"
              >
                Clear search &amp; filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((product) => {
                const added = justAdded === product.id;
                return (
                  <article
                    key={product.id}
                    className={`group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-brand-forest/10 bg-white shadow-[0_2px_12px_rgba(31,58,43,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-gold/50 hover:shadow-[0_24px_48px_-12px_rgba(31,58,43,0.25)] ${
                      !product.inStock ? "opacity-80" : ""
                    }`}
                  >
                    {/* Image stage */}
                    <div className="relative m-2 flex h-60 items-center justify-center overflow-hidden rounded-[1.25rem] bg-[radial-gradient(ellipse_at_50%_35%,#fffdf6_0%,#fbf1d6_55%,#f3e2b3_100%)]">
                      {/* soft floor shadow */}
                      <div className="absolute bottom-5 h-4 w-28 rounded-full bg-black/10 blur-lg" />

                      {product.badge && (
                        <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-brand-forest px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-gold shadow-md">
                          <Star className="h-3 w-3 fill-brand-gold" />
                          {product.badge}
                        </span>
                      )}

                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={`${product.name} — ${product.size}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain p-5 drop-shadow-[0_14px_18px_rgba(0,0,0,0.18)] transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <BottleIllustration
                          size={product.size}
                          volumeMl={product.volumeMl}
                          className="relative h-auto w-24"
                        />
                      )}
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col px-5 pb-5 pt-3">
                      {/* Stock + volume */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-gold">
                          {product.volumeMl > 0 ? `${product.volumeMl} ml` : "Standard bottle"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                            product.inStock ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              product.inStock ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {product.inStock ? "In stock" : "Sold out"}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="mt-2 text-xl font-extrabold leading-tight tracking-tight text-black">
                        {product.name}
                      </h2>

                      {/* Feature chips */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {["Raw", "Unfiltered", "With the mother"].map((c) => (
                          <span
                            key={c}
                            className="rounded-full bg-brand-forest/5 px-2.5 py-1 text-[10px] font-semibold text-brand-forest/70"
                          >
                            {c}
                          </span>
                        ))}
                      </div>

                      {/* Description */}
                      <p
                        className={`mt-3 text-sm leading-relaxed text-black ${
                          expanded === product.id ? "" : "line-clamp-2"
                        }`}
                      >
                        {product.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === product.id ? null : product.id)}
                        aria-expanded={expanded === product.id}
                        className="mt-1 self-start rounded text-xs font-bold text-brand-forest underline decoration-brand-gold decoration-2 underline-offset-4 hover:text-brand-gold focus-ring"
                      >
                        {expanded === product.id ? "Read less" : "Read more"}
                      </button>

                      <div className="flex-1" />

                      {/* Price */}
                      <div className="mt-5 flex items-end justify-between border-t border-dashed border-brand-forest/15 pt-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-forest/50">
                            Price
                          </p>
                          <p className="text-3xl font-black leading-none tracking-tight text-brand-forest">
                            {formatGHS(product.price)}
                          </p>
                        </div>
                        {product.volumeMl > 0 && (
                          <p className="pb-0.5 text-[11px] text-brand-forest/50">
                            {formatGHS((product.price / product.volumeMl) * 100)} / 100 ml
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex items-center gap-2">
                        <div className="flex flex-shrink-0 items-center rounded-full bg-brand-forest/5 p-1">
                          <button
                            type="button"
                            onClick={() => setQtyFor(product.id, getQty(product.id) - 1)}
                            disabled={!product.inStock}
                            aria-label="Decrease quantity"
                            className="flex h-9 w-9 items-center justify-center rounded-full text-brand-forest transition-colors hover:bg-white disabled:opacity-40"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm font-bold text-brand-forest">
                            {getQty(product.id)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQtyFor(product.id, getQty(product.id) + 1)}
                            disabled={!product.inStock}
                            aria-label="Increase quantity"
                            className="flex h-9 w-9 items-center justify-center rounded-full text-brand-forest transition-colors hover:bg-white disabled:opacity-40"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAdd(product.id)}
                          disabled={!product.inStock}
                          aria-label={`Add ${product.size} to cart`}
                          className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold transition-all active:scale-[0.98] ${
                            !product.inStock
                              ? "cursor-not-allowed bg-slate-200 text-slate-500"
                              : added
                              ? "bg-emerald-600 text-white"
                              : "bg-brand-forest text-brand-gold hover:bg-brand-gold hover:text-brand-forest"
                          }`}
                        >
                          {added ? (
                            <>
                              <Check className="h-4 w-4" />
                              Added
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4" />
                              {product.inStock ? "Add to cart" : "Sold out"}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-brand-forest text-white/70">
        <div className="section-container py-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {ASSURANCES.map(({ src, label }) => (
              <div key={label} className="flex items-center gap-4">
                <Image src={src} alt="" width={44} height={44} className="h-11 w-11 flex-shrink-0" />
                <span className="text-sm font-medium text-white/85">{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-6 border-t border-white/10 pt-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gold">
                  <span className="text-sm font-bold text-brand-forest">G</span>
                </div>
                <span className="text-lg font-bold tracking-tight text-white">GBHPL</span>
              </div>
              <p className="mt-3 max-w-sm text-xs leading-relaxed">
                Gid&apos;s Beverages &amp; Health Products Ltd. Crafting honest health products in
                Cape Coast since 2018.
              </p>
            </div>

            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 text-brand-gold" />
                Cape Coast, Central Region, Ghana
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0 text-brand-gold" />
                <a href="mailto:hello@gbhpl.com" className="hover:text-white">
                  hello@gbhpl.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0 text-brand-gold" />
                <a href="tel:+233000000000" className="hover:text-white">
                  +233 XX XXX XXXX
                </a>
              </li>
            </ul>

            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm lg:flex-col lg:gap-y-2">
              <Link href="/" className="hover:text-brand-gold">Home</Link>
              <Link href="/#process" className="hover:text-brand-gold">Our Process</Link>
              <Link href="/#support" className="hover:text-brand-gold">Support</Link>
              <Link href="/returns" className="hover:text-brand-gold">Return Policy</Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="section-container flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
            <p>© {new Date().getFullYear()} Gid&apos;s Beverages &amp; Health Products Ltd. All rights reserved.</p>
            <p>Cape Coast, Ghana</p>
          </div>
        </div>
      </footer>
    </>
  );
}
