"use client";

import React from "react";
import Image from "next/image";
import { useManager } from "@/context/manager-context";
import { ArrowRight } from "@/components/ui/icons";

export function FounderSection() {
  const { ceo } = useManager();

  return (
    <>
        {ceo.name && (
          <section className="bg-brand-forest py-20" id="about">
            <div className="section-container">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Photo */}
                <div className="flex justify-center lg:justify-start">
                  <div className="relative">
                    <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-3xl overflow-hidden bg-brand-forest-mid border border-white/10">
                      {ceo.photoPath ? (
                        <Image
                          src={ceo.photoPath}
                          alt={ceo.name}
                          fill
                          sizes="(min-width: 640px) 288px, 224px"
                          className="object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-7xl font-bold text-white/10">
                            {ceo.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Name card below photo */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-brand-gold
                      text-brand-forest px-5 py-2 rounded-full text-xs font-bold tracking-wide
                      whitespace-nowrap shadow-gold-sm">
                      {ceo.title}
                    </div>
                  </div>
                </div>

                {/* Text */}
                <div className="text-white">
                  <p className="section-label text-brand-gold mb-4">Our Founder</p>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
                    {ceo.name}
                  </h2>
                  {ceo.quote && (
                    <blockquote className="border-l-2 border-brand-gold pl-5 mb-6">
                      <p className="text-white/80 italic text-lg leading-relaxed">
                        &ldquo;{ceo.quote}&rdquo;
                      </p>
                    </blockquote>
                  )}
                  <p className="text-white/60 leading-relaxed text-sm">{ceo.bio}</p>
                  <a href="#process" className="btn-white-outline mt-8 inline-flex gap-2">
                    See our process <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}
    </>
  );
}
