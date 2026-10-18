"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check } from "@/components/ui/icons";
import { useManager } from "@/context/manager-context";
import { Card, Field, PageHeader, inputClass } from "@/components/manager/ui";

export default function FounderPage() {
  const { ceo, updateCEO } = useManager();
  const [draft, setDraft] = useState(ceo);
  const [saved, setSaved] = useState(false);

  const save = () => {
    updateCEO(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
      <PageHeader icon="founder" title="Founder Profile" text="The founder story shown on the home page." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_16rem]">
        <Card className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Role">
              <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} className={inputClass} />
            </Field>
          </div>
          <Field label="Quote">
            <input
              value={draft.quote}
              onChange={(e) => setDraft((d) => ({ ...d, quote: e.target.value }))}
              placeholder="A memorable line from the founder"
              className={inputClass}
            />
          </Field>
          <Field label="Bio">
            <textarea
              rows={5}
              value={draft.bio}
              onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
              className={`${inputClass} resize-none`}
            />
          </Field>
          <Field label="Photo path" hint="Put the image in the public/ folder and enter its path, e.g. /founder/ceo.jpg">
            <input
              value={draft.photoPath}
              onChange={(e) => setDraft((d) => ({ ...d, photoPath: e.target.value }))}
              placeholder="/founder/ceo.jpg"
              className={inputClass}
            />
          </Field>
          <button
            onClick={save}
            className={`btn-gold gap-2 px-6 py-2.5 text-sm font-bold ${saved ? "!bg-emerald-500 !text-white" : ""}`}
          >
            {saved && <Check className="h-4 w-4" />}
            {saved ? "Saved" : "Save changes"}
          </button>
        </Card>

        <Card className="h-fit text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/50">Preview</p>
          <div className="relative mx-auto mt-4 h-40 w-40 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
            {draft.photoPath ? (
              <Image src={draft.photoPath} alt={draft.name} fill sizes="160px" className="object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center text-xs text-white/45">No photo</span>
            )}
          </div>
          <p className="mt-4 text-base font-extrabold text-white">{draft.name || "Name"}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">{draft.title || "Role"}</p>
        </Card>
      </div>
    </div>
  );
}
