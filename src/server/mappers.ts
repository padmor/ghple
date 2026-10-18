import type { CEOInfo, Product, SiteSettings } from "@/data/defaults";
import type { OrderDetails, OrderLogEntry, OrderRefund } from "@/types/store";

type Row = Record<string, unknown>;

const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : String(v));

export const toProduct = (r: Row): Product => ({
  id: String(r.id),
  name: String(r.name),
  size: String(r.size),
  volumeMl: Number(r.volume_ml),
  price: Number(r.price),
  description: String(r.description ?? ""),
  badge: r.badge ? String(r.badge) : undefined,
  image: r.image ? String(r.image) : undefined,
  inStock: Boolean(r.in_stock),
});

export const toSettings = (r: Row): SiteSettings => ({
  tradeEmail: String(r.trade_email ?? ""),
  whatsappNumber: String(r.whatsapp_number ?? ""),
  phone: String(r.phone ?? ""),
  phone2: String(r.phone2 ?? ""),
  deliveryFee: r.delivery_fee == null ? 20 : Number(r.delivery_fee),
  address: String(r.address ?? ""),
});

export const toFounder = (r: Row): CEOInfo => ({
  name: String(r.name ?? ""),
  title: String(r.title ?? ""),
  bio: String(r.bio ?? ""),
  quote: String(r.quote ?? ""),
  photoPath: String(r.photo_path ?? ""),
});

export const toLogEntry = (r: Row): OrderLogEntry => ({
  at: iso(r.at),
  action: String(r.action),
  note: r.note ? String(r.note) : undefined,
});

export const toOrder = (r: Row, log: OrderLogEntry[] = []): OrderDetails => ({
  id: String(r.id),
  customerName: String(r.customer_name ?? ""),
  phone: String(r.phone ?? ""),
  region: String(r.region ?? ""),
  deliveryAddress: String(r.delivery_address ?? ""),
  paymentMethod: r.payment_method as OrderDetails["paymentMethod"],
  items: r.items as OrderDetails["items"],
  subtotal: Number(r.subtotal),
  deliveryFee: Number(r.delivery_fee),
  total: Number(r.total),
  status: r.status as OrderDetails["status"],
  location: (r.location as OrderDetails["location"] | null) ?? undefined,
  fulfillment: (r.fulfillment as OrderDetails["fulfillment"]) ?? "delivery",
  delivery: (r.delivery as OrderDetails["delivery"] | null) ?? undefined,
  paid: Boolean(r.paid_at),
  paymentStarted: Boolean(r.payment_ref),
  paidAt: r.paid_at ? iso(r.paid_at) : undefined,
  email: String(r.email ?? ""),
  refund: (r.refund as OrderRefund | null) ?? undefined,
  createdAt: iso(r.created_at),
  log,
});

/** What a stranger who knows an order ID may see: no full phone number or street address. */
export function publicOrder(o: OrderDetails): OrderDetails {
  const digits = o.phone.replace(/\D/g, "");
  return {
    ...o,
    customerName: o.customerName.split(" ")[0] ?? "",
    phone: digits.length >= 3 ? `•••• ${digits.slice(-3)}` : "",
    deliveryAddress: "",
    location: undefined,
    email: "",
    paidAt: undefined,
    log: [],
    refund: undefined,
  };
}
