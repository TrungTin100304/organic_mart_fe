import { apiRequest, toJsonBody } from "./apiClient";

export type DeliveryMethod = "STANDARD" | "EXPRESS" | "SCHEDULED";
export type OrderStatus =
  | "PENDING" | "CONFIRMED" | "PREPARING" | "READY_FOR_DELIVERY" | "DELIVERING"
  | "DELIVERED" | "CANCELLED" | "REFUNDED";

export interface CreateOrderItem {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  addressId: number;
  promotionCode?: string;
  note?: string;
  items: CreateOrderItem[];
  // Internal delivery
  deliveryMethod: DeliveryMethod;
  deliveryDate?: string;
  deliverySlotId?: number;
}

export interface Order {
  id: number;
  orderCode: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt?: string;
}

export interface UserOrderSummary {
  id: number;
  orderCode: string;
  status: OrderStatus;
  paymentMethod: "COD" | "VIETQR";
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const createOrder = (data: CreateOrderRequest) =>
  apiRequest<Order>("/orders", {
    method: "POST",
    body: toJsonBody(data),
    requireAuth: true,
  });

export const getMyOrders = (
  params: { page?: number; size?: number } = {},
  baseUrl?: string,
) => {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 10));

  return apiRequest<OrderPage<UserOrderSummary>>(
    `/orders/me?${query}`,
    { requireAuth: true },
    baseUrl,
  );
};
