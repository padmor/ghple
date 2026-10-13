"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package, Search } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useManager } from "@/context/manager-context";
import { Navbar } from "@/components/navbar";
import { CartDrawer } from "@/components/cart-drawer";
import { CheckoutDialog } from "@/components/checkout-dialog";
import { Spinner } from "@/components/ui/spinner";
import { formatGHS } from "@/lib/utils";
import type { OrderDetails } from "@/types/store";

const STEPS = [
  { key: "pending_payment", label: "Order received", note: "We have your order", img: "/icons/track-received.svg" },
  { key: "confirmed", label: "Confirmed", note: "Payment confirmed, packing", img: "/icons/track-confirmed.svg" },
  { key: "out_for_delivery", label: "Out for delivery", note: "On its way to you", img: "/icons/track-delivery.svg" },
  { key: "delivered", label: "Delivered", note: "Enjoy your vinegar", img: "/icons/track-delivered.svg" },
] as const;

const PAYMENT_LABEL: Record<string, string> = {
  momo_mtn: "MTN Mobile Money",
  momo_telecel: "Telecel Cash",
  momo_at: "AirtelTigo Money",
  cash: "Cash on Delivery",
};

const WHATSAPP = "233507154818";

export default function TrackOrderPage() {
  const { recentOrder } = useCart();
  const { products } = useManager();

  const [input, setInput] = useState("");
  const [searched, setSearched] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [checking, setChecking] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  // Read ?id= / ?demo=1 from the address; otherwise show the order just placed
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo")) setDemo(true);
    const id = params.get("id") || recentOrder?.id || "";
    if (id) {
      setInput(id);
      setSearched(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sample: OrderDetails = useMemo(() => {
    const items = products.slice(0, 2).map((p) => ({ ...p, quantity: 1 }));
    const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);
    return {
      id: "GBH-SAMPLE",
      customerName: "Sample customer",
      phone: "+233 00 000 0000",
      region: "Greater Accra",
      deliveryAddress: "Sample street, Accra",
      paymentMethod: "momo_mtn",
      items,
      subtotal,
      deliveryFee: 20,
      total: subtotal + 20,
      status: "out_for_delivery",
      createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    };
  }, [products]);

  const order: OrderDetails | null = useMemo(() => {
    if (demo) return sample;
    if (searched === null) return null;
    const q = searched.trim().toLowerCase();
    if (!q) return null;
    if (recentOrder && recentOrder.id.toLowerCase() === q) return recentOrder;
    // No backend: show the tracking screen for any ID, with a status picked from the ID
    const statuses = ["pending_payment", "confirmed", "out_for_delivery", "delivered"] as const;
    const hash = Array.from(q).reduce((n, c) => n + c.charCodeAt(0), 0);
    return { ...sample, id: searched.trim().toUpperCase(), status: statuses[hash % statuses.length] };
  }, [demo, sample, searched, recentOrder]);
  const isPreview = !!order && order.id !== recentOrder?.id;

  const stepIndex = order ? Math.max(0, STEPS.findIndex((s) => s.key === order.status)) : -1;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemo(false);
    setChecking(true);
    setTimeout(() => {
      setSearched(input.trim());
      setChecking(false);
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 500);
  };

  return (
    <>
      <Navbar />
      <CartDrawer />
      <CheckoutDialog />

      <main className="relative overflow-hidden bg-brand-forest sm:min-h-screen">
        {/* Background — same as the Products section on the landing page */}
        <div
          className="relative z-0 mt-[72px] aspect-[1376/768] w-full overflow-hidden sm:absolute sm:inset-0 sm:mt-0 sm:aspect-auto"
          aria-hidden="true"
        >
          <Image
            src="/products-bg.jpg"
            alt=""
            fill
            priority
            className="object-fill sm:object-cover sm:object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/70 via-transparent to-brand-forest/40" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-brand-forest to-transparent sm:hidden" />
        </div>

        <div className="relative z-10 flex flex-col sm:min-h-screen">
          <header className="section-container pt-4 sm:pt-[100px]">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em]">
                <li>
                  <Link href="/" className="text-white/60 transition-colors hover:text-brand-gold">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true" className="text-white/30">
                  /
                </li>
                <li aria-current="page" className="text-brand-gold">
                  Track order
                </li>
              </ol>
            </nav>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Track your order
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
              Enter the order ID from your confirmation to see where your vinegar is.
            </p>

            {/* Search */}
            <form onSubmit={onSubmit} noValidate className="mt-5 flex max-w-xl gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-forest/50" />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Order ID, e.g. GBH-1A2B3C"
                  aria-label="Order ID"
                  className="w-full rounded-full border border-white/30 bg-white py-3 pl-11 pr-4 text-sm text-brand-forest shadow-lg outline-none placeholder:text-brand-forest/40 focus:ring-4 focus:ring-brand-gold/40"
                />
              </div>
              <button
                type="submit"
                disabled={checking}
                className="btn-gold flex-shrink-0 gap-2 px-5 py-3 text-sm font-bold disabled:cursor-wait disabled:opacity-80"
              >
                {checking ? "Checking…" : "Track"}
                {checking ? <Spinner /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/70">
              <span>Try a demo ID:</span>
              {["GBH-DEMO1", "GBH-DEMO2", "GBH-DEMO3", "GBH-DEMO4"].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setDemo(false);
                    setInput(id);
                    setSearched(id);
                    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="rounded-full border border-white/30 px-3 py-1 font-bold text-white transition-colors hover:border-brand-gold hover:text-brand-gold focus-ring"
                >
                  {id}
                </button>
              ))}
            </div>
          </header>

          <section ref={resultsRef} className="section-container w-full flex-1 scroll-mt-24 py-8 sm:py-10">
            {checking ? (
              <div className="grid animate-pulse grid-cols-1 gap-6 lg:grid-cols-12" role="status" aria-label="Looking up your order">
                <div className="h-64 rounded-3xl bg-white/80 lg:col-span-8" />
                <div className="h-64 rounded-3xl bg-white/80 lg:col-span-4" />
              </div>
            ) : order ? (
              <>
              {isPreview && (
                <p className="mb-4 rounded-xl border border-brand-gold/40 bg-brand-gold/15 px-4 py-2.5 text-xs font-semibold text-white">
                  Preview: live order lookup isn&apos;t connected yet, so this screen shows sample details for your ID.
                </p>
              )}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Status */}
                <div className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_18px_40px_rgba(0,0,0,0.3)] sm:p-7 lg:col-span-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-brand-gold">
                        Order ID{demo ? " · sample" : ""}
                      </p>
                      <p className="mt-1 text-2xl font-extrabold tracking-tight text-black">{order.id}</p>
                      <p className="mt-0.5 text-xs text-black/50">
                        Placed{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-GH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="rounded-full bg-brand-forest px-3.5 py-1.5 text-xs font-bold text-brand-gold">
                      {STEPS[stepIndex].label}
                    </span>
                  </div>

                  {/* Timeline */}
                  <ol className="mt-7 flex flex-col gap-6 md:flex-row md:gap-0">
                    {STEPS.map((step, i) => {
                      const done = i <= stepIndex;
                      const current = i === stepIndex;
                      return (
                        <li
                          key={step.key}
                          className="relative flex items-start gap-4 md:flex-1 md:flex-col md:items-center md:gap-3 md:text-center"
                        >
                          {i < STEPS.length - 1 && (
                            <>
                              <span
                                className={`absolute left-[21px] top-11 -ml-px h-[calc(100%+1.5rem-2.75rem)] w-0.5 md:hidden ${
                                  i < stepIndex ? "bg-brand-gold" : "bg-black/10"
                                }`}
                              />
                              <span
                                className={`absolute left-[calc(50%+1.75rem)] top-[21px] hidden h-0.5 w-[calc(100%-3.5rem)] md:block ${
                                  i < stepIndex ? "bg-brand-gold" : "bg-black/10"
                                }`}
                              />
                            </>
                          )}
                          <span
                            className={`relative z-10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl transition-all ${
                              current
                                ? "scale-110 shadow-lg ring-4 ring-brand-gold/40"
                                : done
                                ? ""
                                : "opacity-35 grayscale"
                            }`}
                          >
                            <Image src={step.img} alt="" width={44} height={44} className="h-11 w-11" />
                          </span>
                          <span className="min-w-0">
                            <span
                              className={`block text-sm font-bold ${done ? "text-black" : "text-black/35"}`}
                            >
                              {step.label}
                            </span>
                            <span className={`block text-xs ${done ? "text-black/55" : "text-black/30"}`}>
                              {current ? step.note : done ? "Done" : "Pending"}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>

                  {/* Delivery */}
                  <div className="mt-8 grid grid-cols-1 gap-3 border-t border-dashed border-black/15 pt-5 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-black/45">
                        Delivering to
                      </p>
                      <p className="mt-0.5 font-semibold text-black">{order.customerName || "—"}</p>
                      <p className="text-black/60">
                        {[order.deliveryAddress, order.region].filter(Boolean).join(", ") || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-black/45">
                        Payment
                      </p>
                      <p className="mt-0.5 font-semibold text-black">
                        {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
                      </p>
                      <p className="text-black/60">{order.phone || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <aside className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_18px_40px_rgba(0,0,0,0.3)] sm:p-6 lg:col-span-4">
                  <h2 className="text-base font-bold text-black">Order summary</h2>
                  <ul className="mt-4 divide-y divide-black/10">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0">
                        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#fbf1d6]">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt="" className="h-full w-full object-contain p-1" />
                          ) : (
                            <Package className="h-5 w-5 text-black/30" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-black">{item.size}</span>
                          <span className="block text-xs text-black/50">
                            {item.quantity} × {formatGHS(item.price)}
                          </span>
                        </span>
                        <span className="text-sm font-bold text-black">
                          {formatGHS(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <dl className="mt-4 space-y-1.5 border-t border-dashed border-black/15 pt-4 text-sm">
                    <div className="flex justify-between text-black/60">
                      <dt>Subtotal</dt>
                      <dd className="font-medium text-black">{formatGHS(order.subtotal)}</dd>
                    </div>
                    <div className="flex justify-between text-black/60">
                      <dt>Delivery</dt>
                      <dd className="font-medium text-black">{formatGHS(order.deliveryFee)}</dd>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <dt className="font-bold text-black">Total</dt>
                      <dd className="text-xl font-black text-black">{formatGHS(order.total)}</dd>
                    </div>
                  </dl>
                </aside>
              </div>
              </>
            ) : (
              <div className="mx-auto max-w-xl rounded-3xl border border-white/70 bg-white p-7 text-center shadow-[0_18px_40px_rgba(0,0,0,0.3)] sm:p-9">
                <Image src="/icons/track-parcel.svg" alt="" width={80} height={80} className="mx-auto h-20 w-20" />
                <h2 className="mt-4 text-lg font-extrabold text-black">
                  {!searched ? "Enter your order ID" : `No order found for “${searched}”`}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-black/60">
                  {!searched
                    ? "Your order ID is in your confirmation, and starts with GBH-."
                    : "Check the ID and try again. If you've just ordered, it can take a moment to appear — or message us and we'll look it up."}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <a
                    href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hello GBHPL, I'd like an update on my order.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white py-1.5 pl-1.5 pr-5 text-sm font-bold text-black transition-all hover:-translate-y-0.5 hover:border-brand-gold"
                  >
                    <Image src="/icons/contact-chat.svg" alt="" width={32} height={32} className="h-8 w-8" />
                    WhatsApp us
                  </a>
                  <a
                    href="mailto:hello@gbhpl.com?subject=Order%20update"
                    className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white py-1.5 pl-1.5 pr-5 text-sm font-bold text-black transition-all hover:-translate-y-0.5 hover:border-brand-gold"
                  >
                    <Image src="/icons/contact-email.svg" alt="" width={32} height={32} className="h-8 w-8" />
                    Email us
                  </a>
                </div>
                <Link
                  href="/track?demo=1"
                  onClick={() => setDemo(true)}
                  className="mt-5 inline-block text-xs font-semibold text-black/50 underline decoration-brand-gold decoration-2 underline-offset-4 hover:text-black"
                >
                  See what a tracked order looks like
                </Link>
              </div>
            )}
          </section>

          <footer className="mt-auto border-t border-white/10 bg-brand-forest text-white/60">
            <div className="section-container flex flex-col items-center justify-between gap-2 py-5 text-xs sm:flex-row">
              <p>
                © {new Date().getFullYear()} Gid&apos;s Beverages &amp; Health Products Ltd. All rights
                reserved.
              </p>
              <nav aria-label="Footer" className="flex gap-5">
                <Link href="/" className="hover:text-brand-gold">
                  Home
                </Link>
                <Link href="/products" className="hover:text-brand-gold">
                  Products
                </Link>
                <Link href="/returns" className="hover:text-brand-gold">
                  Return Policy
                </Link>
              </nav>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
