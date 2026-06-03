import { useState } from "react";
import { motion } from "motion/react";
import { Search, ChevronLeft, ChevronRight, Eye, Printer, Clock, CheckCircle, Package, Truck, XCircle } from "lucide-react";
import { ADMIN_ORDERS } from "../mocks";
import OrderDetailDrawer from "../components/OrderDetailDrawer";
import type { AdminOrder } from "../types";

const statusOpts = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "processing", label: "Đang xử lý" },
  { value: "shipped", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
] as const;

const stMap: Record<AdminOrder["orderStatus"], { label: string; cls: string; icon: typeof Clock }> = {
  pending: { label: "Chờ xác nhận", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  processing: { label: "Đang xử lý", cls: "bg-blue-50 text-blue-700 border-blue-200", icon: Package },
  shipped: { label: "Đang giao", cls: "bg-cyan-50 text-cyan-700 border-cyan-200", icon: Truck },
  delivered: { label: "Đã giao", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  cancelled: { label: "Đã hủy", cls: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

const pmMap: Record<AdminOrder["paymentStatus"], { label: string; cls: string }> = {
  paid: { label: "Đã TT", cls: "text-emerald-700 bg-emerald-50" },
  pending: { label: "Chờ TT", cls: "text-amber-700 bg-amber-50" },
  refunded: { label: "Hoàn tiền", cls: "text-red-600 bg-red-50" },
};

export default function Orders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminOrder["orderStatus"]>("all");
  const [selected, setSelected] = useState<AdminOrder | null>(null);

  const filtered = ADMIN_ORDERS.filter((order) => {
    if (
      search &&
      !order.code.toLowerCase().includes(search.toLowerCase()) &&
      !order.customerName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    if (statusFilter !== "all" && order.orderStatus !== statusFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Đơn hàng</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{ADMIN_ORDERS.length} đơn hàng</p>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-2 flex-1 max-w-md focus-within:border-primary/40 transition-colors">
          <Search className="w-4 h-4 text-on-surface-variant/50" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-on-surface-variant/40" placeholder="Tìm mã đơn, tên khách..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusOpts.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${statusFilter === filter.value ? "bg-primary text-white border-primary shadow-sm" : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-primary/30"}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-on-surface-variant/70 text-xs border-b border-outline-variant/20 bg-surface-container-low/30">
                <th className="px-5 py-3 font-semibold">Mã đơn</th>
                <th className="px-5 py-3 font-semibold">Khách hàng</th>
                <th className="px-5 py-3 font-semibold">Sản phẩm</th>
                <th className="px-5 py-3 font-semibold">Tổng tiền</th>
                <th className="px-5 py-3 font-semibold">Thanh toán</th>
                <th className="px-5 py-3 font-semibold">Phương thức</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold">Thời gian</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, index) => {
                const status = stMap[order.orderStatus];
                const payment = pmMap[order.paymentStatus];

                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-outline-variant/10 hover:bg-surface-container-low/40 transition-colors cursor-pointer"
                    onClick={() => setSelected(order)}
                  >
                    <td className="px-5 py-3.5 font-bold text-primary">{order.code}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-on-surface">{order.customerName}</p>
                      <p className="text-[11px] text-on-surface-variant/60">{order.customerEmail}</p>
                    </td>
                    <td className="px-5 py-3.5 text-on-surface-variant">{order.items.length} sp</td>
                    <td className="px-5 py-3.5 font-semibold">{order.total.toLocaleString()}₫</td>
                    <td className="px-5 py-3.5"><span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${payment.cls}`}>{payment.label}</span></td>
                    <td className="px-5 py-3.5 text-xs text-on-surface-variant">{order.paymentMethod}</td>
                    <td className="px-5 py-3.5"><span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${status.cls}`}>{status.label}</span></td>
                    <td className="px-5 py-3.5 text-on-surface-variant text-xs">{new Date(order.createdAt).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}</td>
                    <td className="px-5 py-3.5 text-right" onClick={(event) => event.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelected(order)} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors">
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-outline-variant/20">
          <span className="text-xs text-on-surface-variant">Hiển thị {filtered.length} / {ADMIN_ORDERS.length}</span>
          <div className="flex gap-1">
            <button className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant"><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-8 h-8 rounded-lg bg-primary text-white text-xs font-bold">1</button>
            <button className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <OrderDetailDrawer order={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
