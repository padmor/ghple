import type { OrderDetails } from "@/types/store";

export const PAYMENT_ICON: Record<OrderDetails["paymentMethod"], string> = {
  momo_mtn: "/icons/payment/pay-mtn.svg",
  momo_telecel: "/icons/payment/pay-telecel.svg",
  momo_at: "/icons/payment/pay-airteltigo.svg",
  cash: "/icons/payment/pay-cash.svg",
};

export const STATUS_ICON: Record<OrderDetails["status"], string> = {
  pending_payment: "/icons/track/track-received.svg",
  confirmed: "/icons/track/track-confirmed.svg",
  out_for_delivery: "/icons/track/track-delivery.svg",
  delivered: "/icons/track/track-delivered.svg",
  cancelled: "/icons/track/track-cancelled.svg",
};
