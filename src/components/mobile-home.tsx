"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Home,
  Info,
  Mail,
  MapPin,
  Menu,
  Package,
  Phone,
  ShieldCheck,
  ShoppingCart,
  Store,
  Workflow,
  X,
} from "lucide-react";
import { RealLeafMark } from "@/components/real-leaf-mark";
import { LottieCheckIcon } from "@/components/lottie-check-icon";
import { useCart } from "@/context/cart-context";
import { useManager } from "@/context/manager-context";
import { formatGHS } from "@/lib/utils";

function BenefitVisual({ size = "compact" }: { size?: "compact" | "feature" }) {
  const dimension = size === "feature" ? "h-9 w-9 rounded-xl" : "h-5 w-5 rounded-full";

  return (
    <span
      aria-hidden="true"
      className={"inline-flex shrink-0 items-center justify-center bg-white/10 text-brand-gold ring-1 ring-white/10 " + dimension}
    >
      <LottieCheckIcon size={size === "feature" ? 30 : 17} tone="gold" />
    </span>
  );
}

const PROCESS_IMAGES = [
  { src: "https://slmnzdpvbjesuwwqvcfi.supabase.co/storage/v1/object/public/site_content/apples-1872997.jpg", alt: "Fresh apples selected for production" },
  { src: "https://slmnzdpvbjesuwwqvcfi.supabase.co/storage/v1/object/public/site_content/extractio.jpg", alt: "Apples being pressed for juice" },
  { src: "https://slmnzdpvbjesuwwqvcfi.supabase.co/storage/v1/object/public/site_content/fermentation.jpg", alt: "Cider during fermentation" },
  { src: "https://slmnzdpvbjesuwwqvcfi.supabase.co/storage/v1/object/public/site_content/bottling.jpg", alt: "Finished bottles being prepared" },
];

function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={"inline-flex h-9 w-9 items-center justify-center rounded-xl text-xl font-extrabold " + (inverse ? "bg-brand-gold text-brand-forest" : "bg-brand-forest text-brand-gold")}>
      G
    </span>
  );
}


