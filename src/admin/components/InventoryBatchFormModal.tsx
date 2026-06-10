import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PackagePlus, X } from "lucide-react";
import type { Product } from "../../types";
import type { Farm } from "../../services/farmService";
import type { InventoryBatchRequest } from "../../services/inventoryBatchService";
import {
  createInventoryBatchPayload,
  type InventoryEntryFormValues,
} from "../utils/inventoryEntry";

interface InventoryBatchFormModalProps {
  open: boolean;
  products: Product[];
  farms: Farm[];
  initialProductId?: string | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: InventoryBatchRequest) => Promise<void> | void;
}

const dateValue = (date: Date) => date.toISOString().slice(0, 10);

const createInitialForm = (
  products: Product[],
  farms: Farm[],
  initialProductId?: string | null,
): InventoryEntryFormValues => {
  const today = new Date();
  const expiry = new Date(today);
  expiry.setDate(expiry.getDate() + 7);

  return {
    productId: initialProductId || products[0]?.id || "",
    farmId: farms[0]?.id ? String(farms[0].id) : "",
    batchCode: `LOT-${dateValue(today).replaceAll("-", "")}-${String(Date.now()).slice(-5)}`,
    quantity: "",
    importDate: dateValue(today),
    expiryDate: dateValue(expiry),
    costPrice: "",
  };
};

export default function InventoryBatchFormModal({
  open,
  products,
  farms,
  initialProductId,
  isSubmitting = false,
  onClose,
  onSubmit,
}: InventoryBatchFormModalProps) {
  const [form, setForm] = useState<InventoryEntryFormValues>(() =>
    createInitialForm(products, farms, initialProductId),
  );
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm(createInitialForm(products, farms, initialProductId));
    setValidationError("");
  }, [open, products, farms, initialProductId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const quantity = Number(form.quantity);
    const costPrice = form.costPrice.trim() ? Number(form.costPrice) : 0;

    if (!form.productId || !form.farmId || !form.batchCode.trim()) {
      setValidationError("Vui lòng chọn sản phẩm, nông trại và nhập mã lô.");
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setValidationError("Số lượng nhập phải lớn hơn 0.");
      return;
    }
    if (!form.importDate || !form.expiryDate || form.expiryDate <= form.importDate) {
      setValidationError("Ngày hết hạn phải sau ngày nhập kho.");
      return;
    }
    if (!Number.isFinite(costPrice) || costPrice < 0) {
      setValidationError("Giá vốn phải là số lớn hơn hoặc bằng 0.");
      return;
    }

    setValidationError("");
    await onSubmit(createInventoryBatchPayload(form));
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
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed inset-4 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-xl lg:max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-2xl z-50 overflow-y-auto"
          >
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <PackagePlus className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-on-surface">Nhập kho sản phẩm</h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">Tạo lô mới để cộng số lượng vào tồn kho.</p>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="sm:col-span-2">
                  <span className="text-xs font-bold text-on-surface-variant mb-1.5 block">Sản phẩm</span>
                  <select
                    required
                    value={form.productId}
                    onChange={(event) => setForm({ ...form, productId: event.target.value })}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40"
                  >
                    <option value="">Chọn sản phẩm</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="text-xs font-bold text-on-surface-variant mb-1.5 block">Nông trại / nguồn hàng</span>
                  <select
                    required
                    value={form.farmId}
                    onChange={(event) => setForm({ ...form, farmId: event.target.value })}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40"
                  >
                    <option value="">Chọn nông trại</option>
                    {farms.map((farm) => (
                      <option key={farm.id} value={farm.id}>{farm.name}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="text-xs font-bold text-on-surface-variant mb-1.5 block">Mã lô</span>
                  <input
                    required
                    value={form.batchCode}
                    onChange={(event) => setForm({ ...form, batchCode: event.target.value })}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40"
                  />
                </label>

                <label>
                  <span className="text-xs font-bold text-on-surface-variant mb-1.5 block">Số lượng nhập</span>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.quantity}
                    onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                    placeholder="VD: 50"
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40"
                  />
                </label>

                <label>
                  <span className="text-xs font-bold text-on-surface-variant mb-1.5 block">Giá vốn / đơn vị (không bắt buộc)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.costPrice}
                    onChange={(event) => setForm({ ...form, costPrice: event.target.value })}
                    placeholder="VD: 12000"
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40"
                  />
                </label>

                <label>
                  <span className="text-xs font-bold text-on-surface-variant mb-1.5 block">Ngày nhập kho</span>
                  <input
                    required
                    type="date"
                    value={form.importDate}
                    onChange={(event) => setForm({ ...form, importDate: event.target.value })}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40"
                  />
                </label>

                <label>
                  <span className="text-xs font-bold text-on-surface-variant mb-1.5 block">Ngày hết hạn</span>
                  <input
                    required
                    type="date"
                    min={form.importDate}
                    value={form.expiryDate}
                    onChange={(event) => setForm({ ...form, expiryDate: event.target.value })}
                    className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40"
                  />
                </label>
              </div>

              {validationError && <p className="text-sm font-semibold text-red-600 mt-4">{validationError}</p>}
              {!products.length && <p className="text-sm font-semibold text-amber-700 mt-4">Cần tạo sản phẩm trước khi nhập kho.</p>}
              {!farms.length && <p className="text-sm font-semibold text-amber-700 mt-4">Cần tạo ít nhất một nông trại trước khi nhập kho.</p>}

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-outline-variant/30 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container">
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !products.length || !farms.length}
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmitting ? "Đang nhập kho..." : "Xác nhận nhập kho"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
