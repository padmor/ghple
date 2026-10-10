"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Leaf,
  FlaskConical,
  ShieldCheck,
  Flame,
  MapPin,
  Timer,
  ShoppingCart,
  ArrowRight,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Star,
  Truck,
  Package,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Camera,
  Box,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useManager } from "@/context/manager-context";
import { CartDrawer } from "@/components/cart-drawer";
import { CheckoutDialog } from "@/components/checkout-dialog";
import { TrackOrderDialog } from "@/components/track-order-dialog";
import { Navbar } from "@/components/navbar";
import dynamic from "next/dynamic";
import { BottleIllustration } from "@/components/bottle-illustration";
import { formatGHS } from "@/lib/utils";

const Bottle3D = dynamic(
  () => import("@/components/bottle-3d").then((mod) => mod.Bottle3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[420px] sm:h-[460px] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
        <span className="text-xs font-serif text-brand-gold/70 tracking-widest uppercase">
          Crafting 3D Bottle...
        </span>
      </div>
    ),
  }
);

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Leaf,
  FlaskConical,
  ShieldCheck,
  Flame,
  MapPin,
  Timer,
};

const FAQS = [
  {
    q: "What does 'with the mother' mean?",
    a: "The 'mother' refers to the natural strands of proteins, enzymes and beneficial bacteria that form during fermentation. It appears as a cloudy sediment and is a sign of a raw, unfiltered product.",
  },
  {
    q: "How should I store the vinegar?",
    a: "Store in a cool, dry place away from direct sunlight. Refrigeration is not required. Once opened, consume within 12 months for best quality.",
  },
  {
    q: "Do you deliver nationwide in Ghana?",
    a: "Yes. We deliver to all 16 regions of Ghana. Delivery times vary by location — typically 1–3 business days for Accra and Kumasi, 3–5 days for other regions.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept MTN Mobile Money, Telecel Cash, AirtelTigo Money, and Cash on Delivery.",
  },
  {
    q: "Can I buy in bulk for my shop or business?",
    a: "Yes. We offer wholesale and trade pricing for retailers, health stores, and distributors. Visit our Trade page or call us directly.",
  },
];

const TESTIMONIALS = [
  {
    name: "Abena K.",
    location: "Accra",
    text: "I've tried other brands but Gid's is the only one that actually smells and tastes right. The mother is always there. Proper quality.",
    rating: 5,
  },
  {
    name: "Kofi A.",
    location: "Kumasi",
    text: "Use it in my cooking every day. Delivery was fast and the bottle was well sealed. Will order again.",
    rating: 5,
  },
  {
    name: "Maame D.",
    location: "Cape Coast",
    text: "Love that it's made locally. Good to know where it comes from. The 1L bottle is great value.",
    rating: 5,
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full py-4 text-left gap-4 focus-ring rounded-sm"
        aria-expanded={open}
      >
        <span className="font-semibold text-brand-forest text-sm leading-snug">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-brand-gold flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-brand-sage flex-shrink-0" />
        )}
      </button>
      {open && (
        <p className="pb-4 text-sm text-brand-forest/70 leading-relaxed animate-fade-in">
          {a}
        </p>
      )}
    </div>
  );
}

