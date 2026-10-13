"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Package,
  FileText,
  Users,
  Settings,
  LogOut,
  LayoutDashboard,
  Eye,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/manager", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/manager/products", label: "Products & Prices", icon: Package },
  { href: "/manager/content", label: "Page Content", icon: FileText },
  { href: "/manager/trade", label: "Trade Settings", icon: Users },
];

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-brand-navy flex manager-theme">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-brand-navy-mid border-r border-white/8 flex flex-col">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-gold/20 border border-brand-gold/30
              flex items-center justify-center">
              <span className="text-brand-gold font-bold text-xs">G</span>
            </div>
            <div>
              <p className="text-white text-sm font-bold">GBHPL</p>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider">Manager</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Manager navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && item.href !== "/manager";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`manager-nav-link ${active ? "active" : ""}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer links */}
        <div className="px-3 py-4 border-t border-white/8 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="manager-nav-link text-xs"
          >
            <Eye className="w-4 h-4" />
            Preview Storefront
          </Link>
          <Link
            href="/"
            className="manager-nav-link w-full text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            Leave Manager
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
