"use client";

import React, { useState } from "react";
import { MapPin, ArrowRight, Phone } from "lucide-react";
import { BRANCHES } from "@/data/home";

export function LocationsSection() {
  const [activeBranch, setActiveBranch] = useState(0);

  return (
    <>
        <section className="bg-white py-20" id="location">
          <div className="section-container">
            <div className="max-w-xl">
              <span className="text-brand-gold font-bold tracking-widest uppercase text-xs">
                Find us
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-brand-forest">Our locations</h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-forest/60">
                Choose a branch to see it on the map and get directions.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 items-stretch gap-8">
              {/* Branch list */}
              <div className="lg:col-span-5 space-y-3">
                {BRANCHES.map((b, i) => {
                  const active = i === activeBranch;
                  return (
                    <div
                      key={b.name}
                      className={`rounded-2xl border p-5 transition-all duration-300 ${
                        active
                          ? "border-brand-gold/60 bg-white shadow-lg"
                          : "border-brand-forest/10 bg-white/60 hover:bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveBranch(i)}
                        aria-pressed={active}
                        className="flex w-full items-start gap-4 text-left focus-ring rounded-lg"
                      >
                        <span
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                            active ? "bg-brand-forest" : "bg-brand-forest/10"
                          }`}
                        >
                          <MapPin
                            className={`h-4 w-4 ${active ? "text-brand-gold" : "text-brand-forest"}`}
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="font-bold text-brand-forest">{b.name}</span>
                            <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-forest">
                              {b.type}
                            </span>
                          </span>
                          <span className="mt-1 block text-sm text-brand-forest/60">{b.address}</span>
                        </span>
                      </button>

                      {active && (
                        <div className="mt-4 flex items-center justify-between border-t border-brand-forest/10 pt-4 animate-fade-in">
                          <a
                            href={`tel:${b.phone.replace(/[^+0-9]/g, "")}`}
                            className="flex items-center gap-2 text-sm text-brand-forest/70 hover:text-brand-gold transition-colors"
                          >
                            <Phone className="h-4 w-4 text-brand-gold" />
                            {b.phone}
                          </a>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.mapQuery)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-gold gap-2 px-4 py-2 text-xs"
                          >
                            <span>Get directions</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Map follows the selected branch */}
              <div className="lg:col-span-7 min-h-[420px] overflow-hidden rounded-3xl border border-brand-forest/10 shadow-xl">
                <iframe
                  key={BRANCHES[activeBranch].name}
                  title={`Map of ${BRANCHES[activeBranch].name}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(BRANCHES[activeBranch].mapQuery)}&output=embed`}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