export function MobileHome() {
  const { products, benefits, processSteps, ceo, settings } = useManager();
  const { addToCart, totalCount, setIsCartOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeProcessStepIndex, setActiveProcessStepIndex] = useState<number | null>(null);
  const [activeMobileSection, setActiveMobileSection] = useState("mobile-home");
  const activeProcessStep = activeProcessStepIndex === null ? null : processSteps[activeProcessStepIndex] ?? null;

  useEffect(() => {
    const sectionIds = ["mobile-home", "mobile-products", "mobile-process", "mobile-about"];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    if (!sections.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleSection) setActiveMobileSection(visibleSection.target.id);
      },
      { rootMargin: "-22% 0px -62% 0px", threshold: [0, 0.1, 0.25, 0.5] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const handleAdd = (product: (typeof products)[number]) => {
    if (product.inStock) addToCart(product, 1);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F1] pb-24 text-brand-forest">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#0A2418]/95 text-white shadow-sm backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4">
          <a href="#mobile-home" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center gap-2.5">
            <BrandMark inverse />
            <span className="leading-tight">
              <span className="block text-sm font-extrabold tracking-wide text-white">GBHPL</span>
              <span className="block text-[9px] uppercase tracking-[0.13em] text-white/65">Gid&apos;s Beverages</span>
            </span>
          </a>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setIsCartOpen(true)} aria-label={"Open cart with " + totalCount + " items"} className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
              <ShoppingCart className="h-5 w-5" />
              {totalCount > 0 && <span className="absolute right-1 top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-extrabold text-brand-forest">{totalCount > 99 ? "99+" : totalCount}</span>}
            </button>
            <button type="button" onClick={() => setMenuOpen((current) => !current)} aria-label={menuOpen ? "Close mobile menu" : "Open mobile menu"} aria-expanded={menuOpen} className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <button type="button" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-40 bg-black/45" />
          <nav aria-label="Mobile menu" className="fixed inset-x-3 top-[68px] z-50 rounded-2xl border border-white/10 bg-[#0A2418] p-3 text-white shadow-2xl">
            {[
              { href: "#mobile-home", label: "Home" },
              { href: "#mobile-products", label: "Our products" },
              { href: "#mobile-about", label: "About us" },
              { href: "#mobile-process", label: "Our process" },
              { href: "/trade", label: "Wholesale & trade" },
            ].map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="flex min-h-12 items-center justify-between rounded-xl px-3 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white">
                {item.label}<ChevronRight className="h-4 w-4 text-brand-gold" />
              </a>
            ))}
          </nav>
        </>
      )}

      <main>
        <section
          id="mobile-home"
          className="relative isolate overflow-hidden bg-[#0A2418] px-4 pb-4 pt-[72px] text-white"
          style={{
            backgroundImage: "linear-gradient(180deg, rgba(5, 26, 16, .32) 0%, rgba(5, 26, 16, .82) 55%, rgba(5, 26, 16, .99) 100%), url('/background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 35%",
          }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 top-20 h-40 w-40 rounded-full bg-brand-gold/10 blur-3xl" />
          <div className="relative z-10 mx-auto max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-black/20 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gold backdrop-blur-md">
              <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
              Cape Coast, Ghana
            </div>
            <h1 className="mt-3 max-w-[18ch] font-serif text-[clamp(2rem,8.4vw,2.6rem)] font-bold leading-[1.02] tracking-[-0.04em] text-white">
              Pure Goodness
              <span className="mt-0.5 block text-brand-gold">in Every Bottle.</span>
            </h1>
            <p className="mt-2.5 max-w-[22rem] text-[13px] leading-5 text-white/80">
              Natural beverages and health products, thoughtfully made for everyday wellness.
            </p>
            <a
              href="#mobile-products"
              className="group mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 text-sm font-extrabold text-brand-forest shadow-[0_6px_18px_rgba(212,160,23,0.18)] transition hover:bg-brand-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.99]"
            >
              <Store className="h-4 w-4" />
              Shop now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a href="#mobile-about" className="mx-auto mt-2 inline-flex min-h-9 w-full items-center justify-center gap-1.5 text-xs font-semibold text-white/75 transition hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
              <RealLeafMark className="h-3.5 w-3.5 rounded-full ring-1 ring-white/20" />
              Learn about our story
              <ArrowRight className="h-3 w-3" />
            </a>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-white/10 pt-3">
              {benefits.slice(0, 3).map((benefit) => (
                <span key={benefit.id} className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-white/75">
                  <BenefitVisual size="compact" />
                  {benefit.title}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="mobile-products" className="scroll-mt-14 bg-[#F8F7F1] px-4 pb-6 pt-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl font-bold text-brand-forest">Our Products</h2>
            <Link href="/products" className="inline-flex min-h-10 items-center gap-1 text-xs font-semibold text-brand-forest">
              View all <ArrowRight className="h-4 w-4 text-brand-gold-deep" />
            </Link>
          </div>

          {products.length > 0 ? (
            <>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {products.slice(0, 4).map((product) => (
                  <article key={product.id} className="flex min-w-0 flex-col rounded-2xl bg-white p-2.5 shadow-sm ring-1 ring-brand-forest/5">
                    <Link href={"/products?product=" + encodeURIComponent(product.id)} className="block">
                      <div className="relative flex h-[108px] items-center justify-center overflow-hidden rounded-xl bg-[#F5F5EF]">
                        {product.image ? (
                          <Image src={product.image} alt={product.name + " — " + product.size} width={240} height={240} sizes="(max-width: 639px) 44vw, 180px" quality={78} unoptimized={!product.image.startsWith("/") && !product.image.startsWith("https://slmnzdpvbjesuwwqvcfi.supabase.co/storage/v1/object/public/site_content/")} className="h-full w-full object-contain p-2" />
                        ) : <Package className="h-10 w-10 text-brand-forest/25" />}
                      </div>
                      <p className="mt-2 line-clamp-1 text-[10px] font-semibold text-brand-forest/60">{product.name}</p>
                      <p className="mt-0.5 text-[11px] font-bold text-brand-forest">{product.size}</p>
                      <p className="mt-1 text-sm font-extrabold text-brand-forest">{formatGHS(product.price)}</p>
                    </Link>
                    <button type="button" onClick={() => handleAdd(product)} disabled={!product.inStock} className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-1 rounded-lg bg-[#06442E] px-2 py-2 text-[10px] font-bold text-white transition hover:bg-brand-forest disabled:cursor-not-allowed disabled:opacity-40">
                      {product.inStock ? "Add to Cart" : "Sold Out"}
                    </button>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-brand-forest/60">Products will appear here soon.</p>
          )}
        </section>

        <section className="bg-[#0A2418] px-4 py-4 text-white">
          <div className="mx-auto grid max-w-lg grid-cols-3 gap-2.5">
            {benefits.slice(0, 3).map((benefit) => (
              <div key={benefit.id} className="flex flex-col items-center text-center">
                <BenefitVisual size="feature" />
                <p className="mt-2 text-[9px] font-bold leading-tight text-white/90">{benefit.title}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="mobile-about" className="scroll-mt-14 bg-white px-4 py-5">
          <div className="relative h-28 overflow-hidden rounded-2xl bg-[#EAF0E6]">
            <Image src={PROCESS_IMAGES[0].src} alt={PROCESS_IMAGES[0].alt} fill sizes="92vw" quality={78} className="object-cover" />
          </div>
          <p className="mt-3 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-brand-gold-deep"><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-forest/5 text-brand-forest"><RealLeafMark className="h-4 w-4 rounded-full" /></span>A proudly Ghanaian brand</p>
          <h2 className="mt-1 font-serif text-xl font-bold">About Us</h2>
          <p className="mt-1 text-[13px] font-medium text-[#06442E]">Better Beverages. Healthier Lives.</p>
          <p className="mt-2 text-[13px] leading-5 text-brand-forest/70">Gid&apos;s Beverages &amp; Health Products Ltd. is a Ghanaian brand crafting honest, natural beverages and health products. We started with a simple mission — to bring refreshing products made with care and no compromises.</p>
          <a href="#mobile-process" className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg bg-brand-gold px-3 py-2 text-xs font-bold text-brand-forest">Our Process <ArrowRight className="h-4 w-4" /></a>

          <div className="mt-4 grid gap-2 rounded-xl bg-[#EEF2E8] p-3 text-[11px] text-brand-forest/80">
            <p className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-forest" /><span>{settings.address}</span></p>
            {settings.phone && <a href={"tel:" + settings.phone.replace(/\s/g, "")} className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0 text-brand-forest" />{settings.phone}</a>}
            {settings.tradeEmail && <a href={"mailto:" + settings.tradeEmail} className="flex items-center gap-3"><Mail className="h-4 w-4 shrink-0 text-brand-forest" />{settings.tradeEmail}</a>}
          </div>
        </section>

        <section id="mobile-process" className="relative scroll-mt-14 overflow-hidden bg-[#F6F4EC] px-4 py-5">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 top-8 h-40 w-40 rounded-full bg-brand-gold/10 blur-3xl" />
          <div className="relative z-10 mx-auto max-w-lg">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-brand-gold-deep">From Soil to Seal</p>
            <h2 className="mt-1.5 font-serif text-xl font-bold leading-tight text-brand-forest">Our Process</h2>
            <p className="mt-1.5 text-[13px] leading-5 text-brand-forest/65">Four careful steps from selected fruit to finished bottle.</p>

            {processSteps.length > 0 ? (
              <>
                <div className="mt-4 grid grid-cols-2 gap-2.5" role="group" aria-label="Choose a production phase">
                  {processSteps.slice(0, 4).map((step, index) => {
                    const isActive = index === activeProcessStepIndex;
                    const image = PROCESS_IMAGES[index] ?? PROCESS_IMAGES[0];
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setActiveProcessStepIndex(isActive ? null : index)}
                        aria-pressed={isActive}
                        className={"group min-w-0 overflow-hidden rounded-xl border bg-white text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold " + (
                          isActive
                            ? "border-brand-forest ring-2 ring-brand-forest/10"
                            : "border-brand-forest/10 hover:border-brand-gold/60"
                        )}
                      >
                        <div className="relative h-24 overflow-hidden bg-brand-forest/10">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            sizes="(min-width: 420px) 45vw, 92vw"
                            quality={75}
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                        </div>
                        <div className="p-2.5">
                          <h3 className="text-[12px] font-extrabold leading-snug text-brand-forest">{step.title}</h3>
                          <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-brand-forest/60">{step.description}</p>
                          <span className={"mt-2 inline-flex items-center gap-1 text-[9px] font-bold " + (isActive ? "text-brand-gold-deep" : "text-brand-forest/50")}>
                            {isActive ? "Hide details" : "View details"}
                            <ChevronDown className={"h-3 w-3 transition-transform " + (isActive ? "rotate-180" : "")} />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {activeProcessStep && (
                  <div className="mt-3 overflow-hidden rounded-xl bg-brand-forest text-white shadow-sm">
                    <div className="p-3.5">
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-brand-gold">Production details</p>
                      <h3 className="mt-1.5 text-base font-bold leading-snug">{activeProcessStep.title}</h3>
                      <p className="mt-1.5 text-xs leading-5 text-white/75">{activeProcessStep.description}</p>
                    </div>
                    <div className="relative h-28 overflow-hidden">
                      <Image
                        src={(PROCESS_IMAGES[activeProcessStepIndex ?? 0] ?? PROCESS_IMAGES[0]).src}
                        alt={(PROCESS_IMAGES[activeProcessStepIndex ?? 0] ?? PROCESS_IMAGES[0]).alt}
                        fill
                        sizes="92vw"
                        quality={75}
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-3 rounded-xl border border-brand-forest/10 bg-white p-4 text-sm text-brand-forest/60">Production details will appear here soon.</div>
            )}

            <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-brand-forest/10 bg-white/70 p-2.5 text-[11px] text-brand-forest/75">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#DCE6D7] text-brand-forest"><RealLeafMark className="h-5 w-5 rounded-full" /></span>
              <span>Natural ingredients. No unnecessary additives.</span>
            </div>
          </div>
        </section>

        <section className="px-4 py-5">
          <div className="rounded-xl bg-brand-gold p-4 text-brand-forest">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em]">For retailers and partners</p>
            <h2 className="mt-1.5 font-serif text-xl font-bold leading-tight">Buy in bulk.<br />Grow together.</h2>
            <p className="mt-1.5 text-[13px] leading-5 text-brand-forest/75">Ask about wholesale options for your shop or business.</p>
            <Link href="/trade" className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#06442E] px-3 py-2 text-xs font-bold text-white">Wholesale Details <ArrowRight className="h-4 w-4 text-brand-gold" /></Link>
          </div>
        </section>

        <section id="mobile-faq" className="bg-white px-4 py-5">
          <h2 className="font-serif text-lg font-bold">Frequently Asked Questions</h2>
          <div className="mt-2">
            {[
              { question: "What does “with the mother” mean?", answer: "The mother is the naturally occurring culture formed during fermentation. It gives raw, unfiltered apple cider vinegar its characteristic cloudy appearance." },
              { question: "Do you deliver across Ghana?", answer: "Delivery options, timing, and costs are confirmed with your order and location." },
              { question: "How can I order for my shop?", answer: "Visit our trade page to enquire about wholesale orders for retailers and business partners." },
            ].map((faq, index) => (
              <div key={faq.question} className="border-b border-brand-forest/10 last:border-0">
                <button type="button" onClick={() => setOpenFaq((current) => current === index ? null : index)} aria-expanded={openFaq === index} className="flex min-h-12 w-full items-center justify-between gap-3 py-3 text-left text-sm font-semibold">
                  <span>{faq.question}</span><ChevronDown className={"h-4 w-4 shrink-0 text-brand-gold-deep transition-transform " + (openFaq === index ? "rotate-180" : "")} />
                </button>
                {openFaq === index && <p className="pb-4 text-xs leading-5 text-brand-forest/65">{faq.answer}</p>}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-[#062519] px-4 pb-8 pt-7 text-white/75">
        <div className="flex items-center gap-2.5">
          <BrandMark inverse />
          <div><p className="text-sm font-extrabold tracking-wide text-white">GBHPL</p><p className="text-[9px] uppercase tracking-[0.13em] text-brand-gold">Gid&apos;s Beverages</p></div>
        </div>
        <h2 className="mt-4 text-sm font-bold text-white">Gid&apos;s Beverages &amp; Health Products Ltd.</h2>
        <p className="mt-2 text-xs leading-5 text-white/65">Crafting honest health products in Cape Coast since 2018.</p>
        <div className="mt-4 space-y-3 text-xs">
          <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white" />{settings.address}</p>
          {settings.phone && <a href={"tel:" + settings.phone.replace(/\s/g, "")} className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" />{settings.phone}</a>}
          {settings.tradeEmail && <a href={"mailto:" + settings.tradeEmail} className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" />{settings.tradeEmail}</a>}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-5 border-y border-white/15 py-5 text-xs">
          <nav aria-label="Shop links" className="space-y-3"><p className="font-bold text-white">Shop</p><a href="#mobile-products" className="block">Bottle sizes</a><Link href="/products" className="block">All products</Link><Link href="/trade" className="block">Wholesale</Link></nav>
          <nav aria-label="Company links" className="space-y-3"><p className="font-bold text-white">Company</p><a href="#mobile-about" className="block">About Us</a><a href="#mobile-process" className="block">Our Process</a><Link href="/trade" className="block">Trade Partners</Link><a href="#mobile-faq" className="block">FAQs</a></nav>
        </div>
        <div className="mt-5">
          <p className="text-xs font-bold text-white">Staff</p>
          <Link href="/manager" className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/35 px-3 py-2 text-xs font-semibold text-white"><ShieldCheck className="h-4 w-4" /> Manager Panel <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <p className="mt-6 border-t border-white/10 pt-4 text-center text-[10px] text-white/45">© {new Date().getFullYear()} Gid&apos;s Beverages &amp; Health Products Ltd.</p>
      </footer>

      <nav aria-label="Quick mobile navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-forest/10 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-8px_24px_rgba(6,37,25,0.08)] backdrop-blur-xl">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          <a href="#mobile-home" aria-label="Home" aria-current={activeMobileSection === "mobile-home" ? "page" : undefined} className={"group flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold " + (activeMobileSection === "mobile-home" ? "text-brand-forest" : "text-brand-forest/60 hover:text-brand-forest")}>
            <span className={"inline-flex h-7 w-10 items-center justify-center rounded-xl transition-colors group-active:scale-95 " + (activeMobileSection === "mobile-home" ? "bg-[#E8EFE4] text-brand-forest" : "text-brand-forest/60 group-hover:bg-brand-forest/5")}>
              <Home className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <span className="leading-none">Home</span>
          </a>
          <a href="#mobile-products" aria-label="Shop products" aria-current={activeMobileSection === "mobile-products" ? "page" : undefined} className={"group flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold " + (activeMobileSection === "mobile-products" ? "text-brand-forest" : "text-brand-forest/60 hover:text-brand-forest")}>
            <span className={"inline-flex h-7 w-10 items-center justify-center rounded-xl transition-colors group-active:scale-95 " + (activeMobileSection === "mobile-products" ? "bg-[#E8EFE4] text-brand-forest" : "text-brand-forest/60 group-hover:bg-brand-forest/5")}>
              <Store className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <span className="leading-none">Shop</span>
          </a>
          <a href="#mobile-process" aria-label="Our process" aria-current={activeMobileSection === "mobile-process" ? "page" : undefined} className={"group flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold " + (activeMobileSection === "mobile-process" ? "text-brand-forest" : "text-brand-forest/60 hover:text-brand-forest")}>
            <span className={"inline-flex h-7 w-10 items-center justify-center rounded-xl transition-colors group-active:scale-95 " + (activeMobileSection === "mobile-process" ? "bg-[#E8EFE4] text-brand-forest" : "text-brand-forest/60 group-hover:bg-brand-forest/5")}>
              <Workflow className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <span className="leading-none">Process</span>
          </a>
          <a href="#mobile-about" aria-label="About Gid's" aria-current={activeMobileSection === "mobile-about" ? "page" : undefined} className={"group flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold " + (activeMobileSection === "mobile-about" ? "text-brand-forest" : "text-brand-forest/60 hover:text-brand-forest")}>
            <span className={"inline-flex h-7 w-10 items-center justify-center rounded-xl transition-colors group-active:scale-95 " + (activeMobileSection === "mobile-about" ? "bg-[#E8EFE4] text-brand-forest" : "text-brand-forest/60 group-hover:bg-brand-forest/5")}>
              <Info className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <span className="leading-none">About</span>
          </a>
          <button type="button" onClick={() => setIsCartOpen(true)} aria-label={"Open cart with " + totalCount + " items"} className="group relative flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] font-semibold text-brand-forest/60 transition hover:text-brand-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
            <span className="relative inline-flex h-7 w-10 items-center justify-center rounded-xl text-brand-forest/60 transition-colors group-active:scale-95 group-hover:bg-brand-forest/5">
              <ShoppingCart className="h-5 w-5" strokeWidth={1.9} />
              {totalCount > 0 && <span className="absolute -right-0.5 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-brand-gold px-1 text-[9px] font-extrabold text-brand-forest ring-2 ring-white">{totalCount > 99 ? "99+" : totalCount}</span>}
            </span>
            <span className="leading-none">Cart</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
