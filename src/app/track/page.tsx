"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package, Search } from "@/components/ui/icons";
import { useCart } from "@/context/cart-context";
import { api } from "@/lib/api";
import { Navbar } from "@/components/layout/navbar";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CheckoutDialog } from "@/components/cart/checkout-dialog";
import { PaymentActions } from "@/components/payment/payment-actions";
import { DeliveryContact } from "@/components/ui/delivery-contact";
import { Spinner } from "@/components/ui/spinner";
import { PageLoader } from "@/components/ui/apple-loader";
import { formatGHS } from "@/lib/utils";
import type { OrderDetails } from "@/types/store";

const STEPS = [
  { key: "pending_payment", label: "Order received", note: "We have your order", img: "/icons/track/track-received.svg" },
  { key: "confirmed", label: "Confirmed", note: "Payment confirmed, packing", img: "/icons/track/track-confirmed.svg" },
  { key: "out_for_delivery", label: "Out for delivery", note: "On its way to you", img: "/icons/track/track-delivery.svg" },
  { key: "delivered", label: "Delivered", note: "Enjoy your vinegar", img: "/icons/track/track-delivered.svg" },
] as const;

const PAYMENT_LABEL: Record<string, string> = {
  momo_mtn: "MTN Mobile Money",
  momo_telecel: "Telecel Cash",
  momo_at: "AirtelTigo Money",
  cash: "Cash on Delivery",
};

const DELIVERY_LABEL: Record<string, string> = {
  rider: "Your dispatch rider",
  courier: "Your courier",
  bus: "Sent by bus or parcel service",
  other: "Delivery details",
};

const WHATSAPP = "233507154818";

