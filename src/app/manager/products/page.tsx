"use client";

import React, { useState, useRef } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Save, Image as ImageIcon, Upload, X } from "lucide-react";
import { useManager } from "@/context/manager-context";
import { formatGHS } from "@/lib/utils";
import { Product } from "@/data/defaults";

const BADGE_OPTIONS = ["", "Most Popular", "Best Value", "New", "Limited"];

const PRESET_IMAGES = [
  { label: "500 ml Bottle", url: "/images/products/bottle-500ml.jpg" },
  { label: "1000 ml Family", url: "/images/products/bottle-1000ml.jpg" },
];

function ProductRow({
  product,
  onUpdate,
  onRemove,
  onToggle,
}: {
  product: Product;
  onUpdate: (id: string, changes: Partial<Product>) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(product);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setDraft((d) => ({ ...d, image: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    onUpdate(product.id, {
      size: draft.size,
      price: draft.price,
      badge: draft.badge,
      image: draft.image,
      description: draft.description,
    });
    setEditing(false);
  };

  const cancel = () => {
    setDraft(product);
    setEditing(false);
  };

  return (
    <div
      className={`bg-brand-navy-mid border rounded-xl p-5 transition-colors ${
        product.inStock ? "border-white/8" : "border-white/4 opacity-60"
      }`}
    >
      {!editing ? (
        <div className="flex items-start gap-4">
          {/* Product Thumbnail */}
          <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg bg-black/40 border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden p-1">
            {product.image ? (
              <img
                src={product.image}
                alt={product.size}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 gap-1 text-[10px]">
                <ImageIcon className="w-5 h-5" />
                <span>No image</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-white font-bold">{product.size}</span>
              {product.badge && (
                <span
                  className="text-[10px] font-bold uppercase tracking-widest
                  bg-brand-gold/15 text-brand-gold border border-brand-gold/25 rounded-full px-2 py-0.5"
                >
                  {product.badge}
                </span>
              )}
              {!product.inStock && (
                <span
                  className="text-[10px] font-bold uppercase tracking-widest
                  bg-red-500/15 text-red-400 border border-red-500/20 rounded-full px-2 py-0.5"
                >
                  Out of Stock
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed line-clamp-2">
              {product.description}
            </p>
            {product.image && (
              <p className="text-[11px] text-brand-gold/70 mt-1 font-mono truncate">
                Image: {product.image.startsWith("data:") ? "Custom Upload (Data)" : product.image}
              </p>
            )}
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-brand-gold font-bold text-lg">{formatGHS(product.price)}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Size Label</label>
              <input
                value={draft.size}
                onChange={(e) => setDraft((d) => ({ ...d, size: e.target.value }))}
                className="form-input text-sm bg-brand-navy border-white/15 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Price (GHS)</label>
              <input
                type="number"
                min={0}
                value={draft.price}
                onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) }))}
                className="form-input text-sm bg-brand-navy border-white/15 text-white"
              />
            </div>
          </div>

          {/* Product Image Selector */}
          <div className="bg-brand-navy/60 border border-white/10 rounded-lg p-3">
            <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-brand-gold" /> Product Image
            </label>

            <div className="flex gap-4 items-start">
              {/* Image Preview */}
              <div className="w-20 h-24 rounded-lg bg-black/40 border border-white/15 flex-shrink-0 flex items-center justify-center overflow-hidden p-1 relative group">
                {draft.image ? (
                  <>
                    <img src={draft.image} alt="Preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, image: undefined }))}
                      title="Remove image"
                      className="absolute top-1 right-1 bg-black/70 text-red-400 hover:text-red-300 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-500 text-center px-1">No Image</span>
                )}
              </div>

              {/* Image Controls */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400">Presets:</span>
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      type="button"
                      key={preset.url}
                      onClick={() => setDraft((d) => ({ ...d, image: preset.url }))}
                      className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                        draft.image === preset.url
                          ? "bg-brand-gold/20 text-brand-gold border-brand-gold/40 font-semibold"
                          : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Photo
                  </button>
                  <span className="text-[11px] text-slate-500">or enter URL below:</span>
                </div>

                <input
                  type="text"
                  placeholder="Image URL (e.g. /images/products/bottle-500ml.jpg or https://...)"
                  value={draft.image || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))}
                  className="form-input text-xs bg-brand-navy border-white/15 text-white placeholder:text-slate-600 w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Badge</label>
            <select
              value={draft.badge ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, badge: e.target.value || undefined }))}
              className="form-input text-sm bg-brand-navy border-white/15 text-white"
            >
              {BADGE_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b || "No badge"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Description</label>
            <textarea
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              className="form-input text-sm bg-brand-navy border-white/15 text-white resize-none"
            />
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/8">
        {!editing ? (
          <>
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-semibold text-brand-gold hover:text-brand-gold-light
                px-3 py-1.5 rounded-lg border border-brand-gold/25 hover:border-brand-gold/50
                transition-colors focus-ring"
            >
              Edit
            </button>
            <button
              onClick={() => onToggle(product.id)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
                border border-white/10 text-slate-400 hover:text-white hover:border-white/25
                transition-colors focus-ring"
            >
              {product.inStock ? (
                <><ToggleRight className="w-4 h-4 text-green-400" /> In Stock</>
              ) : (
                <><ToggleLeft className="w-4 h-4 text-slate-500" /> Out of Stock</>
              )}
            </button>
            <button
              onClick={() => onRemove(product.id)}
              aria-label={`Remove ${product.size}`}
              className="ml-auto p-1.5 text-slate-600 hover:text-red-400 transition-colors focus-ring rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button onClick={save} className="btn-gold text-xs px-4 py-2 gap-1.5">
              <Save className="w-3.5 h-3.5" /> Save
            </button>
            <button
              onClick={cancel}
              className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2
                rounded-lg border border-white/10 hover:border-white/25 transition-colors focus-ring"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { products, addProduct, updateProduct, removeProduct, toggleStock } = useManager();
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState({
    size: "",
    volumeMl: 500,
    price: 0,
    badge: "",
    image: "/images/products/bottle-500ml.jpg",
    description: "",
  });
  const addFileInputRef = useRef<HTMLInputElement>(null);

  const handleAddFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setNewProduct((d) => ({ ...d, image: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!newProduct.size.trim() || newProduct.price <= 0) return;
    addProduct({
      name: "Gid's Apple Cider Vinegar",
      size: newProduct.size,
      volumeMl: newProduct.volumeMl,
      price: newProduct.price,
      badge: newProduct.badge || undefined,
      image:
        newProduct.image ||
        (newProduct.volumeMl >= 1000
          ? "/images/products/bottle-1000ml.jpg"
          : "/images/products/bottle-500ml.jpg"),
      description: newProduct.description,
      inStock: true,
    });
    setNewProduct({
      size: "",
      volumeMl: 500,
      price: 0,
      badge: "",
      image: "/images/products/bottle-500ml.jpg",
      description: "",
    });
    setShowAdd(false);
  };

  return (
    <div className="px-8 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Products & Prices</h1>
          <p className="text-slate-400 text-sm mt-1">
            Changes and product images are live on the storefront immediately.
          </p>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="btn-gold gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Size
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-brand-navy-mid border border-brand-gold/25 rounded-xl p-5 mb-6 animate-fade-in">
          <h2 className="text-white font-semibold text-sm mb-4">New Product Size</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Size Label *</label>
              <input
                placeholder="e.g. 250 ml"
                value={newProduct.size}
                onChange={(e) => setNewProduct((d) => ({ ...d, size: e.target.value }))}
                className="form-input text-sm bg-brand-navy border-white/15 text-white placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Price (GHS) *</label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={newProduct.price || ""}
                onChange={(e) => setNewProduct((d) => ({ ...d, price: Number(e.target.value) }))}
                className="form-input text-sm bg-brand-navy border-white/15 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Volume (ml)</label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 250"
                value={newProduct.volumeMl || ""}
                onChange={(e) => setNewProduct((d) => ({ ...d, volumeMl: Number(e.target.value) }))}
                className="form-input text-sm bg-brand-navy border-white/15 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Badge</label>
              <select
                value={newProduct.badge}
                onChange={(e) => setNewProduct((d) => ({ ...d, badge: e.target.value }))}
                className="form-input text-sm bg-brand-navy border-white/15 text-white"
              >
                {BADGE_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b || "No badge"}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Selection in Add Form */}
          <div className="bg-brand-navy/60 border border-white/10 rounded-lg p-3 mb-3">
            <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-brand-gold" /> Product Image
            </label>

            <div className="flex gap-4 items-start">
              {/* Image Preview */}
              <div className="w-20 h-24 rounded-lg bg-black/40 border border-white/15 flex-shrink-0 flex items-center justify-center overflow-hidden p-1 relative">
                {newProduct.image ? (
                  <img src={newProduct.image} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[10px] text-slate-500 text-center px-1">No Image</span>
                )}
              </div>

              {/* Controls */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400">Presets:</span>
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      type="button"
                      key={preset.url}
                      onClick={() => setNewProduct((d) => ({ ...d, image: preset.url }))}
                      className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                        newProduct.image === preset.url
                          ? "bg-brand-gold/20 text-brand-gold border-brand-gold/40 font-semibold"
                          : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={addFileInputRef}
                    onChange={handleAddFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => addFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Photo
                  </button>
                  <span className="text-[11px] text-slate-500">or enter URL:</span>
                </div>

                <input
                  type="text"
                  placeholder="Image URL (e.g. /images/products/bottle-500ml.jpg or https://...)"
                  value={newProduct.image || ""}
                  onChange={(e) => setNewProduct((d) => ({ ...d, image: e.target.value }))}
                  className="form-input text-xs bg-brand-navy border-white/15 text-white placeholder:text-slate-600 w-full"
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-slate-400 block mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Short product description…"
              value={newProduct.description}
              onChange={(e) => setNewProduct((d) => ({ ...d, description: e.target.value }))}
              className="form-input text-sm bg-brand-navy border-white/15 text-white resize-none placeholder:text-slate-600"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={handleAdd} className="btn-gold text-sm gap-1.5">
              <Plus className="w-4 h-4" /> Add Product
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="text-sm text-slate-400 hover:text-white px-4 py-2 rounded-lg
                border border-white/10 hover:border-white/25 transition-colors focus-ring"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Product list */}
      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            No products yet. Click &ldquo;Add Size&rdquo; to create one.
          </div>
        ) : (
          products.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              onUpdate={updateProduct}
              onRemove={removeProduct}
              onToggle={toggleStock}
            />
          ))
        )}
      </div>
    </div>
  );
}
