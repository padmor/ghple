"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

const field =
  "w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30";

export default function ManagerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.replace("/manager");
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not sign in. Please try again.");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    }
    setBusy(false);
  };

  return (
    <main className="manager-theme relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-brand-navy px-4 py-10 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/images/backgrounds/products-bg.jpg"
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/50 via-brand-navy/80 to-brand-navy" />
        <div className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-gold/20 blur-3xl" />
      </div>

      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-brand-navy-mid p-6 shadow-2xl sm:p-8">
        <div className="flex items-center gap-3">
          <Image src="/brand/logo-mark.svg" alt="" width={44} height={44} className="h-11 w-11 rounded-xl ring-1 ring-brand-gold/60" priority />
          <div className="leading-none">
            <p className="text-base font-extrabold text-white">GBHPL</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">Manager</p>
          </div>
        </div>

        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-white/60">Enter your manager email and password.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/60">Email</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
              placeholder="you@gbhpl.com"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-white/60">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
          </label>

          {error && (
            <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-gold w-full justify-center gap-2 py-3 text-sm font-bold disabled:cursor-wait disabled:opacity-80"
          >
            {busy && <Spinner />}
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <Link href="/" className="mt-6 block text-center text-xs font-semibold text-white/50 hover:text-brand-gold">
          ← Back to the store
        </Link>
      </div>
    </main>
  );
}
