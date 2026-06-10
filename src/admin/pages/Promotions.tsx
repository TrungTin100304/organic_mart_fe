import { useEffect, useState } from "react";
import { Copy, Edit2, Plus, Ticket, Trash2, X } from "lucide-react";
import {
  createPromotion,
  deactivatePromotion,
  getPromotions,
  updatePromotion,
  type AdminPromotion,
  type AdminPromotionInput,
} from "../../services/adminPromotionService";

const today = new Date().toISOString().slice(0, 10);
const emptyForm: AdminPromotionInput = {
  code: "",
  name: "",
  description: "",
  type: "PERCENTAGE",
  value: 10,
  minOrderAmount: 0,
  maxDiscountAmount: 0,
  validFrom: today,
  validTo: today,
  usageLimit: 100,
  usageLimitPerUser: 1,
  active: true,
};

const money = (value?: number) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

export default function Promotions() {
  const [promotions, setPromotions] = useState<AdminPromotion[]>([]);
  const [form, setForm] = useState<AdminPromotionInput>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setPromotions(await getPromotions());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải khuyến mãi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (promotion: AdminPromotion) => {
    setEditingId(promotion.id);
    setForm({
      code: promotion.code,
      name: promotion.name,
      description: promotion.description || "",
      type: promotion.type,
      value: promotion.value,
      minOrderAmount: promotion.minOrderAmount || 0,
      maxDiscountAmount: promotion.maxDiscountAmount || 0,
      validFrom: promotion.validFrom,
      validTo: promotion.validTo,
      usageLimit: promotion.usageLimit || undefined,
      usageLimitPerUser: promotion.usageLimitPerUser || undefined,
      active: promotion.active,
    });
    setOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) await updatePromotion(editingId, form);
      else await createPromotion(form);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu khuyến mãi.");
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (promotion: AdminPromotion) => {
    if (!promotion.active) return;
    setError("");
    try {
      await deactivatePromotion(promotion.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể vô hiệu hóa khuyến mãi.");
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <div className="flex items-center justify-between"><div><h1 className="text-xl font-bold lg:text-2xl">Khuyến mãi</h1><p className="text-sm text-on-surface-variant">{promotions.length} mã từ backend</p></div><button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Tạo mã mới</button></div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
      {loading ? <p>Đang tải...</p> : <div className="grid gap-4 md:grid-cols-2">{promotions.map((promotion) => {
        const expired = promotion.validTo < today;
        return <div key={promotion.id} className="rounded-2xl border border-outline-variant/20 bg-white p-5">
          <div className="flex items-start justify-between"><div className="flex gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Ticket className="h-5 w-5" /></div><div><div className="flex items-center gap-2"><h3 className="font-mono font-bold">{promotion.code}</h3><button onClick={() => void navigator.clipboard.writeText(promotion.code)}><Copy className="h-3.5 w-3.5" /></button></div><p className="text-sm font-semibold">{promotion.name}</p><p className="text-xs text-on-surface-variant">{promotion.type === "PERCENTAGE" ? `Giảm ${promotion.value}%` : `Giảm ${money(promotion.value)}`} · đơn tối thiểu {money(promotion.minOrderAmount)}</p></div></div><span className={`rounded-full px-2 py-1 text-xs font-bold ${promotion.active && !expired ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{expired ? "Hết hạn" : promotion.active ? "Đang bật" : "Đã tắt"}</span></div>
          <div className="mt-4 text-xs text-on-surface-variant">Đã dùng: <strong>{promotion.timesUsed}/{promotion.usageLimit ?? "∞"}</strong> · mỗi user: {promotion.usageLimitPerUser ?? "∞"}<br />{promotion.validFrom} → {promotion.validTo}</div>
          <div className="mt-4 flex justify-end gap-2"><button onClick={() => openEdit(promotion)} className="rounded-lg p-2 hover:bg-surface-container"><Edit2 className="h-4 w-4" /></button><button disabled={!promotion.active} onClick={() => void deactivate(promotion)} className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button></div>
        </div>;
      })}</div>}

      {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"><form onSubmit={submit} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-5 flex justify-between"><h2 className="text-lg font-bold">{editingId ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi"}</h2><button type="button" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button></div><div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">Mã<input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} className="mt-1 w-full rounded-xl border p-2.5" /></label>
        <label className="text-sm font-semibold">Tên<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full rounded-xl border p-2.5" /></label>
        <label className="text-sm font-semibold">Loại<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as AdminPromotionInput["type"] })} className="mt-1 w-full rounded-xl border p-2.5"><option value="PERCENTAGE">Phần trăm</option><option value="FIXED_AMOUNT">Số tiền</option></select></label>
        <label className="text-sm font-semibold">Giá trị<input required min="0.01" type="number" value={form.value} onChange={(event) => setForm({ ...form, value: Number(event.target.value) })} className="mt-1 w-full rounded-xl border p-2.5" /></label>
        <label className="text-sm font-semibold">Đơn tối thiểu<input min="0" type="number" value={form.minOrderAmount || 0} onChange={(event) => setForm({ ...form, minOrderAmount: Number(event.target.value) })} className="mt-1 w-full rounded-xl border p-2.5" /></label>
        <label className="text-sm font-semibold">Giảm tối đa<input min="0" type="number" value={form.maxDiscountAmount || 0} onChange={(event) => setForm({ ...form, maxDiscountAmount: Number(event.target.value) })} className="mt-1 w-full rounded-xl border p-2.5" /></label>
        <label className="text-sm font-semibold">Bắt đầu<input required type="date" value={form.validFrom} onChange={(event) => setForm({ ...form, validFrom: event.target.value })} className="mt-1 w-full rounded-xl border p-2.5" /></label>
        <label className="text-sm font-semibold">Kết thúc<input required type="date" value={form.validTo} onChange={(event) => setForm({ ...form, validTo: event.target.value })} className="mt-1 w-full rounded-xl border p-2.5" /></label>
        <label className="text-sm font-semibold">Tổng lượt dùng<input min="1" type="number" value={form.usageLimit || ""} onChange={(event) => setForm({ ...form, usageLimit: event.target.value ? Number(event.target.value) : undefined })} className="mt-1 w-full rounded-xl border p-2.5" /></label>
        <label className="text-sm font-semibold">Lượt mỗi user<input min="1" type="number" value={form.usageLimitPerUser || ""} onChange={(event) => setForm({ ...form, usageLimitPerUser: event.target.value ? Number(event.target.value) : undefined })} className="mt-1 w-full rounded-xl border p-2.5" /></label>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} /> Đang hoạt động</label>
      </div><button disabled={saving} className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu khuyến mãi"}</button></form></div>}
    </div>
  );
}
