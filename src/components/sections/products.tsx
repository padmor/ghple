"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { useManager } from "@/context/manager-context";
import { BottleIllustration } from "@/components/product/bottle-illustration";
import { formatGHS } from "@/lib/utils";
import { ShoppingCart, ArrowRight, Star, ChevronLeft, ChevronRight } from "@/components/ui/icons";

export function ProductsSection() {
  const { addToCart } = useCart();
  const { products } = useManager();
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const productScroller = useRef<HTMLDivElement>(null);
  const scrollProducts = (dir: 1 | -1) =>
    productScroller.current?.scrollBy({ left: dir * 560, behavior: "smooth" });

  return (
    <>
        <section className="relative bg-brand-forest py-12 sm:py-16 overflow-hidden" id="products">
          {/* Background image & atmospheric overlays */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src="/images/backgrounds/products-bg.jpg"
              alt="Gid's Apple Cider Vinegar handcrafted background"
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
            {/* Dark gradient overlay for rich contrast, readability, and depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-black/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/70 via-transparent to-brand-forest/40" />
          </div>

          <div className="relative z-10 section-container">
            <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gold sm:text-xs">
                  <span className="h-px w-6 bg-brand-gold" />
                  Our Products
                </p>
                <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Choose your product
                </h2>
                <p className="mt-1.5 hidden text-sm text-white/65 sm:block">
                  {products.length === 1
                    ? "Raw, unfiltered apple cider vinegar with the living mother culture intact."
                    : `Same premium vinegar in ${products.length} handcrafted sizes — all raw, all unfiltered.`}
                </p>
              </div>

              <Link
                href="/products"
                className="group inline-flex flex-shrink-0 items-center gap-2 rounded-full border border-white/25 py-1.5 pl-4 pr-1.5 text-xs font-bold text-white transition-all hover:border-brand-gold hover:bg-white/5 focus-ring sm:text-sm"
              >
                View all
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold text-brand-forest transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16 text-white/40">
                No products currently available. Check back soon.
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm sm:p-6">
                {/* Horizontal scroller */}
                <div
                  ref={productScroller}
                  className="scrollbar-hide flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-smooth pb-4 sm:gap-6"
                >
                  {products.map((product) => {
                    const expanded = expandedProduct === product.id;
                    return (
                      <article
                        key={product.id}
                        className={`group flex w-[92%] flex-shrink-0 snap-start flex-row overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_18px_40px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/60 hover:shadow-[0_28px_56px_rgba(0,0,0,0.4)] sm:w-[540px] ${
                          !product.inStock ? "opacity-80" : ""
                        }`}
                      >
                        {/* Image — left */}
                        <div className="relative m-2 flex w-[38%] flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_50%_35%,#fffdf6_0%,#fbf1d6_55%,#f3e2b3_100%)] sm:w-[40%]">
                          <div className="absolute bottom-3 h-3 w-16 rounded-full bg-black/10 blur-md" />
                          {product.badge && (
                            <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-brand-forest px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-gold shadow-md sm:px-2.5 sm:py-1 sm:text-[10px]">
                              <Star className="h-2.5 w-2.5 fill-brand-gold" />
                              {product.badge}
                            </span>
                          )}
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={`${product.name} — ${product.size}`}
                              width={600}
                              height={600}
                              sizes="(max-width: 640px) 35vw, 220px"
                              unoptimized={/^(https?:)?\/\//.test(product.image) || product.image.startsWith("data:") || product.image.startsWith("blob:")}
                              className="relative h-full min-h-[180px] w-full object-contain p-3 drop-shadow-[0_10px_14px_rgba(0,0,0,0.2)] transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <BottleIllustration
                              size={product.size}
                              volumeMl={product.volumeMl}
                              className="relative h-auto w-16"
                            />
                          )}
                        </div>

                        {/* Details — right */}
                        <div className="flex min-w-0 flex-1 flex-col py-3 pl-2 pr-3 sm:py-4 sm:pl-3 sm:pr-5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold sm:text-[11px]">
                              {product.volumeMl > 0 ? `${product.volumeMl} ml` : "Bottle"}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-semibold sm:text-[11px] ${
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

                          <h3 className="mt-1 text-lg font-extrabold leading-tight tracking-tight text-black sm:text-2xl">
                            {product.size}
                          </h3>
                          <p className="text-xs font-semibold text-black sm:text-sm">
                            {product.name}
                          </p>

                          <p
                            className={`mt-2 text-xs leading-relaxed text-black sm:text-sm ${
                              expanded ? "" : "line-clamp-2"
                            }`}
                          >
                            {product.description}
                          </p>
                          <button
                            type="button"
                            onClick={() => setExpandedProduct(expanded ? null : product.id)}
                            aria-expanded={expanded}
                            className="mt-1 self-start rounded text-[11px] font-bold text-black underline decoration-brand-gold decoration-2 underline-offset-4 transition-colors hover:text-brand-gold focus-ring sm:text-xs"
                          >
                            {expanded ? "Read less" : "Read more"}
                          </button>

                          <div className="flex-1" />

                          <div className="mt-3 flex items-center justify-between gap-2 border-t border-dashed border-black/15 pt-3">
                            <div>
                              <p className="text-xl font-black leading-none tracking-tight text-black sm:text-2xl">
                                {formatGHS(product.price)}
                              </p>
                              {product.volumeMl > 0 && (
                                <p className="mt-1 text-[10px] text-black/50">
                                  {formatGHS((product.price / product.volumeMl) * 100)} / 100 ml
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (product.inStock) addToCart(product, 1);
                              }}
                              disabled={!product.inStock}
                              aria-label={`Add ${product.size} to cart`}
                              className={`flex h-10 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-bold transition-all active:scale-[0.98] sm:px-4 sm:text-sm ${
                                product.inStock
                                  ? "bg-brand-forest text-brand-gold hover:bg-brand-gold hover:text-brand-forest"
                                  : "cursor-not-allowed bg-slate-200 text-slate-500"
                              }`}
                            >
                              <ShoppingCart className="h-4 w-4" />
                              {product.inStock ? "Add" : "Sold out"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  {/* Last card — leads to the full catalogue */}
                  <Link
                    href="/products"
                    className="group flex w-[60%] flex-shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/30 bg-white/5 p-6 text-center text-white backdrop-blur-sm transition-all hover:border-brand-gold hover:bg-white/10 sm:w-[240px]"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold text-brand-forest transition-transform group-hover:translate-x-1">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                    <span className="font-bold">View all sizes</span>
                  </Link>
                </div>

                {/* Scroll controls */}
                <div className="mt-4 flex items-center justify-center gap-3 sm:justify-between">
                  <p className="hidden text-xs text-white/50 sm:block">Swipe or use the arrows to browse</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => scrollProducts(-1)}
                      aria-label="Scroll products left"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10 focus-ring"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollProducts(1)}
                      aria-label="Scroll products right"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10 focus-ring"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
    </>
  );
}
