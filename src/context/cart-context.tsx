"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product, CartItem, OrderDetails } from "@/types/store";

const STORAGE_KEY = "gbhpl-cart-v2";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isTrackOpen: boolean;
  setIsTrackOpen: (open: boolean) => void;
  recentOrder: OrderDetails | null;
  setRecentOrder: (order: OrderDetails | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [recentOrder, setRecentOrder] = useState<OrderDetails | null>(null);

  // Persist cart across page refreshes (session only)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, quantity: Math.min(99, i.quantity + quantity) }
            : i
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) =>
    setItems((prev) => prev.filter((i) => i.id !== productId));

  const updateQuantity = (productId: string, delta: number) =>
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id !== productId) return i;
          const next = i.quantity + delta;
          return next > 0 ? { ...i, quantity: Math.min(99, next) } : null;
        })
        .filter((i): i is CartItem => i !== null)
    );

  const clearCart = () => setItems([]);

  const totalCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isTrackOpen,
        setIsTrackOpen,
        recentOrder,
        setRecentOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
