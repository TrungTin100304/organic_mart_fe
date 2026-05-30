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

export default function Dashboard() {
  const [adminName, setAdminName] = useState("Admin");
  const today = new Date().toLocaleDateString("vi-VN");

  useEffect(() => {
    getCurrentUser()
      .then((user) => setAdminName(user.fullName || user.email))
      .catch(() => setAdminName("Admin"));
  }, []);

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Dashboard</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Xin chao, {adminName}! Day la tong quan hom nay.</p>
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

      <StatCards />

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
