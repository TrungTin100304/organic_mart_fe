import { apiRequest, toJsonBody } from "./apiClient";

export interface ShippingRate {
  providerId: number;
  providerName: string;
  fee: number;
  estimatedDays: string;
}

export interface OrderItemPayload {
  productId: number;
  quantity: number;
}

export interface CreateOrderPayload {
  addressId: number;
  shippingProviderId: number;
  shippingFee: number;
  promotionCode: string;
  note: string;
  items: OrderItemPayload[];
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

export const createOrder = (payload: CreateOrderPayload) =>
  apiRequest<Order>("/orders", {
    method: "POST",
    body: toJsonBody(payload),
    requireAuth: true,
  });
