import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clock, X } from "lucide-react";

export interface DeliverySlotFormValues {
  name: string;
  startTime: string;
  endTime: string;
  cutoffMinutes: number;
  maximumOrders: number;
  displayOrder: number;
}

interface DeliverySlotFormModalProps {
  open: boolean;
  initial?: Partial<DeliverySlotFormValues> & { id?: number };
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: DeliverySlotFormValues) => Promise<void> | void;
}

export default function DeliverySlotFormModal({
  open,
  initial,
  isSubmitting = false,
  onClose,
  onSubmit,
}: DeliverySlotFormModalProps) {
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [cutoffMinutes, setCutoffMinutes] = useState("30");
  const [maximumOrders, setMaximumOrders] = useState("10");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setStartTime(initial?.startTime ?? "");
    setEndTime(initial?.endTime ?? "");
    setCutoffMinutes(String(initial?.cutoffMinutes ?? 30));
    setMaximumOrders(String(initial?.maximumOrders ?? 10));
    setDisplayOrder(String(initial?.displayOrder ?? 0));
    setError("");
  }, [open, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Tên khung giờ không được trống."); return; }
    if (!startTime.trim()) { setError("Giờ bắt đầu không được trống."); return; }
    if (!endTime.trim()) { setError("Giờ kết thúc không được trống."); return; }
    setError("");
    await onSubmit({
      name: name.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      cutoffMinutes: parseInt(cutoffMinutes, 10) || 30,
      maximumOrders: parseInt(maximumOrders, 10) || 10,
      displayOrder: parseInt(displayOrder, 10) || 0,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40" onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-on-surface">
                      {initial?.id != null ? "Cập nhật khung giờ" : "Thêm khung giờ giao hàng"}
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">Điền thông tin bên dưới.</p>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Tên khung giờ <span className="text-red-500">*</span></label>
                  <input
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    placeholder="VD: 08:00 - 10:00"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Giờ bắt đầu <span className="text-red-500">*</span></label>
                    <input
                      required
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Giờ kết thúc <span className="text-red-500">*</span></label>
                    <input
                      required
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Cắt trước (phút)</label>
                    <input
                      type="number"
                      min="0"
                      value={cutoffMinutes}
                      onChange={(e) => setCutoffMinutes(e.target.value)}
                      className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Số đơn tối đa</label>
                    <input
                      type="number"
                      min="1"
                      value={maximumOrders}
                      onChange={(e) => setMaximumOrders(e.target.value)}
                      className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                  />
                </div>

                {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-outline-variant/30 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
                    Hủy
                  </button>
                  <button disabled={isSubmitting} type="submit" className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50">
                    {isSubmitting ? "Đang lưu..." : initial?.id != null ? "Cập nhật" : "Tạo mới"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
