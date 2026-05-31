import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Calendar, Download } from "lucide-react";
import StatCards from "../components/StatCards";
import RevenueChart from "../components/RevenueChart";
import OrderStatusChart from "../components/OrderStatusChart";
import { TopProductsChart, CategoryRevenueChart } from "../components/ChartComponents";
import RecentOrders from "../components/RecentOrders";
import LowStockAlert from "../components/LowStockAlert";
import ActivityTimeline from "../components/ActivityTimeline";
import { getCurrentUser } from "../../services/userService";
import { getUsers } from "../../services/adminUserService";
import { getInventoryBatches } from "../../services/inventoryBatchService";
import { DASHBOARD_STATS, ADMIN_USERS } from "../mocks";
import { loadAdminDataWithFallback, sourceLabel, type AdminDataSource } from "../utils/dataSource";
import { getMockInventoryBatches } from "../utils/mockAdapters";
import type { DashboardStats } from "../types";

export default function Dashboard() {
  const [adminName, setAdminName] = useState("Admin");
  const [stats, setStats] = useState<DashboardStats>(DASHBOARD_STATS);
  const [dataSource, setDataSource] = useState<AdminDataSource>("mock");
  const today = new Date().toLocaleDateString("vi-VN");

  useEffect(() => {
    getCurrentUser()
      .then((user) => setAdminName(user.fullName || user.email))
      .catch(() => setAdminName("Admin"));
  }, []);

  useEffect(() => {
    Promise.all([
      loadAdminDataWithFallback(getInventoryBatches, getMockInventoryBatches),
      loadAdminDataWithFallback<Array<{ createdAt?: string }>>(getUsers, () => ADMIN_USERS),
    ]).then(([inventoryResult, userResult]) => {
      const stockByProduct = new Map<number, number>();
      inventoryResult.data.forEach((batch) => {
        stockByProduct.set(
          batch.productId,
          (stockByProduct.get(batch.productId) || 0) + Number(batch.quantityRemaining || 0),
        );
      });

      const now = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      const newUsers =
        userResult.source === "api"
          ? userResult.data.filter((user) => {
              const createdAt = user.createdAt ? new Date(user.createdAt).getTime() : 0;
              return createdAt > 0 && now - createdAt <= sevenDays;
            }).length
          : DASHBOARD_STATS.newUsers;

      setStats({
        ...DASHBOARD_STATS,
        lowStockProducts: [...stockByProduct.values()].filter((stock) => stock > 0 && stock <= 10).length,
        newUsers,
      });
      setDataSource(inventoryResult.source === "api" || userResult.source === "api" ? "api" : "mock");
    });
  }, []);

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Dashboard</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Xin chao, {adminName}! Tong quan hom nay {sourceLabel(dataSource)}.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-outline-variant/30 rounded-xl text-xs font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <Calendar className="w-3.5 h-3.5" /> Hom nay, {today}
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all">
            <Download className="w-3.5 h-3.5" /> Xuat bao cao
          </button>
        </div>
      </motion.div>

      <StatCards data={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <OrderStatusChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopProductsChart />
        <CategoryRevenueChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <div className="space-y-4">
          <LowStockAlert />
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
}