export default function TrackOrderPage() {
  const { recentOrder } = useCart();

  const [input, setInput] = useState("");
  const [searched, setSearched] = useState<string | null>(null);
  const [found, setFound] = useState<OrderDetails | null>(null);
  const [lookupError, setLookupError] = useState(false);
  const [checking, setChecking] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  const [actionError, setActionError] = useState("");
  const [receivedPhone, setReceivedPhone] = useState("");
  const [confirming, setConfirming] = useState(false);

  const lookup = useCallback(
    async (raw: string) => {
      const id = raw.trim();
      setSearched(id);
      setLookupError(false);
      setFound(null);
      if (!id) return;
      setChecking(true);
      try {
        let saved = await api.orders.track(id);
        // Paid on the phone but the page never updated? Ask Paystack, then show the truth.
        if (saved && !saved.paid && saved.status === "pending_payment" && saved.paymentMethod !== "cash") {
          if ((await api.payments.verify(id)).state === "paid") saved = (await api.orders.track(id)) ?? saved;
        }
        if (saved) setFound(saved);
      } catch {
        setLookupError(true);
      } finally {
        setChecking(false);
      }
    },
    []
  );

  // Read ?id= from the address; otherwise show the order just placed
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || recentOrder?.id || "";
    if (id) {
      setInput(id);
      // Coming back from the payment page: confirm the payment first, then show the order
      if (params.get("paid")) {
        setChecking(true);
        void api.payments.verify(id).finally(() => lookup(id));
      } else {
        void lookup(id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const order: OrderDetails | null = found;

  const stepIndex = order ? Math.max(0, STEPS.findIndex((s) => s.key === order.status)) : -1;

  const cancelled = order?.status === "cancelled";

  const confirmReceived = async () => {
    if (!order || confirming) return;
    setConfirming(true);
    setActionError("");
    try {
      setFound(await api.orders.received(order.id, receivedPhone));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "We could not update this order.");
    } finally {
      setConfirming(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await lookup(input);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
            src="/images/backgrounds/products-bg.jpg"
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
          </header>

          <section ref={resultsRef} className="section-container w-full flex-1 scroll-mt-24 py-8 sm:py-10">
            {checking ? (
              <div className="mx-auto max-w-xl rounded-3xl border border-white/70 bg-white p-6 shadow-[0_18px_40px_rgba(0,0,0,0.3)]">
                <PageLoader label="Looking up your order…" className="py-6" />
              </div>
            ) : order ? (
              <>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Status */}
                <div className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_18px_40px_rgba(0,0,0,0.3)] sm:p-7 lg:col-span-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-brand-gold">
                        Order ID
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
                    <span className="flex flex-wrap items-center gap-2">
                      {order.paid && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">Paid</span>
                      )}
                      <span
                        className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
                          cancelled ? "bg-red-100 text-red-800" : "bg-brand-forest text-brand-gold"
                        }`}
                      >
                        {cancelled ? "Cancelled" : STEPS[stepIndex].label}
                      </span>
                    </span>
                  </div>

                  {cancelled && (
                    <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-900">
                      This order was cancelled. If you think this is a mistake, message us and we will help.
                    </p>
                  )}

                  {order.status === "pending_payment" && !order.paid && (
                    <PaymentActions order={order} onChange={setFound} />
                  )}

                  {/* Timeline */}
                  <ol className={`mt-7 flex-col gap-6 md:flex-row md:gap-0 ${cancelled ? "hidden" : "flex"}`}>
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

                  {!cancelled && order.fulfillment === "pickup" && (
                    <div className="mt-6 rounded-2xl border border-brand-gold/40 bg-brand-gold/10 p-4 text-sm text-black">
                      <p className="font-bold">Pickup order</p>
                      <p className="mt-0.5 text-black/70">
                        {order.status === "delivered" ? "Collected. Thank you!" : "We will tell you when it is ready to collect."}
                      </p>
                    </div>
                  )}

                  {!cancelled && order.delivery && (order.delivery.provider || order.delivery.contact || order.delivery.eta || order.delivery.note) && (
                    <div className="mt-6 rounded-2xl border border-brand-gold/40 bg-brand-gold/10 p-4 text-sm text-black">
                      <p className="font-bold">{DELIVERY_LABEL[order.delivery.method] ?? "Delivery"}</p>
                      <dl className="mt-2 space-y-1">
                        {order.delivery.provider && (
                          <div className="flex gap-2"><dt className="text-black/50">Who:</dt><dd className="font-semibold">{order.delivery.provider}</dd></div>
                        )}
                        {order.delivery.contact && (
                          <div className="flex gap-2">
                            <dt className="text-black/50">Contact:</dt>
                            <dd className="font-semibold">
                              {/^[+\d][\d\s()+-]{6,}$/.test(order.delivery.contact) ? (
                                <a href={`tel:${order.delivery.contact.replace(/[^\d+]/g, "")}`} className="underline">{order.delivery.contact}</a>
                              ) : (
                                order.delivery.contact
                              )}
                            </dd>
                          </div>
                        )}
                        {order.delivery.eta && (
                          <div className="flex gap-2"><dt className="text-black/50">Expected:</dt><dd className="font-semibold">{order.delivery.eta}</dd></div>
                        )}
                        {order.delivery.note && <p className="pt-1 text-black/70">{order.delivery.note}</p>}
                      </dl>
                    </div>
                  )}

                  {!cancelled && order.status !== "delivered" && (
                    <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4">
                      <DeliveryContact orderId={order.id} />
                    </div>
                  )}

                  {order.status === "out_for_delivery" && (
                    <div className="mt-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
                      <p className="text-sm font-bold text-emerald-900">Did your order arrive?</p>
                      <p className="mt-0.5 text-xs text-emerald-900/70">Enter the phone number you ordered with to confirm.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <input
                          type="tel"
                          value={receivedPhone}
                          onChange={(e) => setReceivedPhone(e.target.value)}
                          placeholder="e.g. 0244 000 000"
                          aria-label="Phone number used for this order"
                          className="min-w-0 flex-1 rounded-full border border-black/15 bg-white px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-emerald-300/60"
                        />
                        <button
                          type="button"
                          onClick={confirmReceived}
                          disabled={confirming || !receivedPhone.trim()}
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {confirming && <Spinner />}
                          {confirming ? "Saving…" : "I've received my order"}
                        </button>
                      </div>
                      {actionError && <p className="mt-3 text-sm font-medium text-red-700">{actionError}</p>}
                    </div>
                  )}

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
                <Image src="/icons/track/track-parcel.svg" alt="" width={80} height={80} className="mx-auto h-20 w-20" />
                <h2 className="mt-4 text-lg font-extrabold text-black">
                  {!searched ? "Enter your order ID" : lookupError ? "We couldn't check right now" : `No order found for “${searched}”`}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-black/60">
                  {!searched
                    ? "Your order ID is in your confirmation, and starts with GBH-."
                    : lookupError
                    ? "Something went wrong reaching our system. Please try again in a moment, or message us and we'll look it up."
                    : "Check the ID and try again. If you've just ordered, it can take a moment to appear — or message us and we'll look it up."}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <a
                    href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hello GBHPL, I'd like an update on my order.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white py-1.5 pl-1.5 pr-5 text-sm font-bold text-black transition-all hover:-translate-y-0.5 hover:border-brand-gold"
                  >
                    <Image src="/icons/contact/whatsapp.svg" alt="" width={32} height={32} className="h-8 w-8" />
                    WhatsApp us
                  </a>
                  <a
                    href="mailto:hello@gbhpl.com?subject=Order%20update"
                    className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white py-1.5 pl-1.5 pr-5 text-sm font-bold text-black transition-all hover:-translate-y-0.5 hover:border-brand-gold"
                  >
                    <Image src="/icons/contact/contact-email.svg" alt="" width={32} height={32} className="h-8 w-8" />
                    Email us
                  </a>
                </div>
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
