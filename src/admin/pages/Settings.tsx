import { useState } from "react";
import { motion } from "motion/react";
import { Store, Bell, Globe, Save, Check } from "lucide-react";

interface StoreSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface NotificationSettings {
  newOrder: boolean;
  lowStock: boolean;
  newReview: boolean;
  weeklyReport: boolean;
}

interface ShippingSettings {
  defaultFee: number;
  freeShippingThreshold: number;
}

export default function SettingsPage() {
  const [store, setStore] = useState<StoreSettings>({
    name: "Organic Mart",
    email: "info@organicmart.vn",
    phone: "1900 6868",
    address: "123 Nguyễn Huệ, Q.1, TP.HCM",
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    newOrder: true,
    lowStock: true,
    newReview: false,
    weeklyReport: true,
  });

  const [shipping, setShipping] = useState<ShippingSettings>({
    defaultFee: 25000,
    freeShippingThreshold: 300000,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // TODO: wire to backend API when available
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Cài đặt</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">Quản lý cài đặt hệ thống</p>
      </motion.div>

      {/* Store Info */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Store className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-on-surface">Thông tin cửa hàng</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Tên cửa hàng</label>
            <input
              value={store.name}
              onChange={(e) => setStore({ ...store, name: e.target.value })}
              className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Email liên hệ</label>
            <input
              type="email"
              value={store.email}
              onChange={(e) => setStore({ ...store, email: e.target.value })}
              className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Số điện thoại</label>
            <input
              value={store.phone}
              onChange={(e) => setStore({ ...store, phone: e.target.value })}
              className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">�ịa chỉ</label>
            <input
              value={store.address}
              onChange={(e) => setStore({ ...store, address: e.target.value })}
              className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Bell className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-on-surface">Thông báo</h2>
        </div>
        <div className="space-y-4">
          {[
            { key: "newOrder" as const, label: "Thông báo đơn hàng mới", desc: "Nhận thông báo khi có đơn hàng mới" },
            { key: "lowStock" as const, label: "Cảnh báo tồn kho thấp", desc: "Nhận cảnh báo khi sản phẩm sắp hết" },
            { key: "newReview" as const, label: "Đánh giá mới", desc: "Nhận thông báo khi có đánh giá mới" },
            { key: "weeklyReport" as const, label: "Báo cáo hàng tuần", desc: "Nhận email tổng kết mỗi tuần" },
          ].map((n) => (
            <div key={n.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors">
              <div>
                <p className="text-sm font-semibold text-on-surface">{n.label}</p>
                <p className="text-xs text-on-surface-variant">{n.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[n.key]}
                  onChange={(e) => setNotifications({ ...notifications, [n.key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-surface-container-high peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Globe className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-on-surface">Giao hàng</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Phí giao hàng mặc định (đ)</label>
            <input
              type="number"
              value={shipping.defaultFee}
              onChange={(e) => setShipping({ ...shipping, defaultFee: Number(e.target.value) })}
              className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Miễn phí ship cho đơn từ (đ)</label>
            <input
              type="number"
              value={shipping.freeShippingThreshold}
              onChange={(e) => setShipping({ ...shipping, freeShippingThreshold: Number(e.target.value) })}
              className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50"
      >
        {saving ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="inline-block"
            >
              <Save className="w-4 h-4" />
            </motion.span>
            Đang lưu...
          </>
        ) : saved ? (
          <>
            <Check className="w-4 h-4" />
            Đã lưu!
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Lưu cài đặt
          </>
        )}
      </button>
    </div>
  );
}
