import {
  DEFAULT_CEO,
  DEFAULT_PRODUCTS,
  DEFAULT_SETTINGS,
  type CEOInfo,
  type Product,
  type SiteSettings,
} from "@/data/defaults";
import type { OrderDetails } from "@/types/store";
import type { FormSubmission, LiveEvent, LiveEventType, StoreApi } from "./types";

/**
 * Built-in store that lives in the browser, used until a real backend is connected.
 * Nothing is saved: closing every tab clears it.
 * Orders and activity are shared live between open tabs of this site, so the storefront
 * in one tab updates the manager in another.
 */

const MAX_EVENTS = 500;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

let orders: OrderDetails[] = [];
let events: LiveEvent[] = [];
let products: Product[] = DEFAULT_PRODUCTS.map((p) => ({ ...p }));
let settings: SiteSettings = { ...DEFAULT_SETTINGS };
let founder: CEOInfo = { ...DEFAULT_CEO };

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

type Message =
  | { t: "order"; order: OrderDetails }
  | { t: "event"; event: LiveEvent }
  | { t: "hello" }
  | { t: "sync"; orders: OrderDetails[]; events: LiveEvent[] };

const logLength = (o: OrderDetails) => o.log?.length ?? 0;

// Same order seen twice: keep the copy with the longer history
function mergeOrders(incoming: OrderDetails[]) {
  const map = new Map(orders.map((o) => [o.id, o]));
  let changed = false;
  incoming.forEach((o) => {
    const cur = map.get(o.id);
    if (!cur || logLength(o) > logLength(cur)) {
      map.set(o.id, o);
      changed = true;
    }
  });
  if (changed) orders = [...map.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return changed;
}

function mergeEvents(incoming: LiveEvent[]) {
  const ids = new Set(events.map((e) => e.id));
  const extra = incoming.filter((e) => !ids.has(e.id));
  if (extra.length) events = [...events, ...extra].sort((a, b) => a.at - b.at).slice(-MAX_EVENTS);
  return extra.length > 0;
}

let channel: BroadcastChannel | null = null;

function ensureChannel() {
  if (channel || typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;
  channel = new BroadcastChannel("gbhpl-live");
  channel.onmessage = (e: MessageEvent<Message>) => {
    const msg = e.data;
    let changed = false;
    if (msg.t === "order") changed = mergeOrders([msg.order]);
    else if (msg.t === "event") changed = mergeEvents([msg.event]);
    else if (msg.t === "sync") changed = mergeOrders(msg.orders) || mergeEvents(msg.events);
    else if (msg.t === "hello" && (orders.length || events.length)) {
      channel?.postMessage({ t: "sync", orders, events } satisfies Message);
    }
    if (changed) notify();
  };
  // Ask any other open tab for what it already knows
  channel.postMessage({ t: "hello" } satisfies Message);
}

const wait = <T,>(value: T, ms = 350) => new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

function mailto(subject: string, body: string) {
  window.location.href = `mailto:hello@gbhpl.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export const localApi: StoreApi = {
  isLocal: true,

  orders: {
    async list() {
      ensureChannel();
      return orders;
    },
    async create(input) {
      ensureChannel();
      const order: OrderDetails = {
        ...input,
        id: `GBH-${Date.now().toString(36).toUpperCase()}`,
        createdAt: new Date().toISOString(),
        log: [
          {
            at: new Date().toISOString(),
            action: "Order placed",
            note: `${input.customerName || "Customer"} · ${input.phone || "no phone"} · ${input.paymentMethod}`,
          },
        ],
      };
      mergeOrders([order]);
      channel?.postMessage({ t: "order", order } satisfies Message);
      const event: LiveEvent = { id: uid("ev"), type: "order", at: Date.now(), label: order.id };
      mergeEvents([event]);
      channel?.postMessage({ t: "event", event } satisfies Message);
      notify();
      return wait(order);
    },
    async update(id, changes, entry) {
      const current = orders.find((o) => o.id === id);
      if (!current) throw new Error("Order not found");
      const order: OrderDetails = {
        ...current,
        ...changes,
        log: [...(current.log ?? []), { at: new Date().toISOString(), ...entry }],
      };
      mergeOrders([order]);
      channel?.postMessage({ t: "order", order } satisfies Message);
      notify();
      return order;
    },
    async track(id) {
      ensureChannel();
      const q = id.trim().toLowerCase();
      return wait(orders.find((o) => o.id.toLowerCase() === q) ?? null, 250);
    },
    async cancel(): Promise<OrderDetails> {
      throw new Error("Cancelling needs the live server.");
    },
  },

  events: {
    async list() {
      ensureChannel();
      return events;
    },
    async track(type: LiveEventType, label?: string) {
      ensureChannel();
      const event: LiveEvent = { id: uid("ev"), type, at: Date.now(), label };
      mergeEvents([event]);
      channel?.postMessage({ t: "event", event } satisfies Message);
      notify();
    },
  },

  products: {
    async list() {
      return products;
    },
    async create(p) {
      const product: Product = { ...p, id: uid("prod") };
      products = [...products, product];
      notify();
      return product;
    },
    async update(id, changes) {
      products = products.map((p) => (p.id === id ? { ...p, ...changes } : p));
      notify();
      return products.find((p) => p.id === id) as Product;
    },
    async remove(id) {
      products = products.filter((p) => p.id !== id);
      notify();
    },
  },

  settings: {
    async get() {
      return settings;
    },
    async update(changes) {
      settings = { ...settings, ...changes };
      notify();
      return settings;
    },
  },

  founder: {
    async get() {
      return founder;
    },
    async update(changes) {
      founder = { ...founder, ...changes };
      notify();
      return founder;
    },
  },

  payments: {
    async start() {
      return null;
    },
    async verify() {
      return false;
    },
  },

  images: {
    upload: (file: Blob) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read that file"));
        reader.readAsDataURL(file);
      }),
  },

  forms: {
    async submit({ kind, fields }: FormSubmission) {
      // No server yet: hand the message to the visitor's email app
      if (kind === "feedback") {
        mailto(
          `Feedback: ${fields.rating}/5 stars`,
          [`Rating: ${fields.rating}/5`, `Name: ${fields.name}`, "", fields.comment].join("\n")
        );
      } else {
        mailto(
          `Application: ${fields.role}`,
          [`Name: ${fields.name}`, `Email: ${fields.email}`, `Phone: ${fields.phone}`, `Role: ${fields.role}`, "", fields.message].join("\n")
        );
      }
      await wait(undefined, 400);
    },
  },

  onChange(listener) {
    ensureChannel();
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
