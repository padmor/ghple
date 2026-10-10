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
}
