import { apiRequest, toJsonBody } from "./apiClient";
export type PaymentStatus = "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";
export type DeliveryMethod = "STANDARD" | "EXPRESS" | "SCHEDULED";
export interface VietQrPayment {
  id: number;
  amount: number;
  status: PaymentStatus;
  transferCode: string;
  qrUrl: string;
  bankId: string;
  accountNo: string;
  accountName: string;
  expiresAt: string;
  paidAt: string | null;
  orderId: number | null;
  orderCode: string | null;
}
export const isSepayDemoEnabled = (value?: string): boolean => value === "true";
export const createVietQrPayment = (
  addressId: string | number,
  deliveryMethod: DeliveryMethod,
  deliveryDate?: string,
  deliverySlotId?: number,
  promotionCode?: string
) =>
  apiRequest<VietQrPayment>("/payments/vietqr", {
    method: "POST",
    body: toJsonBody({
      addressId: Number(addressId),
      deliveryMethod,
      deliveryDate: deliveryDate || null,
      deliverySlotId: deliverySlotId || null,
      promotionCode: promotionCode?.trim() || null,
    }),
    requireAuth: true,
  });
export const getVietQrPayment = (id: string | number) =>
  apiRequest<VietQrPayment>("/payments/vietqr/" + String(id), { requireAuth: true });
export const completeVietQrOrder = (paymentId: string | number) =>
  apiRequest<OrderResponse | null>("/payments/vietqr/" + String(paymentId) + "/complete-order", {
    method: "POST",
    requireAuth: true,
  });
export type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "READY_FOR_DELIVERY" | "DELIVERING" | "DELIVERED" | "CANCELLED" | "REFUNDED";
export interface OrderDetailResponse {
  id: number; productId: number; productName: string; productSlug: string | null;
  imageUrl: string | null; batchId: number | null; batchCode: string | null;
  quantity: number; unit: string | null; priceAtPurchase: number; lineSubtotal: number;
}
export interface OrderStatusHistoryResponse {
  id: number; fromStatus: OrderStatus | null; toStatus: OrderStatus;
  changedById: number; changedByName: string; note: string | null; createdAt: string;
}
export interface OrderResponse {
  id: number; orderCode: string; userId: number; userFullName: string;
  addressId: number; addressLabel: string | null;
  shippingRecipientSnapshot: string; shippingPhoneSnapshot: string;
  shippingAddressSnapshot: string; shippingProviderNameSnapshot: string;
  promotion: { id: number; code: string; type: string; value: number; } | null;
  subtotal: number; discountAmount: number; shippingFee: number; totalAmount: number;
  status: OrderStatus; note: string | null;
  details: OrderDetailResponse[]; statusHistories: OrderStatusHistoryResponse[];
  createdAt: string; updatedAt: string;
  // Internal delivery
  deliveryMethod: DeliveryMethod | null;
  deliveryDate: string | null;
  deliverySlotId: number | null;
  deliverySlotSnapshot: string | null;
  buildingCodeSnapshot: string | null;
  buildingNameSnapshot: string | null;
  floorSnapshot: string | null;
  apartmentNumberSnapshot: string | null;
  recipientNameSnapshot: string | null;
  recipientPhoneSnapshot: string | null;
  deliveryNoteSnapshot: string | null;
}
