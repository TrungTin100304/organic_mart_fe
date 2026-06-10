import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Leaf, X } from "lucide-react";

export interface FarmFormValues {
  name: string;
  location: string;
  certification: string;
  contactPhone: string;
  contactEmail: string;
}

interface FarmFormModalProps {
  open: boolean;
  initial?: Partial<FarmFormValues> & { id?: number };
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: FarmFormValues) => Promise<void> | void;
}

export default function FarmFormModal({
  open,
  initial,
  isSubmitting = false,
  onClose,
  onSubmit,
}: FarmFormModalProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [certification, setCertification] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setLocation(initial?.location ?? "");
    setCertification(initial?.certification ?? "");
    setContactPhone(initial?.contactPhone ?? "");
    setContactEmail(initial?.contactEmail ?? "");
    setError("");
  }, [open, initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Tên nông trại không được trống."); return; }
    setError("");
    await onSubmit({
      name: name.trim(),
      location: location.trim(),
      certification: certification.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
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
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-on-surface">
                      {initial?.id != null ? "Cập nhật nông trại" : "Thêm nông trại"}
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
                  <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Tên nông trại <span className="text-red-500">*</span></label>
                  <input
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    placeholder="VD: Nông trại hữu cơ Đà Lạt"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Địa điểm</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    placeholder="VD: Đà Lạt, Lâm Đồng"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Chứng nhận</label>
                  <input
                    value={certification}
                    onChange={(e) => setCertification(e.target.value)}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    placeholder="VD: USDA Organic, VietGAP"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Số điện thoại liên hệ</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    placeholder="VD: 0901234567"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Email liên hệ</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    placeholder="VD: farm@organicmart.vn"
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
