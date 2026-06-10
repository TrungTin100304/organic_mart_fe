import { apiRequest, toJsonBody } from "./apiClient";

export type PromotionType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface AdminPromotion {
  id: number;
  code: string;
  name: string;
  description?: string;
  type: PromotionType;
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usageLimitPerUser?: number;
  timesUsed: number;
  active: boolean;
  createdAt: string;
}

export type AdminPromotionInput = Omit<AdminPromotion, "id" | "timesUsed" | "createdAt">;

export const getPromotions = (baseUrl?: string) =>
  apiRequest<AdminPromotion[]>("/admin/promotions", { requireAuth: true }, baseUrl);

export const createPromotion = (input: AdminPromotionInput, baseUrl?: string) =>
  apiRequest<AdminPromotion>("/admin/promotions", {
    method: "POST",
    body: toJsonBody(input),
    requireAuth: true,
  }, baseUrl);

export const updatePromotion = (id: number, input: AdminPromotionInput, baseUrl?: string) =>
  apiRequest<AdminPromotion>(`/admin/promotions/${id}`, {
    method: "PUT",
    body: toJsonBody(input),
    requireAuth: true,
  }, baseUrl);

export const deactivatePromotion = (id: number, baseUrl?: string) =>
  apiRequest<AdminPromotion>(`/admin/promotions/${id}`, {
    method: "DELETE",
    requireAuth: true,
  }, baseUrl);
