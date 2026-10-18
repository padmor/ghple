"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppleLoader } from "@/components/ui/apple-loader";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";
import { formatGHS } from "@/lib/utils";
import type { OrderDetails } from "@/types/store";

type Phase = "idle" | "starting" | "approve" | "otp" | "failed";

/**
 * What a customer can do about an unpaid order, shown only when it makes sense:
 * - never started paying  -> "Pay now" (and cancel)
 * - waiting on the phone  -> "Check payment" (and, once there is a problem, pay again or cancel)
 * Paid and later-stage orders show nothing here.
 */
export function PaymentActions({ order, onChange }: { order: OrderDetails; onChange: (o: OrderDetails) => void }) {
  const momo = order.paymentMethod !== "cash";
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [phone, setPhone] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const started = useRef(Date.now());

  const refresh = useCallback(async () => {
    const fresh = await api.orders.track(order.id).catch(() => null);
    if (fresh) onChange(fresh);
  }, [order.id, onChange]);

  const check = useCallback(
    async (manual: boolean) => {
      const { state, message: why } = await api.payments.verify(order.id);
      if (state === "paid") {
        await refresh();
        return true;
      }
      if (state === "failed") {
        setMessage(why ?? "The payment was not completed.");
        setPhase("failed");
        setProblem(true);
      } else if (manual) {
        setMessage("We have not received your payment yet. Please approve the prompt on your phone, then check again.");
        setProblem(true);
      }
      return false;
    },
    [order.id, refresh]
  );

  // While a prompt is on the customer's phone, look every few seconds
  useEffect(() => {
    if (phase !== "approve") return;
    started.current = Date.now();
    const timer = setInterval(async () => {
      if (await check(false)) return;
      if (Date.now() - started.current > 3 * 60_000) {
        setMessage("We did not receive your approval in time.");
        setPhase("failed");
        setProblem(true);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [phase, check]);

  const pay = async (code?: string) => {
    setBusy(true);
    setMessage("");
    if (!code) setPhase("starting");
    try {
      const r = await api.payments.charge(order.id, code);
      if (!r) {
        setMessage("Online payment is not available right now. We will contact you to arrange payment.");
        setPhase("failed");
        setProblem(true);
      } else if (r.next === "paid") {
        await refresh();
      } else {
        setMessage(r.message ?? "");
        setPhase(r.next === "failed" ? "failed" : r.next);
        if (r.next === "failed") setProblem(true);
      }
    } catch {
      setMessage("We could not reach the payment service. Please check your connection and try again.");
      setPhase("failed");
      setProblem(true);
    } finally {
      setBusy(false);
      setOtp("");
    }
  };

  const cancel = async () => {
    setCancelling(true);
    setCancelError("");
    try {
      onChange(await api.orders.cancel(order.id, phone));
    } catch (e) {
      setCancelError(e instanceof Error ? e.message : "We could not cancel this order.");
    } finally {
      setCancelling(false);
    }
  };

  const waiting = phase === "approve" || phase === "starting";
  const hadAttempt = !!order.paymentStarted;
  // Cancel is offered when nothing was paid and either nothing was tried or something went wrong
  const canCancelNow = !hadAttempt || problem || phase === "failed";

  return (
    <div className="mt-6 space-y-3 rounded-2xl border border-black/10 bg-[#fbf8ee] p-4">
      {/* ── Mobile money orders ── */}
      {momo && phase === "idle" && !hadAttempt && (
        <div>
          <p className="text-sm font-bold text-black">Complete your payment</p>
          <p className="mt-0.5 text-xs text-black/60">Your order is saved. Pay with mobile money to confirm it.</p>
          <button type="button" onClick={() => pay()} disabled={busy} className="btn-gold mt-3 gap-2 px-5 py-2.5 text-sm font-bold disabled:opacity-80">
            Pay {formatGHS(order.total)} now
          </button>
        </div>
      )}

      {momo && phase === "idle" && hadAttempt && (
        <div>
          <p className="text-sm font-bold text-black">Waiting for your payment</p>
          <p className="mt-0.5 text-xs text-black/60">
            Already approved it on your phone? Tap below and we will check. If it is not paid yet, you can try again.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                setBusy(true);
                await check(true);
                setBusy(false);
              }}
              disabled={busy}
              className="btn-gold gap-2 px-5 py-2.5 text-sm font-bold disabled:opacity-80"
            >
              {busy && <Spinner />}
              {busy ? "Checking…" : "I've paid. Check now"}
            </button>
            {problem && (
              <button type="button" onClick={() => pay()} className="rounded-full border border-black/15 bg-white px-5 py-2.5 text-sm font-bold text-black hover:border-brand-gold">
                Pay again
              </button>
            )}
          </div>
          {message && <p className="mt-3 text-xs font-medium text-amber-800">{message}</p>}
        </div>
      )}

      {waiting && (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <AppleLoader className="h-14 w-14 text-brand-forest" />
          <p className="text-sm font-bold text-black">{phase === "starting" ? "Sending the payment prompt…" : "Check your phone"}</p>
          {phase === "approve" && (
            <>
              <p className="text-xs leading-relaxed text-black/60">
                {message || `Approve the ${formatGHS(order.total)} prompt by entering your MoMo PIN.`} This updates by itself.
              </p>
              <button
                type="button"
                onClick={async () => {
                  setBusy(true);
                  await check(true);
                  setBusy(false);
                }}
                disabled={busy}
                className="btn-gold gap-2 px-5 py-2 text-sm font-bold disabled:opacity-80"
              >
                {busy && <Spinner />}
                {busy ? "Checking…" : "I've approved. Check now"}
              </button>
              {message.startsWith("We have not received") && <p className="text-xs text-amber-800">{message}</p>}
            </>
          )}
        </div>
      )}

      {phase === "otp" && (
        <div className="space-y-2">
          <p className="text-sm font-bold text-black">Enter your code</p>
          <p className="text-xs text-black/60">{message || "Enter the code sent to your phone."}</p>
          <div className="flex gap-2">
            <input
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Code"
              aria-label="One-time code"
              className="min-w-0 flex-1 rounded-full border border-black/15 bg-white px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-brand-gold/40"
            />
            <button type="button" onClick={() => pay(otp)} disabled={busy || !otp.trim()} className="btn-gold gap-2 px-5 py-2.5 text-sm font-bold disabled:opacity-60">
              {busy && <Spinner />}
              Confirm
            </button>
          </div>
        </div>
      )}

      {phase === "failed" && (
        <div className="space-y-2">
          <p className="text-sm font-bold text-black">Payment not completed</p>
          <p className="text-xs text-black/65">{message || "Something went wrong."}</p>
          <button type="button" onClick={() => pay()} disabled={busy} className="btn-gold gap-2 px-5 py-2.5 text-sm font-bold disabled:opacity-80">
            Send the prompt again
          </button>
        </div>
      )}

      {/* ── Cancel: only when nothing was paid and nothing is in progress ── */}
      {canCancelNow && !waiting && phase !== "otp" && (
        <div className={momo ? "border-t border-black/10 pt-3" : ""}>
          {!showCancel ? (
            <button type="button" onClick={() => setShowCancel(true)} className="text-xs font-bold text-black/55 underline underline-offset-4 hover:text-red-700">
              {momo ? "Not paying? Cancel this order" : "Cancel this order"}
            </button>
          ) : (
            <div className="space-y-2">
              <label htmlFor="cancel-phone" className="block text-xs font-semibold text-black/70">
                Enter the phone number you ordered with to confirm
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  id="cancel-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0244 000 000"
                  className="min-w-0 flex-1 rounded-full border border-black/15 bg-white px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-brand-gold/40"
                />
                <button
                  type="button"
                  onClick={cancel}
                  disabled={cancelling || !phone.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cancelling && <Spinner />}
                  {cancelling ? "Cancelling…" : "Yes, cancel it"}
                </button>
              </div>
              {cancelError && <p className="text-xs font-medium text-red-700">{cancelError}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
