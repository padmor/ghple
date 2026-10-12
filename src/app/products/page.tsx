"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useManager } from "@/context/manager-context";
import { CartDrawer } from "@/components/cart-drawer";
import { CheckoutDialog } from "@/components/checkout-dialog";
import { TrackOrderDialog } from "@/components/track-order-dialog";
import { BottleIllustration } from "@/components/bottle-illustration";
import { formatGHS } from "@/lib/utils";
import { MobileProducts } from "@/components/mobile-products";


const canOptimizeImage = (src: string) =>
  src.startsWith("/") ||
  src.startsWith("https://slmnzdpvbjesuwwqvcfi.supabase.co/storage/v1/object/public/site_content/");

const PAGE_SIZE = 9;
type StockFilter = "all" | "in-stock" | "out-of-stock";
type SortOrder = "featured" | "price-low" | "price-high" | "name";

export default function ProductsPage() {
  const { products } = useManager();
  const { addToCart, totalCount, setIsCartOpen } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("featured");
  const [page, setPage] = useState(1);

  // Product names currently act as families because the product model has no category field.
  const categories = useMemo(() => {
    const unique = new Map<string, string>();
    products.forEach((product) => {
      const name = product.name.trim();
      if (name) unique.set(name.toLowerCase(), name);
    });
    return Array.from(unique.entries()).map(([value, label]) => ({ value, label }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();

    const matching = products.filter((product) => {
      const matchesSearch =
        !term ||
        [product.name, product.size, product.description, product.badge ?? ""]
          .some((value) => value.toLowerCase().includes(term));

      const matchesCategory =
        activeCategory === "all" || product.name.trim().toLowerCase() === activeCategory;

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" ? product.inStock : !product.inStock);

      return matchesSearch && matchesCategory && matchesStock;
    });

    if (sortOrder === "price-low") {
      matching.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "price-high") {
      matching.sort((a, b) => b.price - a.price);
    } else if (sortOrder === "name") {
      matching.sort((a, b) => a.name.localeCompare(b.name) || a.volumeMl - b.volumeMl);
    }

    return matching;
  }, [products, searchQuery, activeCategory, stockFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, activeCategory, stockFilter, sortOrder]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const clearFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setStockFilter("all");
    setSortOrder("featured");
    setPage(1);
  };

  return (
    <>
      <div className="sm:hidden">
        <MobileProducts />
      </div>
      <div className="hidden sm:block">
    <main className="min-h-screen bg-[#F6F4EC] text-brand-forest">
      <header className="sticky top-0 z-40 border-b border-brand-forest/10 bg-[#FFFDF8]/95 backdrop-blur-xl">
        <div className="section-container flex h-[60px] sm:h-[68px] items-center justify-between gap-3 sm:gap-4">
          <Link href="/" className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
            <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-brand-forest text-xs sm:text-sm font-extrabold text-brand-gold">
              G
            </span>
            <span className="text-sm font-extrabold tracking-wide">GBHPL</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand-forest/70 transition-colors hover:bg-brand-forest/5 hover:text-brand-forest sm:inline-flex">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open cart with ${totalCount} items`}
              className="relative inline-flex h-10 items-center gap-2 rounded-xl bg-brand-forest px-4 text-sm font-bold text-white transition-colors hover:bg-brand-forest-mid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            >
              <ShoppingCart className="h-4 w-4 text-brand-gold" />
              <span className="hidden sm:inline">Cart</span>
              {totalCount > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand-gold px-1.5 text-xs font-extrabold text-brand-forest">
                  {totalCount > 99 ? "99+" : totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="section-container pb-10 pt-5 sm:pb-16 sm:pt-12">
        <div className="mb-5 flex items-center justify-between gap-3 sm:mb-9">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">All products</h1>
          <Link href="/#products" className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-brand-forest/65 transition-colors hover:text-brand-forest sm:hidden">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>

        <section aria-label="Find products" className="mb-6 sm:mb-8 rounded-xl sm:rounded-2xl border border-brand-forest/10 bg-white/90 p-3 sm:p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-[minmax(0,1fr)_190px_210px]">
            <label className="relative block">
              <span className="sr-only">Search products</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-forest/40" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products or sizes"
                className="form-input h-12 rounded-xl border-brand-forest/10 bg-[#FAF9F5] pl-11 pr-10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-brand-forest/45 hover:bg-brand-forest/5 hover:text-brand-forest"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>

            <label className="relative block">
              <span className="sr-only">Filter by stock</span>
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-forest/40" />
              <select
                value={stockFilter}
                onChange={(event) => setStockFilter(event.target.value as StockFilter)}
                className="form-input h-12 appearance-none rounded-xl border-brand-forest/10 bg-[#FAF9F5] pl-10 pr-3"
              >
                <option value="all">All stock</option>
                <option value="in-stock">In stock</option>
                <option value="out-of-stock">Out of stock</option>
              </select>
            </label>

            <label className="relative block">
              <span className="sr-only">Sort products</span>
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-forest/40" />
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                className="form-input h-12 appearance-none rounded-xl border-brand-forest/10 bg-[#FAF9F5] pl-10 pr-3"
              >
                <option value="featured">Default order</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
          </div>

          {categories.length > 1 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-brand-forest/8 pt-4">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                aria-pressed={activeCategory === "all"}
                className={`min-h-10 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  activeCategory === "all"
                    ? "border-brand-forest bg-brand-forest text-white"
                    : "border-brand-forest/15 bg-white text-brand-forest/65 hover:border-brand-forest/35"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  type="button"
                  key={category.value}
                  onClick={() => setActiveCategory(category.value)}
                  aria-pressed={activeCategory === category.value}
                  className={`min-h-10 max-w-full truncate rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    activeCategory === category.value
                      ? "border-brand-forest bg-brand-forest text-white"
                      : "border-brand-forest/15 bg-white text-brand-forest/65 hover:border-brand-forest/35"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </section>

        {visibleProducts.length === 0 ? (
          <section className="rounded-3xl border border-brand-forest/10 bg-white px-6 py-16 text-center shadow-sm">
            <Search className="mx-auto h-8 w-8 text-brand-forest/35" />
            <h2 className="mt-4 text-lg font-bold">No matching products</h2>
            <button type="button" onClick={clearFilters} className="btn-forest-outline mt-5 rounded-xl">
              Clear filters
            </button>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <article
                key={product.id}
                className="group flex h-full flex-col rounded-xl sm:rounded-[1.75rem] border border-brand-forest/10 bg-white p-2.5 sm:p-3.5 shadow-[0_8px_25px_rgba(26,51,32,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:shadow-[0_16px_36px_rgba(26,51,32,0.11)]"
              >
                <div className="relative h-[185px] overflow-hidden rounded-lg sm:rounded-[1.1rem] bg-gradient-to-br from-[#F4F0E4] via-[#F1F5EE] to-[#E5ECE1] sm:h-[245px] lg:h-[265px]">
                  <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-2xl" />
                  <div aria-hidden="true" className="absolute bottom-9 left-1/2 h-5 w-32 -translate-x-1/2 rounded-[100%] bg-brand-forest/15 blur-md" />

                  <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2">
                    {product.badge ? (
                      <span className="inline-flex max-w-[65%] items-center gap-1.5 rounded-full border border-brand-gold/30 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-forest shadow-sm backdrop-blur-sm sm:text-[11px]">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold" />
                        <span className="truncate">{product.badge}</span>
                      </span>
                    ) : (
                      <span className="rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-forest/65 shadow-sm backdrop-blur-sm">
                        Gid&apos;s
                      </span>
                    )}

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] shadow-sm backdrop-blur-sm sm:text-[10px] ${
                        product.inStock
                          ? "border-emerald-700/10 bg-emerald-50/95 text-emerald-800"
                          : "border-red-700/10 bg-red-50/95 text-red-700"
                      }`}
                    >
                      {product.inStock ? "In stock" : "Sold out"}
                    </span>
                  </div>

                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name + " — " + product.size}
                      width={600}
                      height={600}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      quality={82}
                      unoptimized={!canOptimizeImage(product.image)}
                      className="relative z-10 h-full w-full scale-[1.02] object-contain px-3 pb-8 pt-9 transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                  ) : (
                    <div className="relative z-10 flex h-full items-center justify-center px-5 pb-8 pt-10">
                      <BottleIllustration
                        size={product.size}
                        volumeMl={product.volumeMl}
                        className="h-auto w-32 drop-shadow-xl transition-transform duration-500 group-hover:scale-[1.06] sm:w-36 lg:w-40"
                      />
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 z-20 inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-md">
                    <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-brand-forest/45">Size</span>
                    <span className="text-sm font-extrabold text-brand-forest">{product.size}</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col px-2 pb-2 pt-4 sm:px-3 sm:pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold-deep">
                    {product.name}
                  </p>
                  <h2 className="mt-1.5 min-h-[2.25rem] text-base font-extrabold leading-snug tracking-tight text-brand-forest sm:mt-2 sm:min-h-[2.5rem] sm:text-xl">
                    {product.size}
                  </h2>
                  <p className="mt-1.5 min-h-[2.25rem] line-clamp-2 text-xs leading-[1.15rem] text-brand-forest/60 sm:mt-2 sm:min-h-[2.5rem] sm:text-sm sm:leading-5">
                    {product.description}
                  </p>

                  <div className="mt-4 flex flex-col gap-3 border-t border-brand-forest/10 pt-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-forest/45">
                        Price
                      </p>
                      <p className="mt-1 text-xl font-extrabold leading-none tracking-tight text-brand-forest sm:text-2xl">
                        {formatGHS(product.price)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (product.inStock) addToCart(product, 1);
                      }}
                      disabled={!product.inStock}
                      className={`btn-gold min-h-11 w-full rounded-xl px-4 py-2.5 text-sm sm:w-auto ${
                        !product.inStock
                          ? "cursor-not-allowed bg-slate-200 text-slate-500 shadow-none hover:translate-y-0 hover:bg-slate-200"
                          : ""
                      }`}
                      aria-label={`Add ${product.name} ${product.size} to cart`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {product.inStock ? "Add to Cart" : "Sold Out"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {filteredProducts.length > PAGE_SIZE && (
          <nav aria-label="Product pages" className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-forest/15 bg-white px-4 py-2.5 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-forest/5 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span aria-live="polite" className="text-sm font-medium text-brand-forest/60">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-forest/15 bg-white px-4 py-2.5 text-sm font-semibold text-brand-forest transition-colors hover:bg-brand-forest/5 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </div>

    </main>
      </div>
      <CartDrawer />
      <CheckoutDialog />
      <TrackOrderDialog />
    </>
  );
}
