"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { LottieCheckIcon } from "@/components/lottie-check-icon";
import {
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
import { MobileHome } from "@/components/mobile-home";
import dynamic from "next/dynamic";
import { BottleIllustration } from "@/components/bottle-illustration";
import { formatGHS } from "@/lib/utils";

const Bottle3D = dynamic(
  () => import("@/components/bottle-3d").then((mod) => mod.Bottle3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[220px] sm:h-[300px] lg:h-[320px] xl:h-[340px] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
        <span className="text-xs font-serif text-brand-gold/70 tracking-widest uppercase">
          Crafting 3D Bottle...
        </span>
      </div>
    ),
  }
);

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  FlaskConical,
  ShieldCheck,
  Flame,
  MapPin,
  Timer,
};


const canOptimizeImage = (src: string) =>
  src.startsWith("/") ||
  src.startsWith("https://slmnzdpvbjesuwwqvcfi.supabase.co/storage/v1/object/public/site_content/");

const PROCESS_IMAGES = [
  {
    src: "https://slmnzdpvbjesuwwqvcfi.supabase.co/storage/v1/object/public/site_content/apples-1872997.jpg",
    alt: "Apples selected for the cider-making process",
  },
  {
    src: "https://slmnzdpvbjesuwwqvcfi.supabase.co/storage/v1/object/public/site_content/extractio.jpg",
    alt: "Apples being pressed to extract their juice",
  },
  {
    src: "https://slmnzdpvbjesuwwqvcfi.supabase.co/storage/v1/object/public/site_content/fermentation.jpg",
    alt: "Cider fermenting during production",
  },
  {
    src: "https://slmnzdpvbjesuwwqvcfi.supabase.co/storage/v1/object/public/site_content/bottling.jpg",
    alt: "Cider being bottled and prepared for sale",
  },
];

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
        className="flex items-center justify-between w-full py-3 sm:py-4 text-left gap-3 sm:gap-4 focus-ring rounded-sm"
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

  // Keep the homepage concise as the full catalogue grows.
  const homepageProducts = products.slice(0, 6);

  const [selectedHeroId, setSelectedHeroId] = useState<string>("");
  const [heroQuantity, setHeroQuantity] = useState<number>(1);
  const [justAddedHero, setJustAddedHero] = useState<boolean>(false);
  const [heroVisualMode, setHeroVisualMode] = useState<"photo" | "3d">("photo");
  const pillTrackRef = useRef<HTMLDivElement>(null);
  const [activeProcessStepIndex, setActiveProcessStepIndex] = useState(0);
  const activeProcessStep = processSteps[activeProcessStepIndex] ?? processSteps[0] ?? null;

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
      {/* Separate phone-first interface; shopping state and product data remain shared. */}
      <div className="sm:hidden">
        <MobileHome />
      </div>

      <div className="hidden sm:block">
        <Navbar />

      <main>
        {/* ═══════════════════════════════════════
            HERO — 2-column Artisanal Product Hero Showcase
        ═══════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-brand-forest pt-[72px] pb-7 text-white sm:hidden">
          {/* Phone-first hero: a calm background and a single clear product action. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-forest-light/30 via-brand-forest to-brand-forest" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 top-16 h-56 w-56 rounded-full bg-brand-gold/15 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-80 h-56 w-56 rounded-full bg-brand-sage/10 blur-3xl" />

          <div className="section-container relative z-10">
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-3 py-1.5 text-brand-gold">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em]">Made in Cape Coast, Ghana</span>
              </div>

              <h1 className="mt-4 text-[2.1rem] font-extrabold leading-[1.02] tracking-[-0.035em] text-white">
                Raw. Unfiltered.
                <br />
                <span className="text-brand-gold">Real.</span>
              </h1>

              <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
                Authentic apple cider vinegar, handcrafted with the living mother culture intact.
              </p>

              <div className="mt-5 flex items-center gap-3">
                <a href="#products" className="btn-gold inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold">
                  Shop bottle sizes <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#process" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-3 py-3 text-xs font-semibold text-white/85 transition hover:bg-white/10">
                  Our process
                </a>
              </div>
            </div>

            {activeProduct ? (
              <div className="relative mt-6 overflow-hidden rounded-[1.4rem] border border-white/15 bg-white/[0.06] p-3 shadow-2xl">
                <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-brand-gold/15 blur-3xl" />

                <div className="relative z-10 flex items-center justify-between gap-2">
                  {activeProduct.badge ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-brand-gold/30 bg-brand-gold/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-gold">
                      <Star className="h-3 w-3 fill-brand-gold" />
                      {activeProduct.badge}
                    </span>
                  ) : (
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/75">Featured bottle</span>
                  )}
                  <span className={activeProduct.inStock ? "inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300" : "inline-flex items-center gap-1.5 text-[10px] font-semibold text-red-300"}>
                    <span className={activeProduct.inStock ? "h-1.5 w-1.5 rounded-full bg-emerald-300" : "h-1.5 w-1.5 rounded-full bg-red-300"} />
                    {activeProduct.inStock ? "In stock" : "Out of stock"}
                  </span>
                </div>

                <div className="relative mt-3 flex h-[224px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent">
                  <div aria-hidden="true" className="pointer-events-none absolute bottom-2 h-20 w-40 rounded-full bg-brand-gold/10 blur-2xl" />
                  {activeProduct.image ? (
                    <Image
                      src={activeProduct.image}
                      alt={activeProduct.name + " - " + activeProduct.size}
                      width={500}
                      height={500}
                      sizes="(max-width: 639px) 76vw, 300px"
                      quality={82}
                      unoptimized={!canOptimizeImage(activeProduct.image)}
                      className="relative z-10 h-full max-h-[214px] max-w-[78%] object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.5)]"
                    />
                  ) : (
                    <BottleIllustration
                      size={activeProduct.size}
                      volumeMl={activeProduct.volumeMl}
                      className="relative z-10 h-auto w-40 drop-shadow-2xl"
                    />
                  )}
                </div>

                <div className="relative z-10 mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">Featured product</p>
                    <h2 className="mt-1 text-base font-bold leading-snug text-white">{activeProduct.name}</h2>
                    <p className="mt-0.5 text-xs text-white/55">{activeProduct.size}</p>
                  </div>
                  <p className="shrink-0 pt-1 text-xl font-extrabold tracking-tight text-brand-gold">{formatGHS(activeProduct.price)}</p>
                </div>

                <div className="relative z-10 mt-4 border-t border-white/10 pt-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Choose a size</span>
                    <span className="text-[10px] text-white/40">Swipe options →</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    {products.map((p) => {
                      const isSelected = p.id === activeProduct.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedHeroId(p.id);
                            setHeroQuantity(1);
                          }}
                          className={isSelected
                            ? "flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-brand-gold bg-brand-gold px-3 py-2 text-xs font-bold text-brand-forest"
                            : "flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80"}
                          aria-pressed={isSelected}
                        >
                          <span>{p.size}</span>
                          <span className={isSelected ? "text-brand-forest/75" : "text-brand-gold"}>{formatGHS(p.price)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="relative z-10 mt-3 flex items-center gap-2">
                  <div className="flex shrink-0 items-center rounded-xl border border-white/20 bg-white/5 p-0.5">
                    <button
                      type="button"
                      onClick={() => setHeroQuantity((q) => Math.max(1, q - 1))}
                      disabled={!activeProduct.inStock}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-white/80 disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-white">{heroQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setHeroQuantity((q) => Math.min(99, q + 1))}
                      disabled={!activeProduct.inStock}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-white/80 disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleHeroAddToCart}
                    disabled={!activeProduct.inStock}
                    className={activeProduct.inStock
                      ? "btn-gold flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold shadow-lg active:scale-[0.98]"
                      : "flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-600 px-3 py-2.5 text-xs font-bold text-white opacity-50"}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {!activeProduct.inStock ? "Out of stock" : justAddedHero ? "Added to cart!" : "Add to cart"}
                  </button>
                </div>

                <p className="relative z-10 mt-2.5 text-center text-[10px] leading-4 text-white/45">
                  Secure packing · Fast checkout · Mobile money accepted
                </p>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-sm text-white/65">
                Our next batch is being prepared. Please check back soon.
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-[10px] text-white/65">
              <span className="inline-flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-brand-gold" /> Delivery across Ghana</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-brand-gold" /> Quality checked</span>
            </div>
          </div>
        </section>

        <section className="relative hidden sm:flex items-center min-h-screen sm:pt-24 sm:pb-16 lg:pt-28 lg:pb-24 overflow-hidden bg-brand-forest">
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/background.jpg"
              alt="Gid's Apple Orchard background"
              fill
              priority
              className="object-cover object-[62%_center] sm:object-center"
              sizes="100vw"
            />
            {/* Dark gradient overlay for rich contrast and legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-brand-forest/65 to-brand-forest/95 sm:bg-gradient-to-r sm:from-black/90 sm:via-black/75 sm:to-black/45" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/70 via-transparent to-black/30 sm:from-brand-forest/75 sm:to-black/40" />
          </div>

          <div className="relative z-10 section-container w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-8 xl:gap-14 items-center">
              {/* Left Column: Brand Story & Trust */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-4 sm:space-y-6">
                {/* Region Badge */}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold/15 border border-brand-gold/30 px-3 py-1 text-brand-gold animate-fade-in">
                  <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    Handcrafted in Cape Coast, Ghana
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-3xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.08] sm:leading-[1.05] tracking-tight text-shadow-md animate-fade-in">
                  Raw. Unfiltered.
                  <br />
                  <span className="text-brand-gold">Real.</span>
                </h1>

                {/* Copy */}
                <p className="text-sm sm:text-lg text-white/85 leading-6 sm:leading-relaxed max-w-xl text-shadow-sm animate-fade-in">
                  Gid&apos;s Apple Cider Vinegar — handcrafted the authentic way with the living
                  mother culture intact. Cold-pressed, unpasteurized, and free from shortcuts or artificial additives.
                </p>

                {/* Direct Action Links */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-1.5 sm:pt-2 animate-fade-in">
                  <a
                    href="#products"
                    className="btn-gold text-xs sm:text-base px-4 sm:px-6 py-3 sm:py-3.5 gap-2"
                  >
                    <span>View All Sizes</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#process"
                    className="btn-white-outline text-xs sm:text-base px-4 sm:px-6 py-3 sm:py-3.5"
                  >
                    See How It&apos;s Made
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 sm:pt-6 border-t border-white/10 flex flex-wrap gap-3 sm:gap-7 animate-fade-in">
                  {[
                    { icon: Truck, label: "Nationwide delivery across Ghana" },
                    { icon: ShieldCheck, label: "Quality & acidity tested" },
                    { icon: Package, label: "Secure glass bottle packing" },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 text-white/75 text-[11px] sm:text-sm"
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
                  <div className="bg-brand-forest-mid/90 backdrop-blur-xl border border-white/15 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl relative overflow-hidden transition-all duration-300">
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
                    <div className="relative -mx-4 sm:-mx-5 mt-1 mb-1">
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
                            <div className="w-full h-[220px] sm:h-[300px] lg:h-[320px] xl:h-[340px] flex items-center justify-center p-6 relative group overflow-hidden select-none">
                              <Image
                                src={activeProduct.image}
                                alt={activeProduct.name + " - " + activeProduct.size}
                                width={560}
                                height={560}
                                sizes="(min-width: 1280px) 320px, (min-width: 640px) 300px, 260px"
                                quality={82}
                                unoptimized={!canOptimizeImage(activeProduct.image)}
                                className="max-h-[90%] max-w-[84%] object-contain drop-shadow-[0_16px_22px_rgba(0,0,0,0.6)] sm:drop-shadow-[0_25px_35px_rgba(0,0,0,0.7)] transition-all duration-700 ease-out group-hover:scale-105"
                              />
                              {/* Bottom pill caption */}
                              <div className="absolute inset-x-0 bottom-2.5 text-center pointer-events-none">
                                <span className="inline-block text-[11px] font-medium tracking-wide text-brand-gold/90 bg-brand-forest/90 border border-brand-gold/30 rounded-full px-3.5 py-1 shadow-md backdrop-blur-sm">
                                  ✦ {activeProduct.size} · Handcrafted in Cape Coast, Ghana
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-[220px] sm:h-[300px] lg:h-[320px] xl:h-[340px] flex items-center justify-center p-6 select-none">
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
                            className="w-full h-[220px] sm:h-[300px] lg:h-[320px] xl:h-[340px]"
                          />
                        )}
                      </div>
                    </div>

                    {/* Adaptive Product Size Selector Track (Handles any number of products elegantly) */}
                    <div className="mt-2 pt-2 border-t border-white/10 relative z-10">
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
                                  <Image src={p.image} alt="" width={40} height={48} sizes="40px" quality={75} unoptimized={!canOptimizeImage(p.image)} className="h-full w-full object-contain" />
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
                    <div className="mt-3 pt-3 border-t border-white/10 relative z-10">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-white/50">Price</p>
                          <p className="text-2xl sm:text-3xl font-extrabold text-brand-gold">
                            {formatGHS(activeProduct.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/80 font-bold">{activeProduct.name}</p>
                          <p className="text-[11px] text-white/50">{activeProduct.size}</p>
                        </div>
                      </div>

                      <p className="text-xs text-white/65 line-clamp-2 mb-3 leading-relaxed">
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

                      <p className="text-[10px] text-center text-white/45 mt-2">
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
            PRODUCTS — warm, editorial shopping grid
        ═══════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#F6F4EC] py-10 sm:py-16" id="products">
          {/* Soft colour washes keep the section warm without competing with the bottles. */}
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-16 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-brand-sage/10 blur-3xl" />

          <div className="section-container relative z-10">
            <div className="mb-5 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold-deep">Made with care in Ghana</p>
                <h2 className="text-xl font-extrabold tracking-tight text-brand-forest sm:text-3xl">Find your bottle</h2>
                <p className="mt-1.5 max-w-lg text-sm leading-5 text-brand-forest/60">Choose the size that fits your routine.</p>
              </div>
              <Link
                href="/products"
                className="inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-lg border border-brand-forest/15 bg-white px-3.5 py-2.5 text-[11px] sm:text-xs font-bold text-brand-forest shadow-sm transition hover:border-brand-gold/60 hover:text-brand-forest"
              >
                View all products
                <ArrowRight className="h-3.5 w-3.5 text-brand-gold-deep" />
              </Link>
            </div>
            {products.length === 0 ? (
              <div className="rounded-[1.75rem] border border-brand-forest/10 bg-white/80 px-6 py-16 text-center shadow-sm">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-forest/5 text-brand-forest/45">
                  <Package className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-brand-forest">Nothing on the shelf just yet</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-brand-forest/60">
                  We&apos;re getting the next products ready. Please come back soon.
                </p>
              </div>
            ) : (
              <div
                aria-label="Product collection"
                className={
                  "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-4 scroll-px-4 " +
                  "sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0 sm:gap-6 " +
                  (products.length === 1
                    ? "sm:mx-auto sm:max-w-xl"
                    : products.length === 2
                    ? "sm:mx-auto sm:max-w-5xl sm:grid-cols-2"
                    : "sm:grid-cols-2 lg:grid-cols-3")
                }
              >
                {homepageProducts.map((product) => (
                  <article
                    key={product.id}
                    className={
                      "group flex h-full w-[min(76vw,300px)] shrink-0 snap-start flex-col rounded-xl sm:rounded-[1.75rem] border border-brand-forest/10 bg-white p-2.5 sm:p-3.5 shadow-[0_8px_25px_rgba(26,51,32,0.06)] transition-all duration-300 hover:border-brand-gold/40 hover:shadow-[0_16px_36px_rgba(26,51,32,0.11)] sm:w-auto sm:shrink sm:hover:-translate-y-1 " +
                      (product.badge?.toLowerCase().includes("popular") ? "ring-1 ring-brand-gold/20 " : "") +
                      (!product.inStock ? "opacity-85" : "")
                    }
                  >
                    {/* The image stage gives each bottle room to stand out. */}
                    <div className="relative h-[185px] overflow-hidden rounded-lg sm:rounded-[1.1rem] bg-gradient-to-br from-[#F4F0E4] via-[#F1F5EE] to-[#E5ECE1] sm:h-[250px] lg:h-[275px]">
                      <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-2xl" />
                      <div aria-hidden="true" className="absolute bottom-9 left-1/2 h-5 w-32 -translate-x-1/2 rounded-[100%] bg-brand-forest/15 blur-md" />

                      <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2">
                        {product.badge ? (
                          <span className="inline-flex max-w-[65%] items-center gap-1.5 rounded-full border border-brand-gold/30 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-forest shadow-sm backdrop-blur-sm sm:text-[11px]">
                            <Star className="h-3 w-3 shrink-0 fill-brand-gold text-brand-gold" />
                            <span className="truncate">{product.badge}</span>
                          </span>
                        ) : (
                          <span className="rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-forest/65 shadow-sm backdrop-blur-sm">
                            Crafted with care
                          </span>
                        )}

                        <span
                          className={
                            "shrink-0 rounded-full border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] shadow-sm backdrop-blur-sm sm:text-[10px] " +
                            (product.inStock
                              ? "border-emerald-700/10 bg-emerald-50/95 text-emerald-800"
                              : "border-red-700/10 bg-red-50/95 text-red-700")
                          }
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
                          className="relative z-10 h-full w-full scale-[1.02] object-contain px-3 pb-8 pt-10 transition-transform duration-500 ease-out group-hover:scale-[1.06]"
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
                        Gid&apos;s collection
                      </p>
                      <h3 className="mt-1.5 min-h-[2.5rem] text-base font-extrabold leading-snug tracking-tight text-brand-forest sm:mt-2 sm:min-h-[2.75rem] sm:text-xl">
                        {product.name}
                      </h3>
                      <p className="mt-1.5 min-h-[2.25rem] line-clamp-2 text-xs leading-[1.15rem] text-brand-forest/60 sm:mt-2 sm:min-h-[2.5rem] sm:text-sm sm:leading-5">
                        {product.description}
                      </p>

                      <div className="mt-4 flex flex-col gap-3 border-t border-brand-forest/10 pt-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-forest/45">
                            Price per bottle
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
                          className={
                            "btn-gold w-full rounded-lg px-3 py-2.5 text-xs sm:w-auto sm:rounded-xl sm:px-4 sm:text-sm " +
                            (!product.inStock ? "cursor-not-allowed bg-slate-200 text-slate-500 shadow-none hover:translate-y-0 hover:bg-slate-200" : "")
                          }
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

            {products.length > 1 && (
              <p className="mb-1 mt-1 flex items-center gap-2 text-[11px] text-brand-forest/45 sm:hidden">
                <ChevronLeft className="h-3.5 w-3.5" />
                Swipe to explore
                <ChevronRight className="h-3.5 w-3.5" />
              </p>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════
            BENEFITS — 6-card grid
        ═══════════════════════════════════════ */}
        <section className="bg-brand-ivory py-12 sm:py-20" id="benefits">
          <div className="section-container">
            <div className="mb-8 sm:mb-12">
              <p className="section-label mb-3">Why Choose Gid&apos;s</p>
              <h2 className="text-2xl sm:text-4xl font-bold text-brand-forest">
                What makes it different
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {benefits.map((b, i) => {
                const isGenericTrustItem = /^(100% natural|with the mother|quality tested)$/i.test(b.title.trim());
                const Icon = ICON_MAP[b.icon] ?? ShieldCheck;
                const isWide = i === 0 || i === 5;
                return (
                  <div
                    key={b.id}
                    className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border shadow-card
                      transition-shadow duration-200 hover:shadow-card-hover
                      ${isWide ? "sm:col-span-2 lg:col-span-1" : ""}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-forest/8 flex items-center justify-center mb-4">
                      {isGenericTrustItem ? (
                        <LottieCheckIcon size={28} tone="forest" />
                      ) : (
                        <Icon className="w-5 h-5 text-brand-forest" />
                      )}
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

        {/* The original four-step process, including images from gbhpl.net. */}
        <section className="relative overflow-hidden bg-[#F6F4EC] py-10 sm:py-20" id="process">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-24 h-80 w-80 rounded-full bg-brand-sage/15 blur-3xl" />

          <div className="section-container relative z-10">
            <div className="mb-6 sm:mb-9 max-w-2xl">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold-deep">
                From Soil to Seal
              </p>
              <h2 className="text-2xl font-bold leading-tight text-brand-forest sm:text-4xl">
                The Architectural Process
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-brand-forest/65 sm:text-base">
                Four critical phases take the cider from selected apples to the finished bottle.
              </p>
            </div>

            {processSteps.length > 0 && activeProcessStep ? (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4" role="group" aria-label="Choose a production phase">
                  {processSteps.map((step, index) => {
                    const isActive = index === activeProcessStepIndex;
                    const image = PROCESS_IMAGES[index] ?? PROCESS_IMAGES[0];
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setActiveProcessStepIndex(index)}
                        aria-pressed={isActive}
                        className={`group overflow-hidden rounded-xl sm:rounded-2xl border bg-white text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${
                          isActive
                            ? "border-brand-forest ring-2 ring-brand-forest/10 shadow-xl shadow-brand-forest/10"
                            : "border-brand-forest/10 shadow-sm hover:-translate-y-1 hover:border-brand-gold/60 hover:shadow-lg"
                        }`}
                      >
                        <div className="relative h-[140px] overflow-hidden bg-brand-forest/10 sm:h-[185px]">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                            quality={78}
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                        </div>
                        <div className="p-3 sm:p-5">
                          <h3 className="text-base font-bold leading-snug text-brand-forest sm:text-lg">
                            {step.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-brand-forest/60">
                            {step.description}
                          </p>
                          <span className={`mt-4 inline-flex items-center gap-2 text-xs font-bold transition-colors ${
                            isActive ? "text-brand-gold-deep" : "text-brand-forest/55 group-hover:text-brand-forest"
                          }`}>
                            {isActive ? "Currently viewing" : "Explore this phase"}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="relative mt-4 sm:mt-6 overflow-hidden rounded-2xl sm:rounded-[1.75rem] bg-brand-forest text-white">
                  <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />
                  <div className="relative grid lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.9fr)]">
                    <div className="flex flex-col justify-center px-4 py-5 sm:px-8 sm:py-9 lg:px-10">
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-gold">Production details</p>
                      <h3 className="max-w-2xl text-xl font-bold leading-tight sm:text-3xl">
                        {activeProcessStep.title}
                      </h3>
                      <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                        {activeProcessStep.description}
                      </p>
                      <div className="mt-7 flex gap-2" aria-label="Production stage progress">
                        {processSteps.map((step, index) => (
                          <span
                            key={step.id}
                            className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
                              index <= activeProcessStepIndex ? "bg-brand-gold" : "bg-white/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="relative min-h-[200px] overflow-hidden sm:min-h-[330px] lg:min-h-[400px]">
                      <Image
                        src={(PROCESS_IMAGES[activeProcessStepIndex] ?? PROCESS_IMAGES[0]).src}
                        alt={(PROCESS_IMAGES[activeProcessStepIndex] ?? PROCESS_IMAGES[0]).alt}
                        fill
                        sizes="(min-width: 1024px) 45vw, 100vw"
                        quality={78}
                        className="object-cover transition-opacity duration-300"
                      />
                      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent lg:bg-gradient-to-r lg:from-brand-forest/80 lg:via-brand-forest/20 lg:to-transparent" />
                      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                        <span className="max-w-[80%] text-sm font-semibold text-white sm:text-base">
                          {activeProcessStep.title}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-brand-forest/10 bg-white p-6 text-sm text-brand-forest/60">
                Production details will appear here soon.
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════
            CEO / FOUNDER — editorial split
        ═══════════════════════════════════════ */}
        {ceo.name && (
          <section className="bg-brand-forest py-12 sm:py-20" id="about">
            <div className="section-container">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 sm:gap-12 lg:gap-20 items-center">
                {/* Photo */}
                <div className="flex justify-center lg:justify-start">
                  <div className="relative">
                    <div className="relative w-48 h-48 sm:w-72 sm:h-72 rounded-2xl sm:rounded-3xl overflow-hidden bg-brand-forest-mid border border-white/10">
                      <Image
                        src={ceo.photoPath || "https://slmnzdpvbjesuwwqvcfi.supabase.co/storage/v1/object/public/site_content/Screenshot%202025-12-04%20012847.png"}
                        alt={ceo.name}
                        fill
                        sizes="(min-width: 640px) 288px, 224px"
                        quality={80}
                        unoptimized={!canOptimizeImage(ceo.photoPath || "https://slmnzdpvbjesuwwqvcfi.supabase.co/storage/v1/object/public/site_content/Screenshot%202025-12-04%20012847.png")}
                        className="object-cover object-center"
                      />
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
                  <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 leading-tight">
                    {ceo.name}
                  </h2>
                  {ceo.quote && (
                    <blockquote className="border-l-2 border-brand-gold pl-5 mb-6">
                      <p className="text-white/80 italic text-base sm:text-lg leading-relaxed">
                        &ldquo;{ceo.quote}&rdquo;
                      </p>
                    </blockquote>
                  )}
                  <p className="text-white/60 leading-relaxed text-xs sm:text-sm">{ceo.bio}</p>
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
        <section className="bg-brand-ivory py-12 sm:py-20">
          <div className="section-container">
            <div className="mb-7 sm:mb-10">
              <p className="section-label mb-3">Customer Reviews</p>
              <h2 className="text-2xl sm:text-4xl font-bold text-brand-forest">
                What people say
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border shadow-card">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-brand-gold text-brand-gold" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-brand-forest/70 leading-relaxed mb-4 sm:mb-5">
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
        <section className="bg-brand-gold py-10 sm:py-16" id="trade">
          <div className="section-container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 sm:gap-8">
              <div>
                <h2 className="text-xl sm:text-3xl font-bold text-brand-forest">
                  Retailer or wholesaler?
                </h2>
                <p className="mt-2 text-brand-forest/70 text-xs sm:text-sm max-w-md leading-relaxed">
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
                    bg-brand-forest text-white font-semibold px-4 sm:px-6 py-3 text-xs sm:text-sm
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
        <section className="bg-white py-12 sm:py-20" id="faq">
          <div className="section-container">
            <div className="max-w-2xl mx-auto">
              <div className="mb-7 sm:mb-10">
                <p className="section-label mb-3">Common Questions</p>
                <h2 className="text-2xl sm:text-4xl font-bold text-brand-forest">
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
        <footer className="bg-[#10271c] text-white/65">
          <div className="section-container py-8 sm:py-9">
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:grid-cols-12 lg:gap-x-8">
              {/* Brand and contact details */}
              <div className="col-span-2 sm:col-span-4 lg:col-span-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gold">
                    <span className="font-serif text-xl font-extrabold leading-none text-brand-forest">G</span>
                  </div>
                  <div>
                    <p className="text-sm font-extrabold tracking-[0.14em] text-white">GBHPL</p>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-brand-gold">Gid&apos;s Beverages</p>
                  </div>
                </div>
                <p className="mt-3 max-w-sm text-xs leading-5 text-white/60">
                  Gid&apos;s Beverages &amp; Health Products Ltd. Crafting honest health products in Cape Coast since 2018.
                </p>
                <div className="mt-4 flex flex-col gap-2 text-xs sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-2">
                  <span className="inline-flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-gold" />
                    Cape Coast, Central Region, Ghana
                  </span>
                  <a href="tel:+233000000000" className="inline-flex items-center gap-2 transition hover:text-white">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-brand-gold" />
                    +233 XX XXX XXXX
                  </a>
                  <a href="mailto:hello@gbhpl.com" className="inline-flex items-center gap-2 transition hover:text-white">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-brand-gold" />
                    hello@gbhpl.com
                  </a>
                </div>
              </div>

              {/* Shop links */}
              <nav aria-label="Shop" className="lg:col-span-2">
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">Shop</h3>
                <ul className="space-y-2 text-xs">
                  {[
                    { href: "#products", label: "500 ml Bottle" },
                    { href: "#products", label: "1000 ml Bottle" },
                    { href: "/trade", label: "Wholesale" },
                  ].map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="transition hover:text-white focus-ring">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Company links */}
              <nav aria-label="Company" className="lg:col-span-3">
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">Company</h3>
                <ul className="space-y-2 text-xs">
                  {[
                    { href: "/about", label: "About Us" },
                    { href: "#process", label: "Our Process" },
                    { href: "/trade", label: "Trade Partners" },
                    { href: "#faq", label: "FAQs" },
                  ].map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="transition hover:text-white focus-ring">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Staff link, kept subtle and aligned with the link columns */}
              <nav aria-label="Staff" className="lg:col-span-2">
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">Staff</h3>
                <Link
                  href="/manager"
                  className="inline-flex items-center gap-1.5 text-xs transition hover:text-white focus-ring"
                >
                  Manager Panel
                  <ArrowRight className="h-3 w-3 text-brand-gold" />
                </Link>
                <p className="mt-2 max-w-[170px] text-[11px] leading-4 text-white/40">
                  For authorised team members.
                </p>
              </nav>
            </div>
          </div>

          <div className="border-t border-white/10">
            <div className="section-container flex flex-col gap-1.5 py-3 text-[10px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} Gid&apos;s Beverages &amp; Health Products Ltd. All rights reserved.</p>
              <p>Proudly made in Cape Coast, Ghana</p>
            </div>
          </div>
        </footer>
      </main>
      </div>

      {/* One shared set of shopping dialogs works from either interface. */}
      <CartDrawer />
      <CheckoutDialog />
      <TrackOrderDialog />
    </>
  );
}
