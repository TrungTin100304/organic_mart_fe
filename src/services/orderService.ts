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

export interface ShippingRate {
  providerId: number;
  providerName: string;
  fee: number;
  estimatedDays: string;
}

export interface OrderDetail {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  imageUrl: string;
  batchId: number | null;
  batchCode: string | null;
  quantity: number;
  unit: string;
  priceAtPurchase: number;
  lineSubtotal: number;
}

export interface OrderStatusHistory {
  id: number;
  fromStatus: string | null;
  toStatus: string;
  changedById: number;
  changedByName: string;
  note: string;
  createdAt: string;
}

// Extended Order with all detail fields (returned by /orders/:id)
export interface Order {
  id: number;
  orderCode: string;
  userId: number;
  userFullName: string;
  addressId: number;
  addressLabel: string;
  shippingRecipientSnapshot: string;
  shippingPhoneSnapshot: string;
  shippingAddressSnapshot: string;
  shippingProviderNameSnapshot: string;
  promotion: unknown;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  status: string;
  note: string;
  details: OrderDetail[];
  statusHistories: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
  // Internal delivery
  deliveryMethod?: DeliveryMethod | null;
  deliveryDate?: string | null;
  deliverySlotId?: number | null;
  deliverySlotSnapshot?: string | null;
  buildingCodeSnapshot?: string | null;
  buildingNameSnapshot?: string | null;
  floorSnapshot?: string | null;
  apartmentNumberSnapshot?: string | null;
  recipientNameSnapshot?: string | null;
  recipientPhoneSnapshot?: string | null;
  deliveryNoteSnapshot?: string | null;
}

// Paginated order list response (old style — kept for backwards compat)
export interface OrderListItem {
  id: number;
  orderCode: string;
  userId: number;
  userFullName: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PageInfo {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: { empty: boolean; sorted: boolean; unsorted: boolean };
  unpaged: boolean;
}

export interface PaginatedOrders {
  content: OrderListItem[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: PageInfo;
  size: number;
  sort: { empty: boolean; sorted: boolean; unsorted: boolean };
  totalElements: number;
  totalPages: number;
}

// New-style summary (used by new checkout + account page)
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

export const getShipmentRates = (params: {
  province: string;
  district: string;
  ward: string;
  weightKg: number;
}) => {
  const searchParams = new URLSearchParams({
    province: params.province,
    district: params.district,
    ward: params.ward,
    weightKg: String(params.weightKg),
  });

  return apiRequest<ShippingRate[]>(`/shipments/rates?${searchParams.toString()}`, {
    requireAuth: true,
  });
};

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

export const getOrderDetail = (orderId: number) =>
  apiRequest<Order>(`/orders/${orderId}`, {
    requireAuth: true,
  });
