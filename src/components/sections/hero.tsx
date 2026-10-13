"use client";

import React from "react";
import Image from "next/image";
import { ArrowDown } from "lucide-react";

export function HeroSection() {

  return (
    <>
        <section className="relative flex flex-col pt-[72px] pb-8 sm:pb-12 lg:pb-10 overflow-hidden bg-brand-forest">
          {/* Backdrop — the photo's own colours, softened, instead of flat green */}
          <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
            <Image
              src="/images/backgrounds/hero-bg-v2.jpg"
              alt=""
              fill
              sizes="100vw"
              className="scale-125 object-cover blur-3xl saturate-125"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-sky-950/25 via-black/40 to-black/65" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-forest to-transparent" />
          </div>

          {/* Background image */}
          <div className="relative z-0 aspect-[1408/768] w-full flex-shrink-0 lg:mx-auto lg:mt-4 lg:max-w-4xl lg:overflow-hidden lg:rounded-3xl lg:shadow-2xl lg:ring-1 lg:ring-white/10">
            <Image
              src="/images/backgrounds/hero-bg-v2.jpg"
              alt="Gid's Apple Orchard background"
              fill
              priority
              className="object-fill"
              sizes="100vw"
            />
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-brand-forest to-transparent sm:h-24 lg:hidden" />
          </div>

          {/* Tagline — top of the hero */}
          <div className="absolute inset-x-0 top-[84px] z-10 flex justify-center px-4 sm:top-24 lg:top-28">
            <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white sm:gap-4 sm:text-xs animate-fade-in [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
              <span className="h-px w-8 bg-brand-gold sm:w-14" />
              Raw · Unfiltered · With the Mother
              <span className="h-px w-8 bg-brand-gold sm:w-14" />
            </p>
          </div>

          <div className="relative z-10 section-container w-full pt-4 sm:pt-6">
            <div className="grid grid-cols-1 items-center">
              {/* Copy */}
              <div className="mx-auto w-full max-w-3xl animate-reveal-up text-center">
                <h1 className="text-[1.4rem] sm:text-4xl lg:text-5xl font-extrabold uppercase text-white leading-[1.1] tracking-tight animate-fade-in">
                  <span className="text-brand-gold">Gid&apos;s</span> Apple Cider Vinegar
                </h1>

                <div className="mt-4 sm:mt-10 flex flex-row flex-wrap items-stretch sm:items-center justify-center gap-2 sm:gap-4 animate-fade-in">
                  <a href="#products" className="btn-gold flex-1 sm:flex-none justify-center text-xs sm:text-base px-4 sm:px-8 py-2.5 sm:py-4 gap-1.5 sm:gap-2">
                    <span>View All Sizes</span>
                    <ArrowDown className="w-4 h-4" />
                  </a>
                  <a href="#process" className="btn-white-outline flex-1 sm:flex-none justify-center text-xs sm:text-base px-4 sm:px-8 py-2.5 sm:py-4">
                    See How It&apos;s Made
                  </a>
                </div>

                {/* Trust row */}
                <div className="mx-auto mt-4 sm:mt-12 lg:mt-8 grid max-w-2xl grid-cols-3 gap-1 sm:gap-0 divide-x divide-white/15 border-t border-white/15 pt-3 sm:pt-8 animate-fade-in">
                  {[
                    { src: "/icons/benefits/delivery.svg", label: "Nationwide delivery across Ghana" },
                    { src: "/icons/benefits/quality.svg", label: "Quality & acidity tested" },
                    { src: "/icons/benefits/packing.svg", label: "Secure glass bottle packing" },
                  ].map(({ src, label }) => (
                    <div key={label} className="flex flex-col items-center text-center gap-1 sm:gap-3 px-1 sm:px-5">
                      <Image src={src} alt="" width={44} height={44} className="h-7 w-7 sm:h-11 sm:w-11" />
                      <span className="text-[10px] sm:text-sm leading-tight text-white/75">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
