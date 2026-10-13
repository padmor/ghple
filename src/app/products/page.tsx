"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  Search,
  ShoppingCart,
  Star,
  X,
} from "lucide-react";
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
  const [qty, setQty] = useState<Record<string, number>>({});
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...products];
    if (sizeFilter !== "all") list = list.filter((p) => p.size === sizeFilter);
    if (q) {
      list = list.filter((p) =>
        [p.name, p.size, p.description, p.badge ?? ""].join(" ").toLowerCase().includes(q)
      );
    }
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, sort, query, sizeFilter]);

  const sizes = useMemo(() => Array.from(new Set(products.map((p) => p.size))), [products]);
  const clearAll = () => {
    setQuery("");
    setSizeFilter("all");
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

      <main className="relative min-h-screen overflow-hidden bg-brand-forest">
        {/* Background — identical to the Products section on the landing page */}
        <div className="relative z-0 mt-[72px] aspect-[1376/768] w-full overflow-hidden sm:absolute sm:inset-0 sm:mt-0 sm:aspect-auto" aria-hidden="true">
          <Image
            src="/products-bg.jpg"
            alt=""
            fill
            priority
            className="object-fill sm:object-cover sm:object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/70 via-transparent to-brand-forest/40" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-brand-forest to-transparent sm:hidden" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <header className="section-container pt-4 sm:pt-[100px]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <nav aria-label="Breadcrumb">
                  <ol className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em]">
                    <li>
                      <Link href="/" className="text-white/60 transition-colors hover:text-brand-gold">
                        Home
                      </Link>
                    </li>
                    <li aria-hidden="true" className="text-white/30">
                      /
                    </li>
                    <li aria-current="page" className="text-brand-gold">
                      Our Products
                    </li>
                  </ol>
                </nav>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Choose your product
                </h1>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-forest/50" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products…"
                  aria-label="Search products"
                  className="w-full rounded-full border border-white/30 bg-white py-2.5 pl-11 pr-10 text-sm text-brand-forest outline-none placeholder:text-brand-forest/40 focus:ring-4 focus:ring-brand-gold/40"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-brand-forest/60 hover:bg-brand-forest/10"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4">
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
                          ? "border-brand-gold bg-brand-gold text-brand-forest"
                          : "border-white/25 text-white/85 hover:border-white/50"
                      }`}
                    >
                      {sz === "all" ? "All sizes" : sz}
                    </button>
                  );
                })}
                <span className="ml-1 text-sm text-white/60">
                  {visible.length} {visible.length === 1 ? "product" : "products"}
                </span>
              </div>

              <label className="flex items-center gap-2 text-sm text-white/80">
                <span className="hidden sm:inline">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="rounded-full border border-white/25 bg-transparent px-4 py-1.5 text-sm text-white outline-none focus:border-brand-gold"
                >
                  <option value="featured" className="text-black">
                    Featured
                  </option>
                  <option value="price-asc" className="text-black">
                    Price: low to high
                  </option>
                  <option value="price-desc" className="text-black">
                    Price: high to low
                  </option>
                </select>
              </label>
            </div>
          </header>

          {/* Grid */}
          <section className="section-container py-8 sm:py-10">
            {visible.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/30 bg-white/10 py-20 text-center backdrop-blur">
                <p className="font-bold text-white">
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
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
                {visible.map((product) => {
                  const added = justAdded === product.id;
                  return (
                    <article
                      key={product.id}
                      className={`group relative flex flex-row overflow-hidden rounded-[1.75rem] border border-white/70 bg-white sm:flex-col lg:flex-row shadow-[0_18px_40px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-gold/60 hover:shadow-[0_28px_56px_rgba(0,0,0,0.4)] ${
                        !product.inStock ? "opacity-80" : ""
                      }`}
                    >
                      {/* Image stage */}
                      <div className="relative m-2 flex min-h-[210px] w-[36%] flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl sm:h-60 sm:min-h-0 sm:w-auto sm:rounded-[1.25rem] lg:h-auto lg:min-h-[340px] lg:w-[42%] bg-[radial-gradient(ellipse_at_50%_35%,#fffdf6_0%,#fbf1d6_55%,#f3e2b3_100%)]">
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
                            className="object-contain p-2 drop-shadow-[0_14px_18px_rgba(0,0,0,0.18)] transition-transform duration-500 group-hover:scale-105"
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
                      <div className="flex min-w-0 flex-1 flex-col py-3 pl-1 pr-3 sm:px-5 sm:pb-5 sm:pt-3 lg:py-6 lg:pl-3 lg:pr-6">
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

                        <h2 className="mt-1 text-base font-extrabold leading-tight tracking-tight text-black sm:mt-2 sm:text-xl lg:text-2xl">
                          {product.name}
                        </h2>

                        <div className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
                          {["Raw", "Unfiltered", "With the mother"].map((c) => (
                            <span
                              key={c}
                              className="rounded-full bg-brand-forest/5 px-2.5 py-1 text-[10px] font-semibold text-black/70"
                            >
                              {c}
                            </span>
                          ))}
                        </div>

                        <p
                          className={`mt-1.5 text-xs leading-relaxed text-black sm:mt-3 sm:text-sm ${
                            expanded === product.id ? "" : "line-clamp-2"
                          }`}
                        >
                          {product.description}
                        </p>
                        <button
                          type="button"
                          onClick={() => setExpanded(expanded === product.id ? null : product.id)}
                          aria-expanded={expanded === product.id}
                          className="mt-1 self-start rounded text-xs font-bold text-black underline decoration-brand-gold decoration-2 underline-offset-4 hover:text-brand-gold focus-ring"
                        >
                          {expanded === product.id ? "Read less" : "Read more"}
                        </button>

                        <div className="flex-1" />

                        <div className="mt-3 flex items-end justify-between border-t border-dashed border-black/15 pt-2.5 sm:mt-5 sm:pt-4">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-black/50">
                              Price
                            </p>
                            <p className="text-2xl font-black leading-none tracking-tight text-black sm:text-3xl">
                              {formatGHS(product.price)}
                            </p>
                          </div>
                          {product.volumeMl > 0 && (
                            <p className="hidden pb-0.5 text-[11px] text-black/50 sm:block">
                              {formatGHS((product.price / product.volumeMl) * 100)} / 100 ml
                            </p>
                          )}
                        </div>

                        <div className="mt-2.5 flex items-center gap-1.5 sm:mt-4 sm:gap-2">
                          <div className="flex flex-shrink-0 items-center rounded-full bg-brand-forest/5 p-1">
                            <button
                              type="button"
                              onClick={() => setQtyFor(product.id, getQty(product.id) - 1)}
                              disabled={!product.inStock}
                              aria-label="Decrease quantity"
                              className="flex h-8 w-8 items-center justify-center rounded-full text-black transition-colors hover:bg-white disabled:opacity-40 sm:h-9 sm:w-9"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-black sm:w-7">
                              {getQty(product.id)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQtyFor(product.id, getQty(product.id) + 1)}
                              disabled={!product.inStock}
                              aria-label="Increase quantity"
                              className="flex h-8 w-8 items-center justify-center rounded-full text-black transition-colors hover:bg-white disabled:opacity-40 sm:h-9 sm:w-9"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAdd(product.id)}
                            disabled={!product.inStock}
                            aria-label={`Add ${product.size} to cart`}
                            className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full text-xs sm:h-11 sm:gap-2 sm:text-sm font-bold transition-all active:scale-[0.98] ${
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
                                {product.inStock ? (<><span className="sm:hidden">Add</span><span className="hidden sm:inline">Add to cart</span></>) : "Sold out"}
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

          {/* Why shop with us — one horizontal line under the products */}
          <section className="section-container pb-10 sm:pb-14" aria-label="Our promise">
            <div className="grid grid-cols-3 divide-x divide-white/20 rounded-2xl border border-white/20 bg-white/10 py-3 backdrop-blur-md sm:rounded-full sm:py-3.5">
              {ASSURANCES.map(({ src, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 px-2 text-center sm:flex-row sm:justify-center sm:gap-3 sm:px-5 sm:text-left"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-md sm:h-11 sm:w-11 sm:rounded-full">
                    <Image src={src} alt="" width={36} height={36} className="h-7 w-7 sm:h-8 sm:w-8" />
                  </span>
                  <span className="text-[10px] font-semibold leading-tight text-white sm:text-sm sm:leading-snug">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-brand-forest text-white/70">
            <div className="section-container py-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Image
                    src="/brand/logo-primary-light.svg"
                    alt="GBHPL — Gid's Apple Cider Vinegar"
                    width={420}
                    height={120}
                    className="h-11 w-auto"
                  />
                  <p className="mt-3 max-w-sm text-xs leading-relaxed">
                    Gid&apos;s Beverages &amp; Health Products Ltd. Crafting honest health products
                    in Cape Coast since 2018.
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
                    <a href="tel:+233507154818" className="hover:text-white">
                      +233 50 715 4818
                    </a>
                  </li>
                </ul>

                <nav
                  aria-label="Footer"
                  className="flex flex-wrap gap-x-6 gap-y-2 text-sm lg:flex-col lg:gap-y-2"
                >
                  <Link href="/" className="hover:text-brand-gold">
                    Home
                  </Link>
                  <Link href="/#process" className="hover:text-brand-gold">
                    Our Process
                  </Link>
                  <Link href="/#support" className="hover:text-brand-gold">
                    Support
                  </Link>
                  <Link href="/track" className="hover:text-brand-gold">
                    Track Order
                  </Link>
                  <Link href="/returns" className="hover:text-brand-gold">
                    Return Policy
                  </Link>
                </nav>
              </div>
            </div>

            <div className="border-t border-white/10">
              <div className="section-container flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
                <p>
                  © {new Date().getFullYear()} Gid&apos;s Beverages &amp; Health Products Ltd. All
                  rights reserved.
                </p>
                <p>Cape Coast, Ghana</p>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
