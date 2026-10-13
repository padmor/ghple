"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  Product,
  Benefit,
  ProcessStep,
  TradeTier,
  CEOInfo,
  SiteSettings,
  DEFAULT_PRODUCTS,
  DEFAULT_BENEFITS,
  DEFAULT_PROCESS_STEPS,
  DEFAULT_TRADE_TIERS,
  DEFAULT_CEO,
  DEFAULT_SETTINGS,
} from "@/data/defaults";

interface ManagerContextType {
  // Data
  products: Product[];
  benefits: Benefit[];
  processSteps: ProcessStep[];
  tradeTiers: TradeTier[];
  ceo: CEOInfo;
  settings: SiteSettings;

  // Product actions
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, changes: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  toggleStock: (id: string) => void;

  // Content actions
  updateBenefit: (id: string, changes: Partial<Benefit>) => void;
  addBenefit: (b: Omit<Benefit, "id">) => void;
  removeBenefit: (id: string) => void;

  updateProcessStep: (id: string, changes: Partial<ProcessStep>) => void;
  addProcessStep: (s: Omit<ProcessStep, "id">) => void;
  removeProcessStep: (id: string) => void;

  updateCEO: (changes: Partial<CEOInfo>) => void;

  updateTradeTier: (id: string, changes: Partial<TradeTier>) => void;
  addTradeTier: (t: Omit<TradeTier, "id">) => void;
  removeTradeTier: (id: string) => void;

  updateSettings: (changes: Partial<SiteSettings>) => void;
}

const ManagerContext = createContext<ManagerContextType | undefined>(undefined);

function uid() {
  return `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

// Preview only: open the site with ?demo=8 to see the layout with extra sample products.
// Nothing is saved — remove the parameter and the sample products disappear.
const DEMO_SAMPLES: Omit<Product, "id">[] = [
  { name: "Gid's Apple Cider Vinegar", size: "250 ml", volumeMl: 250, price: 60, badge: "Starter", image: "/images/products/bottle-500ml.jpg", inStock: true, description: "A small bottle to try the raw, unfiltered vinegar with the mother. Sample product for layout preview." },
  { name: "Gid's Apple Cider Vinegar", size: "750 ml", volumeMl: 750, price: 135, image: "/images/products/bottle-500ml.jpg", inStock: true, description: "A mid-size bottle for weekly use in cooking and daily wellness routines. Sample product for layout preview." },
  { name: "Gid's Apple Cider Vinegar", size: "2 L", volumeMl: 2000, price: 310, badge: "Bulk", image: "/images/products/bottle-1000ml.jpg", inStock: true, description: "Large container for busy kitchens and regular users. Sample product for layout preview." },
  { name: "Gid's Apple Cider Vinegar", size: "Twin Pack", volumeMl: 1000, price: 195, badge: "Save more", image: "/images/products/bottle-500ml.jpg", inStock: true, description: "Two 500 ml bottles together at a better price. Sample product for layout preview." },
  { name: "Gid's Apple Cider Vinegar", size: "Gift Set", volumeMl: 1000, price: 240, badge: "Gift", image: "/images/products/bottle-1000ml.jpg", inStock: true, description: "Presented as a gift, ready to give to someone special. Sample product for layout preview." },
  { name: "Gid's Apple Cider Vinegar", size: "Trial Pack", volumeMl: 300, price: 75, image: "/images/products/bottle-500ml.jpg", inStock: false, description: "Three small bottles to compare. Currently unavailable. Sample product for layout preview." },
  { name: "Gid's Apple Cider Vinegar", size: "5 L", volumeMl: 5000, price: 690, badge: "Trade", image: "/images/products/bottle-1000ml.jpg", inStock: true, description: "Catering size for restaurants and shops. Sample product for layout preview." },
  { name: "Gid's Apple Cider Vinegar", size: "Family Box", volumeMl: 3000, price: 420, image: "/images/products/bottle-1000ml.jpg", inStock: true, description: "Three 1000 ml bottles in one box for the whole household. Sample product for layout preview." },
];

export function ManagerProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [benefits, setBenefits] = useState<Benefit[]>(DEFAULT_BENEFITS);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(DEFAULT_PROCESS_STEPS);
  const [tradeTiers, setTradeTiers] = useState<TradeTier[]>(DEFAULT_TRADE_TIERS);
  const [ceo, setCeo] = useState<CEOInfo>(DEFAULT_CEO);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [demoCount, setDemoCount] = useState(0);

  useEffect(() => {
    const n = Number(new URLSearchParams(window.location.search).get("demo"));
    if (Number.isFinite(n) && n > 0) setDemoCount(Math.min(n, DEMO_SAMPLES.length));
  }, []);

  const displayProducts = useMemo(
    () =>
      demoCount > 0
        ? [...products, ...DEMO_SAMPLES.slice(0, demoCount).map((d, i) => ({ ...d, id: `demo-${i}` }))]
        : products,
    [products, demoCount]
  );

  // Nothing is saved: everything lives in memory and resets on reload.

  // ── Products ──────────────────────────────
  const addProduct = (p: Omit<Product, "id">) =>
    setProducts((prev) => [...prev, { ...p, id: uid() }]);

  const updateProduct = (id: string, changes: Partial<Product>) =>
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...changes } : p))
    );

  const removeProduct = (id: string) =>
    setProducts((prev) => prev.filter((p) => p.id !== id));

  const toggleStock = (id: string) =>
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))
    );

  // ── Benefits ──────────────────────────────
  const updateBenefit = (id: string, changes: Partial<Benefit>) =>
    setBenefits((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...changes } : b))
    );

  const addBenefit = (b: Omit<Benefit, "id">) =>
    setBenefits((prev) => [...prev, { ...b, id: uid() }]);

  const removeBenefit = (id: string) =>
    setBenefits((prev) => prev.filter((b) => b.id !== id));

  // ── Process steps ─────────────────────────
  const updateProcessStep = (id: string, changes: Partial<ProcessStep>) =>
    setProcessSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...changes } : s))
    );

  const addProcessStep = (s: Omit<ProcessStep, "id">) =>
    setProcessSteps((prev) => [...prev, { ...s, id: uid() }]);

  const removeProcessStep = (id: string) =>
    setProcessSteps((prev) => prev.filter((s) => s.id !== id));

  // ── CEO ───────────────────────────────────
  const updateCEO = (changes: Partial<CEOInfo>) =>
    setCeo((prev) => ({ ...prev, ...changes }));

  // ── Trade tiers ───────────────────────────
  const updateTradeTier = (id: string, changes: Partial<TradeTier>) =>
    setTradeTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...changes } : t))
    );

  const addTradeTier = (t: Omit<TradeTier, "id">) =>
    setTradeTiers((prev) => [...prev, { ...t, id: uid() }]);

  const removeTradeTier = (id: string) =>
    setTradeTiers((prev) => prev.filter((t) => t.id !== id));

  // ── Settings ──────────────────────────────
  const updateSettings = (changes: Partial<SiteSettings>) =>
    setSettings((prev) => ({ ...prev, ...changes }));

  return (
    <ManagerContext.Provider
      value={{
        products: displayProducts,
        benefits,
        processSteps,
        tradeTiers,
        ceo,
        settings,
        addProduct,
        updateProduct,
        removeProduct,
        toggleStock,
        updateBenefit,
        addBenefit,
        removeBenefit,
        updateProcessStep,
        addProcessStep,
        removeProcessStep,
        updateCEO,
        updateTradeTier,
        addTradeTier,
        removeTradeTier,
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
