import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Truck, CheckCircle, AlertTriangle, UserPlus, Target, Receipt } from 'lucide-react';
import { DASHBOARD_STATS } from "../mocks";

const stats = [
  { label: 'Doanh thu hôm nay', value: `${(DASHBOARD_STATS.todayRevenue / 1000000).toFixed(1)}M₫`, icon: DollarSign, trend: '+12.5%', up: true, color: 'bg-primary' },
  { label: 'Đơn hàng hôm nay', value: DASHBOARD_STATS.todayOrders, icon: ShoppingCart, trend: '+8.3%', up: true, color: 'bg-secondary' },
  { label: 'Đang xử lý', value: DASHBOARD_STATS.processingOrders, icon: Truck, trend: '-2', up: false, color: 'bg-amber-600' },
  { label: 'Giao thành công', value: DASHBOARD_STATS.deliveredOrders, icon: CheckCircle, trend: '+3', up: true, color: 'bg-emerald-600' },
  { label: 'Sắp hết hàng', value: DASHBOARD_STATS.lowStockProducts, icon: AlertTriangle, trend: '+1', up: false, color: 'bg-red-500' },
  { label: 'Người dùng mới', value: DASHBOARD_STATS.newUsers, icon: UserPlus, trend: '+50%', up: true, color: 'bg-primary-container' },
  { label: 'Tỷ lệ chuyển đổi', value: `${DASHBOARD_STATS.conversionRate}%`, icon: Target, trend: '+0.5%', up: true, color: 'bg-primary' },
  { label: 'Giá trị đơn TB', value: `${(DASHBOARD_STATS.avgOrderValue / 1000).toFixed(0)}K₫`, icon: Receipt, trend: '+5.2%', up: true, color: 'bg-secondary' },
];

export default function StatCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-4 lg:p-5 hover:shadow-md hover:border-primary/10 transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${stat.up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
              {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {stat.trend}
            </span>
          </div>
          <p className="text-2xl lg:text-[28px] font-bold text-on-surface leading-none mb-1">{stat.value}</p>
          <p className="text-xs text-on-surface-variant font-medium">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
