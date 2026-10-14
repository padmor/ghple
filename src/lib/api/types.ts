import type { CEOInfo, Product, SiteSettings } from "@/data/defaults";
import type { OrderDetails, OrderLogEntry } from "@/types/store";

/** Something a visitor did on the storefront, shown live on the manager dashboard. */
export type LiveEventType = "visit" | "add_to_cart" | "checkout" | "order";

export interface LiveEvent {
  id: string;
  type: LiveEventType;
  at: number;
  label?: string;
}

export type FormKind = "feedback" | "application";

export interface FormSubmission {
  kind: FormKind;
  fields: Record<string, string>;
}

/**
 * The one contract between this frontend and any backend.
 *
 * - `local.ts` implements it in the browser (nothing saved).
 * - `http.ts` implements it with fetch calls to a real server.
 *
 * To go live: build the endpoints listed in `http.ts`, then set NEXT_PUBLIC_API_URL.
 * No component needs to change.
 */
export interface StoreApi {
  /** True while running on the in-browser store instead of a real server. */
  readonly isLocal: boolean;

  orders: {
    /** Manager only. Newest first. */
    list(): Promise<OrderDetails[]>;
    /** Storefront checkout. The server issues the real order ID. */
    create(order: Omit<OrderDetails, "id" | "createdAt" | "log">): Promise<OrderDetails>;
    /** Manager only. Status changes, refunds. Every call appends a log entry. */
    update(id: string, changes: Partial<OrderDetails>, entry: Omit<OrderLogEntry, "at">): Promise<OrderDetails>;
    /** Public lookup by order ID for the Track page. Returns null when not found. */
    track(id: string): Promise<OrderDetails | null>;
    /** Customer cancels their own unpaid order; the phone number used at checkout proves it is theirs. */
    cancel(id: string, phone: string): Promise<OrderDetails>;
  };

  payments: {
    /** Starts an online payment. Returns the page to send the customer to, or null when online payment is off. */
    start(orderId: string): Promise<string | null>;
    /** After the customer returns: has the payment gone through? */
    verify(orderId: string): Promise<boolean>;
  };

  images: {
    /** Manager only. Stores a photo and returns the address to save on the product. */
    upload(file: Blob): Promise<string>;
  };

  events: {
    /** Manager only. */
    list(): Promise<LiveEvent[]>;
    /** Fire and forget from the storefront. */
    track(type: LiveEventType, label?: string): Promise<void>;
  };

  products: {
    list(): Promise<Product[]>;
    create(product: Omit<Product, "id">): Promise<Product>;
    update(id: string, changes: Partial<Product>): Promise<Product>;
    remove(id: string): Promise<void>;
  };

  settings: {
    get(): Promise<SiteSettings>;
    update(changes: Partial<SiteSettings>): Promise<SiteSettings>;
  };

  founder: {
    get(): Promise<CEOInfo>;
    update(changes: Partial<CEOInfo>): Promise<CEOInfo>;
  };

  forms: {
    /** Feedback and job applications. */
    submit(submission: FormSubmission): Promise<void>;
  };

  /** Called when data changed somewhere else (another tab, or the server). Returns an unsubscribe function. */
  onChange(listener: () => void): () => void;
}
