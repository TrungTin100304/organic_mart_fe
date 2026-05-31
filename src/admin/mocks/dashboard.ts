import type { CategoryRevenuePoint, DashboardStats, RevenuePoint } from "../types";

export const REVENUE_7_DAYS: RevenuePoint[] = [
  { date: "T2", revenue: 1250000 },
  { date: "T3", revenue: 1890000 },
  { date: "T4", revenue: 1450000 },
  { date: "T5", revenue: 2100000 },
  { date: "T6", revenue: 1780000 },
  { date: "T7", revenue: 2450000 },
  { date: "CN", revenue: 2800000 },
];

export const REVENUE_BY_CATEGORY: CategoryRevenuePoint[] = [
  { name: "Rau cu", value: 4500000 },
  { name: "Trai cay", value: 3200000 },
  { name: "Sua & do uong", value: 1800000 },
  { name: "Do kho", value: 2100000 },
  { name: "Khac", value: 900000 },
];

export const DASHBOARD_STATS: DashboardStats = {
  todayRevenue: 3250000,
  todayOrders: 18,
  processingOrders: 5,
  deliveredOrders: 12,
  lowStockProducts: 4,
  newUsers: 3,
  conversionRate: 3.2,
  avgOrderValue: 180000,
};
