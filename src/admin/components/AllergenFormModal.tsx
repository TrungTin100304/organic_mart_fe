import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, X } from "lucide-react";

export interface AllergenFormValues {
  name: string;
}

interface AllergenFormModalProps {
  open: boolean;
  initialName?: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: AllergenFormValues) => Promise<void> | void;
}

export default function AllergenFormModal({
  open,
  initialName = "",
  isSubmitting = false,
  onClose,
  onSubmit,
}: AllergenFormModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setError("");
  }, [open, initialName]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextName = name.trim();

    if (!nextName) {
      setError("Vui lòng nhập tên chất gây dị ứng.");
      return;
    }

    setError("");
    await onSubmit({ name: nextName });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
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
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-on-surface">{initialName ? "Cập nhật chất gây dị ứng" : "Thêm chất gây dị ứng"}</h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">Tên sẽ được dùng trong thông tin sản phẩm.</p>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Tên chất gây dị ứng</label>
                  <input
                    required
                    autoFocus
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                    placeholder="VD: Sesame, Soy, Gluten"
                  />
                </div>

                {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-outline-variant/30 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
                    Hủy
                  </button>
                  <button disabled={isSubmitting} type="submit" className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50">
                    {isSubmitting ? "Đang lưu..." : initialName ? "Cập nhật" : "Tạo mới"}
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