export default function HomePage() {
  const { addToCart } = useCart();
  const { products, benefits, processSteps, ceo, settings } = useManager();

  const [selectedHeroId, setSelectedHeroId] = useState<string>("");
  const [heroQuantity, setHeroQuantity] = useState<number>(1);
  const [justAddedHero, setJustAddedHero] = useState<boolean>(false);
  const [heroVisualMode, setHeroVisualMode] = useState<"photo" | "3d">("photo");
  const pillTrackRef = useRef<HTMLDivElement>(null);

  // Pick active product: user selection -> Most Popular -> first available product
  const activeProduct =
    products.find((p) => p.id === selectedHeroId) ||
    products.find((p) => p.badge?.toLowerCase().includes("popular")) ||
    products[0] ||
    null;

  const handleHeroAddToCart = () => {
    if (!activeProduct || !activeProduct.inStock) return;
    addToCart(activeProduct, heroQuantity);
    setJustAddedHero(true);
    setTimeout(() => setJustAddedHero(false), 2000);
  };

  const handlePrevProduct = () => {
    if (products.length <= 1) return;
    const currentIndex = products.findIndex((p) => p.id === activeProduct?.id);
    const prevIndex = (currentIndex - 1 + products.length) % products.length;
    setSelectedHeroId(products[prevIndex].id);
    setHeroQuantity(1);
  };

  const handleNextProduct = () => {
    if (products.length <= 1) return;
    const currentIndex = products.findIndex((p) => p.id === activeProduct?.id);
    const nextIndex = (currentIndex + 1) % products.length;
    setSelectedHeroId(products[nextIndex].id);
    setHeroQuantity(1);
  };

  const scrollPillTrack = (direction: "left" | "right") => {
    if (pillTrackRef.current) {
      pillTrackRef.current.scrollBy({
        left: direction === "left" ? -140 : 140,
        behavior: "smooth",
      });
    }
  };

  // Keep active pill scrolled into view automatically
  useEffect(() => {
    if (!activeProduct || !pillTrackRef.current) return;
    const activeEl = pillTrackRef.current.querySelector<HTMLButtonElement>(
      `[data-product-id="${activeProduct.id}"]`
    );
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeProduct?.id]);

  return (
    <>
      <Navbar />
      <CartDrawer />
      <CheckoutDialog />
      <TrackOrderDialog />

      <main>
        {/* ═══════════════════════════════════════
            HERO — 2-column Artisanal Product Hero Showcase
        ═══════════════════════════════════════ */}
        <section className="relative min-h-screen flex items-center pt-24 pb-16 lg:pt-28 lg:pb-24 overflow-hidden bg-brand-forest">
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/background.jpg"
              alt="Gid's Apple Orchard background"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            {/* Dark gradient overlay for rich contrast and legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/45" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/75 via-transparent to-black/40" />
          </div>

          <div className="relative z-10 section-container w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-14 items-center">
              {/* Left Column: Brand Story & Trust */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-6">
                {/* Region Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-gold/15 border border-brand-gold/30 px-3.5 py-1 text-brand-gold animate-fade-in">
                  <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Handcrafted in Cape Coast, Ghana
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight text-shadow-md animate-fade-in">
                  Raw. Unfiltered.
                  <br />
                  <span className="text-brand-gold">Real.</span>
                </h1>

                {/* Copy */}
                <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-xl text-shadow-sm animate-fade-in">
                  Gid&apos;s Apple Cider Vinegar — handcrafted the authentic way with the living
                  mother culture intact. Cold-pressed, unpasteurized, and free from shortcuts or artificial additives.
                </p>

                {/* Direct Action Links */}
                <div className="flex flex-wrap items-center gap-4 pt-2 animate-fade-in">
                  <a
                    href="#products"
                    className="btn-gold text-sm sm:text-base px-6 py-3.5 gap-2"
                  >
                    <span>View All Sizes</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#process"
                    className="btn-white-outline text-sm sm:text-base px-6 py-3.5"
                  >
                    See How It&apos;s Made
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="pt-6 border-t border-white/10 flex flex-wrap gap-5 sm:gap-7 animate-fade-in">
                  {[
                    { icon: Truck, label: "Nationwide delivery across Ghana" },
                    { icon: ShieldCheck, label: "Quality & acidity tested" },
                    { icon: Package, label: "Secure glass bottle packing" },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2.5 text-white/75 text-xs sm:text-sm"
                    >
                      <Icon className="w-4 h-4 text-brand-gold flex-shrink-0" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Hero Product Showcase Stage (Interactive product display for admin products) */}
              <div className="lg:col-span-5 xl:col-span-5 w-full max-w-lg mx-auto lg:max-w-none animate-fade-in">
                {activeProduct ? (
                  <div className="bg-brand-forest-mid/90 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden transition-all duration-300">
                    {/* Atmospheric warm glow in background */}
                    <div className="absolute -top-20 -right-20 w-56 h-56 bg-brand-gold/20 rounded-full blur-3xl pointer-events-none" />

                    {/* Top Row: Badge + Live Stock status */}
                    <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
                      {activeProduct.badge ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold/20 text-brand-gold text-xs font-bold tracking-wider uppercase px-3 py-1 border border-brand-gold/30">
                          <Star className="w-3 h-3 fill-brand-gold text-brand-gold" />
                          {activeProduct.badge}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-white/10 text-white/70 text-xs font-semibold px-3 py-1">
                          Craft Batch
                        </span>
                      )}

                      {activeProduct.inStock ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-semibold text-red-300 bg-red-950/60 border border-red-500/30 px-2.5 py-0.5 rounded-full">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Bottle Visual Stage — recessed well with prev/next nav */}
                    <div className="relative -mx-6 sm:-mx-7 mt-1 mb-1">
                      {/* Stage well: dark recessed background */}
                      <div className="relative bg-gradient-to-b from-black/60 via-brand-forest/80 to-black/70 border-y border-white/8 overflow-hidden">

                        {/* Radial warm glow on the floor */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-brand-gold/15 rounded-full blur-3xl pointer-events-none" />
                        {/* Top vignette */}
                        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
                        {/* Side rim lights */}
                        <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-brand-gold/6 to-transparent pointer-events-none" />
                        <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-brand-gold/6 to-transparent pointer-events-none" />

                        {/* Previous / Next arrows */}
                        {products.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={handlePrevProduct}
                              aria-label="Previous product"
                              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 text-white/80 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 backdrop-blur-sm focus-ring"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={handleNextProduct}
                              aria-label="Next product"
                              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 text-white/80 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 backdrop-blur-sm focus-ring"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* View Mode Toggle (Photo vs 3D) */}
                        <div className="absolute top-3 right-3 z-20 flex items-center bg-black/60 border border-white/15 rounded-full p-0.5 backdrop-blur-md shadow-lg">
                          <button
                            type="button"
                            onClick={() => setHeroVisualMode("photo")}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                              heroVisualMode === "photo"
                                ? "bg-brand-gold text-brand-forest shadow font-bold"
                                : "text-white/70 hover:text-white"
                            }`}
                          >
                            <Camera className="w-3 h-3" />
                            <span>Photo</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setHeroVisualMode("3d")}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                              heroVisualMode === "3d"
                                ? "bg-brand-gold text-brand-forest shadow font-bold"
                                : "text-white/70 hover:text-white"
                            }`}
                          >
                            <Box className="w-3 h-3" />
                            <span>3D</span>
                          </button>
                        </div>

                        {/* Product Visual Display */}
                        {heroVisualMode === "photo" ? (
                          activeProduct.image ? (
                            <div className="w-full h-[420px] sm:h-[460px] flex items-center justify-center p-6 relative group overflow-hidden select-none">
                              <img
                                src={activeProduct.image}
                                alt={`${activeProduct.name} - ${activeProduct.size}`}
                                className="max-h-[92%] max-w-[88%] object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.7)] transition-all duration-700 ease-out group-hover:scale-105"
                              />
                              {/* Bottom pill caption */}
                              <div className="absolute inset-x-0 bottom-2.5 text-center pointer-events-none">
                                <span className="inline-block text-[11px] font-medium tracking-wide text-brand-gold/90 bg-brand-forest/90 border border-brand-gold/30 rounded-full px-3.5 py-1 shadow-md backdrop-blur-sm">
                                  ✦ {activeProduct.size} · Handcrafted in Cape Coast, Ghana
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-[420px] sm:h-[460px] flex items-center justify-center p-6 select-none">
                              <BottleIllustration
                                size={activeProduct.size}
                                volumeMl={activeProduct.volumeMl}
                                className="w-48 sm:w-56 h-auto drop-shadow-2xl"
                              />
                            </div>
                          )
                        ) : (
                          <Bottle3D
                            size={activeProduct.size}
                            volumeMl={activeProduct.volumeMl}
                            className="w-full h-[420px] sm:h-[460px]"
                          />
                        )}
                      </div>
                    </div>

                    {/* Adaptive Product Size Selector Track (Handles any number of products elegantly) */}
                    <div className="mt-3 pt-3 border-t border-white/10 relative z-10">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white/60 font-medium">Select Size:</span>
                          <span className="text-brand-gold font-semibold text-[11px]">
                            ({products.findIndex((p) => p.id === activeProduct.id) + 1} of {products.length})
                          </span>
                        </div>

                        {/* Track Scroll Controls if more than 3 products */}
                        {products.length > 3 && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => scrollPillTrack("left")}
                              className="w-5 h-5 rounded-md bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors focus-ring"
                              aria-label="Scroll sizes left"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => scrollPillTrack("right")}
                              className="w-5 h-5 rounded-md bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors focus-ring"
                              aria-label="Scroll sizes right"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Horizontal snap-scrolling pill track (Fixed height, never wraps or expands card) */}
                      <div
                        ref={pillTrackRef}
                        className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1 px-0.5 -mx-0.5"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                      >
                        {products.map((p) => {
                          const isSelected = p.id === activeProduct.id;
                          return (
                            <button
                              key={p.id}
                              data-product-id={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedHeroId(p.id);
                                setHeroQuantity(1);
                              }}
                              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap snap-start ${
                                isSelected
                                  ? "bg-brand-gold text-brand-forest shadow font-bold scale-[1.02]"
                                  : "bg-white/5 hover:bg-white/15 text-white/80 border border-white/10 hover:border-white/20"
                              }`}
                            >
                              {p.image && (
                                <span className="w-4 h-5 rounded overflow-hidden bg-black/40 flex-shrink-0 flex items-center justify-center p-0.5">
                                  <img src={p.image} alt="" className="w-full h-full object-contain" />
                                </span>
                              )}
                              <span>{p.size}</span>
                              <span
                                className={`text-[10px] ${
                                  isSelected ? "text-brand-forest/80 font-bold" : "text-brand-gold"
                                }`}
                              >
                                · {formatGHS(p.price)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Price, Name & Short Description */}
                    <div className="mt-4 pt-3 border-t border-white/10 relative z-10">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-white/50">Price</p>
                          <p className="text-3xl font-extrabold text-brand-gold">
                            {formatGHS(activeProduct.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/80 font-bold">{activeProduct.name}</p>
                          <p className="text-[11px] text-white/50">{activeProduct.size}</p>
                        </div>
                      </div>

                      <p className="text-xs text-white/65 line-clamp-2 mb-4 leading-relaxed">
                        {activeProduct.description}
                      </p>

                      {/* Quantity & Add to Cart Controls */}
                      <div className="flex items-center gap-2.5">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-white/20 rounded-xl bg-white/5 px-1 py-0.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setHeroQuantity((q) => Math.max(1, q - 1))}
                            disabled={!activeProduct.inStock}
                            className="w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-40"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm font-bold text-white">
                            {heroQuantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setHeroQuantity((q) => Math.min(99, q + 1))}
                            disabled={!activeProduct.inStock}
                            className="w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Add to Cart CTA */}
                        <button
                          type="button"
                          onClick={handleHeroAddToCart}
                          disabled={!activeProduct.inStock}
                          className={`flex-1 btn-gold py-2.5 px-3 text-xs sm:text-sm font-bold gap-2 justify-center shadow-lg transition-transform active:scale-[0.98] ${
                            !activeProduct.inStock
                              ? "opacity-50 cursor-not-allowed bg-slate-600 text-white"
                              : ""
                          }`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {activeProduct.inStock
                            ? justAddedHero
                              ? "Added to Cart!"
                              : `Add to Cart · ${formatGHS(activeProduct.price * heroQuantity)}`
                            : "Out of Stock"}
                        </button>
                      </div>

                      <p className="text-[10px] text-center text-white/45 mt-2.5">
                        ⚡ Fast checkout · MTN MoMo, Telecel Cash & Cash on Delivery
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-brand-forest-mid/80 border border-white/10 rounded-3xl p-8 text-center text-white/60">
                    No products added yet. Add products in the admin panel to showcase them here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            BENEFITS — 6-card grid
        ═══════════════════════════════════════ */}
        <section className="bg-brand-ivory py-20" id="benefits">
          <div className="section-container">
            <div className="mb-12">
              <p className="section-label mb-3">Why Choose Gid&apos;s</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-forest">
                What makes it different
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {benefits.map((b, i) => {
                const Icon = ICON_MAP[b.icon] ?? Leaf;
                const isWide = i === 0 || i === 5;
                return (
                  <div
                    key={b.id}
                    className={`bg-white rounded-2xl p-6 border border-border shadow-card
                      transition-shadow duration-200 hover:shadow-card-hover
                      ${isWide ? "sm:col-span-2 lg:col-span-1" : ""}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-forest/8 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-brand-forest" />
                    </div>
                    <h3 className="font-bold text-brand-forest mb-2">{b.title}</h3>
                    <p className="text-sm text-brand-forest/60 leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            PRODUCTS — dynamic catalog grid
        ═══════════════════════════════════════ */}
        <section className="bg-brand-forest py-20" id="products">
          <div className="section-container">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
              <div>
                <p className="section-label text-brand-gold mb-3">Our Products</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-white">
                  Choose your size
                </h2>
              </div>
              <p className="text-white/60 text-sm max-w-sm sm:text-right">
                {products.length === 1
                  ? "Raw, unfiltered apple cider vinegar with the living mother culture intact."
                  : `Same premium vinegar, available in ${products.length} handcrafted sizes. All raw, all unfiltered.`}
              </p>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16 text-white/40">
                No products currently available. Check back soon.
              </div>
            ) : (
              <div
                className={`grid grid-cols-1 ${
                  products.length === 1
                    ? "max-w-md mx-auto"
                    : products.length === 2
                    ? "md:grid-cols-2 max-w-4xl mx-auto"
                    : "md:grid-cols-2 lg:grid-cols-3"
                } gap-6`}
              >
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`bg-brand-forest-mid rounded-2xl p-6 sm:p-7 border border-white/10
                      flex flex-col justify-between gap-6 transition-all duration-200 hover:-translate-y-1 hover:border-brand-gold/30 ${
                        !product.inStock ? "opacity-75" : ""
                      }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        {product.badge ? (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full
                            bg-brand-gold/20 text-brand-gold text-xs font-bold tracking-wider uppercase
                            px-3 py-1 border border-brand-gold/30"
                          >
                            <Star className="w-3 h-3 fill-brand-gold text-brand-gold" />
                            {product.badge}
                          </span>
                        ) : (
                          <span className="text-[11px] uppercase tracking-wider text-white/40 font-medium">
                            Raw & Unfiltered
                          </span>
                        )}

                        {product.inStock ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                            In Stock
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-red-300 bg-red-950/60 border border-red-500/30 px-2.5 py-0.5 rounded-full">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Visual & Size display */}
                      <div className="flex items-center gap-5 my-2">
                        <div className="w-20 sm:w-24 h-28 flex-shrink-0 flex items-center justify-center p-2 bg-brand-forest/60 rounded-xl border border-white/5 overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.size}
                              className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                            />
                          ) : (
                            <BottleIllustration
                              size={product.size}
                              volumeMl={product.volumeMl}
                              className="w-16 sm:w-20 h-auto"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-3xl sm:text-4xl font-extrabold text-white leading-none">
                            {product.size}
                          </p>
                          <p className="text-xs text-brand-gold/80 font-medium mt-1">
                            {product.volumeMl > 0 ? `${product.volumeMl} ml Net Content` : "Standard Bottle"}
                          </p>
                          <p className="text-white/60 text-xs leading-relaxed mt-2 line-clamp-3">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price and Add button */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Price</p>
                        <p className="text-2xl sm:text-3xl font-extrabold text-brand-gold">
                          {formatGHS(product.price)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (product.inStock) addToCart(product, 1);
                        }}
                        disabled={!product.inStock}
                        className={`btn-gold text-xs sm:text-sm px-4 py-2.5 gap-2 ${
                          !product.inStock ? "opacity-40 cursor-not-allowed bg-slate-600 text-white" : ""
                        }`}
                        aria-label={`Add ${product.size} to cart`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {product.inStock ? "Add to Cart" : "Out of Stock"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════
            PROCESS — numbered steps on ivory
        ═══════════════════════════════════════ */}
        <section className="bg-white py-20" id="process">
          <div className="section-container">
            <div className="mb-12">
              <p className="section-label mb-3">From Apple to Bottle</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-forest">
                How it&apos;s made
              </h2>
              <p className="mt-3 text-brand-forest/60 max-w-lg text-sm leading-relaxed">
                Every bottle goes through the same careful process. Nothing rushed, nothing skipped.
              </p>
            </div>

            {/* Steps — horizontal scroll on mobile, grid on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {processSteps.map((step, i) => (
                <div key={step.id} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="step-circle flex-shrink-0">
                      {step.number}
                    </div>
                    {i < processSteps.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-3 hidden lg:block" />
                    )}
                  </div>
                  <div className="pb-8 lg:pb-0">
                    <h3 className="font-bold text-brand-forest mb-1.5">{step.title}</h3>
                    <p className="text-sm text-brand-forest/60 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            CEO / FOUNDER — editorial split
        ═══════════════════════════════════════ */}
        {ceo.name && (
          <section className="bg-brand-forest py-20" id="about">
            <div className="section-container">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Photo */}
                <div className="flex justify-center lg:justify-start">
                  <div className="relative">
                    <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-3xl overflow-hidden bg-brand-forest-mid border border-white/10">
                      {ceo.photoPath ? (
                        <Image
                          src={ceo.photoPath}
                          alt={ceo.name}
                          fill
                          className="object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-7xl font-bold text-white/10">
                            {ceo.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Name card below photo */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-brand-gold
                      text-brand-forest px-5 py-2 rounded-full text-xs font-bold tracking-wide
                      whitespace-nowrap shadow-gold-sm">
                      {ceo.title}
                    </div>
                  </div>
                </div>

                {/* Text */}
                <div className="text-white">
                  <p className="section-label text-brand-gold mb-4">Our Founder</p>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
                    {ceo.name}
                  </h2>
                  {ceo.quote && (
                    <blockquote className="border-l-2 border-brand-gold pl-5 mb-6">
                      <p className="text-white/80 italic text-lg leading-relaxed">
                        &ldquo;{ceo.quote}&rdquo;
                      </p>
                    </blockquote>
                  )}
                  <p className="text-white/60 leading-relaxed text-sm">{ceo.bio}</p>
                  <a href="#process" className="btn-white-outline mt-8 inline-flex gap-2">
                    See our process <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════
            TESTIMONIALS
        ═══════════════════════════════════════ */}
        <section className="bg-brand-ivory py-20">
          <div className="section-container">
            <div className="mb-10">
              <p className="section-label mb-3">Customer Reviews</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-forest">
                What people say
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="bg-white rounded-2xl p-6 border border-border shadow-card">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-brand-gold text-brand-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-brand-forest/70 leading-relaxed mb-5">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-forest flex items-center justify-center
                      text-white font-bold text-sm flex-shrink-0">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-brand-forest text-sm">{t.name}</p>
                      <p className="text-xs text-brand-forest/40">{t.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            TRADE CTA
        ═══════════════════════════════════════ */}
        <section className="bg-brand-gold py-16" id="trade">
          <div className="section-container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-brand-forest">
                  Retailer or wholesaler?
                </h2>
                <p className="mt-2 text-brand-forest/70 text-sm max-w-md leading-relaxed">
                  We supply health stores, supermarkets and distributors across Ghana.
                  Bulk pricing available for orders of 30+ bottles.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <a
                  href={`https://wa.me/${(settings.whatsappNumber || "233540000000").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello GBHPL, I would like to inquire about wholesale / trade pricing.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-forest-outline justify-center bg-white/20"
                >
                  WhatsApp Inquiries
                </a>
                <a
                  href={`tel:${settings.phone || "+233000000000"}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg
                    bg-brand-forest text-white font-semibold px-6 py-3 text-sm
                    transition-all duration-200 hover:bg-brand-forest-light hover:-translate-y-0.5
                    focus-ring"
                >
                  <Phone className="w-4 h-4" /> Call Us
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FAQ
        ═══════════════════════════════════════ */}
        <section className="bg-white py-20" id="faq">
          <div className="section-container">
            <div className="max-w-2xl mx-auto">
              <div className="mb-10">
                <p className="section-label mb-3">Common Questions</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-brand-forest">
                  FAQs
                </h2>
              </div>
              <div className="divide-y-0">
                {FAQS.map((faq) => (
                  <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════ */}
        <footer className="bg-brand-forest text-white/60">
          <div className="section-container py-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {/* Brand */}
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded bg-brand-gold flex items-center justify-center">
                    <span className="text-brand-forest font-bold text-xs">G</span>
                  </div>
                  <span className="text-white font-bold">GBHPL</span>
                </div>
                <p className="text-sm leading-relaxed mb-5">
                  Gid&apos;s Beverages &amp; Health Products Ltd.
                  Crafting honest health products in Cape Coast since 2018.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-gold flex-shrink-0" />
                    Cape Coast, Central Region, Ghana
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
                    <a href="tel:+233000000000" className="hover:text-white transition-colors">
                      +233 XX XXX XXXX
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-brand-gold flex-shrink-0" />
                    <a href="mailto:hello@gbhpl.com" className="hover:text-white transition-colors">
                      hello@gbhpl.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Shop */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Shop</h3>
                <ul className="space-y-3 text-sm">
                  {[
                    { href: "#products", label: "500 ml Bottle" },
                    { href: "#products", label: "1000 ml Bottle" },
                    { href: "/trade", label: "Wholesale" },
                  ].map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="hover:text-white transition-colors underline-hover">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Company</h3>
                <ul className="space-y-3 text-sm">
                  {[
                    { href: "/about", label: "About Us" },
                    { href: "#process", label: "Our Process" },
                    { href: "/trade", label: "Trade Partners" },
                    { href: "#faq", label: "FAQs" },
                  ].map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="hover:text-white transition-colors underline-hover">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Manager */}
              <div>
                <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Staff</h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link
                      href="/manager"
                      className="hover:text-brand-gold transition-colors text-white/40 underline-hover text-xs"
                    >
                      Manager Panel →
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10">
            <div className="section-container py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
              <p>© {new Date().getFullYear()} Gid&apos;s Beverages &amp; Health Products Ltd. All rights reserved.</p>
              <p>Cape Coast, Ghana</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
