"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { X, CheckCircle, Copy, Check } from "@/components/ui/icons";
import { useCart } from "@/context/cart-context";
import { api } from "@/lib/api";
import { useOrders } from "@/context/orders-context";
import { formatGHS } from "@/lib/utils";
import { DELIVERY_FEE } from "@/data/pricing";
import type { OrderDetails } from "@/types/store";

const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Central",
  "Western",
  "Eastern",
  "Northern",
  "Upper East",
  "Upper West",
  "Volta",
  "Oti",
  "Bono",
  "Bono East",
  "Ahafo",
  "Savannah",
  "North East",
  "Western North",
];

const PAYMENT_METHODS = [
  { value: "momo_mtn", label: "MTN Mobile Money", icon: "/icons/payment/pay-mtn.svg", logo: "/icons/logos/mtn.png" },
  { value: "momo_telecel", label: "Telecel Cash", icon: "/icons/payment/pay-telecel.svg", logo: "/icons/logos/telecel.png" },
  { value: "momo_at", label: "AirtelTigo Money", icon: "/icons/payment/pay-airteltigo.svg", logo: "/icons/logos/airteltigo.png" },
  { value: "cash", label: "Cash on Delivery", icon: "/icons/payment/pay-cash.svg", logo: "/icons/logos/cash.png" },
];


type Step = "form" | "review" | "success";

