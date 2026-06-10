import { apiRequest } from "./apiClient";
import type { DeliveryMethod } from "./orderService";
import type { PageResponse } from "./adminOrderService";

export type PaymentAuditStatus = "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";
export type WebhookAuditStatus = "RECEIVED" | "PROCESSED" | "REJECTED";

export interface PaymentAuditItem {
  id: number;
  userId?: number;
  userName?: string;
  transferCode: string;
  transactionId?: string;
  status: PaymentAuditStatus;
  subtotal: number;
  shippingFee: number;
  amount: number;
  orderId?: number;
  orderCode?: string;
  deliveryMethod?: DeliveryMethod;
  buildingCode?: string;
  apartmentNumber?: string;
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
}

export interface WebhookAuditItem {
  id: number;
  sepayTransactionId: string;
  referenceCode?: string;
  transferCode?: string;
  transferAmount: number;
  transferType?: string;
  gateway?: string;
  status: WebhookAuditStatus;
  rejectionReason?: string;
  processedAt?: string;
  createdAt: string;
}

const queryString = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const getPaymentAudit = (
  params: { status?: PaymentAuditStatus | ""; search?: string; page?: number; size?: number } = {},
  baseUrl?: string,
) =>
  apiRequest<PageResponse<PaymentAuditItem>>(
    `/admin/payment-audit/payments${queryString(params)}`,
    { requireAuth: true },
    baseUrl,
  );

export const getWebhookAudit = (
  params: { status?: WebhookAuditStatus | ""; search?: string; page?: number; size?: number } = {},
  baseUrl?: string,
) =>
  apiRequest<PageResponse<WebhookAuditItem>>(
    `/admin/payment-audit/webhooks${queryString(params)}`,
    { requireAuth: true },
    baseUrl,
  );
