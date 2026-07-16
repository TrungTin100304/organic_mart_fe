import { apiRequest, toJsonBody } from "./apiClient";
import type { DeliveryMethod } from "./deliveryService";

export interface DeliverySetting {
  deliveryType: DeliveryMethod;
  fee: number;
  freeShippingThreshold: number | null;
  estimatedMinutes: number | null;
  displayOrder: number;
  enabled: boolean;
}

export const getAdminDeliverySettings = () =>
  apiRequest<DeliverySetting[]>("/admin/delivery-settings", { requireAuth: true });

export const updateAdminDeliverySetting = (setting: DeliverySetting) =>
  apiRequest<DeliverySetting>(`/admin/delivery-settings/${setting.deliveryType}`, {
    method: "PUT",
    body: toJsonBody({
      fee: setting.fee,
      freeShippingThreshold: setting.freeShippingThreshold,
      estimatedMinutes: setting.estimatedMinutes,
      displayOrder: setting.displayOrder,
      enabled: setting.enabled,
    }),
    requireAuth: true,
  });
