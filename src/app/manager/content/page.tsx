"use client";

import React, { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { useManager } from "@/context/manager-context";

const ICON_OPTIONS = [
  "Leaf", "FlaskConical", "ShieldCheck", "Flame", "MapPin", "Timer",
  "Heart", "Star", "Droplets", "Beaker",
];

export default function ContentPage() {
  const {
    ceo, updateCEO,
    benefits, updateBenefit, addBenefit, removeBenefit,
    processSteps, updateProcessStep, addProcessStep, removeProcessStep,
  } = useManager();

  const [ceoDraft, setCeoDraft] = useState(ceo);
  const [ceoSaved, setCeoSaved] = useState(false);

  const saveCEO = () => {
    updateCEO(ceoDraft);
    setCeoSaved(true);
    setTimeout(() => setCeoSaved(false), 2000);
  };

  return (
    <div className="px-8 py-8 max-w-3xl space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-white">Page Content</h1>
        <p className="text-slate-400 text-sm mt-1">
          Edit CEO info, benefits and process steps shown on the storefront.
        </p>
      </div>

      {/* ── CEO ── */}
      <section>
        <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-brand-gold/20 border border-brand-gold/25
            flex items-center justify-center text-brand-gold text-xs font-bold">C</span>
          Founder / CEO
        </h2>
        <div className="bg-brand-navy-mid border border-white/8 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Full Name</label>
              <input
                value={ceoDraft.name}
                onChange={(e) => setCeoDraft((d) => ({ ...d, name: e.target.value }))}
                className="form-input text-sm bg-brand-navy border-white/15 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Title / Role</label>
              <input
                value={ceoDraft.title}
                onChange={(e) => setCeoDraft((d) => ({ ...d, title: e.target.value }))}
                className="form-input text-sm bg-brand-navy border-white/15 text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Short Quote</label>
            <input
              value={ceoDraft.quote}
              onChange={(e) => setCeoDraft((d) => ({ ...d, quote: e.target.value }))}
              placeholder="A memorable quote from the founder…"
              className="form-input text-sm bg-brand-navy border-white/15 text-white placeholder:text-slate-600"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Bio</label>
            <textarea
              rows={4}
              value={ceoDraft.bio}
              onChange={(e) => setCeoDraft((d) => ({ ...d, bio: e.target.value }))}
              className="form-input text-sm bg-brand-navy border-white/15 text-white resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Photo Path</label>
            <input
              value={ceoDraft.photoPath}
              onChange={(e) => setCeoDraft((d) => ({ ...d, photoPath: e.target.value }))}
              placeholder="/ceo-photo.jpg  (place image in /public)"
              className="form-input text-sm bg-brand-navy border-white/15 text-white placeholder:text-slate-600"
            />
            <p className="text-xs text-slate-500 mt-1">
              Place the photo in the <code className="text-slate-400">public/</code> folder and enter the path here.
            </p>
          </div>
          <button
            onClick={saveCEO}
            className={`btn-gold text-sm gap-2 ${ceoSaved ? "bg-green-500 border-green-500" : ""}`}
          >
            <Save className="w-4 h-4" />
            {ceoSaved ? "Saved!" : "Save CEO Info"}
          </button>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-brand-gold/20 border border-brand-gold/25
              flex items-center justify-center text-brand-gold text-xs font-bold">B</span>
            Benefits ({benefits.length})
          </h2>
          <button
            onClick={() => addBenefit({ icon: "Leaf", title: "New Benefit", description: "Description here." })}
            className="text-xs font-semibold text-brand-gold hover:text-brand-gold-light
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-gold/25
              hover:border-brand-gold/50 transition-colors focus-ring"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <div className="space-y-3">
          {benefits.map((b) => (
            <div key={b.id} className="bg-brand-navy-mid border border-white/8 rounded-xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Icon</label>
                  <select
                    value={b.icon}
                    onChange={(e) => updateBenefit(b.id, { icon: e.target.value })}
                    className="form-input text-sm bg-brand-navy border-white/15 text-white"
                  >
                    {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-400 block mb-1">Title</label>
                  <input
                    value={b.title}
                    onChange={(e) => updateBenefit(b.id, { title: e.target.value })}
                    className="form-input text-sm bg-brand-navy border-white/15 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={b.description}
                    onChange={(e) => updateBenefit(b.id, { description: e.target.value })}
                    className="form-input text-sm bg-brand-navy border-white/15 text-white resize-none"
                  />
                </div>
                <button
                  onClick={() => removeBenefit(b.id)}
                  aria-label="Remove benefit"
                  className="p-2 text-slate-600 hover:text-red-400 transition-colors focus-ring rounded mb-0.5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Process steps ── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-brand-gold/20 border border-brand-gold/25
              flex items-center justify-center text-brand-gold text-xs font-bold">P</span>
            Production Steps ({processSteps.length})
          </h2>
          <button
            onClick={() =>
              addProcessStep({
                number: processSteps.length + 1,
                title: "New Step",
                description: "Describe this step.",
              })
            }
            className="text-xs font-semibold text-brand-gold hover:text-brand-gold-light
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-gold/25
              hover:border-brand-gold/50 transition-colors focus-ring"
          >
            <Plus className="w-3.5 h-3.5" /> Add Step
          </button>
        </div>
        <div className="space-y-3">
          {processSteps.map((s) => (
            <div key={s.id} className="bg-brand-navy-mid border border-white/8 rounded-xl p-4
              flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-brand-forest border border-white/15
                flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                {s.number}
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Step Title</label>
                  <input
                    value={s.title}
                    onChange={(e) => updateProcessStep(s.id, { title: e.target.value })}
                    className="form-input text-sm bg-brand-navy border-white/15 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={s.description}
                    onChange={(e) => updateProcessStep(s.id, { description: e.target.value })}
                    className="form-input text-sm bg-brand-navy border-white/15 text-white resize-none"
                  />
                </div>
              </div>
              <button
                onClick={() => removeProcessStep(s.id)}
                aria-label="Remove step"
                className="p-2 text-slate-600 hover:text-red-400 transition-colors focus-ring rounded mt-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
