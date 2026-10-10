"use client";

import React from "react";
import Link from "next/link";
import { Package, FileText, Users, ArrowRight } from "lucide-react";
import { useManager } from "@/context/manager-context";
import { formatGHS } from "@/lib/utils";

export default function ManagerDashboard() {
  const { products, benefits, processSteps, tradeTiers } = useManager();
  const inStock = products.filter((p) => p.inStock).length;
  const priceRange =
    products.length > 0
      ? `${formatGHS(Math.min(...products.map((p) => p.price)))} – ${formatGHS(Math.max(...products.map((p) => p.price)))}`
      : "—";

  const QUICK_LINKS = [
    {
      href: "/manager/products",
      icon: Package,
      label: "Products & Prices",
      description: "Add sizes, update prices, toggle stock",
      stat: `${inStock} in stock`,
    },
    {
      href: "/manager/content",
      icon: FileText,
      label: "Page Content",
      description: "CEO info, benefits, process steps",
      stat: `${benefits.length} benefits · ${processSteps.length} steps`,
    },
    {
      href: "/manager/trade",
      icon: Users,
      label: "Trade Settings",
      description: "Bulk pricing tiers and delivery zones",
      stat: `${tradeTiers.length} pricing tiers`,
    },
  ];

  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your products, content, and trade settings.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Products", value: products.length },
          { label: "In Stock", value: inStock },
          { label: "Price Range", value: priceRange },
        ].map((s) => (
          <div key={s.label} className="bg-brand-navy-mid border border-white/8 rounded-xl p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">{s.label}</p>
            <p className="text-white font-bold text-xl">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          Sections
        </h2>
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-5 bg-brand-navy-mid border border-white/8 rounded-xl p-5
                hover:border-brand-gold/30 hover:bg-brand-navy-light
                transition-all duration-150 group"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-gold/15 border border-brand-gold/20
                flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-brand-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{link.label}</p>
                <p className="text-slate-400 text-xs mt-0.5">{link.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-brand-gold text-xs font-medium">{link.stat}</p>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-brand-gold
                  group-hover:translate-x-0.5 transition-all mt-1 ml-auto" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Note */}
      <div className="mt-8 bg-brand-gold/10 border border-brand-gold/20 rounded-xl p-4">
        <p className="text-brand-gold text-xs font-semibold mb-1">⚠ No data persistence</p>
        <p className="text-slate-400 text-xs leading-relaxed">
          Changes made here are live in the browser only and reset when the page is refreshed.
          This is a frontend-only demo — a backend database would be needed for permanent storage.
        </p>
      </div>
    </div>
  );
}
