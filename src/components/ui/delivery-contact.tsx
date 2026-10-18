"use client";

import Image from "next/image";
import { useManager } from "@/context/manager-context";

const digits = (s: string) => s.replace(/[^\d+]/g, "");

/** Numbers a customer can call or message to arrange or follow up a delivery. Set in Store Settings. */
export function DeliveryContact({ orderId, tone = "light" }: { orderId?: string; tone?: "light" | "dark" }) {
  const { settings } = useManager();

  // Each distinct number once, in the order the manager entered them
  const phones = [settings.phone, settings.phone2].filter((p, i, all) => p.trim() && all.findIndex((x) => digits(x) === digits(p)) === i);
  const wa = digits(settings.whatsappNumber).replace(/^\+/, "");
  if (phones.length === 0 && !wa) return null;

  const text = encodeURIComponent(`Hello GBHPL, I'd like to arrange delivery${orderId ? ` for order ${orderId}` : ""}.`);
  const light = tone === "light";
  const pill = `inline-flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-sm font-bold transition-all hover:-translate-y-0.5 hover:border-brand-gold ${
    light ? "border-black/15 bg-white text-black" : "border-white/20 bg-white/5 text-white"
  }`;

  return (
    <div>
      <p className={`text-sm font-bold ${light ? "text-black" : "text-white"}`}>Need to arrange or follow up delivery?</p>
      <p className={`mt-0.5 text-xs ${light ? "text-black/55" : "text-white/60"}`}>Call or message us any time.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {phones.map((p) => (
          <a key={p} href={`tel:${digits(p)}`} className={pill}>
            <Image src="/icons/contact/contact-phone.svg" alt="" width={32} height={32} className="h-8 w-8" />
            {p}
          </a>
        ))}
        {wa && (
          <a href={`https://wa.me/${wa}?text=${text}`} target="_blank" rel="noopener noreferrer" className={pill}>
            <Image src="/icons/contact/whatsapp.svg" alt="" width={32} height={32} className="h-8 w-8" />
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
