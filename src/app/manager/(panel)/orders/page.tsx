"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Download, Search, Phone, MapPin, Copy, Check } from "@/components/ui/icons";
import { useOrders } from "@/context/orders-context";
import { useManager } from "@/context/manager-context";
import { PAYMENT_ICON, STATUS_ICON } from "@/components/manager/assets";
import { formatGHS } from "@/lib/utils";
import type { OrderDetails } from "@/types/store";
import { Field, Icon, Modal, PageHeader, inputClass, secondaryBtn } from "@/components/manager/ui";

const PAYMENT_LABEL: Record<OrderDetails["paymentMethod"], string> = {
  momo_mtn: "MTN MoMo",
  momo_telecel: "Telecel Cash",
  momo_at: "AirtelTigo Money",
  cash: "Cash on delivery",
};

const STATUSES: { value: OrderDetails["status"]; label: string }[] = [
  { value: "pending_payment", label: "Received" },
  { value: "confirmed", label: "Confirmed" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
];

const REFUND_REASONS = ["Customer cancelled", "Wrong item sent", "Damaged in delivery", "Late delivery", "Paid twice", "Other"];

type Filter = "all" | "refund" | "refunded";

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

function StatusPill({ order }: { order: OrderDetails }) {
  if (order.refund?.status === "refunded")
    return <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-[11px] font-bold text-red-300">Refunded</span>;
  if (order.refund?.status === "requested")
    return <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[11px] font-bold text-orange-300">Refund requested</span>;
  const label = STATUSES.find((s) => s.value === order.status)?.label ?? order.status;
  return <span className="rounded-full bg-brand-gold/15 px-2.5 py-0.5 text-[11px] font-bold text-brand-gold">{label}</span>;
}

export default function OrdersPage() {
  const { orders, updateOrder } = useOrders();
  const { products } = useManager();
  const photoFor = (size: string) => products.find((p) => p.size === size)?.image;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [reason, setReason] = useState(REFUND_REASONS[0]);
  const [refundNote, setRefundNote] = useState("");
  const [copied, setCopied] = useState(false);

  const order = orders.find((o) => o.id === openId) ?? null;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter === "refund" && o.refund?.status !== "requested") return false;
      if (filter === "refunded" && o.refund?.status !== "refunded") return false;
      if (!q) return true;
      return [o.id, o.customerName, o.phone, o.deliveryAddress].some((v) => v?.toLowerCase().includes(q));
    });
  }, [orders, query, filter]);

  const counts = {
    all: orders.length,
    refund: orders.filter((o) => o.refund?.status === "requested").length,
    refunded: orders.filter((o) => o.refund?.status === "refunded").length,
  };

  const open = (o: OrderDetails) => {
    setReason(REFUND_REASONS[0]);
    setRefundNote("");
    setCopied(false);
    setOpenId(o.id);
  };

  const exportCsv = () => {
    const head = ["Order", "Placed", "Customer", "Phone", "Region", "Address", "Payment", "Items", "Total (GHS)", "Status", "Refund", "Refund reason", "Log"];
    const rows = orders.map((o) => [
      o.id,
      o.createdAt,
      o.customerName,
      o.phone,
      o.region,
      o.deliveryAddress,
      PAYMENT_LABEL[o.paymentMethod],
      o.items.map((i) => `${i.quantity}x ${i.size}`).join("; "),
      o.total,
      STATUSES.find((s) => s.value === o.status)?.label,
      o.refund?.status ?? "",
      o.refund?.reason ?? "",
      (o.log ?? []).map((l) => `${l.at} ${l.action}${l.note ? ` (${l.note})` : ""}`).join(" | "),
    ]);
    const csv = [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `gbhpl-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySummary = async (o: OrderDetails) => {
    const text = [
      `Order ${o.id}`,
      `Placed: ${dateTime(o.createdAt)}`,
      `Customer: ${o.customerName} (${o.phone})`,
      `Delivery: ${o.deliveryAddress}, ${o.region}`,
      `Payment: ${PAYMENT_LABEL[o.paymentMethod]}`,
      ...o.items.map((i) => `- ${i.quantity} x ${i.size}  ${formatGHS(i.price * i.quantity)}`),
      `Total: ${formatGHS(o.total)}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: ignore */
    }
  };

  const requestRefund = (o: OrderDetails) => {
    updateOrder(
      o.id,
      { refund: { status: "requested", reason, amount: o.total, requestedAt: new Date().toISOString() } },
      "Refund requested",
      `${reason}${refundNote ? `: ${refundNote}` : ""} · ${formatGHS(o.total)}`
    );
    setRefundNote("");
  };

  const markRefunded = (o: OrderDetails) => {
    if (!o.refund) return;
    updateOrder(
      o.id,
      { refund: { ...o.refund, status: "refunded", refundedAt: new Date().toISOString() } },
      "Refund paid",
      `${formatGHS(o.refund.amount)} returned to ${o.customerName || "customer"} via ${PAYMENT_LABEL[o.paymentMethod]}`
    );
  };

  const setStatus = (o: OrderDetails, status: OrderDetails["status"]) => {
    if (status === o.status) return;
    const label = STATUSES.find((s) => s.value === status)?.label;
    updateOrder(o.id, { status }, "Status changed", `${STATUSES.find((s) => s.value === o.status)?.label} → ${label}`);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      <PageHeader
        icon="orders"
        title="Orders & Refunds"
        text="Every customer, order and action is recorded here for easy tracing."
        action={
          <button
            onClick={exportCsv}
            disabled={orders.length === 0}
            className="btn-gold gap-2 px-5 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        }
      />

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order ID, name or phone"
            aria-label="Search orders"
            className={`${inputClass} !rounded-full pl-11`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["refund", "Needs refund"],
              ["refunded", "Refunded"],
            ] as [Filter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full border px-4 py-2 text-xs font-bold transition-colors focus-ring ${
                filter === key
                  ? "border-brand-gold bg-brand-gold text-brand-forest"
                  : "border-white/15 text-white/75 hover:border-white/35"
              }`}
            >
              {label} · {counts[key]}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-brand-navy-mid px-6 py-14 text-center">
          <Icon name="log" className="mx-auto h-16 w-16" />
          <p className="mt-4 text-base font-bold text-white">{orders.length === 0 ? "No orders yet" : "No matching orders"}</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-white/60">
            {orders.length === 0
              ? "Place a test order on the store (in another tab) and it is recorded here with the customer's details."
              : "Try a different search or filter."}
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {visible.map((o) => (
            <li key={o.id}>
              <button
                onClick={() => open(o)}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-brand-navy-mid p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold/50 focus-ring sm:gap-4 sm:p-5"
              >
                <Icon name={o.refund ? "refund" : "customer"} className="h-11 w-11" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-gold">{o.id}</span>
                    <StatusPill order={o} />
                  </span>
                  <span className="mt-1 block truncate text-sm font-bold text-white">{o.customerName || "No name given"}</span>
                  <span className="block truncate text-xs text-white/55">
                    {o.phone || "No phone"} · {dateTime(o.createdAt)}
                  </span>
                </span>
                <span className="flex-shrink-0 text-right">
                  <span className="block text-base font-extrabold text-white">{formatGHS(o.total)}</span>
                  <span className="mt-0.5 flex items-center justify-end gap-1.5 text-[11px] text-white/50">
                    <Image src={PAYMENT_ICON[o.paymentMethod]} alt="" width={20} height={20} className="h-5 w-5" />
                    {PAYMENT_LABEL[o.paymentMethod]}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-white/40">
        Records last while a browser tab on this site is open. Use Export CSV to keep a copy; a database is needed to
        store them permanently.
      </p>

      {/* Order record */}
      <Modal
        open={order !== null}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={order ? `Order ${order.id}` : ""}
        description={order ? `Placed ${dateTime(order.createdAt)}` : undefined}
        footer={
          order && (
            <>
              <button onClick={() => copySummary(order)} className={secondaryBtn}>
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy summary"}
              </button>
              <button onClick={() => setOpenId(null)} className="btn-gold px-6 py-2.5 text-sm font-bold">
                Done
              </button>
            </>
          )
        }
      >
        {order && (
          <div className="space-y-5">
            {/* Customer */}
            <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-white">
                <Icon name="customer" className="h-7 w-7" />
                Customer
              </h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-white/55">Name</dt>
                  <dd className="text-right font-semibold text-white">{order.customerName || "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="flex items-center gap-1.5 text-white/55">
                    <Phone className="h-3.5 w-3.5" />
                    Phone
                  </dt>
                  <dd className="text-right font-semibold text-white">
                    {order.phone ? (
                      <a href={`tel:${order.phone}`} className="underline decoration-brand-gold underline-offset-4">
                        {order.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="flex items-center gap-1.5 text-white/55">
                    <MapPin className="h-3.5 w-3.5" />
                    Deliver to
                  </dt>
                  <dd className="text-right font-semibold text-white">
                    {[order.deliveryAddress, order.region].filter(Boolean).join(", ") || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-white/55">Payment</dt>
                  <dd className="flex items-center justify-end gap-2 text-right font-semibold text-white">
                    <Image src={PAYMENT_ICON[order.paymentMethod]} alt="" width={28} height={28} className="h-7 w-7" />
                    {PAYMENT_LABEL[order.paymentMethod]}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Items */}
            <section>
              <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-black/20 text-sm">
                {order.items.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="flex items-center gap-3 text-white/85">
                      {(i.image || photoFor(i.size)) && (
                        <Image
                          src={(i.image || photoFor(i.size)) as string}
                          alt=""
                          width={72}
                          height={96}
                          unoptimized={((i.image || photoFor(i.size)) as string).startsWith("data:")}
                          className="h-12 w-9 rounded-lg border border-white/10 bg-black/30 object-contain p-0.5"
                        />
                      )}
                      {i.quantity} × {i.size}
                    </span>
                    <span className="font-semibold text-white">{formatGHS(i.price * i.quantity)}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between px-4 py-2.5 text-white/60">
                  <span>Delivery</span>
                  <span>{formatGHS(order.deliveryFee)}</span>
                </li>
                <li className="flex items-center justify-between px-4 py-3 font-extrabold text-white">
                  <span>Total</span>
                  <span className="text-brand-gold">{formatGHS(order.total)}</span>
                </li>
              </ul>
            </section>

            {/* Status */}
            <Field label="Order status">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
                <Image src={STATUS_ICON[order.status]} alt="" width={36} height={36} className="h-9 w-9" />
                {STATUSES.find((st) => st.value === order.status)?.label}
              </span>
              <select
                value={order.status}
                onChange={(e) => setStatus(order, e.target.value as OrderDetails["status"])}
                className={inputClass}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value} className="bg-brand-navy text-white">
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>

            {/* Refund */}
            <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-white">
                <Icon name="refund" className="h-7 w-7" />
                Refund
              </h3>
              {!order.refund ? (
                <div className="mt-3 space-y-3">
                  <Field label="Reason">
                    <select value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass}>
                      {REFUND_REASONS.map((r) => (
                        <option key={r} value={r} className="bg-brand-navy text-white">
                          {r}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Note (optional)">
                    <input
                      value={refundNote}
                      onChange={(e) => setRefundNote(e.target.value)}
                      placeholder="Anything worth remembering"
                      className={inputClass}
                    />
                  </Field>
                  <button
                    onClick={() => requestRefund(order)}
                    className="inline-flex items-center justify-center rounded-full bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-400 focus-ring"
                  >
                    Request refund of {formatGHS(order.total)}
                  </button>
                </div>
              ) : (
                <div className="mt-3 space-y-3 text-sm">
                  <p className="text-white/80">
                    <StatusPill order={order} /> <span className="ml-1">{formatGHS(order.refund.amount)} · {order.refund.reason}</span>
                  </p>
                  {order.refund.status === "requested" && (
                    <button onClick={() => markRefunded(order)} className="btn-gold px-5 py-2.5 text-sm font-bold">
                      Mark as refunded
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* Log */}
            <section>
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-white">
                <Icon name="log" className="h-7 w-7" />
                Activity log
              </h3>
              <ol className="mt-3 space-y-3 border-l border-white/15 pl-4">
                {[...(order.log ?? [])].reverse().map((l, i) => (
                  <li key={`${l.at}-${i}`} className="relative">
                    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-gold ring-4 ring-brand-navy-mid" />
                    <p className="text-sm font-bold text-white">{l.action}</p>
                    {l.note && <p className="text-xs leading-relaxed text-white/60">{l.note}</p>}
                    <p className="mt-0.5 text-[11px] text-white/40">{dateTime(l.at)}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        )}
      </Modal>
    </div>
  );
}
