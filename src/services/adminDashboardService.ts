import { apiRequest } from "./apiClient";
import type { AdminOrderListItem } from "./adminOrderService";

export interface AdminDashboardData {
  todayRevenue: number;
  todayOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  lowStockProducts: number;
  newUsers: number;
  averageOrderValue: number;
  orderStatusCounts: Record<string, number>;
  revenue: Array<{ date: string; revenue: number }>;
  topProducts: Array<{ name: string; sold: number }>;
  categoryRevenue: Array<{ name: string; revenue: number }>;
  recentOrders: AdminOrderListItem[];
}

export const getAdminDashboard = (days = 30, baseUrl?: string) =>
  apiRequest<AdminDashboardData>(
    `/admin/dashboard?days=${days}`,
    { requireAuth: true },
    baseUrl,
  );
