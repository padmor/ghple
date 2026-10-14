"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "@/components/ui/icons";
import { LiveStats } from "@/components/manager/live-stats";
import { PageHeader } from "@/components/manager/ui";

export default function ManagerDashboard() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      <PageHeader
        icon="dashboard"
        title="Dashboard"
        text="How the store is doing, live."
        action={
          <Link href="/" target="_blank" className="btn-gold gap-2 px-5 py-2.5 text-sm font-bold">
            View live store
            <ExternalLink className="h-4 w-4" />
          </Link>
        }
      />

      <div className="relative mb-5 overflow-hidden rounded-3xl border border-white/10">
        <Image
          src="/images/backgrounds/hero-bg-v2.jpg"
          alt=""
          fill
          sizes="(min-width: 1024px) 960px, 100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/80 to-brand-navy/20" />
        <div className="relative flex items-center gap-4 px-5 py-6 sm:px-8 sm:py-8">
          <Image src="/brand/logo-mark.svg" alt="" width={64} height={64} className="h-14 w-14 sm:h-16 sm:w-16" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">Welcome back</p>
            <p className="mt-1 text-lg font-extrabold text-white sm:text-2xl">Gid&apos;s Apple Cider Vinegar</p>
            <p className="text-sm text-white/65">Raw. Unfiltered. Real.</p>
          </div>
        </div>
      </div>

      <LiveStats />
    </div>
  );
}
