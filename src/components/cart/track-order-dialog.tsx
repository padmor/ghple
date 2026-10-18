"use client";

import React from "react";
import { X, Package, CheckCircle, Truck, MapPin } from "@/components/ui/icons";
import { useCart } from "@/context/cart-context";
import { formatGHS } from "@/lib/utils";

const STATUS_STEPS = [
  { key: "pending_payment", label: "Order Received", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
] as const;

export function TrackOrderDialog() {
  const { isTrackOpen, setIsTrackOpen, recentOrder } = useCart();

  if (!isTrackOpen) return null;

  const currentStepIndex = recentOrder
    ? STATUS_STEPS.findIndex((s) => s.key === recentOrder.status)
    : 0;

  return (
    <>
      <div
        className="fixed inset-0 z-50 drawer-overlay"
        onClick={() => setIsTrackOpen(false)}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Track your order"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50
          max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-brand-forest">Track Order</h2>
          <button
            onClick={() => setIsTrackOpen(false)}
            aria-label="Close"
            className="p-2 rounded-lg text-brand-forest/40 hover:text-brand-forest hover:bg-brand-mist transition-colors focus-ring"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          {!recentOrder ? (
            <div className="text-center py-8">
              <Package className="w-10 h-10 text-brand-sage mx-auto mb-4" />
              <p className="font-semibold text-brand-forest">No recent order</p>
              <p className="text-sm text-brand-forest/50 mt-1">
                Place an order first to track it here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order ID */}
              <div className="bg-brand-mist rounded-xl p-4">
                <p className="text-xs text-brand-forest/50 uppercase tracking-wider mb-1">Order ID</p>
                <p className="font-bold text-brand-forest text-lg">{recentOrder.id}</p>
                <p className="text-xs text-brand-forest/40 mt-1">
                  {new Date(recentOrder.createdAt).toLocaleDateString("en-GH", {
                    day: "numeric", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Status timeline */}
              <div className="space-y-4">
                {STATUS_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const done = i <= currentStepIndex;
                  const current = i === currentStepIndex;
                  return (
                    <div key={step.key} className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                        ${done ? "bg-brand-forest text-white" : "bg-brand-mist text-brand-sage"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${done ? "text-brand-forest" : "text-brand-forest/30"}`}>
                          {step.label}
                        </p>
                        {current && (
                          <p className="text-xs text-brand-gold font-medium mt-0.5">Current status</p>
                        )}
                      </div>
                      {done && <CheckCircle className="w-4 h-4 text-brand-gold flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="border-t border-border pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-brand-forest/60">
                  <span>Total</span>
                  <span className="font-bold text-brand-forest">{formatGHS(recentOrder.total)}</span>
                </div>
                <div className="flex justify-between text-brand-forest/60">
                  <span>Delivery to</span>
                  <span className="font-medium text-brand-forest text-right max-w-[60%]">
                    {recentOrder.region}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
