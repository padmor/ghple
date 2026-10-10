"use client";

import React, { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { useManager } from "@/context/manager-context";
import { formatGHS } from "@/lib/utils";
import { TradeTier } from "@/data/defaults";

export default function TradePage() {
  const {
    settings, updateSettings,
    tradeTiers, updateTradeTier, addTradeTier, removeTradeTier,
  } = useManager();

  const [settingsDraft, setSettingsDraft] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [zonesInput, setZonesInput] = useState(settings.deliveryZones.join(", "));

  const saveSettings = () => {
    updateSettings({
      ...settingsDraft,
      deliveryZones: zonesInput.split(",").map((z) => z.trim()).filter(Boolean),
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const handleAddTier = () => {
    addTradeTier({ size: "", minOrder: 1, bulkPrice: 0 });
  };

  return (
    <div className="px-8 py-8 max-w-3xl space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-white">Trade Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage wholesale pricing tiers and contact details shown on the Trade page.
        </p>
      </div>

      {/* ── Bulk Pricing Tiers ── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-brand-gold/20 border border-brand-gold/25
              flex items-center justify-center text-brand-gold text-xs font-bold">₵</span>
            Bulk Pricing Tiers
          </h2>
          <button
            onClick={handleAddTier}
            className="text-xs font-semibold text-brand-gold hover:text-brand-gold-light
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-gold/25
              hover:border-brand-gold/50 transition-colors focus-ring"
          >
            <Plus className="w-3.5 h-3.5" /> Add Tier
          </button>
        </div>

        <div className="bg-brand-navy-mid border border-white/8 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-4 gap-3 px-5 py-3 border-b border-white/8 bg-white/3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Size</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Min. Order</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bulk Price</span>
            <span />
          </div>

          {tradeTiers.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No tiers yet. Click &ldquo;Add Tier&rdquo; to create one.
            </div>
          ) : (
            tradeTiers.map((tier) => (
              <div
                key={tier.id}
                className="grid grid-cols-4 gap-3 items-center px-5 py-3 border-b border-white/5 last:border-0"
              >
                <input
                  value={tier.size}
                  onChange={(e) => updateTradeTier(tier.id, { size: e.target.value })}
                  placeholder="500 ml"
                  className="form-input text-sm bg-brand-navy border-white/15 text-white placeholder:text-slate-600 py-2"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    value={tier.minOrder}
                    onChange={(e) => updateTradeTier(tier.id, { minOrder: Number(e.target.value) })}
                    className="form-input text-sm bg-brand-navy border-white/15 text-white py-2 w-full"
                  />
                  <span className="text-slate-500 text-xs whitespace-nowrap">units</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 text-sm">₵</span>
                  <input
                    type="number"
                    min={0}
                    value={tier.bulkPrice}
                    onChange={(e) => updateTradeTier(tier.id, { bulkPrice: Number(e.target.value) })}
                    className="form-input text-sm bg-brand-navy border-white/15 text-white py-2 w-full"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => removeTradeTier(tier.id)}
                    aria-label="Remove tier"
                    className="p-1.5 text-slate-600 hover:text-red-400 transition-colors focus-ring rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <p className="text-xs text-slate-500 mt-3">
          These tiers appear on the <code>/trade</code> page and are visible to retailers.
        </p>
      </section>

      {/* ── Contact & Settings ── */}
      <section>
        <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-brand-gold/20 border border-brand-gold/25
            flex items-center justify-center text-brand-gold text-xs font-bold">S</span>
          Contact & Settings
        </h2>
        <div className="bg-brand-navy-mid border border-white/8 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Trade Email</label>
              <input
                type="email"
                value={settingsDraft.tradeEmail}
                onChange={(e) => setSettingsDraft((d) => ({ ...d, tradeEmail: e.target.value }))}
                className="form-input text-sm bg-brand-navy border-white/15 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={settingsDraft.phone}
                onChange={(e) => setSettingsDraft((d) => ({ ...d, phone: e.target.value }))}
                className="form-input text-sm bg-brand-navy border-white/15 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">WhatsApp Number</label>
              <input
                type="tel"
                value={settingsDraft.whatsappNumber}
                onChange={(e) => setSettingsDraft((d) => ({ ...d, whatsappNumber: e.target.value }))}
                className="form-input text-sm bg-brand-navy border-white/15 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Address</label>
              <input
                value={settingsDraft.address}
                onChange={(e) => setSettingsDraft((d) => ({ ...d, address: e.target.value }))}
                className="form-input text-sm bg-brand-navy border-white/15 text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">
              Delivery Zones{" "}
              <span className="font-normal text-slate-500">(comma-separated)</span>
            </label>
            <input
              value={zonesInput}
              onChange={(e) => setZonesInput(e.target.value)}
              placeholder="Accra, Kumasi, Cape Coast…"
              className="form-input text-sm bg-brand-navy border-white/15 text-white placeholder:text-slate-600"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {zonesInput.split(",").map((z) => z.trim()).filter(Boolean).map((zone) => (
                <span key={zone} className="badge-gold text-[10px] px-2 py-0.5">{zone}</span>
              ))}
            </div>
          </div>
          <button
            onClick={saveSettings}
            className={`btn-gold text-sm gap-2 ${settingsSaved ? "bg-green-500 border-green-500" : ""}`}
          >
            <Save className="w-4 h-4" />
            {settingsSaved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </section>
    </div>
  );
}
