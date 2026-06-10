import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Eye, LoaderCircle, Search } from "lucide-react";
import AdminConfirmModal from "../components/AdminConfirmModal";
import {
  getAdminOrderById,
  getAdminOrders,
  updateAdminOrderStatus,
  type AdminOrderDetail,
  type AdminOrderListItem,
} from "../../services/adminOrderService";
import type { OrderStatus } from "../../services/orderService";

const statusOptions: Array<{ value: "" | OrderStatus; label: string }> = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "PREPARING", label: "Đang chuẩn bị" },
  { value: "READY_FOR_DELIVERY", label: "Sẵn sàng giao" },
  { value: "DELIVERING", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
];

const statusLabel = (status: OrderStatus) =>
  statusOptions.find((option) => option.value === status)?.label ?? status;

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY_FOR_DELIVERY",
  READY_FOR_DELIVERY: "DELIVERING",
  DELIVERING: "DELIVERED",
};

const money = (value: number) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

export default function Orders() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [selected, setSelected] = useState<AdminOrderDetail | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | OrderStatus>("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [orderToAdvance, setOrderToAdvance] = useState<AdminOrderListItem | null>(null);

  const loadOrders = async (targetPage = page) => {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminOrders({
        page: targetPage,
        size: 10,
        status: status || undefined,
      });
      setOrders(result.content);
      setPage(result.number);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải đơn hàng.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders(0);
  }, [status]);

  const openDetail = async (id: number) => {
    setError("");
    try {
      setSelected(await getAdminOrderById(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải chi tiết đơn hàng.");
    }
  };

  const advanceOrder = async () => {
    if (!orderToAdvance) return;
    const target = nextStatus[orderToAdvance.status];
    if (!target) return;
    setUpdatingId(orderToAdvance.id);
    setError("");
    try {
      await updateAdminOrderStatus(orderToAdvance.id, target, `Admin cập nhật sang ${target}`);
      await loadOrders(page);
      if (selected?.id === orderToAdvance.id) setSelected(await getAdminOrderById(orderToAdvance.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật trạng thái đơn hàng.");
    } finally {
      setUpdatingId(null);
      setOrderToAdvance(null);
    }
  };

  const visibleOrders = orders.filter((order) => {
    const term = search.trim().toLowerCase();
    return !term
      || order.orderCode.toLowerCase().includes(term)
      || order.userFullName?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Đơn hàng</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">{totalElements} đơn hàng từ backend</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-on-surface-variant/50" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="bg-transparent border-none outline-none text-sm ml-2 w-full" placeholder="Tìm trong trang theo mã đơn hoặc khách hàng" />
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value as "" | OrderStatus)} className="px-3 py-2 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm">
          {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-on-surface-variant"><LoaderCircle className="w-5 h-5 animate-spin" /> Đang tải đơn hàng...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[850px]">
              <thead className="bg-surface-container-low/30 text-left text-xs text-on-surface-variant">
                <tr><th className="px-5 py-3">Mã đơn</th><th className="px-5 py-3">Khách hàng</th><th className="px-5 py-3">Sản phẩm</th><th className="px-5 py-3">Tổng tiền</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3">Thời gian</th><th className="px-5 py-3 text-right">Hành động</th></tr>
              </thead>
              <tbody>
                {visibleOrders.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-16 text-center text-on-surface-variant">Không có đơn hàng phù hợp.</td></tr>
                ) : visibleOrders.map((order) => (
                  <tr key={order.id} className="border-t border-outline-variant/10 hover:bg-surface-container-low/40">
                    <td className="px-5 py-3.5 font-bold text-primary">{order.orderCode}</td>
                    <td className="px-5 py-3.5">{order.userFullName || `User #${order.userId ?? "?"}`}</td>
                    <td className="px-5 py-3.5">{order.itemCount} sản phẩm</td>
                    <td className="px-5 py-3.5 font-semibold">{money(order.totalAmount)}</td>
                    <td className="px-5 py-3.5"><span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-xs font-bold text-primary">{statusLabel(order.status)}</span></td>
                    <td className="px-5 py-3.5 text-xs text-on-surface-variant">{new Date(order.createdAt).toLocaleString("vi-VN")}</td>
                    <td className="px-5 py-3.5"><div className="flex justify-end gap-2">
                      <button onClick={() => void openDetail(order.id)} className="p-2 rounded-lg hover:bg-surface-container" title="Xem chi tiết"><Eye className="w-4 h-4" /></button>
                      {nextStatus[order.status] && <button disabled={updatingId === order.id} onClick={() => setOrderToAdvance(order)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">{updatingId === order.id ? "Đang lưu..." : `Chuyển: ${statusLabel(nextStatus[order.status]!)}`}</button>}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-outline-variant/20 px-5 py-3">
          <span className="text-xs text-on-surface-variant">Trang {totalPages ? page + 1 : 0} / {totalPages}</span>
          <div className="flex gap-1">
            <button disabled={page === 0 || loading} onClick={() => void loadOrders(page - 1)} className="p-2 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <button disabled={page + 1 >= totalPages || loading} onClick={() => void loadOrders(page + 1)} className="p-2 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setSelected(null)}>
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex justify-between gap-4"><div><h2 className="text-lg font-bold text-primary">{selected.orderCode}</h2><p className="text-sm text-on-surface-variant">{selected.userFullName || `User #${selected.userId}`}</p></div><button onClick={() => setSelected(null)} className="font-bold">Đóng</button></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2"><p><strong>Trạng thái:</strong> {statusLabel(selected.status)}</p><p><strong>Tổng tiền:</strong> {money(selected.totalAmount)}</p><p className="sm:col-span-2"><strong>�ịa chỉ:</strong> {selected.shippingAddressSnapshot || "Chưa có dữ liệu"}</p><p className="sm:col-span-2"><strong>Ghi chú:</strong> {selected.note || "Không có"}</p></div>
          <h3 className="mt-6 font-bold">Sản phẩm</h3>
          <div className="mt-2 space-y-2">{selected.details.map((item) => <div key={item.id} className="flex justify-between rounded-xl bg-surface-container-low p-3"><span>{item.productName || "Sản phẩm"} x {item.quantity}</span><strong>{money(item.lineSubtotal)}</strong></div>)}</div>
          <h3 className="mt-6 font-bold">Lịch sử trạng thái</h3>
          <div className="mt-2 space-y-2">{selected.statusHistories.map((item) => <div key={item.id} className="rounded-xl border border-outline-variant/20 p-3 text-sm"><strong>{statusLabel(item.toStatus)}</strong> · {new Date(item.createdAt).toLocaleString("vi-VN")}<p className="text-on-surface-variant">{item.note || "Không có ghi chú"}{item.changedByName ? ` · ${item.changedByName}` : ""}</p></div>)}</div>
        </div>
      </div>}

      <AdminConfirmModal
        open={Boolean(orderToAdvance)}
        title={`Chuyển trạng thái đơn #${orderToAdvance?.orderCode ?? ""}`}
        message={`Xác nhận chuyển đơn "${orderToAdvance?.orderCode}" sang "${orderToAdvance ? statusLabel(nextStatus[orderToAdvance.status]!) : ""}"?`}
        confirmLabel="Xác nhận"
        isProcessing={Boolean(updatingId)}
        onClose={() => !updatingId && setOrderToAdvance(null)}
        onConfirm={advanceOrder}
      />
    </div>
  );
}
