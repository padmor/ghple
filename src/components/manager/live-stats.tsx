"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useOrders, type LiveEvent } from "@/context/orders-context";
import { formatGHS } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/manager/ui";
import { PAYMENT_ICON, STATUS_ICON } from "@/components/manager/assets";
import { useManager } from "@/context/manager-context";
import type { OrderDetails } from "@/types/store";

const PAYMENT_LABEL: Record<OrderDetails["paymentMethod"], string> = {
  momo_mtn: "MTN MoMo",
  momo_telecel: "Telecel Cash",
  momo_at: "AirtelTigo Money",
  cash: "Cash on delivery",
};

const STATUS_LABEL: Record<OrderDetails["status"], string> = {
  pending_payment: "Received",
  confirmed: "Confirmed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

const EVENT_COPY: Record<LiveEvent["type"], (e: LiveEvent) => string> = {
  visit: () => "Someone opened the store",
  add_to_cart: (e) => `Added ${e.label ?? "a bottle"} to the cart`,
  checkout: () => "A customer reached checkout",
  order: (e) => `Order ${e.label ?? ""} placed`,
};

const EVENT_ICON: Record<LiveEvent["type"], string> = {
  visit: "visit",
  add_to_cart: "cart",
  checkout: "checkout",
  order: "done",
};

function ago(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

function Bar({
  label,
  value,
  max,
  right,
  image,
  contain,
}: {
  label: string;
  value: number;
  max: number;
  right: string;
  image?: string;
  contain?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {image && (
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/25">
          <Image
            src={image}
            alt=""
            width={88}
            height={88}
            unoptimized={image.startsWith("data:")}
            className={contain ? "h-full w-full object-contain p-1" : "h-full w-full object-cover"}
          />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3 text-xs">
          <span className="truncate font-semibold text-white/85">{label}</span>
          <span className="flex-shrink-0 font-bold text-brand-gold">{right}</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-brand-gold transition-all duration-700"
            style={{ width: `${max > 0 ? Math.max(4, (value / max) * 100) : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function Panel({ title, icon, children, className = "" }: { title: string; icon: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-brand-navy-mid p-5 ${className}`}>
      <h3 className="flex items-center gap-2.5 text-sm font-extrabold text-white">
        <Icon name={icon} className="h-8 w-8" />
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function LiveStats() {
  const { orders, events } = useOrders();
  const { products } = useManager();
  const photoFor = (size: string) => products.find((p) => p.size === size)?.image;

  // Tick every second so "x seconds ago" stays live
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    const revenue = orders.reduce((n, o) => n + o.total, 0);
    const itemsSold = orders.reduce((n, o) => n + o.items.reduce((m, i) => m + i.quantity, 0), 0);

    const byProduct = new Map<string, { qty: number; money: number }>();
    orders.forEach((o) =>
      o.items.forEach((i) => {
        const key = i.size || i.name;
        const cur = byProduct.get(key) ?? { qty: 0, money: 0 };
        byProduct.set(key, { qty: cur.qty + i.quantity, money: cur.money + i.price * i.quantity });
      })
    );

    const byPayment = new Map<string, number>();
    orders.forEach((o) => byPayment.set(o.paymentMethod, (byPayment.get(o.paymentMethod) ?? 0) + 1));

    const byStatus = new Map<string, number>();
    orders.forEach((o) => byStatus.set(o.status, (byStatus.get(o.status) ?? 0) + 1));

    const count = (t: LiveEvent["type"]) => events.filter((e) => e.type === t).length;
    return {
      revenue,
      itemsSold,
      avg: orders.length ? revenue / orders.length : 0,
      products: [...byProduct.entries()].sort((a, b) => b[1].qty - a[1].qty),
      payments: [...byPayment.entries()].sort((a, b) => b[1] - a[1]),
      statuses: [...byStatus.entries()],
      funnel: [
        { label: "Store visits", value: count("visit") },
        { label: "Added to cart", value: count("add_to_cart") },
        { label: "Reached checkout", value: count("checkout") },
        { label: "Orders placed", value: orders.length },
      ],
    };
  }, [orders, events]);

  const KPIS = [
    { label: "Revenue", value: formatGHS(stats.revenue), icon: "revenue" },
    { label: "Orders", value: String(orders.length), icon: "orders" },
    { label: "Bottles sold", value: String(stats.itemsSold), icon: "bottles" },
    { label: "Average order", value: formatGHS(stats.avg), icon: "average" },
  ];

  const funnelMax = Math.max(1, ...stats.funnel.map((f) => f.value));
  const productMax = Math.max(1, ...stats.products.map(([, v]) => v.qty));
  const recentEvents = [...events].reverse().slice(0, 8);
  const lastEvent = events[events.length - 1];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/50">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          Live statistics
        </h2>
        <p className="text-[11px] text-white/45">
          {lastEvent ? `Last activity ${ago(now - lastEvent.at)}` : "Waiting for activity…"}
        </p>
      </div>

      {/* KPIs */}
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPIS.map(({ label, value, icon }) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-brand-navy-mid p-4 sm:p-5">
            <Icon name={icon} className="h-10 w-10" />
            <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-white/50">{label}</p>
            <p className="mt-0.5 truncate text-xl font-extrabold text-white sm:text-2xl">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title="Customer journey" icon="activity">
          <div className="space-y-3.5">
            {stats.funnel.map((f, i) => {
              const prev = i > 0 ? stats.funnel[i - 1].value : 0;
              const rate = i > 0 && prev > 0 ? ` · ${Math.round((f.value / prev) * 100)}%` : "";
              return <Bar key={f.label} label={f.label} value={f.value} max={funnelMax} right={`${f.value}${rate}`} />;
            })}
          </div>
        </Panel>

        <Panel title="Live activity" icon="visit">
          {recentEvents.length === 0 ? (
            <p className="text-sm text-white/55">
              Nothing yet. Open the store in another tab and browse, add a bottle, or place a test order, and it shows
              up here instantly.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {recentEvents.map((e) => {
                return (
                  <li key={e.id} className="flex items-center gap-3 text-sm">
                    <Icon name={EVENT_ICON[e.type]} className="h-8 w-8" />
                    <span className="min-w-0 flex-1 truncate text-white/85">{EVENT_COPY[e.type](e)}</span>
                    <span className="flex-shrink-0 text-[11px] text-white/45">{ago(now - e.at)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Best sellers" icon="trophy">
          {stats.products.length === 0 ? (
            <p className="text-sm text-white/55">Sales by bottle size appear after the first order.</p>
          ) : (
            <div className="space-y-3.5">
              {stats.products.map(([name, v]) => (
                <Bar key={name} label={name} value={v.qty} max={productMax} image={photoFor(name)} contain right={`${v.qty} sold · ${formatGHS(v.money)}`} />
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Payments & delivery" icon="payments">
          {orders.length === 0 ? (
            <p className="text-sm text-white/55">Payment methods and order status appear after the first order.</p>
          ) : (
            <div className="space-y-5">
              <div className="space-y-3.5">
                {stats.payments.map(([m, n]) => (
                  <Bar
                    key={m}
                    label={PAYMENT_LABEL[m as OrderDetails["paymentMethod"]] ?? m}
                    image={PAYMENT_ICON[m as OrderDetails["paymentMethod"]]}
                    value={n}
                    max={orders.length}
                    right={`${n} (${Math.round((n / orders.length) * 100)}%)`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.statuses.map(([s, n]) => (
                  <span key={s} className="inline-flex items-center gap-2 rounded-full bg-brand-gold/15 py-1 pl-1.5 pr-3 text-xs font-bold text-brand-gold">
                    <Image src={STATUS_ICON[s as OrderDetails["status"]]} alt="" width={24} height={24} className="h-6 w-6" />
                    {STATUS_LABEL[s as OrderDetails["status"]]}: {n}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Recent orders" icon="orders" className="mt-3">
        {orders.length === 0 ? (
          <p className="text-sm text-white/55">No orders yet this session.</p>
        ) : (
          <div className="-mx-1 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-widest text-white/45">
                  <th className="px-1 pb-2 font-bold">Order</th>
                  <th className="px-1 pb-2 font-bold">Customer</th>
                  <th className="px-1 pb-2 font-bold">Total</th>
                  <th className="px-1 pb-2 font-bold">Status</th>
                  <th className="px-1 pb-2 text-right font-bold">Placed</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((o) => (
                  <tr key={o.id} className="border-t border-white/10">
                    <td className="px-1 py-2.5 font-mono text-xs font-bold text-brand-gold">{o.id}</td>
                    <td className="px-1 py-2.5 text-white/85">{o.customerName || "—"}</td>
                    <td className="px-1 py-2.5 font-semibold text-white">{formatGHS(o.total)}</td>
                    <td className="px-1 py-2.5 text-white/70">
                      <span className="inline-flex items-center gap-2">
                        <Image src={STATUS_ICON[o.status]} alt="" width={24} height={24} className="h-6 w-6" />
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                    <td className="px-1 py-2.5 text-right text-xs text-white/50">
                      {ago(now - new Date(o.createdAt).getTime())}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {orders.length > 0 && (
        <Link href="/manager/orders" className="mt-3 inline-block text-xs font-bold text-brand-gold underline underline-offset-4">
          Open orders &amp; refunds
        </Link>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-white/40">
        Figures cover this browsing session and update live between open tabs. They reset when every tab is closed,
        because nothing is stored yet.
      </p>
    </div>
  );
}
