"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { LottieIcon } from "@/components/lottie-icon";

const NAV_LINKS = [
  { href: "/#products", label: "Products" },
  { href: "/#process", label: "Our Process" },
  { href: "/#about", label: "About Us" },
  { href: "/#trade", label: "Trade" },
  { href: "/#support", label: "Support" },
  { href: "/#location", label: "Location" },
  { href: "/#join", label: "Join Us" },
];

export function Navbar() {
  const { totalCount, setIsCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the link of the section currently in view
  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.getElementById(l.href.slice(2))).filter(
      (el): el is HTMLElement => !!el
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const solid = scrolled || menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid
          ? "bg-white/90 backdrop-blur-md border-b border-brand-forest/10 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto w-full max-w-[1400px] px-6">
        <div className="flex h-[72px] items-center justify-between gap-4">
          {/* Left — logo */}
          <Link href="/" className="flex flex-shrink-0 items-center gap-2.5 rounded-md focus-ring">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-forest ring-1 ring-brand-gold/40">
              <span className="text-sm font-bold text-brand-gold">G</span>
            </div>
            <div className="leading-none">
              <span
                className={`block text-sm font-bold tracking-tight transition-colors ${
                  solid ? "text-brand-forest" : "text-white"
                }`}
              >
                GBHPL
              </span>
              <span
                className={`mt-0.5 block text-[10px] uppercase tracking-widest transition-colors ${
                  solid ? "text-brand-sage" : "text-white/70"
                }`}
              >
                Since 2018
              </span>
            </div>
          </Link>

          {/* Centre — navigation pill */}
          <nav
            aria-label="Main navigation"
            className={`hidden lg:flex items-center gap-0.5 rounded-full border p-1 transition-colors ${
              scrolled
                ? "border-brand-forest/10 bg-brand-forest/[0.04]"
                : "border-white/15 bg-white/10 backdrop-blur-md"
            }`}
          >
            {NAV_LINKS.map((link) => {
              const active = activeId === link.href.slice(2);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "true" : undefined}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-all duration-200 focus-ring ${
                    active
                      ? "bg-brand-gold text-brand-forest shadow-sm"
                      : scrolled
                      ? "text-brand-forest/70 hover:bg-brand-forest/[0.06] hover:text-brand-forest"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right — location, cart, CTA */}
          <div className="flex flex-shrink-0 items-center gap-2.5">
            <div
              className={`hidden md:flex items-center gap-1 text-xs font-medium transition-colors ${
                solid ? "text-brand-forest/70" : "text-white/80"
              }`}
            >
              <LottieIcon src="/lottie/location-pin.json" className="h-6 w-6 flex-shrink-0" />
              <span className="whitespace-nowrap">Cape Coast</span>
            </div>

            <span className={`hidden md:block h-5 w-px ${solid ? "bg-brand-forest/15" : "bg-white/20"}`} />

            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open cart — ${totalCount} item${totalCount !== 1 ? "s" : ""}`}
              className="group flex items-center gap-2 rounded-full bg-brand-gold py-2 pl-4 pr-2 text-brand-forest shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-105 active:translate-y-0 focus-ring"
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
              <span className="hidden sm:inline text-[13px] font-bold">Cart</span>
              <span
                key={totalCount}
                className={`flex h-6 min-w-[24px] items-center justify-center rounded-full px-1.5 text-xs font-bold animate-fade-in ${
                  totalCount > 0
                    ? "bg-brand-forest text-brand-gold"
                    : "bg-brand-forest/15 text-brand-forest/60"
                }`}
              >
                {totalCount > 9 ? "9+" : totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className={`rounded-full p-2 transition-colors focus-ring lg:hidden ${
                solid ? "text-brand-forest hover:bg-brand-forest/10" : "text-white hover:bg-white/10"
              }`}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="grid gap-1 border-t border-brand-forest/10 pb-4 pt-3 lg:hidden animate-fade-in"
          >
            {NAV_LINKS.map((link) => {
              const active = activeId === link.href.slice(2);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-gold text-brand-forest"
                      : "text-brand-forest/80 hover:bg-brand-forest/[0.06]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <p className="px-4 pt-2 text-xs text-brand-forest/50">Cape Coast, Ghana</p>
          </nav>
        )}
      </div>
    </header>
  );
}
