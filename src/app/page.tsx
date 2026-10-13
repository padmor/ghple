"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  ShoppingCart,
  ArrowRight,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Facebook,
  Instagram,
  MessageCircle,
  Music2,
  Star,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useManager } from "@/context/manager-context";
import { CartDrawer } from "@/components/cart-drawer";
import { CheckoutDialog } from "@/components/checkout-dialog";
import { TrackOrderDialog } from "@/components/track-order-dialog";
import { Navbar } from "@/components/navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BottleIllustration } from "@/components/bottle-illustration";
import { formatGHS } from "@/lib/utils";

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

const PROCESS_STEPS = [
  {
    title: "Source Harvesting",
    text: "We manually select healthy, unblemished apples from the orchards in South Africa.",
    specs: [{ label: "Standard", val: "Organic Grade A" }, { label: "Method", val: "Hand-picked" }],
  },
  {
    title: "Cold Press Extraction",
    text: "Apples are washed and cold-pressed within 24 hours of harvest to preserve delicate enzymes.",
    specs: [{ label: "Temp", val: "< 4°C" }, { label: "Yield", val: "Pure Juice" }],
  },
  {
    title: "Oak Barrel Fermentation",
    text: "The critical 'Double Fermentation'. First, yeast converts sugars to alcohol. Second, bacteria convert alcohol to acetic acid (5-20%), forming the 'Mother'.",
    specs: [{ label: "Vessel", val: "French Oak" }, { label: "Acidity", val: "5-20%" }],
  },
  {
    title: "Mature Cider Bottling",
    text: "Bottled raw and unfiltered. No pasteurization ensures enzymes and probiotics remain biologically active and structurally potent.",
    specs: [{ label: "State", val: "Raw/Unfiltered" }, { label: "Pasteurized", val: "No" }],
  },
];

// Add every branch here — the list and the map pick them up automatically.
const BRANCHES = [
  {
    name: "University of Cape Coast HQ",
    type: "Factory Store",
    address: "Plot No. 78,79 Amamoma, UCC, Cape Coast",
    phone: "+233 XX XXX XXXX",
    mapQuery: "Gid's Beverages & Health Products, Amamoma, Cape Coast, Ghana",
  },
];

const OPENINGS = [
  { role: "Sales Representative", title: "Sales Representative", meta: "Accra & Kumasi • Full Time" },
  { role: "Fermentation Specialist", title: "Brew / Fermentation Specialist", meta: "Cape Coast HQ • Full Time" },
  { role: "Wholesale Partner", title: "Wholesale Partner", meta: "Nationwide • B2B Partnership" },
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
        className="relative flex items-center justify-center w-full py-4 px-8 text-center focus-ring rounded-sm"
        aria-expanded={open}
      >
        <span className="font-semibold text-brand-forest text-sm sm:text-base leading-snug">{q}</span>
        {open ? (
          <ChevronUp className="absolute right-0 w-4 h-4 text-brand-gold flex-shrink-0" />
        ) : (
          <ChevronDown className="absolute right-0 w-4 h-4 text-brand-sage flex-shrink-0" />
        )}
      </button>
      {open && (
        <p className="pb-4 px-4 text-center text-sm text-brand-forest/70 leading-relaxed animate-fade-in">
          {a}
        </p>
      )}
    </div>
  );
}

