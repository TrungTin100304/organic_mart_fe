import { apiRequest } from "./apiClient";
import type { PageResponse } from "./adminOrderService";

export interface AdminAuditLog {
  id: number;
  action: string;
  entityType?: string;
  entityId?: number;
  performedById?: number;
  performedByEmail?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export const getAdminAuditLogs = (params: {
  entityType?: string;
  page?: number;
  size?: number;
} = {}) => {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 50));
  if (params.entityType) query.set("entityType", params.entityType);
  return apiRequest<PageResponse<AdminAuditLog>>(`/admin/audit-logs?${query}`, {
    requireAuth: true,
  });
};
