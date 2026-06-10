import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Search, Building2, Clock, Truck, Package, CheckCircle, XCircle } from "lucide-react";
import { getDeliveryOrders, type DeliveryOrder } from "../../services/adminDeliveryOrderService";
import type { DeliveryMethod } from "../../services/orderService";

const deliveryMethodLabels: Record<DeliveryMethod, string> = {
  STANDARD: "Giao tiêu chuẩn",
  EXPRESS: "Giao nhanh",
  SCHEDULED: "Đặt lịch",
};

const statusConfig: Record<string, { label: string; cls: string; icon: typeof Clock }> = {
  PENDING: { label: "Chờ xác nhận", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  CONFIRMED: { label: "Đã xác nhận", cls: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle },
  PREPARING: { label: "Đang chuẩn bị", cls: "bg-violet-50 text-violet-700 border-violet-200", icon: Package },
  READY_FOR_DELIVERY: { label: "Sẵn sàng giao", cls: "bg-cyan-50 text-cyan-700 border-cyan-200", icon: Truck },
  DELIVERING: { label: "Đang giao", cls: "bg-orange-50 text-orange-700 border-orange-200", icon: Truck },
  DELIVERED: { label: "Đã giao", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  CANCELLED: { label: "Đã hủy", cls: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

export default function DeliveryOrders() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState<DeliveryMethod | "">("");

  const loadOrders = async (page = 0) => {
    setIsLoading(true);
    setError("");
    try {
      const result = await getDeliveryOrders({
        status: statusFilter || undefined,
        deliveryMethod: methodFilter || undefined,
        page,
        size: pageSize,
      });
      setOrders(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
      setCurrentPage(result.number);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể tải đơn giao hàng nội khu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadOrders(0); }, [statusFilter, methodFilter]);

  const handleSearch = () => { void loadOrders(0); };

  const handlePageChange = (page: number) => { void loadOrders(page); };

  const filteredOrders = search
    ? orders.filter(
        (o) =>
          o.orderCode.toLowerCase().includes(search.toLowerCase()) ||
          o.recipientNameSnapshot?.toLowerCase().includes(search.toLowerCase()) ||
          o.apartmentNumberSnapshot?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Đơn giao hàng nội khu</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">
          {totalElements} đơn hàng giao nội khu
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-2 flex-1 max-w-sm focus-within:border-primary/40 transition-colors">
          <Search className="w-4 h-4 text-on-surface-variant/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-on-surface-variant/40"
            placeholder="Tìm mã đơn, tên, căn hộ..."
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-surface-container-lowest border-outline-variant/30 text-on-surface focus:border-primary/40 outline-none cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as DeliveryMethod | "")}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-surface-container-lowest border-outline-variant/30 text-on-surface focus:border-primary/40 outline-none cursor-pointer"
          >
            <option value="">Tất cả hình thức</option>
            <option value="STANDARD">Giao tiêu chuẩn</option>
            <option value="EXPRESS">Giao nhanh</option>
            <option value="SCHEDULED">Đặt lịch</option>
          </select>
        </div>
      </div>

      {isLoading && <p className="text-on-surface-variant">Đang tải đơn hàng...</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {!isLoading && !error && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-outline-variant/20">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-high text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Mã đơn</th>
                  <th className="px-4 py-3 text-left">Người nhận</th>
                  <th className="px-4 py-3 text-left">Địa chỉ giao hàng</th>
                  <th className="px-4 py-3 text-center">Hình thức</th>
                  <th className="px-4 py-3 text-left">Ngày / Khung giờ</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Tổng tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-on-surface-variant">
                      Không có đơn giao hàng nội khu nào.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const st = statusConfig[order.status] || { label: order.status, cls: "bg-gray-50 text-gray-700", icon: Clock };
                    return (
                      <tr key={order.id} className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
                        <td className="px-4 py-3 font-bold text-primary">{order.orderCode}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-on-surface">{order.recipientNameSnapshot || "—"}</div>
                          <div className="text-xs text-on-surface-variant">{order.recipientPhoneSnapshot || "—"}</div>
                        </td>
                        <td className="px-4 py-3">
                          {order.buildingCodeSnapshot ? (
                            <div className="flex items-start gap-1">
                              <Building2 className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                              <div className="text-on-surface text-xs">
                                <div>Căn {order.apartmentNumberSnapshot || "?"}, tầng {order.floorSnapshot || "?"}, tòa {order.buildingCodeSnapshot}</div>
                                {order.buildingNameSnapshot && <div className="text-on-surface-variant">{order.buildingNameSnapshot}</div>}
                              </div>
                            </div>
                          ) : (
                            <span className="text-on-surface-variant text-xs">—</span>
                          )}
                          {order.deliveryNoteSnapshot && (
                            <div className="text-xs text-on-surface-variant/70 mt-1 italic">"{order.deliveryNoteSnapshot}"</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-surface-container-high text-on-surface">
                            {deliveryMethodLabels[order.deliveryMethod] || order.deliveryMethod}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {order.deliveryDate ? (
                            <div className="flex items-center gap-1 text-xs text-on-surface">
                              <Clock className="w-3.5 h-3.5 text-on-surface-variant" />
                              {new Date(order.deliveryDate).toLocaleDateString("vi-VN")}
                              {order.deliverySlotSnapshot && <span className="text-on-surface-variant">· {order.deliverySlotSnapshot}</span>}
                            </div>
                          ) : (
                            <span className="text-on-surface-variant text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${st.cls}`}>
                            <st.icon className="w-3 h-3" />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-on-surface">
                          {order.totalAmount.toLocaleString()}đ
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-1.5 rounded-xl border border-outline-variant/30 text-sm font-semibold disabled:opacity-40 hover:bg-surface-container-high transition-colors"
              >
                ← Trước
              </button>
              <span className="text-sm text-on-surface-variant">
                Trang {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1.5 rounded-xl border border-outline-variant/30 text-sm font-semibold disabled:opacity-40 hover:bg-surface-container-high transition-colors"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
