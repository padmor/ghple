"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, ChevronUp } from "@/components/ui/icons";

export function SiteFooter() {

  return (
    <>
        <footer className="bg-brand-forest text-white/60">
          <div className="section-container py-5 sm:py-10">
            <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-5 sm:px-8 sm:py-8">
              <div className="grid grid-cols-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-x-3 gap-y-5 sm:gap-10">
                {/* Brand */}
                <div className="col-span-3 lg:col-span-1">
                  <Image
                    src="/brand/logo-primary-light.svg"
                    alt="GBHPL — Gid's Apple Cider Vinegar"
                    width={420}
                    height={120}
                    className="h-11 w-auto"
                  />
                  <p className="mt-2 sm:mt-3 max-w-xs text-[11px] sm:text-xs leading-relaxed">
                    Gid&apos;s Beverages &amp; Health Products Ltd. Crafting honest health products
                    in Cape Coast since 2018.
                  </p>
                  <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <li className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-brand-gold" />
                      <span>Cape Coast, Central Region, Ghana</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 flex-shrink-0 text-brand-gold" />
                      <a href="tel:+233507154818" className="transition-colors hover:text-white">
                        +233 50 715 4818
                      </a>
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0 text-brand-gold" />
                      <a href="mailto:hello@gbhpl.com" className="transition-colors hover:text-white">
                        hello@gbhpl.com
                      </a>
                    </li>
                  </ul>

                  <p className="mt-4 sm:mt-5 text-[11px] sm:text-sm font-bold uppercase tracking-widest text-brand-gold">
                    Follow us
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {[
                      { href: "https://wa.me/233507154818", label: "WhatsApp", icon: "whatsapp" },
                      { href: "https://www.facebook.com/share/1KUHEd8FRx/?mibextid=wwXIfr", label: "Facebook", icon: "facebook" },
                      { href: "https://www.instagram.com/gids_apple_cider_vinegar", label: "Instagram", icon: "instagram" },
                      { href: "https://www.tiktok.com/@gids.beverage", label: "TikTok", icon: "tiktok" },
                    ].map(({ href, label, icon }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        title={label}
                        className="block rounded-xl transition-transform hover:-translate-y-0.5 hover:scale-110 focus-ring"
                      >
                        <Image src={`/icons/ui/${icon}.svg`} alt="" width={36} height={36} className="h-8 w-8 sm:h-9 sm:w-9" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Link columns */}
                {[
                  {
                    title: "Shop",
                    links: [
                      { href: "#products", label: "500 ml Bottle" },
                      { href: "#products", label: "1000 ml Bottle" },
                      { href: "#trade", label: "Wholesale" },
                    ],
                  },
                  {
                    title: "Company",
                    links: [
                      { href: "#about", label: "About Us" },
                      { href: "#process", label: "Our Process" },
                      { href: "#trade", label: "Trade Partners" },
                      { href: "#faq", label: "FAQs" },
                      { href: "/track", label: "Track Order" },
                      { href: "/returns", label: "Return Policy" },
                    ],
                  },
                  {
                    title: "Staff",
                    links: [{ href: "/manager", label: "Manager Panel →" }],
                  },
                ].map((col) => (
                  <div key={col.title}>
                    <h3 className="text-[11px] sm:text-sm font-bold uppercase tracking-widest text-brand-gold">
                      {col.title}
                    </h3>
                    <ul className="mt-2 sm:mt-4 space-y-1.5 sm:space-y-2.5 text-[11px] sm:text-sm">
                      {col.links.map((l) => (
                        <li key={l.label}>
                          <Link href={l.href} className="transition-colors hover:text-white">
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 border-t border-white/10 pt-4 sm:pt-5 text-center sm:text-left text-[10px] text-white/35">
                <p>
                  © {new Date().getFullYear()} Gid&apos;s Beverages &amp; Health Products Ltd. All
                  rights reserved.
                </p>
                <a
                  href="#top"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-white/70 transition-colors hover:border-brand-gold hover:text-brand-gold"
                >
                  Back to top
                  <ChevronUp className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </footer>
    </>
  );
}
