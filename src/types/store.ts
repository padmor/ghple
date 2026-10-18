export interface Product {
  id: string;
  name: string;
  size: string;
  volumeMl: number;
  price: number;
  description: string;
  badge?: string;
  image?: string;
  inStock: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderLogEntry {
  at: string;
  action: string;
  note?: string;
}

export interface OrderRefund {
  status: "requested" | "refunded";
  reason: string;
  amount: number;
  requestedAt: string;
  refundedAt?: string;
}

/** How the manager is getting the order to the customer. Free text so it fits any situation. */
export interface OrderDelivery {
  method: "rider" | "courier" | "bus" | "other";
  /** Rider or driver name, or the company (for example "Bolt" or "VIP bus, Kumasi station") */
  provider: string;
  /** Phone number, waybill or tracking number */
  contact: string;
  /** For example "Today by 5pm" or "2 to 3 days" */
  eta: string;
  note: string;
}

export interface OrderLocation {
  lat: number;
  lng: number;
  label?: string;
}

export interface OrderDetails {
  id: string;
  customerName: string;
  phone: string;
  region: string;
  deliveryAddress: string;
  paymentMethod: "momo_mtn" | "momo_telecel" | "momo_at" | "cash";
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: "pending_payment" | "confirmed" | "out_for_delivery" | "delivered" | "cancelled";
  /** True once an online payment has been confirmed */
  /** Customer map position. Only the manager receives this. */
  location?: OrderLocation;
  fulfillment?: "delivery" | "pickup";
  delivery?: OrderDelivery;
  paid?: boolean;
  paidAt?: string;
  /** Optional, used for order emails */
  email?: string;
  createdAt: string;
  /** Every action taken on this order, oldest first, so refunds and disputes can be traced */
  log?: OrderLogEntry[];
  refund?: OrderRefund;
}
