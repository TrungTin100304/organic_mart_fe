import { apiRequest, toJsonBody } from "./apiClient";

export interface DeliverySlot {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  cutoffMinutes: number;
  maximumOrders: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getAllDeliverySlots = () =>
  apiRequest<DeliverySlot[]>("/admin/delivery-slots", { requireAuth: true });

export const createDeliverySlot = (data: Omit<DeliverySlot, "id" | "createdAt" | "updatedAt">) =>
  apiRequest<DeliverySlot>("/admin/delivery-slots", {
    method: "POST",
    body: toJsonBody(data),
    requireAuth: true,
  });

export const updateDeliverySlot = (id: number, data: Omit<DeliverySlot, "id" | "createdAt" | "updatedAt">) =>
  apiRequest<DeliverySlot>(`/admin/delivery-slots/${id}`, {
    method: "PUT",
    body: toJsonBody(data),
    requireAuth: true,
  });

export const toggleDeliverySlotStatus = (id: number, isActive: boolean) =>
  apiRequest<DeliverySlot>(`/admin/delivery-slots/${id}/status`, {
    method: "PATCH",
    body: toJsonBody({ isActive }),
    requireAuth: true,
  });
