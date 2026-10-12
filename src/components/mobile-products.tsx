"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Search, ShoppingCart, SlidersHorizontal, X, Package, Plus, Minus, ChevronDown } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useManager } from "@/context/manager-context";
import { formatGHS } from "@/lib/utils";

type StockFilter = "all" | "in-stock" | "out-of-stock";
type SortOrder = "featured" | "price-low" | "price-high" | "name";

const canOptimizeImage = (src: string) =>
  src.startsWith("/") ||
  src.startsWith("https://slmnzdpvbjesuwwqvcfi.supabase.co/storage/v1/object/public/site_content/");

function ProductPhoto({ product, large = false }: { product: import("@/data/defaults").Product; large?: boolean }) {
  if (!product.image) {
    return <div className={"flex h-full w-full items-center justify-center " + (large ? "text-7xl" : "text-4xl")}><Package className="h-12 w-12 text-brand-forest/20" /></div>;
  }
  return (
    <Image
      src={product.image}
      alt={product.name + " — " + product.size}
      width={large ? 720 : 360}
      height={large ? 720 : 360}
      sizes={large ? "100vw" : "(max-width: 639px) 46vw, 300px"}
      quality={large ? 84 : 78}
      unoptimized={!canOptimizeImage(product.image)}
      className={large ? "h-full w-full object-contain p-6" : "h-full w-full object-contain p-2"}
    />
  );
}

