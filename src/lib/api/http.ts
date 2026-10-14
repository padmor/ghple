import type { CEOInfo, Product, SiteSettings } from "@/data/defaults";
import type { OrderDetails } from "@/types/store";
import type { LiveEvent, StoreApi } from "./types";

/**
 * Real backend. Every call is plain JSON over HTTPS.
 *
 * Endpoints the server needs (all under NEXT_PUBLIC_API_URL):
 *
 *   Public (storefront)
 *     GET    /products                    -> Product[]
 *     GET    /settings                    -> SiteSettings
 *     GET    /founder                     -> CEOInfo
 *     POST   /orders                      -> OrderDetails   (server issues id, createdAt, log)
 *     GET    /orders/track/:id            -> OrderDetails | 404
 *     POST   /events                      -> 204            { type, label? }
 *     POST   /forms                       -> 204            { kind, fields }
 *
 *   Manager (requires a signed-in session cookie; reject with 401 otherwise)
 *     GET    /orders                      -> OrderDetails[] (newest first)
 *     PATCH  /orders/:id                  -> OrderDetails   { changes, entry } (server appends the log entry)
 *     GET    /events                      -> LiveEvent[]
 *     POST   /products                    -> Product
 *     PATCH  /products/:id                -> Product
 *     DELETE /products/:id                -> 204
 *     PATCH  /settings                    -> SiteSettings
 *     PATCH  /founder                     -> CEOInfo
 *
 * Money amounts are in GHS. Dates are ISO-8601 strings.
 */
export function createHttpApi(baseUrl: string): StoreApi {
  const base = baseUrl.replace(/\/$/, "");

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${base}${path}`, {
      credentials: "include",
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
      // Signed out (for example the session ran out): go back to the login page
      if (res.status === 401 && typeof window !== "undefined" && window.location.pathname.startsWith("/manager")) {
        window.location.href = "/manager/login";
      }
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      const error = new Error(body?.error ?? `Request failed: ${res.status}`) as Error & { status: number };
      error.status = res.status;
      throw error;
    }
    return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
  }

  const send = (method: string, body?: unknown): RequestInit => ({
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  // Without websockets, the manager refreshes by polling while it is open
  const listeners = new Set<() => void>();
  let timer: ReturnType<typeof setInterval> | null = null;
  const POLL_MS = 30000;

  return {
    isLocal: false,

    orders: {
      list: () => request<OrderDetails[]>("/orders"),
      create: (order) => request<OrderDetails>("/orders", send("POST", order)),
      update: (id, changes, entry) =>
        request<OrderDetails>(`/orders/${encodeURIComponent(id)}`, send("PATCH", { changes, entry })),
      track: async (id) => {
        try {
          return await request<OrderDetails>(`/orders/track/${encodeURIComponent(id.trim())}`);
        } catch (e) {
          if ((e as { status?: number }).status === 404) return null;
          throw e;
        }
      },
      cancel: (id, phone) =>
        request<OrderDetails>(`/orders/track/${encodeURIComponent(id.trim())}/cancel`, send("POST", { phone })),
    },

    payments: {
      start: async (orderId) => {
        try {
          const r = await request<{ url: string }>("/payments/initialize", send("POST", { id: orderId }));
          return r.url;
        } catch (e) {
          // 503 means online payment isn't switched on: carry on as a normal order
          if ((e as { status?: number }).status === 503) return null;
          throw e;
        }
      },
      verify: async (orderId) => {
        try {
          const r = await request<{ paid: boolean }>(`/payments/verify?id=${encodeURIComponent(orderId)}`);
          return r.paid;
        } catch {
          return false;
        }
      },
    },

    images: {
      upload: async (file) => {
        const res = await fetch(`${base}/images`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": file.type || "image/jpeg" },
          body: file,
        });
        if (res.status === 401 && typeof window !== "undefined") window.location.href = "/manager/login";
        const body = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
        if (!res.ok || !body?.url) throw new Error(body?.error ?? "Upload failed");
        return body.url;
      },
    },

    events: {
      list: () => request<LiveEvent[]>("/events"),
      track: (type, label) => request<void>("/events", send("POST", { type, label })).catch(() => undefined),
    },

    products: {
      list: () => request<Product[]>("/products"),
      create: (p) => request<Product>("/products", send("POST", p)),
      update: (id, changes) => request<Product>(`/products/${encodeURIComponent(id)}`, send("PATCH", changes)),
      remove: (id) => request<void>(`/products/${encodeURIComponent(id)}`, send("DELETE")),
    },

    settings: {
      get: () => request<SiteSettings>("/settings"),
      update: (changes) => request<SiteSettings>("/settings", send("PATCH", changes)),
    },

    founder: {
      get: () => request<CEOInfo>("/founder"),
      update: (changes) => request<CEOInfo>("/founder", send("PATCH", changes)),
    },

    forms: {
      submit: (submission) => request<void>("/forms", send("POST", submission)),
    },

    onChange(listener) {
      listeners.add(listener);
      if (!timer) {
        timer = setInterval(() => {
          // Nobody is looking at a hidden tab, so don't spend requests on it
          if (typeof document !== "undefined" && document.hidden) return;
          listeners.forEach((l) => l());
        }, POLL_MS);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && timer) {
          clearInterval(timer);
          timer = null;
        }
      };
    },
  };
}
