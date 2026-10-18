"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingCart, ArrowRight } from "@/components/ui/icons";
import { useCart } from "@/context/cart-context";
import { formatGHS } from "@/lib/utils";
import { useManager } from "@/context/manager-context";

export function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    items,
    removeFromCart,
    updateQuantity,
    totalCount,
    subtotal,
    setIsCheckoutOpen,
  } = useCart();
  const { settings } = useManager();

  const total = subtotal + (items.length > 0 ? settings.deliveryFee : 0);

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Modal — a bottom sheet on phones, a centred card on larger screens */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="relative flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden
          rounded-t-3xl bg-white shadow-2xl animate-sheet-up
          sm:max-h-[85vh] sm:rounded-2xl sm:animate-scale-in"
      >
        {/* Grab handle (phones) */}
        <div className="mx-auto mt-2 h-1 w-10 flex-shrink-0 rounded-full bg-black/15 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 sm:px-6 sm:py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-brand-forest" />
            <h2 className="font-bold text-brand-forest text-base">
              Your Cart
              {totalCount > 0 && (
                <span className="ml-2 text-brand-gold font-semibold">
                  ({totalCount} {totalCount === 1 ? "item" : "items"})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
            className="p-2 rounded-lg text-brand-forest/40 hover:text-brand-forest
              hover:bg-brand-mist transition-colors focus-ring"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-brand-mist flex items-center justify-center">
                <ShoppingCart className="w-7 h-7 text-brand-sage" />
              </div>
              <p className="font-semibold text-brand-forest">Your cart is empty</p>
              <p className="text-sm text-brand-forest/50">
                Add a product to get started.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-gold mt-2"
              >
                Browse Products
              </button>
              <Link
                href="/track"
                onClick={() => setIsCartOpen(false)}
                className="text-sm font-semibold text-brand-forest underline decoration-brand-gold decoration-2 underline-offset-4 hover:text-brand-gold"
              >
                Track an existing order
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  {/* Product block */}
                  <div className="w-16 h-16 rounded-xl bg-brand-forest/8 border border-brand-forest/10 flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
                    {item.image ? (
                      <Image
  src={item.image}
  alt={item.size}
  width={64}
  height={64}
  sizes="64px"
  unoptimized={/^(https?:)?\/\//.test(item.image) || item.image.startsWith("data:") || item.image.startsWith("blob:")}
  className="w-full h-full object-contain"
/>
                    ) : (
                      <span className="text-lg font-bold text-brand-forest/30">
                        {item.volumeMl >= 1000
                          ? `${item.volumeMl / 1000}L`
                          : item.volumeMl > 0
                          ? `${item.volumeMl}ml`
                          : item.size}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-brand-forest leading-tight">
                      {item.name}
                    </p>
                    <p className="text-xs text-brand-forest/50 mt-0.5">{item.size}</p>
                    <p className="text-sm font-bold text-brand-gold mt-1.5">
                      {formatGHS(item.price)}
                    </p>
                  </div>

                  {/* Quantity + remove */}
                  <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className="p-1 text-brand-forest/25 hover:text-brand-terracotta
                        transition-colors focus-ring rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        aria-label="Decrease quantity"
                        className="w-7 h-7 rounded-md border border-border flex items-center
                          justify-center text-brand-forest hover:bg-brand-mist
                          transition-colors focus-ring"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-brand-forest">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        aria-label="Increase quantity"
                        className="w-7 h-7 rounded-md border border-border flex items-center
                          justify-center text-brand-forest hover:bg-brand-mist
                          transition-colors focus-ring"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer — only when items exist */}
        {items.length > 0 && (
          <div className="px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-5 border-t border-border bg-brand-ivory flex-shrink-0 space-y-3">
            <div className="flex justify-between text-sm text-brand-forest/60">
              <span>Subtotal</span>
              <span className="font-medium text-brand-forest">{formatGHS(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-brand-forest/60">
              <span>Delivery (est.)</span>
              <span className="font-medium text-brand-forest">{formatGHS(settings.deliveryFee)}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-brand-forest
              pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-xl text-brand-gold">{formatGHS(total)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="btn-gold w-full justify-center gap-2 mt-1"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-full text-center text-sm text-brand-forest/40
                hover:text-brand-forest transition-colors py-1 focus-ring rounded"
            >
              Continue Shopping
            </button>
            <Link
              href="/track"
              onClick={() => setIsCartOpen(false)}
              className="flex items-center justify-center gap-2 text-sm font-semibold text-brand-forest
                hover:text-brand-gold transition-colors py-1 focus-ring rounded"
            >
              <Image src="/icons/track/track-delivery.svg" alt="" width={24} height={24} className="w-6 h-6" />
              Track an existing order
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
