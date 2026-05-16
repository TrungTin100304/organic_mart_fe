import { motion } from 'motion/react';
import { Calendar, Download } from 'lucide-react';
import StatCards from '../components/StatCards';
import RevenueChart from '../components/RevenueChart';
import OrderStatusChart from '../components/OrderStatusChart';
import { TopProductsChart, CategoryRevenueChart } from '../components/ChartComponents';
import RecentOrders from '../components/RecentOrders';
import LowStockAlert from '../components/LowStockAlert';
import ActivityTimeline from '../components/ActivityTimeline';

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Dashboard</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Xin chào, Quang Huy! Đây là tổng quan hôm nay.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-outline-variant/30 rounded-xl text-xs font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <Calendar className="w-3.5 h-3.5" /> Hôm nay, 16/05/2025
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all">
            <Download className="w-3.5 h-3.5" /> Xuất báo cáo
          </button>
        </div>
      </motion.div>

      {/* KPI Stats */}
      <StatCards />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <OrderStatusChart />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopProductsChart />
        <CategoryRevenueChart />
      </div>

      {/* Tables & Alerts */}
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
