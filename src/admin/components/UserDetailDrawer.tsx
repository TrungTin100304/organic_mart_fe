import { AnimatePresence, motion } from "motion/react";
import { Mail, MapPin, Phone, X } from "lucide-react";
import type { AdminOrder, AdminUser } from "../types";

const roleMap: Record<AdminUser["role"], { label: string; cls: string }> = {
  admin: { label: "Admin", cls: "bg-primary/10 text-primary border-primary/20" },
  staff: { label: "Nhan vien", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  customer: { label: "Khach hang", cls: "bg-surface-container-high text-on-surface-variant border-outline-variant/30" },
};

interface UserDetailDrawerProps {
  orders: AdminOrder[];
  user: AdminUser | null;
  onClose: () => void;
}

export default function UserDetailDrawer({ orders, user, onClose }: UserDetailDrawerProps) {
  return (
    <AnimatePresence>
      {user && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface-container-lowest shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-on-surface">Chi tiet nguoi dung</h2>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary-container/30 flex items-center justify-center text-primary font-bold text-2xl mx-auto mb-3">
                  {user.name.split(" ").slice(-1)[0][0]}
                </div>
                <h3 className="font-bold text-lg">{user.name}</h3>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${roleMap[user.role].cls}`}>{roleMap[user.role].label}</span>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low">
                  <Mail className="w-4 h-4 text-on-surface-variant" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low">
                  <Phone className="w-4 h-4 text-on-surface-variant" />
                  <span className="text-sm">{user.phone}</span>
                </div>
                {user.address && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low">
                    <MapPin className="w-4 h-4 text-on-surface-variant" />
                    <span className="text-sm">{user.address}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 rounded-xl bg-surface-container-low text-center">
                  <p className="text-2xl font-bold text-primary">{user.totalOrders}</p>
                  <p className="text-xs text-on-surface-variant mt-1">Don hang</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low text-center">
                  <p className="text-2xl font-bold text-primary">{(user.totalSpent / 1000).toFixed(0)}K₫</p>
                  <p className="text-xs text-on-surface-variant mt-1">Tong chi tieu</p>
                </div>
              </div>
              <h4 className="font-bold text-sm mb-3">Don hang gan day</h4>
              <div className="space-y-2">
                {orders.filter((order) => order.customerEmail === user.email).slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                    <div>
                      <p className="text-sm font-semibold text-primary">{order.code}</p>
                      <p className="text-[11px] text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
                    </div>
                    <span className="text-sm font-bold">{order.total.toLocaleString()}₫</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
