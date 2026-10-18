"use client";

import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
import {
  Product,
  CEOInfo,
  SiteSettings,
  DEFAULT_PRODUCTS,
  DEFAULT_CEO,
  DEFAULT_SETTINGS,
} from "@/data/defaults";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import type { StoreContent } from "@/server/content";

interface ManagerContextType {
  // Data
  products: Product[];
  ceo: CEOInfo;
  settings: SiteSettings;

  // Product actions
  addProduct: (p: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, changes: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  toggleStock: (id: string) => Promise<void>;

  // Content actions
  updateCEO: (changes: Partial<CEOInfo>) => Promise<void>;
  updateSettings: (changes: Partial<SiteSettings>) => Promise<void>;
}

const ManagerContext = createContext<ManagerContextType | undefined>(undefined);

export function ManagerProvider({ children, initial }: { children: React.ReactNode; initial?: StoreContent | null }) {
  const path = usePathname();
  const inManager = path.startsWith("/manager") && path !== "/manager/login";
  const [products, setProducts] = useState<Product[]>(initial?.products ?? DEFAULT_PRODUCTS);
  const [ceo, setCeo] = useState<CEOInfo>(initial?.founder ?? DEFAULT_CEO);
  const [settings, setSettings] = useState<SiteSettings>(initial?.settings ?? DEFAULT_SETTINGS);

  // Only the manager area reloads from the API (and keeps refreshing). Visitors get the
  // content the server already put in the page.
  useEffect(() => {
    if (!inManager) return;
    let alive = true;
    const load = () => {
      void api.products.list().then((v) => alive && setProducts([...v])).catch(() => undefined);
      void api.settings.get().then((v) => alive && setSettings({ ...v })).catch(() => undefined);
      void api.founder.get().then((v) => alive && setCeo({ ...v })).catch(() => undefined);
    };
    load();
    const off = api.onChange(load);
    return () => {
      alive = false;
      off();
    };
  }, [inManager]);

  // ── Products ──────────────────────────────
  const addProduct = useCallback(async (p: Omit<Product, "id">) => {
    const saved = await api.products.create(p);
    setProducts((prev) => (prev.some((x) => x.id === saved.id) ? prev : [...prev, saved]));
  }, []);

  const updateProduct = useCallback(async (id: string, changes: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...changes } : p))); // instant
    const saved = await api.products.update(id, changes);
    setProducts((prev) => prev.map((p) => (p.id === id ? saved : p)));
  }, []);

  const removeProduct = useCallback(async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await api.products.remove(id);
  }, []);

  const toggleStock = useCallback(
    async (id: string) => {
      const current = products.find((p) => p.id === id);
      if (current) await updateProduct(id, { inStock: !current.inStock });
    },
    [products, updateProduct]
  );

  // ── Founder & settings ────────────────────
  const updateCEO = useCallback(async (changes: Partial<CEOInfo>) => {
    setCeo((prev) => ({ ...prev, ...changes }));
    setCeo(await api.founder.update(changes));
  }, []);

  const updateSettings = useCallback(async (changes: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...changes }));
    setSettings(await api.settings.update(changes));
  }, []);

  return (
    <ManagerContext.Provider
      value={{
        products,
        ceo,
        settings,
        addProduct,
        updateProduct,
        removeProduct,
        toggleStock,
        updateCEO,
        updateSettings,
      }}
    >
      {children}
    </ManagerContext.Provider>
  );
}

export function useManager() {
  const ctx = useContext(ManagerContext);
  if (!ctx) throw new Error("useManager must be used inside <ManagerProvider>");
  return ctx;
}
