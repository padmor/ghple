"use client";

import React, { useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
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

const MANAGER_PIN = "1234"; // Change this in code to update PIN

const NAV_ITEMS = [
  { href: "/manager", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/manager/products", label: "Products & Prices", icon: Package },
  { href: "/manager/content", label: "Page Content", icon: FileText },
  { href: "/manager/trade", label: "Trade Settings", icon: Users },
];

function PinGate({ onSuccess }: { onSuccess: () => void }) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleDigit = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    setError(false);
    if (val && i < 3) refs[i + 1].current?.focus();

    // Auto-submit when all 4 filled
    if (val && i === 3) {
      const pin = [...next.slice(0, 3), val].join("");
      if (pin === MANAGER_PIN) {
        onSuccess();
      } else {
        setShake(true);
        setError(true);
        setDigits(["", "", "", ""]);
        setTimeout(() => {
          setShake(false);
          refs[0].current?.focus();
        }, 600);
      }
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs[i - 1].current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-brand-gold/20 border border-brand-gold/30
            flex items-center justify-center mx-auto mb-6">
            <span className="text-brand-gold font-bold text-xl">G</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Manager Panel</h1>
          <p className="text-slate-400 text-sm mt-2">Enter your 4-digit PIN to continue</p>
        </div>

        <div className={`flex justify-center gap-4 mb-6 ${shake ? "animate-[shake_0.4s_ease]" : ""}`}
          style={shake ? { animation: "shake 0.4s ease" } : {}}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              id={`pin-${i}`}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              autoFocus={i === 0}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`pin-input ${error ? "border-red-500 text-red-400" : ""}`}
              aria-label={`PIN digit ${i + 1}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-red-400 text-sm animate-fade-in">
            Incorrect PIN. Try again.
          </p>
        )}

        <p className="text-center text-slate-600 text-xs mt-8">
          Default PIN: 1234 — update it in{" "}
          <code className="text-slate-500">src/app/manager/layout.tsx</code>
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
      `}</style>
    </div>
  );
}

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authed, setAuthed] = useState(false);
  const pathname = usePathname();

  if (!authed) {
    return <PinGate onSuccess={() => setAuthed(true)} />;
  }

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
          <button
            onClick={() => setAuthed(false)}
            className="manager-nav-link w-full text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
