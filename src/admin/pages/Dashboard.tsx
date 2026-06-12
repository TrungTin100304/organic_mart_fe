import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Download, Receipt, ShoppingCart, Truck, UserPlus } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAdminDashboard, type AdminDashboardData } from "../../services/adminDashboardService";
import { downloadDashboardReport } from "../utils/dashboardReport";

const money = (value: number) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;
const emptyDashboard: AdminDashboardData = {
  todayRevenue: 0,
  todayOrders: 0,
  processingOrders: 0,
  deliveredOrders: 0,
  lowStockProducts: 0,
  newUsers: 0,
  averageOrderValue: 0,
  orderStatusCounts: {},
  revenue: [],
  topProducts: [],
  categoryRevenue: [],
  recentOrders: [],
};

const statusColors: Record<string, string> = {
  PENDING: "#d97706",
  CONFIRMED: "#2563eb",
  PREPARING: "#7c3aed",
  READY_FOR_DELIVERY: "#0891b2",
  DELIVERING: "#ea580c",
  DELIVERED: "#16a34a",
  CANCELLED: "#dc2626",
  REFUNDED: "#64748b",
};

export default function Dashboard() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AdminDashboardData>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setData(await getAdminDashboard(days));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dashboard.");
      setData(emptyDashboard);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [days]);

  const statusData = Object.entries(data.orderStatusCounts).map(([name, value]) => ({
    name,
    value,
    color: statusColors[name] || "#64748b",
  }));
  const stats = [
    { label: "Doanh thu hôm nay", value: money(data.todayRevenue), icon: Receipt },
    { label: "Đơn hàng hôm nay", value: data.todayOrders, icon: ShoppingCart },
    { label: "Đang xử lý", value: data.processingOrders, icon: Truck },
    { label: "Đã giao", value: data.deliveredOrders, icon: CheckCircle },
    { label: "Sắp hết hàng", value: data.lowStockProducts, icon: AlertTriangle },
    { label: "Người dùng mới 7 ngày", value: data.newUsers, icon: UserPlus },
    { label: "Giá trị đơn trung bình", value: money(data.averageOrderValue), icon: Receipt },
  ];

  const exportCsv = () => {
    downloadDashboardReport(data, days);
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><h1 className="text-xl font-bold text-on-surface lg:text-2xl">Dashboard</h1><p className="text-sm text-on-surface-variant">Số liệu thật từ backend, cập nhật theo phạm vi đã chọn.</p></div>
        <div className="flex gap-2"><select value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded-xl border border-outline-variant/30 bg-white px-3 py-2 text-sm"><option value={7}>7 ngày</option><option value={30}>30 ngày</option><option value={90}>90 ngày</option></select><button onClick={exportCsv} disabled={!data.revenue.length} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-40"><Download className="h-4 w-4" /> Xuất CSV</button></div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
      {loading && <p className="text-sm text-on-surface-variant">Đang tải số liệu...</p>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{stats.map((stat) => <div key={stat.label} className="rounded-2xl border border-outline-variant/20 bg-white p-4"><div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white"><stat.icon className="h-4 w-4" /></div><p className="text-2xl font-bold">{stat.value}</p><p className="text-xs text-on-surface-variant">{stat.label}</p></div>)}</div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-outline-variant/20 bg-white p-5 lg:col-span-2"><h2 className="mb-4 font-bold">Doanh thu {days} ngày</h2><ResponsiveContainer width="100%" height={280}><AreaChart data={data.revenue}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis tickFormatter={(value) => `${Number(value) / 1_000_000}M`} /><Tooltip formatter={(value) => money(Number(value))} /><Area dataKey="revenue" stroke="#486800" fill="#80b40033" /></AreaChart></ResponsiveContainer></div>
        <div className="rounded-2xl border border-outline-variant/20 bg-white p-5"><h2 className="mb-4 font-bold">Trạng thái đơn hàng</h2><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>{statusData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-outline-variant/20 bg-white p-5"><h2 className="mb-4 font-bold">Sản phẩm bán chạy</h2><ResponsiveContainer width="100%" height={260}><BarChart data={data.topProducts} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="sold" fill="#80b400" /></BarChart></ResponsiveContainer></div>
        <div className="rounded-2xl border border-outline-variant/20 bg-white p-5"><h2 className="mb-4 font-bold">Doanh thu theo danh mục</h2><ResponsiveContainer width="100%" height={260}><BarChart data={data.categoryRevenue}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tickFormatter={(value) => `${Number(value) / 1_000_000}M`} /><Tooltip formatter={(value) => money(Number(value))} /><Bar dataKey="revenue" fill="#486800" /></BarChart></ResponsiveContainer></div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-outline-variant/20 bg-white p-5"><h2 className="mb-4 font-bold">Đơn hàng mới nhất</h2><table className="w-full min-w-[650px] text-sm"><thead className="text-left text-xs text-on-surface-variant"><tr><th className="pb-3">Mã đơn</th><th className="pb-3">Khách hàng</th><th className="pb-3">Sản phẩm</th><th className="pb-3">Tổng tiền</th><th className="pb-3">Trạng thái</th><th className="pb-3">Thời gian</th></tr></thead><tbody>{data.recentOrders.map((order) => <tr key={order.id} className="border-t border-outline-variant/10"><td className="py-3 font-bold text-primary">{order.orderCode}</td><td>{order.userFullName || `User #${order.userId}`}</td><td>{order.itemCount}</td><td>{money(order.totalAmount)}</td><td>{order.status}</td><td>{new Date(order.createdAt).toLocaleString("vi-VN")}</td></tr>)}</tbody></table></div>
    </div>
  );
}
