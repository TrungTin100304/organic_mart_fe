import { apiRequest, toJsonBody } from "./apiClient";
import type { DeliveryMethod, OrderStatus } from "./orderService";

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AdminOrderListItem {
  id: number;
  orderCode: string;
  userId?: number;
  userFullName?: string;
  status: OrderStatus;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminOrderDetail {
  id: number;
  orderCode: string;
  userId?: number;
  userFullName?: string;
  shippingRecipientSnapshot?: string;
  shippingPhoneSnapshot?: string;
  shippingAddressSnapshot?: string;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  note?: string;
  details: Array<{
    id: number;
    productName?: string;
    imageUrl?: string;
    quantity: number;
    unit?: string;
    priceAtPurchase: number;
    lineSubtotal: number;
  }>;
  statusHistories: Array<{
    id: number;
    fromStatus?: OrderStatus;
    toStatus: OrderStatus;
    changedByName?: string;
    note?: string;
    createdAt: string;
  }>;
  createdAt: string;
  deliveryMethod?: DeliveryMethod;
}

export const getAdminOrders = (
  params: { page?: number; size?: number; status?: OrderStatus } = {},
  baseUrl?: string,
) => {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.size !== undefined) search.set("size", String(params.size));
  if (params.status) search.set("status", params.status);
  const query = search.toString();

  return apiRequest<PageResponse<AdminOrderListItem>>(
    `/orders${query ? `?${query}` : ""}`,
    { requireAuth: true },
    baseUrl,
  );
};

export const getAdminOrderById = (id: number, baseUrl?: string) =>
  apiRequest<AdminOrderDetail>(`/orders/${id}`, { requireAuth: true }, baseUrl);

export const updateAdminOrderStatus = (
  id: number,
  status: OrderStatus,
  note?: string,
  baseUrl?: string,
) =>
  apiRequest<AdminOrderDetail>(
    `/orders/${id}/status`,
    {
      method: "PATCH",
      body: toJsonBody({ status, note }),
      requireAuth: true,
    },
    baseUrl,
  );
