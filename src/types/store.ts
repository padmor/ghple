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
  status: "pending_payment" | "confirmed" | "out_for_delivery" | "delivered";
  createdAt: string;
  /** Every action taken on this order, oldest first, so refunds and disputes can be traced */
  log?: OrderLogEntry[];
  refund?: OrderRefund;
}
