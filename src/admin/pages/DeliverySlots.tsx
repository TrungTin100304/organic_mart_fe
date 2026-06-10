import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Clock, Plus, Edit2, Power } from "lucide-react";
import AdminConfirmModal from "../components/AdminConfirmModal";
import DeliverySlotFormModal, { type DeliverySlotFormValues } from "../components/DeliverySlotFormModal";
import {
  getAllDeliverySlots,
  createDeliverySlot,
  updateDeliverySlot,
  toggleDeliverySlotStatus,
  type DeliverySlot,
} from "../../services/adminDeliveryService";

export default function DeliverySlots() {
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [slotToToggle, setSlotToToggle] = useState<DeliverySlot | null>(null);
  const [editingSlot, setEditingSlot] = useState<DeliverySlot | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadSlots = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getAllDeliverySlots();
      setSlots(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể tải khung giờ giao hàng.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadSlots(); }, []);

  const openCreate = () => {
    setEditingSlot(null);
    setIsFormModalOpen(true);
  };

  const openEdit = (slot: DeliverySlot) => {
    setEditingSlot(slot);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (values: DeliverySlotFormValues) => {
    setIsProcessing(true);
    try {
      if (editingSlot) {
        await updateDeliverySlot(editingSlot.id, {
          name: values.name,
          startTime: values.startTime,
          endTime: values.endTime,
          cutoffMinutes: values.cutoffMinutes,
          maximumOrders: values.maximumOrders,
          displayOrder: values.displayOrder,
          isActive: editingSlot.isActive,
        });
      } else {
        await createDeliverySlot({ ...values, isActive: true });
      }
      setIsFormModalOpen(false);
      await loadSlots();
    } catch (err: unknown) {
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggle = (slot: DeliverySlot) => {
    setSlotToToggle(slot);
  };

  const handleConfirmToggle = async () => {
    if (!slotToToggle) return;
    setIsProcessing(true);
    try {
      await toggleDeliverySlotStatus(slotToToggle.id, !slotToToggle.isActive);
      await loadSlots();
      setSlotToToggle(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Không thể cập nhật trạng thái.");
    } finally {
      setIsProcessing(false);
    }
  };

  const activeCount = slots.filter((s) => s.isActive).length;

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Khung giờ giao hàng</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {activeCount} / {slots.length} khung giờ đang hoạt động
          </p>
        </div>
        <button
          onClick={openCreate}
          disabled={isProcessing}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Thêm khung giờ
        </button>
      </motion.div>

      {isLoading && <p className="text-on-surface-variant">Đang tải khung giờ...</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {!isLoading && !error && (
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/20">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-high text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Tên</th>
                <th className="px-4 py-3 text-left">Giờ bắt đầu</th>
                <th className="px-4 py-3 text-left">Giờ kết thúc</th>
                <th className="px-4 py-3 text-center">Cắt trước (phút)</th>
                <th className="px-4 py-3 text-center">Tối đa đơn</th>
                <th className="px-4 py-3 text-center">Thứ tự</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {slots.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-on-surface-variant">
                    Chưa có khung giờ nào.
                  </td>
                </tr>
              ) : (
                slots.map((slot) => (
                  <tr key={slot.id} className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-semibold text-on-surface">{slot.name}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{slot.startTime}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{slot.endTime}</td>
                    <td className="px-4 py-3 text-center text-on-surface-variant">{slot.cutoffMinutes}</td>
                    <td className="px-4 py-3 text-center text-on-surface-variant">{slot.maximumOrders}</td>
                    <td className="px-4 py-3 text-center text-on-surface-variant">{slot.displayOrder}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                        slot.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}>
                        {slot.isActive ? "Hoạt động" : "Tắt"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(slot)}
                          className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                          title="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggle(slot)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            slot.isActive
                              ? "hover:bg-red-50 text-on-surface-variant hover:text-red-600"
                              : "hover:bg-emerald-50 text-on-surface-variant hover:text-emerald-600"
                          }`}
                          title={slot.isActive ? "Tắt khung giờ" : "Bật khung giờ"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <AdminConfirmModal
        open={Boolean(slotToToggle)}
        title={slotToToggle?.isActive ? "Tắt khung giờ" : "Bật khung giờ"}
        message={
          slotToToggle?.isActive
            ? `Tắt khung giờ "${slotToToggle?.name}"? Khung giờ này sẽ không xuất hiện khi đặt lịch giao hàng.`
            : `Bật khung giờ "${slotToToggle?.name}"?`
        }
        confirmLabel={slotToToggle?.isActive ? "Tắt" : "Bật"}
        isProcessing={isProcessing}
        onClose={() => !isProcessing && setSlotToToggle(null)}
        onConfirm={handleConfirmToggle}
      />

      <DeliverySlotFormModal
        open={isFormModalOpen}
        initial={editingSlot ?? undefined}
        isSubmitting={isProcessing}
        onClose={() => !isProcessing && setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
