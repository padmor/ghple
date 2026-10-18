"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "@/components/ui/icons";
import { FAQS } from "@/data/home";

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-full py-4 px-8 text-center focus-ring rounded-sm"
        aria-expanded={open}
      >
        <span className="font-semibold text-brand-forest text-sm sm:text-base leading-snug">{q}</span>
        {open ? (
          <ChevronUp className="absolute right-0 w-4 h-4 text-brand-gold flex-shrink-0" />
        ) : (
          <ChevronDown className="absolute right-0 w-4 h-4 text-brand-sage flex-shrink-0" />
        )}
      </button>
      {open && (
        <p className="pb-4 px-4 text-center text-sm text-brand-forest/70 leading-relaxed animate-fade-in">
          {a}
        </p>
      )}
    </div>
  );
}

export function FaqSection() {
  return (
    <>
        <section className="bg-white py-20" id="faq">
          <div className="section-container">
            <div className="max-w-2xl mx-auto">
              <div className="mb-10 text-center">
                <p className="section-label mb-3">Common Questions</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-brand-forest">
                  FAQs
                </h2>
              </div>
              <div className="divide-y-0">
                {FAQS.map((faq) => (
                  <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
