"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AddressInput } from "@/components/cart/address-input";
import { DeliveryContact } from "@/components/ui/delivery-contact";
import { Spinner } from "@/components/ui/spinner";
import { AppleLoader } from "@/components/ui/apple-loader";
import { X, CheckCircle, Copy, Check, ArrowRight } from "@/components/ui/icons";
import { useCart } from "@/context/cart-context";
import { api } from "@/lib/api";
import { useOrders } from "@/context/orders-context";
import { formatGHS } from "@/lib/utils";
import { useManager } from "@/context/manager-context";
import type { OrderDetails, OrderLocation } from "@/types/store";

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


type Step = "form" | "review" | "pay" | "success";

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
  const { settings } = useManager();
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

  const [location, setLocation] = useState<OrderLocation | null>(null);
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const fee = fulfillment === "pickup" ? 0 : settings.deliveryFee;
  const total = subtotal + fee;

  // No restrictions: any (even empty) entry is accepted.
  const validate = () => true;

  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [paid, setPaid] = useState(false);
  const [payNext, setPayNext] = useState<"approve" | "otp" | "failed">("approve");
  const [payMessage, setPayMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [payBusy, setPayBusy] = useState(false);

  // While the customer approves on their phone, check every few seconds
  useEffect(() => {
    if (step !== "pay" || payNext !== "approve" || !recentOrder) return;
    let stopped = false;
    const started = Date.now();
    const timer = setInterval(async () => {
      const { state, message } = await api.payments.verify(recentOrder.id);
      if (stopped) return;
      if (state === "paid") {
        setPaid(true);
        setStep("success");
      } else if (state === "failed") {
        setPayMessage(message ?? "The payment was not approved.");
        setPayNext("failed");
      } else if (Date.now() - started > 3 * 60_000) {
        setPayMessage("We have not received your approval yet.");
        setPayNext("failed");
      }
    }, 3000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [step, payNext, recentOrder]);

  const applyCharge = (r: { next: "approve" | "otp" | "paid" | "failed"; message?: string }) => {
    setPayMessage(r.message ?? "");
    if (r.next === "paid") {
      setPaid(true);
      setStep("success");
    } else {
      setPayNext(r.next);
    }
  };

  /** Send the prompt again, or submit the one-time code the customer received. */
  const startMomo = async (code?: string) => {
    if (!recentOrder) return;
    setPayBusy(true);
    try {
      const r = await api.payments.charge(recentOrder.id, code);
      if (r) applyCharge(r);
      else setPayMessage("Online payment is unavailable right now.");
    } catch {
      setPayMessage("We could not reach the payment service.");
      setPayNext("failed");
    } finally {
      setPayBusy(false);
      setOtp("");
    }
  };

  const payByCard = async () => {
    if (!recentOrder) return;
    setPayBusy(true);
    try {
      const url = await api.payments.start(recentOrder.id);
      if (url) {
        window.location.href = url;
        return;
      }
    } catch {
      /* fall through */
    }
    setPayBusy(false);
    setPayMessage("Online payment is unavailable right now. Please pay on delivery or contact us.");
  };

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
        fulfillment,
        location: fulfillment === "delivery" && location ? location : undefined,
        deliveryFee: fee,
        total,
        status: "pending_payment",
      });
      setRecentOrder(saved);
      clearCart();

      // Mobile money: send an approval prompt to the customer's phone and wait here.
      // If online payment is off or fails to start, the order is still saved.
      if (saved.paymentMethod !== "cash") {
        setPayNext("approve");
        setPayMessage("");
        try {
          const r = await api.payments.charge(saved.id);
          if (r) {
            applyCharge(r);
            if (r.next !== "paid") setStep("pay");
            return;
          }
        } catch {
          setPayMessage("We could not reach the payment service.");
          setPayNext("failed");
          setStep("pay");
          return;
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
      setPlacing(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep("form");
    setPaid(false);
    setPayNext("approve");
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
    <div className="space-y-1">
      <label htmlFor={key} className="block text-xs font-semibold text-brand-forest/80">
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

  const stepNo = step === "form" ? 0 : step === "review" ? 1 : 2;
  const progress = ["Details", "Review", "Pay"];
  const title =
    step === "form" ? "Checkout" : step === "review" ? "Review & pay" : step === "pay" ? "Pay with Mobile Money" : paid ? "Payment received" : "Order placed";
  const placeLabel = form.paymentMethod === "cash" ? "Place order" : "Confirm & pay";

  const SHORT_LABEL: Record<string, string> = {
    momo_mtn: "MTN MoMo",
    momo_telecel: "Telecel Cash",
    momo_at: "AirtelTigo",
    cash: "Pay on delivery",
  };
  const method = PAYMENT_METHODS.find((p) => p.value === form.paymentMethod);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 drawer-overlay" onClick={handleClose} aria-hidden="true" />

      {/* Bottom sheet on phones, centred card on larger screens */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
        className="sheet-in font-sans fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-[#FBFAF5] text-brand-forest shadow-[0_-20px_60px_rgba(15,35,22,0.35)]
          sm:inset-x-4 sm:bottom-auto sm:top-1/2 sm:max-h-[88vh] sm:max-w-[30rem] sm:-translate-y-1/2 sm:rounded-[28px] sm:shadow-[0_30px_80px_rgba(15,35,22,0.45)] sm:animate-scale-in"
      >
        {/* Header */}
        <div className="flex-shrink-0 px-5 pb-3 pt-3 sm:px-6 sm:pt-5">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-brand-forest/15 sm:hidden" aria-hidden="true" />
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
            <button
              onClick={handleClose}
              aria-label="Close checkout"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-forest/5 text-brand-forest/60 transition-colors hover:bg-brand-forest/10 hover:text-brand-forest focus-ring"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {step !== "success" && (
            <ol className="mt-4 flex items-center" aria-label="Checkout progress">
              {progress.map((label, i) => {
                const done = i < stepNo;
                const now = i === stepNo;
                return (
                  <li key={label} className="flex flex-1 items-center last:flex-none">
                    <span className="flex items-center gap-2">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold transition-colors ${
                          done
                            ? "bg-brand-forest text-brand-gold"
                            : now
                            ? "bg-brand-gold text-brand-forest ring-4 ring-brand-gold/25"
                            : "bg-brand-forest/10 text-brand-forest/40"
                        }`}
                      >
                        {done ? <Check className="h-3 w-3" /> : i + 1}
                      </span>
                      <span className={`text-xs font-bold ${now ? "text-brand-forest" : "text-brand-forest/40"}`}>{label}</span>
                    </span>
                    {i < progress.length - 1 && (
                      <span className={`mx-3 h-px flex-1 ${done ? "bg-brand-forest/40" : "bg-brand-forest/10"}`} aria-hidden="true" />
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4 pt-2 sm:px-6">
          {/* ── Step 1: Details ── */}
          {step === "form" && (
            <form
              id="checkout-form"
              noValidate
              className="space-y-4 [&_.form-input]:rounded-xl [&_.form-input]:border-brand-forest/10 [&_.form-input]:bg-white [&_.form-input]:py-3 [&_.form-input]:shadow-[0_1px_2px_rgba(15,35,22,0.04)]"
              onSubmit={(e) => {
                e.preventDefault();
                if (validate()) setStep("review");
              }}
            >
              {/* Delivery or pickup: segmented control */}
              <div className="grid grid-cols-2 gap-1 rounded-2xl bg-brand-forest/[0.06] p-1" role="radiogroup" aria-label="How do you want to get your order?">
                {([
                  ["delivery", "Deliver to me", settings.deliveryFee === 0 ? "Free delivery" : `${formatGHS(settings.deliveryFee)} delivery`],
                  ["pickup", "I'll pick it up", "Free, from our shop"],
                ] as const).map(([value, name, hint]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={fulfillment === value}
                    onClick={() => setFulfillment(value)}
                    className={`rounded-xl px-3 py-2 text-left transition-all focus-ring ${
                      fulfillment === value ? "bg-white shadow-[0_2px_8px_rgba(15,35,22,0.12)]" : "text-brand-forest/55 hover:text-brand-forest"
                    }`}
                  >
                    <span className="block text-sm font-bold leading-tight">{name}</span>
                    <span className={`block text-[11px] ${fulfillment === value ? "text-amber-700" : ""}`}>{hint}</span>
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {field("customerName", "Full name", "text", "e.g. Ama Mensah")}
                {field("phone", "Phone number", "tel", "e.g. 0244 000 000")}
              </div>
              {field("email", "Email (optional, for your receipt)", "email", "you@example.com")}

              {fulfillment === "delivery" ? (
                <>
                  <div className="space-y-1">
                    <label htmlFor="region" className="block text-xs font-semibold text-brand-forest/80">
                      Region
                    </label>
                    <select
                      id="region"
                      value={form.region}
                      onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
                      className="form-input"
                    >
                      <option value="">Select region…</option>
                      {GHANA_REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <AddressInput
                    place={form.deliveryAddress}
                    onPlace={(text) => setForm((p) => ({ ...p, deliveryAddress: text }))}
                    location={location}
                    onLocation={setLocation}
                  />
                </>
              ) : (
                <p className="rounded-2xl bg-brand-forest/[0.06] px-4 py-3 text-xs leading-relaxed text-brand-forest/70">
                  We will tell you when your order is ready to collect.
                </p>
              )}

              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold text-brand-forest/80">Pay with</legend>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((pm) => {
                    const on = form.paymentMethod === pm.value;
                    return (
                      <label
                        key={pm.value}
                        className={`relative flex cursor-pointer items-center gap-2.5 rounded-2xl border bg-white p-2.5 text-xs font-bold transition-all ${
                          on
                            ? "border-brand-forest shadow-[0_0_0_3px_rgba(26,51,32,0.1)]"
                            : "border-brand-forest/10 text-brand-forest/70 hover:border-brand-forest/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={pm.value}
                          checked={on}
                          onChange={() => setForm((p) => ({ ...p, paymentMethod: pm.value }))}
                          className="sr-only"
                        />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pm.logo}
                          alt=""
                          className="h-8 w-8 flex-shrink-0 rounded-lg object-contain"
                          onError={(e) => {
                            if (e.currentTarget.dataset.fallback) return;
                            e.currentTarget.dataset.fallback = "1";
                            e.currentTarget.src = pm.icon;
                          }}
                        />
                        <span className="flex-1 leading-tight">{SHORT_LABEL[pm.value]}</span>
                        {on && (
                          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-forest text-brand-gold">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {showNotes ? (
                <div className="space-y-1">
                  <label htmlFor="notes" className="block text-xs font-semibold text-brand-forest/80">
                    Note for delivery
                  </label>
                  <textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    rows={2}
                    placeholder="Gate colour, landmark, best time to call…"
                    className="form-input resize-none"
                  />
                </div>
              ) : (
                <button type="button" onClick={() => setShowNotes(true)} className="text-xs font-bold text-brand-forest/60 underline decoration-brand-forest/20 underline-offset-4">
                  + Add a note for delivery
                </button>
              )}
            </form>
          )}

          {/* ── Step 2: Review ── */}
          {step === "review" && (
            <div className="space-y-3.5">
              {/* The one dark card: what you are about to pay */}
              <div
                className="relative overflow-hidden rounded-3xl bg-brand-forest p-5 text-white"
                style={{ backgroundImage: "radial-gradient(120% 120% at 100% 0%, rgba(212,160,23,0.38), transparent 55%)" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Amount to pay</p>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <p className="text-4xl font-black leading-none tracking-tight text-brand-gold">{formatGHS(total)}</p>
                  <div className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 text-xs font-bold backdrop-blur">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={method?.icon} alt="" className="h-6 w-6 rounded-full object-contain" />
                    {SHORT_LABEL[form.paymentMethod]}
                  </div>
                </div>
              </div>

              <ul className="divide-y divide-brand-forest/[0.07] rounded-2xl border border-brand-forest/10 bg-white text-sm">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="min-w-0">
                      <span className="block truncate font-bold">{item.size}</span>
                      <span className="block text-xs text-brand-forest/55">
                        {item.quantity} × {formatGHS(item.price)}
                      </span>
                    </span>
                    <span className="font-extrabold">{formatGHS(item.price * item.quantity)}</span>
                  </li>
                ))}
                <li className="flex justify-between px-4 py-2.5 text-xs text-brand-forest/60">
                  <span>{fulfillment === "pickup" ? "Pickup" : "Delivery"}</span>
                  <span className="font-bold">{fee === 0 ? "Free" : formatGHS(fee)}</span>
                </li>
              </ul>

              <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 rounded-2xl border border-brand-forest/10 bg-white p-4 text-sm">
                <dt className="text-brand-forest/50">Name</dt>
                <dd className="font-semibold">{form.customerName || "—"}</dd>
                <dt className="text-brand-forest/50">Phone</dt>
                <dd className="font-semibold">{form.phone || "—"}</dd>
                <dt className="text-brand-forest/50">{fulfillment === "pickup" ? "Pickup" : "Deliver to"}</dt>
                <dd className="font-semibold">
                  {fulfillment === "pickup"
                    ? "Collect from our shop"
                    : [form.deliveryAddress, location?.label, form.region].filter(Boolean).join(", ") || "—"}
                </dd>
              </dl>

              <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-brand-forest/50">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                Secure payment by Paystack. Your PIN is only entered on your phone.
              </p>

              {placeError && (
                <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                  {placeError}
                </p>
              )}
            </div>
          )}

          {/* ── Pay on the phone ── */}
          {step === "pay" && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              {payNext === "approve" && (
                <>
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-[0_8px_30px_rgba(15,35,22,0.1)]">
                    <AppleLoader className="h-16 w-16 text-brand-forest" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold">Check your phone</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-brand-forest/60">
                      {payMessage || `Approve the ${formatGHS(total)} payment prompt sent to`}{" "}
                      <span className="font-bold text-brand-forest">{form.phone}</span> by entering your MoMo PIN.
                    </p>
                  </div>
                  <p className="rounded-full bg-brand-forest/[0.06] px-4 py-2 text-xs font-medium text-brand-forest/60">
                    This page updates by itself once you approve.
                  </p>
                  <p className="text-[11px] leading-relaxed text-brand-forest/45">
                    No prompt? On MTN, dial <span className="font-bold text-brand-forest/70">*170#</span>, then My Wallet, then My Approvals.
                  </p>
                </>
              )}

              {payNext === "otp" && (
                <div className="w-full space-y-3">
                  <h3 className="text-xl font-extrabold">Enter your code</h3>
                  <p className="text-sm text-brand-forest/60">{payMessage || "Enter the code that was sent to your phone."}</p>
                  <input
                    inputMode="numeric"
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Code"
                    aria-label="One-time code"
                    className="form-input rounded-xl bg-white text-center text-lg tracking-widest"
                  />
                  <button
                    onClick={() => startMomo(otp)}
                    disabled={payBusy || !otp.trim()}
                    className="btn-gold w-full justify-center gap-2 rounded-xl py-3 text-sm font-bold disabled:opacity-60"
                  >
                    {payBusy && <Spinner />}
                    {payBusy ? "Checking…" : "Confirm code"}
                  </button>
                </div>
              )}

              {payNext === "failed" && (
                <div className="w-full space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <X className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-extrabold">Payment not completed</h3>
                  <p className="text-sm text-brand-forest/60">
                    {payMessage || "Something went wrong."} Your order {recentOrder?.id} is saved, so nothing is lost.
                  </p>
                  <button
                    onClick={() => {
                      setPayNext("approve");
                      void startMomo();
                    }}
                    disabled={payBusy}
                    className="btn-gold w-full justify-center gap-2 rounded-xl py-3 text-sm font-bold disabled:opacity-60"
                  >
                    {payBusy && <Spinner />}
                    Send the prompt again
                  </button>
                  <button onClick={payByCard} disabled={payBusy} className="btn-forest-outline w-full justify-center rounded-xl text-sm disabled:opacity-60">
                    Pay by card or another way
                  </button>
                  <button onClick={() => setStep("success")} className="text-xs font-semibold text-brand-forest/60 underline underline-offset-4">
                    I&apos;ll pay later
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Done ── */}
          {step === "success" && (
            <div className="flex flex-col items-center gap-4 py-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 shadow-[0_8px_24px_rgba(16,185,129,0.25)]">
                <CheckCircle className="h-8 w-8 text-emerald-700" />
              </div>
              <p className="text-sm leading-relaxed text-brand-forest/65">
                {paid ? (
                  "Your payment went through and we are packing your order."
                ) : (
                  <>
                    We&apos;ll contact you on <span className="font-bold text-brand-forest">{form.phone}</span> to confirm and arrange payment.
                  </>
                )}
              </p>
              {recentOrder && (
                <div className="w-full rounded-2xl border border-dashed border-brand-gold bg-brand-gold/10 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-forest/55">Your order number</p>
                  <div className="mt-1 flex items-center justify-center gap-3">
                    <p className="select-all font-mono text-lg font-extrabold tracking-wider sm:text-xl">{recentOrder.id}</p>
                    <button
                      type="button"
                      onClick={copyOrderId}
                      aria-label="Copy order number"
                      className="inline-flex items-center gap-1 rounded-full border border-brand-forest/20 bg-white px-2.5 py-1 text-xs font-bold transition-colors hover:border-brand-gold focus-ring"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-brand-forest/60">Keep it. You need it to track your order.</p>
                </div>
              )}
              <div className="w-full rounded-2xl border border-brand-forest/10 bg-white p-4 text-left">
                <DeliveryContact orderId={recentOrder?.id} />
              </div>
            </div>
          )}
        </div>

        {/* Footer: always-visible total and main action */}
        {step === "form" && (
          <div className="flex flex-shrink-0 items-center gap-4 border-t border-black/5 bg-white/90 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,35,22,0.06)] backdrop-blur sm:px-6">
            <div className="leading-tight">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-forest/45">Total</p>
              <p className="text-xl font-black">{formatGHS(total)}</p>
            </div>
            <button type="submit" form="checkout-form" className="btn-gold flex-1 justify-center gap-2 rounded-2xl py-3.5 text-sm font-extrabold">
              Review order <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === "review" && (
          <div className="flex flex-shrink-0 items-center gap-3 border-t border-black/5 bg-white/90 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,35,22,0.06)] backdrop-blur sm:px-6">
            <button
              onClick={() => setStep("form")}
              disabled={placing}
              className="rounded-2xl border border-brand-forest/15 bg-white px-5 py-3.5 text-sm font-bold transition-colors hover:border-brand-forest/40 disabled:opacity-50"
            >
              Edit
            </button>
            <button
              onClick={handleSubmitOrder}
              disabled={placing}
              aria-busy={placing}
              className="btn-gold flex-1 justify-center gap-2 rounded-2xl py-3.5 text-sm font-extrabold disabled:cursor-wait disabled:opacity-80"
            >
              {placing && <Spinner />}
              {placing ? "Placing order…" : `${placeLabel} · ${formatGHS(total)}`}
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-shrink-0 gap-3 border-t border-black/5 bg-white/90 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:px-6">
            <button onClick={handleTrack} className="btn-forest-outline flex-1 justify-center gap-2 rounded-2xl text-sm">
              <Image src="/icons/track/track-delivery.svg" alt="" width={24} height={24} className="h-6 w-6" /> Track order
            </button>
            <button onClick={handleClose} className="btn-gold flex-1 justify-center rounded-2xl text-sm">
              Done
            </button>
          </div>
        )}
      </div>
    </>
  );
}
