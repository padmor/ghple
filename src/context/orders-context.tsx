"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { OrderDetails } from "@/types/store";
import { api, type LiveEvent, type LiveEventType } from "@/lib/api";

export type { LiveEvent, LiveEventType };

interface OrdersContextType {
  /** Manager only: filled when the manager area is open. */
  orders: OrderDetails[];
  events: LiveEvent[];
  /** Storefront checkout. Resolves with the saved order (the server issues its ID). */
  addOrder: (order: Omit<OrderDetails, "id" | "createdAt" | "log">) => Promise<OrderDetails>;
  /** Manager: change an order and write the action into its log. */
  updateOrder: (id: string, changes: Partial<OrderDetails>, action: string, note?: string) => Promise<void>;
  track: (type: LiveEventType, label?: string) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const inManager = pathname.startsWith("/manager");

  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [events, setEvents] = useState<LiveEvent[]>([]);

  // Only the manager area reads the order and activity lists
  useEffect(() => {
    if (!inManager) return;
    let alive = true;
    const load = () =>
      Promise.all([api.orders.list(), api.events.list()])
        .then(([o, e]) => {
          if (!alive) return;
          setOrders([...o]);
          setEvents([...e]);
        })
        .catch(() => undefined);
    load();
    const off = api.onChange(load);
    return () => {
      alive = false;
      off();
    };
  }, [inManager]);

  const track = useCallback((type: LiveEventType, label?: string) => {
    void api.events.track(type, label);
  }, []);

  const addOrder = useCallback((input: Omit<OrderDetails, "id" | "createdAt" | "log">) => api.orders.create(input), []);

  const updateOrder = useCallback(
    async (id: string, changes: Partial<OrderDetails>, action: string, note?: string) => {
      const saved = await api.orders.update(id, changes, { action, note });
      setOrders((prev) => prev.map((o) => (o.id === id ? saved : o)));
    },
    []
  );

  return (
    <OrdersContext.Provider value={{ orders, events, addOrder, updateOrder, track }}>{children}</OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used inside <OrdersProvider>");
  return ctx;
}
