"use client";

import Image from "next/image";
import React from "react";
import { useManager } from "@/context/manager-context";
import { Phone } from "@/components/ui/icons";

export function TradeSection() {
  const { settings } = useManager();

  return (
    <>
        <section className="bg-brand-gold py-16" id="trade">
          <div className="section-container">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-brand-forest">
                  Retailer or wholesaler?
                </h2>
                <p className="mt-2 text-brand-forest/70 text-sm max-w-md leading-relaxed">
                  We supply health stores, supermarkets and distributors across Ghana.
                  Bulk pricing available for orders of 30+ bottles.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <a
                  href={`https://wa.me/${(settings.whatsappNumber || "233540000000").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello GBHPL, I would like to inquire about wholesale / trade pricing.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-forest-outline justify-center gap-2 bg-white/20"
                >
                  <Image src="/icons/contact/whatsapp.svg" alt="" width={24} height={24} className="h-6 w-6" />
                  WhatsApp Inquiries
                </a>
                <a
                  href={`tel:${settings.phone || "+233000000000"}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg
                    bg-brand-forest text-white font-semibold px-6 py-3 text-sm
                    transition-all duration-200 hover:bg-brand-forest-light hover:-translate-y-0.5
                    focus-ring"
                >
                  <Phone className="w-4 h-4" /> Call Us
                </a>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
