import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Copy, Edit2, Plus, Ticket, Trash2, X } from "lucide-react";
import AdminConfirmModal from "../components/AdminConfirmModal";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<AdminPromotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
    setError("");
    setIsModalOpen(true);
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
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) await updatePromotion(editingId, form);
      else await createPromotion(form);
      setIsModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu khuyến mãi.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (promotion: AdminPromotion) => {
    if (!promotion.active) return;
    setPromotionToDelete(promotion);
  };

  const handleConfirmDelete = async () => {
    if (!promotionToDelete) return;
    setDeleting(true);
    try {
      await deactivatePromotion(promotionToDelete.id);
      setPromotionToDelete(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể vô hiệu hóa khuyến mãi.");
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold lg:text-2xl">Khuyến mãi</h1>
          <p className="text-sm text-on-surface-variant">{promotions.length} mã từ backend</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white">
          <Plus className="h-4 w-4" /> Tạo mã mới
        </button>
      </div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {promotions.map((promotion) => {
            const expired = promotion.validTo < today;
            return (
              <div key={promotion.id} className="rounded-2xl border border-outline-variant/20 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Ticket className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono font-bold">{promotion.code}</h3>
                        <button onClick={() => void navigator.clipboard.writeText(promotion.code)} title="Sao chép mã">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold">{promotion.name}</p>
                      <p className="text-xs text-on-surface-variant">
                        {promotion.type === "PERCENTAGE" ? `Giảm ${promotion.value}%` : `Giảm ${money(promotion.value)}`} · đơn tối thiểu {money(promotion.minOrderAmount)}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${promotion.active && !expired ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {expired ? "Hết hạn" : promotion.active ? "Đang bật" : "Đã tắt"}
                  </span>
                </div>
                <div className="mt-4 text-xs text-on-surface-variant">
                  Đã dùng: <strong>{promotion.timesUsed}/{promotion.usageLimit ?? "∞"}</strong> · mỗi user: {promotion.usageLimitPerUser ?? "∞"}
                  <br />
                  {promotion.validFrom} → {promotion.validTo}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => openEdit(promotion)} className="rounded-lg p-2 hover:bg-surface-container">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    disabled={!promotion.active}
                    onClick={() => handleDelete(promotion)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-30"
                    title="Vô hiệu hóa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Promotion Form Modal */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => !saving && setIsModalOpen(false)} />
          <div className="fixed inset-4 z-50 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold">{editingId ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi"}</h2>
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={saving} className="p-2 rounded-xl hover:bg-surface-container disabled:opacity-50">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">Mã
                  <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} disabled={!!editingId} className="mt-1 w-full rounded-xl border p-2.5 disabled:opacity-50" />
                </label>
                <label className="text-sm font-semibold">Tên
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5" />
                </label>
                <label className="text-sm font-semibold">Loại
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as AdminPromotionInput["type"] })} className="mt-1 w-full rounded-xl border p-2.5">
                    <option value="PERCENTAGE">Phần trăm</option>
                    <option value="FIXED_AMOUNT">Số tiền</option>
                  </select>
                </label>
                <label className="text-sm font-semibold">Giá trị
                  <input required min="0.01" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="mt-1 w-full rounded-xl border p-2.5" />
                </label>
                <label className="text-sm font-semibold">Đơn tối thiểu
                  <input min="0" type="number" value={form.minOrderAmount || 0} onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })} className="mt-1 w-full rounded-xl border p-2.5" />
                </label>
                <label className="text-sm font-semibold">Giảm tối đa
                  <input min="0" type="number" value={form.maxDiscountAmount || 0} onChange={(e) => setForm({ ...form, maxDiscountAmount: Number(e.target.value) })} className="mt-1 w-full rounded-xl border p-2.5" />
                </label>
                <label className="text-sm font-semibold">Bắt đầu
                  <input required type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5" />
                </label>
                <label className="text-sm font-semibold">Kết thúc
                  <input required type="date" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5" />
                </label>
                <label className="text-sm font-semibold">Tổng lượt dùng
                  <input min="1" type="number" value={form.usageLimit || ""} onChange={(e) => setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : undefined })} className="mt-1 w-full rounded-xl border p-2.5" />
                </label>
                <label className="text-sm font-semibold">Lượt mỗi user
                  <input min="1" type="number" value={form.usageLimitPerUser || ""} onChange={(e) => setForm({ ...form, usageLimitPerUser: e.target.value ? Number(e.target.value) : undefined })} className="mt-1 w-full rounded-xl border p-2.5" />
                </label>
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Đang hoạt động
              </label>
              {error && <p className="mt-2 text-sm text-red-600 font-semibold">{error}</p>}
              <button disabled={saving} type="submit" className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-50">
                {saving ? "Đang lưu..." : "Lưu khuyến mãi"}
              </button>
            </form>
          </div>
        </>
      )}

      <AdminConfirmModal
        open={Boolean(promotionToDelete)}
        title="Vô hiệu hóa khuyến mãi"
        message={`Vô hiệu hóa mã "${promotionToDelete?.code}"? Khách hàng sẽ không thể sử dụng mã này.`}
        confirmLabel="Vô hiệu hóa"
        isProcessing={deleting}
        onClose={() => !deleting && setPromotionToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
