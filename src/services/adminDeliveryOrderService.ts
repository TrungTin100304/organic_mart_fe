import { apiRequest } from "./apiClient";
import type { DeliveryMethod } from "./orderService";

export interface DeliveryOrder {
  id: number;
  orderCode: string;
  status: string;
  deliveryMethod: DeliveryMethod;
  deliveryDate?: string;
  deliverySlotSnapshot?: string;
  buildingCodeSnapshot?: string;
  buildingNameSnapshot?: string;
  floorSnapshot?: string;
  apartmentNumberSnapshot?: string;
  recipientNameSnapshot?: string;
  recipientPhoneSnapshot?: string;
  deliveryNoteSnapshot?: string;
  totalAmount: number;
  createdAt: string;
  customerName?: string;
}

export const getDeliveryOrders = (params?: {
  status?: string;
  deliveryMethod?: DeliveryMethod;
  deliveryDate?: string;
  buildingCode?: string;
  page?: number;
  size?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.deliveryMethod) searchParams.set("deliveryMethod", params.deliveryMethod);
  if (params?.deliveryDate) searchParams.set("deliveryDate", params.deliveryDate);
  if (params?.buildingCode) searchParams.set("buildingCode", params.buildingCode);
  if (params?.page !== undefined) searchParams.set("page", String(params.page));
  if (params?.size !== undefined) searchParams.set("size", String(params.size));

  const query = searchParams.toString();
  return apiRequest<{ content: DeliveryOrder[]; totalElements: number; totalPages: number; size: number; number: number }>(
    `/admin/delivery-orders${query ? `?${query}` : ""}`,
    { requireAuth: true }
  );
};