export default function HomePage() {
  const { addToCart } = useCart();
  const { products, ceo, settings } = useManager();
  const [activeStep, setActiveStep] = useState(0);
  const [activeBranch, setActiveBranch] = useState(0);
  const [joinRole, setJoinRole] = useState("");
  const [joinOpen, setJoinOpen] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const productScroller = useRef<HTMLDivElement>(null);
  const processPanel = useRef<HTMLDivElement>(null);
  const scrollProducts = (dir: 1 | -1) =>
    productScroller.current?.scrollBy({ left: dir * 560, behavior: "smooth" });
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [stepsPaused, setStepsPaused] = useState(false);
  const goToStep = (i: number) =>
    setActiveStep((i + PROCESS_STEPS.length) % PROCESS_STEPS.length);

  // Gently walk through the phases until the visitor takes over
  useEffect(() => {
    if (stepsPaused) return;
    const t = setTimeout(() => goToStep(activeStep + 1), 6000);
    return () => clearTimeout(t);
  }, [activeStep, stepsPaused]);

  return (
    <>
      <Navbar />
      <CartDrawer />
      <CheckoutDialog />
      <TrackOrderDialog />

      <main>
        {/* ═══════════════════════════════════════
            HERO — brand statement + product photo
        ═══════════════════════════════════════ */}
        <section className="relative flex items-center pt-[88px] pb-8 sm:pt-32 sm:pb-14 lg:min-h-screen lg:pt-36 lg:pb-28 overflow-hidden bg-brand-forest">
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
            <div className="absolute inset-0 bg-gradient-to-r from-brand-forest/95 via-brand-forest/80 to-brand-forest/50" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-brand-forest to-transparent" />
          </div>

          <div className="relative z-10 section-container w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 sm:gap-12 lg:gap-16">
              {/* Copy */}
              <div className="lg:col-span-7 sm:text-center lg:text-left">
                <div className="flex items-center gap-3 sm:block">
                <div className="min-w-0 flex-1">
                <h1 className="text-[1.55rem] sm:text-4xl lg:text-5xl lg:whitespace-nowrap font-bold text-white leading-[1.1] tracking-tight animate-fade-in">
                  Raw. Unfiltered. <span className="text-brand-gold">Real.</span>
                </h1>

                <p className="mx-auto lg:mx-0 mt-2 sm:mt-7 max-w-lg text-[12px] sm:text-lg text-white/80 leading-snug sm:leading-relaxed animate-fade-in">
                  Gid&apos;s Apple Cider Vinegar — handcrafted the authentic way with the living
                  mother culture intact. Cold-pressed, unpasteurized, and free from shortcuts or
                  artificial additives.
                </p>
                </div>

                {/* Small bottle — phones only */}
                <div className="relative h-28 w-24 flex-shrink-0 sm:hidden">
                  <div className="absolute inset-0 rounded-full bg-brand-gold/20 blur-2xl" />
                  <Image
                    src="/products/bottle-500ml.jpg"
                    alt="Gid's Apple Cider Vinegar bottle"
                    fill
                    priority
                    sizes="96px"
                    className="rounded-2xl object-cover ring-1 ring-white/25 shadow-xl"
                  />
                </div>
                </div>

                <div className="mt-4 sm:mt-10 flex flex-row flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-2 sm:gap-4 animate-fade-in">
                  <a href="#products" className="btn-gold flex-1 sm:flex-none justify-center text-xs sm:text-base px-4 sm:px-8 py-2.5 sm:py-4 gap-1.5 sm:gap-2">
                    <span>View All Sizes</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a href="#process" className="btn-white-outline flex-1 sm:flex-none justify-center text-xs sm:text-base px-4 sm:px-8 py-2.5 sm:py-4">
                    See How It&apos;s Made
                  </a>
                </div>

                {/* Trust row */}
                <div className="mx-auto lg:mx-0 mt-4 sm:mt-12 grid max-w-xl grid-cols-3 gap-1 sm:gap-0 divide-x divide-white/15 border-t border-white/15 pt-3 sm:pt-8 animate-fade-in">
                  {[
                    { src: "/icons/delivery.svg", label: "Nationwide delivery across Ghana" },
                    { src: "/icons/quality.svg", label: "Quality & acidity tested" },
                    { src: "/icons/packing.svg", label: "Secure glass bottle packing" },
                  ].map(({ src, label }) => (
                    <div key={label} className="flex flex-col items-center text-center lg:items-start lg:text-left gap-1 sm:gap-3 px-1 sm:px-5 lg:first:pl-0 lg:last:pr-0">
                      <Image src={src} alt="" width={44} height={44} className="h-7 w-7 sm:h-11 sm:w-11" />
                      <span className="text-[10px] sm:text-sm leading-tight text-white/75">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product photo */}
              <div className="hidden sm:flex lg:col-span-5 justify-center animate-fade-in">
                <div className="relative w-full max-w-[250px] sm:max-w-[340px] lg:max-w-[460px]">
                  <div className="absolute inset-0 rounded-full bg-brand-gold/15 blur-3xl" />
                  <div
                    className="relative aspect-[3/4]"
                    style={{
                      WebkitMaskImage:
                        "radial-gradient(ellipse 62% 66% at 50% 50%, #000 40%, transparent 100%)",
                      maskImage:
                        "radial-gradient(ellipse 62% 66% at 50% 50%, #000 40%, transparent 100%)",
                    }}
                  >
                    <Image
                      src="/products/bottle-500ml.jpg"
                      alt="Gid's Apple Cider Vinegar 500ml bottle"
                      fill
                      priority
                      className="object-cover"
                      sizes="460px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            PRODUCTS — dynamic catalog grid
        ═══════════════════════════════════════ */}
        <section className="relative bg-brand-forest py-12 sm:py-16 overflow-hidden" id="products">
          {/* Background image & atmospheric overlays */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src="/products-bg.jpg"
              alt="Gid's Apple Cider Vinegar handcrafted background"
              fill
              className="object-cover object-center blur-md scale-105"
              sizes="100vw"
            />
            {/* Dark gradient overlay for rich contrast, readability, and depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-brand-forest/65 to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-forest via-black/25 to-brand-forest/80" />
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
                            <img
                              src={product.image}
                              alt={`${product.name} — ${product.size}`}
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

        {/* ═══════════════════════════════════════
            PROCESS — numbered steps on ivory
        ═══════════════════════════════════════ */}
        <section className="bg-white py-24" id="process">
          <div className="section-container">
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
              onMouseEnter={() => setStepsPaused(true)}
              onMouseLeave={() => setStepsPaused(false)}
              onFocus={() => setStepsPaused(true)}
              onBlur={() => setStepsPaused(false)}
            >
              {/* Steps */}
              <div>
                <span className="text-brand-gold font-bold tracking-widest uppercase text-xs">
                  From Soil to Seal
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-forest mt-2 mb-10">
                  The Architectural Process
                </h2>

                <div
                  className="relative"
                  role="tablist"
                  aria-orientation="vertical"
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                      e.preventDefault();
                      goToStep(activeStep + 1);
                    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                      e.preventDefault();
                      goToStep(activeStep - 1);
                    }
                  }}
                >
                  {/* Track + progress that fills down to the active step */}
                  <div className="absolute left-[27px] top-7 bottom-7 w-[2px] bg-border" />
                  <div
                    className="absolute left-[27px] top-7 w-[2px] bg-brand-gold transition-all duration-500"
                    style={{
                      height: `calc((100% - 3.5rem) * ${activeStep / (PROCESS_STEPS.length - 1)})`,
                    }}
                  />

                  <div className="space-y-2">
                    {PROCESS_STEPS.map((step, i) => {
                      const active = i === activeStep;
                      const done = i < activeStep;
                      return (
                        <button
                          key={step.title}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          tabIndex={active ? 0 : -1}
                          onClick={() => {
                            goToStep(i);
                            if (window.innerWidth < 1024) {
                              processPanel.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }
                          }}
                          className={`relative z-10 w-full flex items-center gap-5 p-3 rounded-2xl border text-left transition-all duration-300 focus-ring ${
                            active
                              ? "bg-brand-ivory border-brand-gold/60 shadow-lg"
                              : "border-transparent hover:bg-brand-ivory/60"
                          }`}
                        >
                          <span
                            className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all duration-300 ${
                              active
                                ? "border-brand-gold bg-brand-forest text-brand-gold scale-110"
                                : done
                                ? "border-brand-gold bg-brand-gold text-brand-forest"
                                : "border-gray-300 bg-white text-gray-400"
                            }`}
                          >
                            {done ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              String(i + 1).padStart(2, "0")
                            )}
                          </span>
                          <span className="min-w-0">
                            <span
                              className={`block font-bold text-lg leading-tight transition-colors ${
                                active ? "text-brand-forest" : "text-gray-500"
                              }`}
                            >
                              {step.title}
                            </span>
                            <span className="block mt-0.5 text-xs text-brand-forest/50">
                              {step.specs.map((sp) => sp.val).join(" · ")}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Detail panel */}
              <div ref={processPanel} className="relative h-[560px] sm:h-[500px] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl bg-brand-forest scroll-mt-24">
                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand-gold/15 blur-3xl pointer-events-none" />

                {/* Segmented progress */}
                <div className="absolute top-6 inset-x-10 flex gap-2 z-10">
                  {PROCESS_STEPS.map((step, i) => (
                    <button
                      key={step.title}
                      type="button"
                      aria-label={`Go to phase ${i + 1}`}
                      onClick={() => goToStep(i)}
                      className="h-1.5 flex-1 rounded-full bg-white/15 overflow-hidden focus-ring"
                    >
                      <span
                        className={`block h-full rounded-full bg-brand-gold transition-all duration-500 ${
                          i <= activeStep ? "w-full" : "w-0"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* Re-keyed so each phase fades in fresh */}
                <div
                  key={activeStep}
                  className="absolute inset-0 p-10 pt-16 flex flex-col justify-end animate-fade-in"
                  aria-live="polite"
                >
                  <div className="absolute top-14 right-10 text-[9rem] leading-none font-black text-white/[0.06] select-none">
                    {String(activeStep + 1).padStart(2, "0")}
                  </div>

                  <span className="self-start bg-brand-gold text-brand-forest text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    Phase {String(activeStep + 1).padStart(2, "0")} of{" "}
                    {String(PROCESS_STEPS.length).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-3xl font-bold text-white">
                    {PROCESS_STEPS[activeStep].title}
                  </h3>
                  <p className="mt-3 text-base text-white/75 leading-relaxed min-h-[96px]">
                    {PROCESS_STEPS[activeStep].text}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {PROCESS_STEPS[activeStep].specs.map((sp) => (
                      <div
                        key={sp.label}
                        className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 backdrop-blur-sm"
                      >
                        <span className="block text-[10px] text-brand-gold uppercase tracking-wider font-bold">
                          {sp.label}
                        </span>
                        <span className="block mt-1 text-sm font-bold text-white">{sp.val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs text-white/40">
                      {stepsPaused ? "Paused" : "Auto-playing"} · use ← → keys
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => goToStep(activeStep - 1)}
                        aria-label="Previous phase"
                        className="w-10 h-10 rounded-full border border-white/20 text-white hover:bg-white/10 flex items-center justify-center transition-colors focus-ring"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => goToStep(activeStep + 1)}
                        aria-label="Next phase"
                        className="w-10 h-10 rounded-full bg-brand-gold text-brand-forest hover:brightness-110 flex items-center justify-center transition-all focus-ring"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
              <div className="mb-10 text-center">
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
            SUPPORT & FEEDBACK — get help, comment or rate
        ═══════════════════════════════════════ */}
        <section className="bg-brand-ivory py-20" id="support">
          <div className="section-container">
            <div className="max-w-xl">
              <span className="text-brand-gold font-bold tracking-widest uppercase text-xs">
                We&apos;re listening
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-brand-forest">Help &amp; feedback</h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-forest/60">
                Need a hand with an order, or want to tell us how we&apos;re doing? Pick one below.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Quick contact */}
              <div className="lg:col-span-4 space-y-3">
                {[
                  {
                    href: "https://wa.me/233507154818?text=Hello%20GBHPL%2C%20I%20need%20help%20with%20my%20order.",
                    title: "Chat on WhatsApp",
                    sub: "Fastest way to reach us",
                    Icon: MessageCircle,
                    bg: "bg-[#25D366]",
                  },
                  {
                    href: "mailto:hello@gbhpl.com?subject=Support%20request",
                    title: "Email support",
                    sub: "hello@gbhpl.com",
                    Icon: Mail,
                    bg: "bg-brand-forest",
                  },
                  {
                    href: "tel:+233000000000",
                    title: "Call us",
                    sub: "+233 XX XXX XXXX",
                    Icon: Phone,
                    bg: "bg-brand-gold",
                  },
                ].map(({ href, title, sub, Icon, bg }) => (
                  <a
                    key={title}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-2xl border border-brand-forest/10 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-ring"
                  >
                    <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white ${bg}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-bold text-brand-forest">{title}</span>
                      <span className="block text-xs text-brand-forest/60">{sub}</span>
                    </span>
                  </a>
                ))}
              </div>

              {/* Rate & comment */}
              <form
                className="lg:col-span-8 space-y-4 rounded-3xl border border-brand-forest/10 bg-white p-8"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!feedbackRating) return;
                  const f = new FormData(e.currentTarget);
                  const body = [
                    `Rating: ${feedbackRating}/5`,
                    `Name: ${f.get("name")}`,
                    "",
                    `${f.get("comment")}`,
                  ].join("\n");
                  window.location.href = `mailto:hello@gbhpl.com?subject=${encodeURIComponent(
                    `Feedback: ${feedbackRating}/5 stars`
                  )}&body=${encodeURIComponent(body)}`;
                }}
              >
                <h3 className="text-lg font-bold text-brand-forest">Rate us &amp; leave a comment</h3>

                <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const lit = n <= (feedbackHover || feedbackRating);
                    return (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={feedbackRating === n}
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                        onClick={() => setFeedbackRating(n)}
                        onMouseEnter={() => setFeedbackHover(n)}
                        onMouseLeave={() => setFeedbackHover(0)}
                        className="rounded p-1 transition-transform hover:scale-110 focus-ring"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            lit ? "fill-brand-gold text-brand-gold" : "text-brand-forest/20"
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-3 text-sm text-brand-forest/60">
                    {feedbackRating ? `${feedbackRating} out of 5` : "Tap a star to rate"}
                  </span>
                </div>

                <input
                  name="name"
                  required
                  placeholder="Your name"
                  className="w-full rounded-xl border border-brand-forest/15 bg-brand-ivory/40 px-4 py-3 text-sm outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                />
                <textarea
                  name="comment"
                  required
                  rows={4}
                  placeholder="Your comment, question or suggestion"
                  className="w-full resize-none rounded-xl border border-brand-forest/15 bg-brand-ivory/40 px-4 py-3 text-sm outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                />
                <button
                  type="submit"
                  disabled={!feedbackRating}
                  className="btn-gold w-full justify-center gap-2 py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>Send feedback</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-center text-[11px] text-brand-forest/50">
                  This opens your email app with your rating and comment ready to send to hello@gbhpl.com.
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            LOCATION — where to find us
        ═══════════════════════════════════════ */}
        <section className="bg-white py-20" id="location">
          <div className="section-container">
            <div className="max-w-xl">
              <span className="text-brand-gold font-bold tracking-widest uppercase text-xs">
                Find us
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-brand-forest">Our locations</h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-forest/60">
                Choose a branch to see it on the map and get directions.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 items-stretch gap-8">
              {/* Branch list */}
              <div className="lg:col-span-5 space-y-3">
                {BRANCHES.map((b, i) => {
                  const active = i === activeBranch;
                  return (
                    <div
                      key={b.name}
                      className={`rounded-2xl border p-5 transition-all duration-300 ${
                        active
                          ? "border-brand-gold/60 bg-white shadow-lg"
                          : "border-brand-forest/10 bg-white/60 hover:bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveBranch(i)}
                        aria-pressed={active}
                        className="flex w-full items-start gap-4 text-left focus-ring rounded-lg"
                      >
                        <span
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                            active ? "bg-brand-forest" : "bg-brand-forest/10"
                          }`}
                        >
                          <MapPin
                            className={`h-4 w-4 ${active ? "text-brand-gold" : "text-brand-forest"}`}
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="font-bold text-brand-forest">{b.name}</span>
                            <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-forest">
                              {b.type}
                            </span>
                          </span>
                          <span className="mt-1 block text-sm text-brand-forest/60">{b.address}</span>
                        </span>
                      </button>

                      {active && (
                        <div className="mt-4 flex items-center justify-between border-t border-brand-forest/10 pt-4 animate-fade-in">
                          <a
                            href={`tel:${b.phone.replace(/[^+0-9]/g, "")}`}
                            className="flex items-center gap-2 text-sm text-brand-forest/70 hover:text-brand-gold transition-colors"
                          >
                            <Phone className="h-4 w-4 text-brand-gold" />
                            {b.phone}
                          </a>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.mapQuery)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-gold gap-2 px-4 py-2 text-xs"
                          >
                            <span>Get directions</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Map follows the selected branch */}
              <div className="lg:col-span-7 min-h-[420px] overflow-hidden rounded-3xl border border-brand-forest/10 shadow-xl">
                <iframe
                  key={BRANCHES[activeBranch].name}
                  title={`Map of ${BRANCHES[activeBranch].name}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(BRANCHES[activeBranch].mapQuery)}&output=embed`}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            JOIN — careers & partnerships
        ═══════════════════════════════════════ */}
        <section className="bg-brand-ivory py-14 sm:py-20" id="join">
          <div className="section-container">
            <div className="max-w-xl">
              <span className="text-brand-gold font-bold tracking-widest uppercase text-xs">
                Careers
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-brand-forest">Join GBHPL</h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-forest/60">
                Build a career with purpose or partner with us.
              </p>
            </div>

            <h3 className="mt-8 text-lg font-bold text-brand-forest">Current openings</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {OPENINGS.map((o) => (
                <div
                  key={o.role}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-brand-forest/10 bg-white p-5 transition-shadow hover:shadow-lg"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-brand-forest">{o.title}</p>
                    <p className="mt-1 text-xs text-brand-forest/60">{o.meta}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setJoinRole(o.role);
                      setJoinOpen(true);
                    }}
                    className="flex-shrink-0 rounded-full bg-brand-forest px-4 py-2 text-xs font-bold text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-forest focus-ring"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setJoinRole("General Application");
                setJoinOpen(true);
              }}
              className="mt-5 text-sm font-semibold text-brand-forest underline decoration-brand-gold decoration-2 underline-offset-4 hover:text-brand-gold focus-ring rounded"
            >
              Don&apos;t see your role? Send a general application
            </button>
          </div>

          {/* Application modal */}
          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogContent className="max-w-md bg-white text-black">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-black">Apply to GBHPL</DialogTitle>
                <DialogDescription className="text-black/60">
                  Tell us a little about yourself.
                </DialogDescription>
              </DialogHeader>

              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  const body = [
                    `Name: ${f.get("name")}`,
                    `Email: ${f.get("email")}`,
                    `Phone: ${f.get("phone")}`,
                    `Role: ${f.get("role")}`,
                    "",
                    `${f.get("message")}`,
                  ].join("\n");
                  window.location.href = `mailto:hello@gbhpl.com?subject=${encodeURIComponent(
                    `Application: ${f.get("role")}`
                  )}&body=${encodeURIComponent(body)}`;
                  setJoinOpen(false);
                }}
              >
                <select
                  name="role"
                  required
                  value={joinRole}
                  onChange={(e) => setJoinRole(e.target.value)}
                  className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                >
                  <option value="" disabled>
                    Select role
                  </option>
                  {OPENINGS.map((o) => (
                    <option key={o.role} value={o.role}>
                      {o.title}
                    </option>
                  ))}
                  <option value="General Application">General application</option>
                </select>
                <input
                  name="name"
                  required
                  placeholder="Full name"
                  className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                />
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="Phone number"
                  className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                />
                <textarea
                  name="message"
                  required
                  rows={3}
                  placeholder="A short note about you"
                  className="w-full resize-none rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                />
                <button type="submit" className="btn-gold w-full justify-center gap-2 py-3 text-sm font-bold">
                  <span>Send application</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-center text-[11px] text-black/50">
                  Opens your email app, ready to send to hello@gbhpl.com.
                </p>
              </form>
            </DialogContent>
          </Dialog>
        </section>

        {/* ═══════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════ */}
        <footer className="bg-brand-forest text-white/60">
          <div className="section-container py-5 sm:py-10">
            <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-5 sm:px-8 sm:py-8">
              <div className="grid grid-cols-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-x-3 gap-y-5 sm:gap-10">
                {/* Brand */}
                <div className="col-span-3 lg:col-span-1">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-brand-gold">
                      <span className="text-xs font-bold text-brand-forest">G</span>
                    </div>
                    <span className="text-lg sm:text-xl font-bold tracking-tight text-white">GBHPL</span>
                  </div>
                  <p className="mt-2 sm:mt-3 max-w-xs text-[11px] sm:text-xs leading-relaxed">
                    Gid&apos;s Beverages &amp; Health Products Ltd. Crafting honest health products
                    in Cape Coast since 2018.
                  </p>
                  <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <li className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-brand-gold" />
                      <span>Cape Coast, Central Region, Ghana</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 flex-shrink-0 text-brand-gold" />
                      <a href="tel:+233000000000" className="transition-colors hover:text-white">
                        +233 XX XXX XXXX
                      </a>
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0 text-brand-gold" />
                      <a href="mailto:hello@gbhpl.com" className="transition-colors hover:text-white">
                        hello@gbhpl.com
                      </a>
                    </li>
                  </ul>

                  <p className="mt-4 sm:mt-5 text-[11px] sm:text-sm font-bold uppercase tracking-widest text-brand-gold">
                    Follow us
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {[
                      { href: "https://wa.me/233507154818", label: "WhatsApp", Icon: MessageCircle, bg: "bg-[#25D366]" },
                      { href: "https://www.facebook.com/share/1KUHEd8FRx/?mibextid=wwXIfr", label: "Facebook", Icon: Facebook, bg: "bg-[#1877F2]" },
                      { href: "https://www.instagram.com/gids_apple_cider_vinegar", label: "Instagram", Icon: Instagram, bg: "bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#4F5BD5]" },
                      { href: "https://www.tiktok.com/@gids.beverage", label: "TikTok", Icon: Music2, bg: "bg-black ring-1 ring-white/30" },
                    ].map(({ href, label, Icon, bg }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        title={label}
                        className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-white shadow-md transition-transform hover:-translate-y-0.5 hover:scale-110 ${bg}`}
                      >
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Link columns */}
                {[
                  {
                    title: "Shop",
                    links: [
                      { href: "#products", label: "500 ml Bottle" },
                      { href: "#products", label: "1000 ml Bottle" },
                      { href: "/trade", label: "Wholesale" },
                    ],
                  },
                  {
                    title: "Company",
                    links: [
                      { href: "/about", label: "About Us" },
                      { href: "#process", label: "Our Process" },
                      { href: "/trade", label: "Trade Partners" },
                      { href: "#faq", label: "FAQs" },
                      { href: "/returns", label: "Return Policy" },
                    ],
                  },
                  {
                    title: "Staff",
                    links: [{ href: "/manager", label: "Manager Panel →" }],
                  },
                ].map((col) => (
                  <div key={col.title}>
                    <h3 className="text-[11px] sm:text-sm font-bold uppercase tracking-widest text-brand-gold">
                      {col.title}
                    </h3>
                    <ul className="mt-2 sm:mt-4 space-y-1.5 sm:space-y-2.5 text-[11px] sm:text-sm">
                      {col.links.map((l) => (
                        <li key={l.label}>
                          <Link href={l.href} className="transition-colors hover:text-white">
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 border-t border-white/10 pt-4 sm:pt-5 text-center sm:text-left text-[10px] text-white/35">
                <p>
                  © {new Date().getFullYear()} Gid&apos;s Beverages &amp; Health Products Ltd. All
                  rights reserved.
                </p>
                <a
                  href="#top"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-white/70 transition-colors hover:border-brand-gold hover:text-brand-gold"
                >
                  Back to top
                  <ChevronUp className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
