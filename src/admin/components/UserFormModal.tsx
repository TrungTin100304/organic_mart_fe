import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff, X } from "lucide-react";
import type { AdminUser } from "../types";

export interface UserFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: "ROLE_USER";
}

interface UserFormModalProps {
  user: AdminUser | null;
  open: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void> | void;
}

const emptyValues: UserFormValues = {
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  role: "ROLE_USER",
};

export default function UserFormModal({ user, open, isSubmitting = false, onClose, onSubmit }: UserFormModalProps) {
  const [form, setForm] = useState<UserFormValues>(emptyValues);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const isEditing = Boolean(user);

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm({
      fullName: user?.name || "",
      email: user?.email || "",
      phoneNumber: user?.phone || "",
      password: "",
      role: "ROLE_USER",
    });
    setShowPassword(false);
  }, [open, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.fullName.trim()) {
      setError("Vui long nhap ho ten.");
      return;
    }
    if (!form.email.trim()) {
      setError("Vui long nhap email.");
      return;
    }
    if (!form.phoneNumber.trim()) {
      setError("Vui long nhap so dien thoai.");
      return;
    }
    if (!isEditing && !form.password) {
      setError("Vui long nhap mat khau cho tai khoan moi.");
      return;
    }

    await onSubmit({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      password: form.password,
      role: "ROLE_USER",
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-lg lg:max-h-[85vh] bg-surface-container-lowest rounded-2xl shadow-2xl z-50 overflow-y-auto"
          >
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">{isEditing ? "Chinh sua nguoi dung" : "Them nguoi dung"}</h2>
                <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Ho ten</label>
                  <input
                    required
                    value={form.fullName}
                    onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Email</label>
                  <input
                    required
                    type="email"
                    disabled={isEditing}
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 disabled:bg-surface-container-low disabled:text-on-surface-variant"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">So dien thoai</label>
                  <input
                    required
                    value={form.phoneNumber}
                    onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40"
                  />
                </div>
                {!isEditing && (
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Mat khau</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={form.password}
                        onChange={(event) => setForm({ ...form, password: event.target.value })}
                        className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 pr-10 text-sm bg-surface-container-lowest outline-none focus:border-primary/40"
                      />
                      <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant/60 hover:text-primary">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Vai tro</label>
                  <select
                    value={form.role}
                    onChange={() => setForm({ ...form, role: "ROLE_USER" })}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40"
                  >
                    <option value="ROLE_USER">Khach hang</option>
                  </select>
                </div>

                {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-outline-variant/30 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container">
                    Huy
                  </button>
                  <button disabled={isSubmitting} type="submit" className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 disabled:opacity-50">
                    {isSubmitting ? "Dang luu..." : isEditing ? "Cap nhat" : "Tao nguoi dung"}
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
