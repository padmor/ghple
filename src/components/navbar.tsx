"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X, ChevronRight } from "lucide-react";
import { useCart } from "@/context/cart-context";

const NAV_LINKS = [
  { href: "#products", label: "Products" },
  { href: "#process", label: "Our Process" },
  { href: "#about", label: "About Us" },
  { href: "#trade", label: "Trade" },
];

export function Navbar() {
  const { totalCount, setIsCartOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep the page still while the menu is open, and allow Escape to close it.
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white border-b border-brand-forest/10 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-16 md:h-[68px]">
            {/* Logo */}
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center gap-2 focus-ring rounded-md"
            >
              <div className="w-8 h-8 rounded bg-brand-forest flex items-center justify-center">
                <span className="text-brand-gold font-bold text-xs tracking-tight">G</span>
              </div>
              <div className="leading-none">
                <span
                  className={`font-bold text-sm tracking-tight block transition-colors ${
                    scrolled ? "text-brand-forest" : "text-white"
                  }`}
                >
                  GBHPL
                </span>
                <span
                  className={`text-[10px] tracking-widest uppercase block transition-colors ${
                    scrolled ? "text-brand-sage" : "text-white/70"
                  }`}
                >
                  Since 2018
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium underline-hover transition-colors focus-ring rounded ${
                    scrolled
                      ? "text-brand-forest/80 hover:text-brand-forest"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              {/* Cart button */}
              <button
                onClick={() => setIsCartOpen(true)}
                aria-label={`Open cart — ${totalCount} item${totalCount !== 1 ? "s" : ""}`}
                className={`relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 transition-colors focus-ring ${
                  scrolled
                    ? "text-brand-forest hover:bg-brand-forest/8"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {totalCount > 0 && (
                  <span className="cart-badge">{totalCount > 9 ? "9+" : totalCount}</span>
                )}
              </button>

              {/* Shop CTA — desktop only */}
              <Link
                href="#products"
                className="hidden md:inline-flex btn-gold text-xs px-4 py-2"
              >
                Shop Now
              </Link>

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className={`md:hidden inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 transition-colors focus-ring ${
                  scrolled
                    ? "text-brand-forest hover:bg-brand-forest/8"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 drawer-overlay md:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 sm:w-72 z-50 bg-brand-forest md:hidden
          flex flex-col transition-transform duration-300 ease-out
          ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!menuOpen}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-14 sm:px-6 sm:h-16 border-b border-white/10">
          <span className="text-white font-bold tracking-tight">Menu</span>
          <button
            onClick={closeMenu}
            aria-label="Close menu"
            tabIndex={menuOpen ? 0 : -1}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-ring"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer links */}
        <nav className="flex flex-col flex-1 px-3 py-4 sm:px-4 sm:py-6 gap-1" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              tabIndex={menuOpen ? 0 : -1}
              className="flex min-h-11 items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-lg
                text-white/80 hover:text-white hover:bg-white/10
                text-sm font-medium transition-colors focus-ring"
            >
              {link.label}
              <ChevronRight className="w-4 h-4 text-brand-gold" />
            </Link>
          ))}
        </nav>

        {/* Drawer footer CTA */}
        <div className="px-3 pb-5 sm:px-4 sm:pb-8">
          <Link
            href="#products"
            onClick={closeMenu}
            tabIndex={menuOpen ? 0 : -1}
            className="btn-gold min-h-11 w-full justify-center text-sm"
          >
            Shop Now
          </Link>
          <p className="text-center text-white/40 text-xs mt-4">
            © {new Date().getFullYear()} GBHPL. Cape Coast, Ghana.
          </p>
        </div>
      </div>
    </>
  );
}
