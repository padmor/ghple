"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Upload, X } from "@/components/ui/icons";
import { useManager } from "@/context/manager-context";
import { formatGHS } from "@/lib/utils";
import { Product } from "@/data/defaults";
import { Card, Field, Icon, Modal, PageHeader, inputClass, secondaryBtn } from "@/components/manager/ui";

const BADGE_OPTIONS = ["", "Most Popular", "Best Value", "New", "Limited"];

const PRESET_IMAGES = [
  { label: "500 ml bottle", url: "/images/products/bottle-500ml.jpg" },
  { label: "1000 ml bottle", url: "/images/products/bottle-1000ml.jpg" },
];

type Draft = {
  size: string;
  volumeMl: number;
  price: number;
  badge: string;
  image: string;
  description: string;
};

const EMPTY: Draft = {
  size: "",
  volumeMl: 500,
  price: 0,
  badge: "",
  image: PRESET_IMAGES[0].url,
  description: "",
};

const isRemote = (src: string) => /^(https?:)?\/\//.test(src) || src.startsWith("data:") || src.startsWith("blob:");

function Thumb({ src, alt, className }: { src?: string; alt: string; className: string }) {
  return (
    <div className={`flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/30 p-1 ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={320}
          height={400}
          sizes="96px"
          unoptimized={isRemote(src)}
          className="h-full w-full object-contain"
        />
      ) : (
        <span className="px-1 text-center text-[10px] text-white/45">No image</span>
      )}
    </div>
  );
}

export default function ProductsPage() {
  const { products, addProduct, updateProduct, removeProduct, toggleStock } = useManager();

  // null = closed, "new" = adding, otherwise the product being edited
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    setDraft(EMPTY);
    setEditing("new");
  };

  const openEdit = (p: Product) => {
    setDraft({
      size: p.size,
      volumeMl: p.volumeMl,
      price: p.price,
      badge: p.badge ?? "",
      image: p.image ?? "",
      description: p.description,
    });
    setEditing(p);
  };

  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      if (data) setDraft((d) => ({ ...d, image: data }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const canSave = draft.size.trim().length > 0 && draft.price > 0;

  const save = () => {
    if (!canSave || !editing) return;
    if (editing === "new") {
      addProduct({
        name: "Gid's Apple Cider Vinegar",
        size: draft.size.trim(),
        volumeMl: draft.volumeMl,
        price: draft.price,
        badge: draft.badge || undefined,
        image: draft.image || (draft.volumeMl >= 1000 ? PRESET_IMAGES[1].url : PRESET_IMAGES[0].url),
        description: draft.description,
        inStock: true,
      });
    } else {
      updateProduct(editing.id, {
        size: draft.size.trim(),
        price: draft.price,
        badge: draft.badge,
        image: draft.image,
        description: draft.description,
      });
    }
    setEditing(null);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
      <PageHeader
        icon="products"
        title="Products & Prices"
        text="Changes go live on the storefront straight away."
        action={
          <button onClick={openNew} className="btn-gold gap-2 px-5 py-2.5 text-sm font-bold">
            <Plus className="h-4 w-4" />
            Add size
          </button>
        }
      />

      {products.length === 0 ? (
        <Card className="py-14 text-center">
          <Icon name="products" className="mx-auto h-16 w-16" />
          <p className="mt-4 text-base font-bold text-white">No products yet</p>
          <p className="mt-1 text-sm text-white/60">Add your first bottle size to show it on the store.</p>
          <button onClick={openNew} className="btn-gold mx-auto mt-5 gap-2 px-5 py-2.5 text-sm font-bold">
            <Plus className="h-4 w-4" />
            Add size
          </button>
        </Card>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li
              key={p.id}
              className={`rounded-2xl border border-white/10 bg-brand-navy-mid p-4 transition-opacity sm:p-5 ${
                p.inStock ? "" : "opacity-70"
              }`}
            >
              <div className="flex items-start gap-4">
                <Thumb src={p.image} alt={p.size} className="h-20 w-16 flex-shrink-0 sm:h-24 sm:w-20" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-white">{p.size}</h2>
                    {p.badge && (
                      <span className="rounded-full bg-brand-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/60">{p.description}</p>
                  <p className="mt-2 text-lg font-extrabold text-brand-gold sm:hidden">{formatGHS(p.price)}</p>
                </div>
                <p className="hidden flex-shrink-0 text-xl font-extrabold text-brand-gold sm:block">{formatGHS(p.price)}</p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                <button
                  role="switch"
                  aria-checked={p.inStock}
                  onClick={() => toggleStock(p.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 py-1.5 pl-2 pr-3.5 text-xs font-bold text-white/85 transition-colors hover:border-white/35 focus-ring"
                >
                  <span className={`relative h-5 w-9 rounded-full transition-colors ${p.inStock ? "bg-emerald-500" : "bg-white/25"}`}>
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${p.inStock ? "left-[18px]" : "left-0.5"}`}
                    />
                  </span>
                  {p.inStock ? "In stock" : "Out of stock"}
                </button>
                <button
                  onClick={() => openEdit(p)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-gold/40 px-4 py-1.5 text-xs font-bold text-brand-gold transition-colors hover:bg-brand-gold/10 focus-ring"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setToDelete(p)}
                  aria-label={`Remove ${p.size}`}
                  className="ml-auto rounded-full p-2 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400 focus-ring"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add / edit modal */}
      <Modal
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing === "new" ? "Add a size" : "Edit product"}
        description={editing === "new" ? "It appears on the storefront as soon as you save." : undefined}
        footer={
          <>
            <button onClick={() => setEditing(null)} className={secondaryBtn}>
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!canSave}
              className="btn-gold px-6 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {editing === "new" ? "Add product" : "Save changes"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Size label">
              <input
                value={draft.size}
                onChange={(e) => setDraft((d) => ({ ...d, size: e.target.value }))}
                placeholder="e.g. 750 ml"
                className={inputClass}
              />
            </Field>
            <Field label="Price (GH₵)">
              <input
                type="number"
                min={0}
                value={draft.price || ""}
                onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) }))}
                placeholder="0"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/60">Photo</p>
            <div className="flex gap-4">
              <div className="relative">
                <Thumb src={draft.image || undefined} alt="Preview" className="h-28 w-24" />
                {draft.image && (
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, image: "" }))}
                    aria-label="Remove photo"
                    className="absolute -right-2 -top-2 rounded-full bg-black/80 p-1 text-red-400 ring-1 ring-white/20 hover:text-red-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2.5">
                <div className="flex flex-wrap gap-2">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      type="button"
                      key={preset.url}
                      onClick={() => setDraft((d) => ({ ...d, image: preset.url }))}
                      className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                        draft.image === preset.url
                          ? "border-brand-gold bg-brand-gold/20 text-brand-gold"
                          : "border-white/15 text-white/75 hover:border-white/35"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input type="file" ref={fileRef} onChange={upload} accept="image/*" className="hidden" />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:border-brand-gold hover:text-brand-gold focus-ring"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload photo
                </button>
              </div>
            </div>
          </div>

          <Field label="Badge">
            <select
              value={draft.badge}
              onChange={(e) => setDraft((d) => ({ ...d, badge: e.target.value }))}
              className={inputClass}
            >
              {BADGE_OPTIONS.map((b) => (
                <option key={b} value={b} className="bg-brand-navy text-white">
                  {b || "No badge"}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Description">
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="A short line about this size"
              className={`${inputClass} resize-none`}
            />
          </Field>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Remove this product?"
        description={toDelete ? `${toDelete.size} will disappear from the storefront.` : undefined}
        footer={
          <>
            <button onClick={() => setToDelete(null)} className={secondaryBtn}>
              Keep it
            </button>
            <button
              onClick={() => {
                if (toDelete) removeProduct(toDelete.id);
                setToDelete(null);
              }}
              className="inline-flex items-center justify-center rounded-full bg-red-500 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-400 focus-ring"
            >
              Remove
            </button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-white/70">
          You can add it back later with &ldquo;Add size&rdquo;, but you&apos;ll need to enter its details again.
        </p>
      </Modal>
    </div>
  );
}
