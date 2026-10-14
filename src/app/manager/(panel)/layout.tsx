"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "@/components/ui/icons";
import { Icon } from "@/components/manager/ui";

const NAV_ITEMS = [
  { href: "/manager", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/manager/orders", label: "Orders & Refunds", icon: "orders" },
  { href: "/manager/products", label: "Products & Prices", icon: "products" },
  { href: "/manager/content", label: "Founder Profile", icon: "founder" },
  { href: "/manager/trade", label: "Store Settings", icon: "settings" },
];

function Brand() {
  return (
    <Link href="/manager" aria-label="GBHPL Manager home" className="flex items-center gap-2.5 rounded-md focus-ring">
      <Image src="/brand/logo-mark.svg" alt="" width={36} height={36} className="h-9 w-9 rounded-xl ring-1 ring-brand-gold/60" priority />
      <span className="leading-none">
        <span className="block text-sm font-extrabold tracking-tight text-white">GBHPL</span>
        <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">Manager</span>
      </span>
    </Link>
  );
}

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the phone menu after every navigation
  useEffect(() => setMenuOpen(false), [pathname]);

  const isActive = (item: (typeof NAV_ITEMS)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const links = NAV_ITEMS.map((item) => {
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={isActive(item) ? "page" : undefined}
        className={`manager-nav-link focus-ring ${isActive(item) ? "active" : ""}`}
      >
        <Icon name={item.icon} className="h-7 w-7" />
        {item.label}
      </Link>
    );
  });

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/manager/login");
    router.refresh();
  };

  const footerLinks = (
    <>
      <Link href="/" target="_blank" className="manager-nav-link text-xs focus-ring">
        <Icon name="store" className="h-7 w-7" />
        Preview storefront
      </Link>
      <button type="button" onClick={signOut} className="manager-nav-link w-full text-left text-xs focus-ring">
        <Icon name="exit" className="h-7 w-7" />
        Sign out
      </button>
    </>
  );

  return (
    <div className="manager-theme relative isolate min-h-screen bg-brand-navy text-white lg:flex">
      {/* Backdrop: the orchard from the storefront, dimmed so figures stay easy to read */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <Image
          src="/images/backgrounds/products-bg.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/40 via-brand-navy/75 to-brand-navy" />
        <div className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-gold/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-brand-forest-light/30 blur-3xl" />
        <div className="manager-dots absolute inset-0" />
      </div>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col border-r border-white/10 bg-brand-navy-mid lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <Brand />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Manager navigation">
          {links}
        </nav>
        <div className="space-y-1 border-t border-white/10 px-3 py-4">{footerLinks}</div>
      </aside>

      {/* Phone & tablet top bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-brand-navy-mid/95 backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <Brand />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="rounded-full p-2 text-white transition-colors hover:bg-white/10 focus-ring"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="animate-fade-in border-t border-white/10 px-3 pb-4 pt-3">
            <nav className="space-y-1" aria-label="Manager navigation">
              {links}
            </nav>
            <div className="mt-3 grid grid-cols-2 gap-1 border-t border-white/10 pt-3">{footerLinks}</div>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