export function CheckoutDialog() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    items,
    subtotal,
    clearCart,
    setRecentOrder,
    recentOrder,
  } = useCart();
  const { addOrder, track } = useOrders();

  // Count each time a customer reaches checkout
  useEffect(() => {
    if (isCheckoutOpen) track("checkout");
  }, [isCheckoutOpen, track]);
  const router = useRouter();

  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    region: "",
    deliveryAddress: "",
    paymentMethod: "momo_mtn",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = subtotal + DELIVERY_FEE;

  // No restrictions: any (even empty) entry is accepted.
  const validate = () => true;

  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [copied, setCopied] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [payFailed, setPayFailed] = useState(false);

  const copyOrderId = async () => {
    if (!recentOrder) return;
    try {
      await navigator.clipboard.writeText(recentOrder.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the number is selectable on screen */
    }
  };

  const handleSubmitOrder = async () => {
    if (placing) return;
    setPlacing(true);
    setPlaceError("");
    let leaving = false;
    try {
      // The server issues the real order ID and timestamp
      const saved = await addOrder({
        customerName: form.customerName,
        phone: form.phone,
        email: form.email,
        region: form.region,
        deliveryAddress: form.deliveryAddress,
        paymentMethod: form.paymentMethod as OrderDetails["paymentMethod"],
        items: [...items],
        subtotal,
        deliveryFee: DELIVERY_FEE,
        total,
        status: "pending_payment",
      });
      setRecentOrder(saved);
      clearCart();

      // Mobile money: hand over to the payment page. If online payment is off
      // (or fails), the order is still saved and the customer sees it below.
      if (saved.paymentMethod !== "cash") {
        try {
          const payUrl = await api.payments.start(saved.id);
          if (payUrl) {
            // Keep the spinner up while the browser leaves for the payment page
            leaving = true;
            setRedirecting(true);
            window.location.href = payUrl;
            return;
          }
        } catch {
          setPayFailed(true);
        }
      }
      setStep("success");
    } catch (e) {
      const status = (e as { status?: number }).status;
      setPlaceError(
        status && status < 500
          ? (e as Error).message
          : "We couldn't place your order. Please check your connection and try again."
      );
    } finally {
      if (!leaving) setPlacing(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep("form");
    setErrors({});
    setPlaceError("");
  };

  const handleTrack = () => {
    handleClose();
    router.push(recentOrder ? `/track?id=${encodeURIComponent(recentOrder.id)}` : "/track");
  };

  const field = (
    key: keyof typeof form,
    label: string,
    type = "text",
    placeholder = ""
  ) => (
    <div className="space-y-1.5">
      <label htmlFor={key} className="block text-sm font-semibold text-brand-forest">
        {label}
      </label>
      <input
        id={key}
        type={type}
        value={form[key]}
        onChange={(e) => {
          setForm((p) => ({ ...p, [key]: e.target.value }));
          if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
        }}
        placeholder={placeholder}
        className={`form-input ${errors[key] ? "border-red-400 focus:ring-red-400" : ""}`}
      />
      {errors[key] && (
        <p className="text-xs text-red-500">{errors[key]}</p>
      )}
    </div>
  );

  if (!isCheckoutOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 drawer-overlay"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50
          max-w-lg mx-auto bg-white rounded-2xl shadow-2xl
          flex flex-col max-h-[90vh] overflow-hidden
          animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-bold text-brand-forest">
              {step === "form" && "Your Details"}
              {step === "review" && "Review Order"}
              {step === "success" && "Order Placed!"}
            </h2>
            {step !== "success" && (
              <p className="text-xs text-brand-forest/50 mt-0.5">
                Step {step === "form" ? "1" : "2"} of 2
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            aria-label="Close checkout"
            className="p-2 rounded-lg text-brand-forest/40 hover:text-brand-forest hover:bg-brand-mist transition-colors focus-ring"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* ── Step 1: Form ── */}
          {step === "form" && (
            <form noValidate className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (validate()) setStep("review"); }}>
              {field("customerName", "Full Name", "text", "e.g. Ama Mensah")}
              {field("phone", "Phone Number", "tel", "e.g. 0244 000 000")}
              {field("email", "Email (optional, for your receipt)", "email", "you@example.com")}

              <div className="space-y-1.5">
                <label htmlFor="region" className="block text-sm font-semibold text-brand-forest">
                  Region
                </label>
                <select
                  id="region"
                  value={form.region}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, region: e.target.value }));
                    if (errors.region) setErrors((p) => ({ ...p, region: "" }));
                  }}
                  className={`form-input ${errors.region ? "border-red-400" : ""}`}
                >
                  <option value="">Select region…</option>
                  {GHANA_REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {errors.region && <p className="text-xs text-red-500">{errors.region}</p>}
              </div>

              {field("deliveryAddress", "Delivery Address", "text", "Street, area, landmark…")}

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-brand-forest">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <label
                      key={pm.value}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-colors text-xs sm:text-sm font-medium
                        ${form.paymentMethod === pm.value
                          ? "border-brand-forest bg-brand-forest/5 text-brand-forest"
                          : "border-border text-brand-forest/60 hover:border-brand-forest/40"
                        }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm.value}
                        checked={form.paymentMethod === pm.value}
                        onChange={() => setForm((p) => ({ ...p, paymentMethod: pm.value }))}
                        className="sr-only"
                      />
                      <img
                        src={pm.logo}
                        alt=""
                        className="w-9 h-9 flex-shrink-0 rounded-lg object-contain"
                        onError={(e) => {
                          if (e.currentTarget.dataset.fallback) return;
                          e.currentTarget.dataset.fallback = "1";
                          e.currentTarget.src = pm.icon;
                        }}
                      />
                      <span className="flex-1 leading-tight">{pm.label}</span>
                      <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors
                        ${form.paymentMethod === pm.value
                          ? "border-brand-forest bg-brand-forest"
                          : "border-current"}`}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="notes" className="block text-sm font-semibold text-brand-forest">
                  Notes <span className="font-normal text-brand-forest/40">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  placeholder="Any special delivery instructions…"
                  className="form-input resize-none"
                />
              </div>

              <button type="submit" className="btn-gold w-full justify-center mt-2">
                Review Order
              </button>
            </form>
          )}

          {/* ── Step 2: Review ── */}
          {step === "review" && (
            <div className="space-y-5">
              {/* Order items */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-forest/50">
                  Items
                </h3>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-brand-forest">
                      {item.name} ({item.size}) × {item.quantity}
                    </span>
                    <span className="font-semibold text-brand-forest">
                      {formatGHS(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-brand-forest/70">
                  <span>Subtotal</span><span>{formatGHS(subtotal)}</span>
                </div>
                <div className="flex justify-between text-brand-forest/70">
                  <span>Delivery</span><span>{formatGHS(DELIVERY_FEE)}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-brand-forest border-t border-border pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-brand-gold">{formatGHS(total)}</span>
                </div>
              </div>

              {/* Delivery details */}
              <div className="bg-brand-mist rounded-xl p-4 space-y-2 text-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-forest/50 mb-3">
                  Delivery Details
                </h3>
                <p><span className="text-brand-forest/50">Name:</span> <span className="font-medium text-brand-forest">{form.customerName}</span></p>
                <p><span className="text-brand-forest/50">Phone:</span> <span className="font-medium text-brand-forest">{form.phone}</span></p>
                <p><span className="text-brand-forest/50">Region:</span> <span className="font-medium text-brand-forest">{form.region}</span></p>
                <p><span className="text-brand-forest/50">Address:</span> <span className="font-medium text-brand-forest">{form.deliveryAddress}</span></p>
                <p><span className="text-brand-forest/50">Payment:</span> <span className="font-medium text-brand-forest">{PAYMENT_METHODS.find(p => p.value === form.paymentMethod)?.label}</span></p>
              </div>

              {placeError && (
                <p role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                  {placeError}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep("form")}
                  disabled={placing}
                  className="btn-forest-outline flex-1 justify-center text-sm py-2.5 disabled:opacity-50"
                >
                  Edit
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={placing}
                  aria-busy={placing}
                  className="btn-gold flex-1 justify-center gap-2 text-sm py-2.5 disabled:cursor-wait disabled:opacity-80"
                >
                  {placing && <Spinner />}
                  {redirecting ? "Opening payment…" : placing ? "Placing order…" : "Confirm Order"}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Success ── */}
          {step === "success" && (
            <div className="flex flex-col items-center text-center gap-5 py-6">
              <div className="w-16 h-16 rounded-full bg-brand-forest/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-brand-forest" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-brand-forest">Thank you!</h3>
                <p className="text-brand-forest/60 text-sm mt-1.5 leading-relaxed">
                  Your order has been received. We&apos;ll contact you on{" "}
                  <span className="font-semibold text-brand-forest">{form.phone}</span>{" "}
                  to confirm and arrange payment.
                </p>
                {payFailed && (
                  <p className="mt-2 text-xs font-semibold text-amber-700">
                    We couldn&apos;t open the online payment page. You can pay from the Track Order page.
                  </p>
                )}
              </div>
              {recentOrder && (
                <div className="w-full rounded-2xl border border-dashed border-brand-gold bg-brand-gold/10 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-brand-forest/60">Your order number</p>
                  <p className="mt-1 select-all font-mono text-xl font-extrabold tracking-wider text-brand-forest">
                    {recentOrder.id}
                  </p>
                  <button
                    type="button"
                    onClick={copyOrderId}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-brand-forest/20 px-3 py-1 text-xs font-bold text-brand-forest transition-colors hover:border-brand-gold focus-ring"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <p className="mt-2 text-xs text-brand-forest/60">Keep it. You need it to track your order.</p>
                </div>
              )}
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleTrack}
                  className="btn-forest-outline flex-1 justify-center gap-2 text-sm"
                >
                  <Image src="/icons/track/track-delivery.svg" alt="" width={28} height={28} className="h-7 w-7" /> Track Order
                </button>
                <button
                  onClick={handleClose}
                  className="btn-gold flex-1 justify-center text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
