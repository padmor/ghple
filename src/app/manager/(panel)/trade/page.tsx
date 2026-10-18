"use client";

import React, { useState } from "react";
import { Check } from "@/components/ui/icons";
import { useManager } from "@/context/manager-context";
import { Card, Field, PageHeader, inputClass } from "@/components/manager/ui";

export default function SettingsPage() {
  const { settings, updateSettings } = useManager();
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);

  const save = () => {
    updateSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (key: keyof typeof draft) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
      <PageHeader icon="settings" title="Store Settings" text="Contact details customers use to reach you, including for delivery. Add at least two numbers." />

      <Card className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="WhatsApp number">
            <input type="tel" value={draft.whatsappNumber} onChange={set("whatsappNumber")} className={inputClass} />
          </Field>
          <Field label="Phone number">
            <input type="tel" value={draft.phone} onChange={set("phone")} className={inputClass} />
          </Field>
          <Field label="Second phone number (for delivery calls)">
            <input type="tel" value={draft.phone2} onChange={set("phone2")} className={inputClass} />
          </Field>
          <Field label="Delivery fee (GH₵)">
            <input
              type="number"
              min={0}
              step="0.5"
              inputMode="decimal"
              value={draft.deliveryFee}
              onChange={(e) => setDraft((d) => ({ ...d, deliveryFee: Math.max(0, Number(e.target.value) || 0) }))}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-white/45">Added to every delivery order. Set 0 for free delivery. Pickup is always free.</p>
          </Field>
          <Field label="Trade email">
            <input type="email" value={draft.tradeEmail} onChange={set("tradeEmail")} className={inputClass} />
          </Field>
          <Field label="Address">
            <input value={draft.address} onChange={set("address")} className={inputClass} />
          </Field>
        </div>
        <button
          onClick={save}
          className={`btn-gold gap-2 px-6 py-2.5 text-sm font-bold ${saved ? "!bg-emerald-500 !text-white" : ""}`}
        >
          {saved && <Check className="h-4 w-4" />}
          {saved ? "Saved" : "Save changes"}
        </button>
      </Card>
    </div>
  );
}