export function MobileProducts() {
  const { products } = useManager();
  const { addToCart, totalCount, setIsCartOpen } = useCart();
  const [query, setQuery] = useState("");
  const [activeSize, setActiveSize] = useState("all");
  const [stock, setStock] = useState<StockFilter>("all");
  const [sort, setSort] = useState<SortOrder>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null;
  const sizes = useMemo(() => Array.from(new Set(products.map((product) => product.size.trim()).filter(Boolean))), [products]);

  useEffect(() => {
    const requestedProductId = new URLSearchParams(window.location.search).get("product");
    if (requestedProductId && products.some((product) => product.id === requestedProductId)) {
      setSelectedProductId(requestedProductId);
    }
  }, [products]);

  const clearProductSelection = () => {
    setSelectedProductId(null);
    setQuantity(1);

    const url = new URL(window.location.href);
    if (url.searchParams.has("product")) {
      url.searchParams.delete("product");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  };

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matching = products.filter((product) => {
      const matchesQuery = !term || [product.name, product.size, product.description, product.badge ?? ""].some((value) => value.toLowerCase().includes(term));
      const matchesSize = activeSize === "all" || product.size.trim() === activeSize;
      const matchesStock = stock === "all" || (stock === "in-stock" ? product.inStock : !product.inStock);
      return matchesQuery && matchesSize && matchesStock;
    });
    if (sort === "price-low") matching.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") matching.sort((a, b) => b.price - a.price);
    else if (sort === "name") matching.sort((a, b) => a.name.localeCompare(b.name) || a.volumeMl - b.volumeMl);
    return matching;
  }, [products, query, activeSize, stock, sort]);

  const clearFilters = () => {
    setQuery("");
    setActiveSize("all");
    setStock("all");
    setSort("featured");
  };

  const selectProduct = (id: string) => {
    setSelectedProductId(id);
    setQuantity(1);

    const url = new URL(window.location.href);
    url.searchParams.set("product", id);
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addSelectedToCart = () => {
    if (selectedProduct?.inStock) {
      addToCart(selectedProduct, quantity);
      clearProductSelection();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F1] pb-24 text-brand-forest">
      <header className={"sticky top-0 z-40 border-b border-brand-forest/10 shadow-sm " + (selectedProduct ? "bg-[#FFFDF8]" : "bg-[#FFFDF8]/95 backdrop-blur-xl")}>
        <div className="flex h-14 items-center justify-between gap-2 px-4">
          {selectedProduct ? (
            <button type="button" onClick={clearProductSelection} className="inline-flex min-h-11 items-center gap-2 rounded-lg pr-2 text-sm font-semibold">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF0E6]"><ArrowLeft className="h-4 w-4" /></span>Back
            </button>
          ) : (
            <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg pr-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-forest text-sm font-extrabold text-brand-gold">G</span>
              <span><span className="block text-sm font-extrabold">GBHPL</span><span className="block text-[9px] uppercase tracking-[0.12em] text-brand-forest/50">Our products</span></span>
            </Link>
          )}
          <button type="button" onClick={() => setIsCartOpen(true)} aria-label={"Open cart with " + totalCount + " items"} className="relative inline-flex h-11 min-w-11 items-center justify-center rounded-xl bg-brand-forest px-3 text-white">
            <ShoppingCart className="h-5 w-5 text-brand-gold" />
            {totalCount > 0 && <span className="ml-1 text-xs font-extrabold">{totalCount > 99 ? "99+" : totalCount}</span>}
          </button>
        </div>
      </header>

      {selectedProduct ? (
        <main>
          <section className="relative overflow-hidden bg-[#E7ECE3]">
            <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-2xl" />
            <div className="relative z-10 flex h-[220px] items-center justify-center">
              <ProductPhoto product={selectedProduct} large />
            </div>
            {selectedProduct.badge && <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-forest shadow-sm">{selectedProduct.badge}</span>}
          </section>

          <section className="px-4 pb-4 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold-deep">{selectedProduct.name}</p>
            <h1 className="mt-1 font-serif text-2xl font-bold leading-tight">{selectedProduct.size}</h1>
            <p className="mt-2 text-xl font-extrabold">{formatGHS(selectedProduct.price)}</p>
            <p className="mt-3 text-[13px] leading-5 text-brand-forest/70">{selectedProduct.description}</p>

            <div className="mt-4">
              <h2 className="text-xs font-bold">Size</h2>
              <div className="scrollbar-hide mt-2 flex gap-2 overflow-x-auto pb-1">
                {products.filter((product) => product.name === selectedProduct.name).map((product) => (
                  <button key={product.id} type="button" onClick={() => { setSelectedProductId(product.id); setQuantity(1); }} aria-pressed={selectedProduct.id === product.id} className={"min-h-10 shrink-0 rounded-full border px-4 py-2 text-xs font-bold " + (selectedProduct.id === product.id ? "border-[#06442E] bg-[#06442E] text-white" : "border-brand-forest/15 bg-white text-brand-forest")}>
                    {product.size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs font-semibold text-brand-forest/65">Quantity</span>
              <div className="flex items-center rounded-full border border-brand-forest/15 bg-white">
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={!selectedProduct.inStock} aria-label="Decrease quantity" className="inline-flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-40"><Minus className="h-4 w-4" /></button>
                <span className="w-7 text-center text-sm font-bold">{quantity}</span>
                <button type="button" onClick={() => setQuantity((value) => Math.min(99, value + 1))} disabled={!selectedProduct.inStock} aria-label="Increase quantity" className="inline-flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-40"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-brand-forest/10 pt-3 text-sm">
              <span className="text-brand-forest/60">Total</span><span className="text-lg font-extrabold">{formatGHS(selectedProduct.price * quantity)}</span>
            </div>
          </section>

          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-forest/10 bg-white/95 p-3 pb-[max(env(safe-area-inset-bottom),12px)] backdrop-blur-xl">
            <button type="button" onClick={addSelectedToCart} disabled={!selectedProduct.inStock} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#06442E] px-4 py-3 text-sm font-bold text-white disabled:opacity-45">
              <ShoppingCart className="h-4 w-4 text-brand-gold" />{selectedProduct.inStock ? "Add to Cart" : "Sold Out"}
            </button>
          </div>
        </main>
      ) : (
        <>
          <main>
            <section className="px-4 pb-2 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gold-deep">Natural. Healthy. Refreshing.</p>
              <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight">Our Products</h1>
              <p className="mt-1 text-[13px] text-brand-forest/65">Find the right size for you.</p>
            </section>

            <section aria-label="Product categories" className="px-4 pb-2">
              <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
                <button type="button" onClick={() => setActiveSize("all")} aria-pressed={activeSize === "all"} className={"min-h-10 shrink-0 rounded-full border px-4 py-2 text-xs font-bold " + (activeSize === "all" ? "border-[#06442E] bg-[#06442E] text-white" : "border-transparent bg-[#EFF0EC] text-brand-forest/75")}>All</button>
                {sizes.map((size) => (
                  <button key={size} type="button" onClick={() => setActiveSize(size)} aria-pressed={activeSize === size} className={"min-h-10 shrink-0 rounded-full border px-4 py-2 text-xs font-semibold " + (activeSize === size ? "border-[#06442E] bg-[#06442E] text-white" : "border-transparent bg-[#EFF0EC] text-brand-forest/75")}>{size}</button>
                ))}
                <Link href="/trade" className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-transparent bg-[#EFF0EC] px-4 py-2 text-xs font-semibold text-brand-forest/75">Wholesale</Link>
              </div>
            </section>

            <section className="px-4 pb-3">
              <label className="relative block">
                <span className="sr-only">Search products</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-forest/40" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." className="h-11 w-full rounded-xl border border-brand-forest/10 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20" />
                {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-brand-forest/45"><X className="h-4 w-4" /></button>}
              </label>
              <button type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-xl px-1 text-xs font-bold text-brand-forest/65"><SlidersHorizontal className="h-4 w-4" /> Filters and sorting <ChevronDown className={"h-3.5 w-3.5 transition-transform " + (filtersOpen ? "rotate-180" : "")} /></button>
              {filtersOpen && (
                <div className="mt-1 grid grid-cols-2 gap-2 rounded-2xl border border-brand-forest/10 bg-white p-3">
                  <label className="space-y-1 text-[10px] font-bold text-brand-forest/70">Availability
                    <select value={stock} onChange={(event) => setStock(event.target.value as StockFilter)} className="h-10 w-full rounded-lg border border-brand-forest/10 bg-[#FAF9F5] px-2 text-xs text-brand-forest"><option value="all">All stock</option><option value="in-stock">In stock</option><option value="out-of-stock">Sold out</option></select>
                  </label>
                  <label className="space-y-1 text-[10px] font-bold text-brand-forest/70">Sort
                    <select value={sort} onChange={(event) => setSort(event.target.value as SortOrder)} className="h-10 w-full rounded-lg border border-brand-forest/10 bg-[#FAF9F5] px-2 text-xs text-brand-forest"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name A–Z</option></select>
                  </label>
                </div>
              )}
            </section>

            <section className="px-4 pb-8">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-brand-forest/55">{filtered.length} {filtered.length === 1 ? "product" : "products"}</p>
                {(query || activeSize !== "all" || stock !== "all" || sort !== "featured") && <button type="button" onClick={clearFilters} className="text-xs font-bold text-brand-gold-deep">Clear filters</button>}
              </div>
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-brand-forest/10 bg-white px-5 py-12 text-center">
                  <Search className="mx-auto h-8 w-8 text-brand-forest/35" /><h2 className="mt-3 text-base font-bold">No matching products</h2><p className="mt-1 text-xs text-brand-forest/55">Try another search or clear your filters.</p>
                  <button type="button" onClick={clearFilters} className="mt-4 min-h-10 rounded-xl bg-[#06442E] px-4 text-xs font-bold text-white">Clear filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {filtered.map((product) => (
                    <article key={product.id} className="flex min-w-0 flex-col overflow-hidden rounded-xl bg-white p-2 shadow-sm ring-1 ring-brand-forest/5">
                      <button type="button" onClick={() => selectProduct(product.id)} className="text-left">
                        <div className="relative flex h-[120px] items-center justify-center overflow-hidden rounded-lg bg-[#F4F5EF]"><ProductPhoto product={product} /></div>
                        <p className="mt-2 line-clamp-1 text-[10px] font-semibold text-brand-forest/55">{product.name}</p>
                        <h2 className="mt-1 text-sm font-extrabold">{product.size}</h2>
                        <p className="mt-1 text-base font-extrabold text-brand-forest">{formatGHS(product.price)}</p>
                        <span className={"mt-1 inline-flex rounded-full px-2 py-1 text-[8px] font-bold uppercase " + (product.inStock ? "bg-[#E9F3E9] text-[#17613D]" : "bg-red-50 text-red-700")}>{product.inStock ? "In stock" : "Sold out"}</span>
                      </button>
                      <button type="button" onClick={() => addToCart(product, 1)} disabled={!product.inStock} aria-label={"Add " + product.name + " " + product.size + " to cart"} className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-1 rounded-lg bg-[#06442E] px-2 py-2 text-[10px] font-bold text-white disabled:opacity-40"><ShoppingCart className="h-3.5 w-3.5 text-brand-gold" />{product.inStock ? "Add to Cart" : "Sold Out"}</button>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="mx-4 mb-5 rounded-xl bg-[#0A2418] p-3.5 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-gold">For shops and retailers</p>
              <h2 className="mt-1 font-serif text-lg font-bold">Buying for a business?</h2>
              <p className="mt-1 text-xs leading-5 text-white/65">Ask about wholesale and trade pricing.</p>
              <Link href="/trade" className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-lg bg-brand-gold px-3 py-2 text-xs font-bold text-brand-forest">Wholesale details <ArrowRight className="h-3.5 w-3.5" /></Link>
            </section>
          </main>

          <nav aria-label="Mobile quick navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-forest/10 bg-white/95 px-3 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur-xl">
            <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
              <Link href="/" className="flex min-h-11 items-center justify-center gap-2 rounded-xl text-xs font-bold text-brand-forest/70"><ArrowLeft className="h-4 w-4" />Home</Link>
              <button type="button" onClick={() => setIsCartOpen(true)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#06442E] text-xs font-bold text-white"><ShoppingCart className="h-4 w-4 text-brand-gold" />Cart ({totalCount})</button>
              <Link href="/trade" className="flex min-h-11 items-center justify-center gap-2 rounded-xl text-xs font-bold text-brand-forest/70">Wholesale <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
