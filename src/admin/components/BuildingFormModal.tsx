import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Building2, X } from "lucide-react";

export interface BuildingFormValues {
  code: string;
  name: string;
  description: string;
  displayOrder: number;
}

interface BuildingFormModalProps {
  open: boolean;
  initial?: Partial<BuildingFormValues> & { id?: number };
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: BuildingFormValues) => Promise<void> | void;
}

export default function BuildingFormModal({
  open,
  initial,
  isSubmitting = false,
  onClose,
  onSubmit,
}: BuildingFormModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setCode(initial?.code ?? "");
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setDisplayOrder(String(initial?.displayOrder ?? 0));
    setError("");
  }, [open, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) { setError("Mã tòa nhà không được trống."); return; }
    if (!trimmedName) { setError("Tên tòa nhà không được trống."); return; }
    setError("");
    await onSubmit({
      code: trimmedCode,
      name: trimmedName,
      description: description.trim(),
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
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-on-surface">
                      {initial?.id != null ? "Cập nhật tòa nhà" : "Thêm tòa nhà"}
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
                  <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Mã tòa nhà <span className="text-red-500">*</span></label>
                  <input
                    required
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all uppercase"
                    placeholder="VD: A, B, C"
                    disabled={!!initial?.id}
                  />
                  {initial?.id && <p className="text-[11px] text-on-surface-variant mt-1">Mã tòa nhà không thể thay đổi.</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Tên tòa nhà <span className="text-red-500">*</span></label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    placeholder="VD: Tòa A - Nam Kỳ Khởi Nghĩa"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Mô tả</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all resize-none"
                    placeholder="Mô tả tòa nhà (tuỳ chọn)"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    placeholder="0"
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
