import { AnimatePresence, motion } from "motion/react";
import { Upload, X } from "lucide-react";
import { CATEGORIES } from "../mocks";
import type { AdminProduct } from "../types";

interface ProductFormModalProps {
  product: AdminProduct | null;
  open: boolean;
  onClose: () => void;
}

export default function ProductFormModal({ product, open, onClose }: ProductFormModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-2xl lg:max-h-[85vh] bg-surface-container-lowest rounded-2xl shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">{product ? "Chinh sua san pham" : "Them san pham moi"}</h2>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-outline-variant/40 rounded-2xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-on-surface-variant/40 mx-auto mb-2" />
                  <p className="text-sm text-on-surface-variant">Keo tha hoac click de tai anh</p>
                  <p className="text-xs text-on-surface-variant/50 mt-1">PNG, JPG toi da 5MB</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Ten san pham</label>
                    <input defaultValue={product?.name} className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all" placeholder="VD: Rau cai organic 300gr" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">SKU</label>
                    <input defaultValue={product?.sku} className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Danh muc</label>
                    <select defaultValue={product?.category} className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all">
                      {CATEGORIES.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Gia (₫)</label>
                    <input type="number" defaultValue={product?.price} className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Gia sale (₫)</label>
                    <input type="number" defaultValue={product?.salePrice} className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all" placeholder="De trong neu khong sale" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Ton kho</label>
                    <input type="number" defaultValue={product?.stock} className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Trang thai</label>
                    <select defaultValue={product?.status || "active"} className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all">
                      <option value="active">Dang ban</option>
                      <option value="draft">Nhap</option>
                      <option value="out_of_stock">Het hang</option>
                    </select>
                  </div>
                  <div className="col-span-2 flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked={product?.organic} className="w-4 h-4 rounded border-outline text-primary focus:ring-primary" />
                      <span className="text-sm font-medium">Chung nhan Organic</span>
                    </label>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Mo ta</label>
                    <textarea rows={3} className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all resize-none" placeholder="Mo ta chi tiet san pham..." />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={onClose} className="flex-1 py-2.5 border border-outline-variant/30 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">Huy</button>
                  <button onClick={onClose} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all">
                    {product ? "Cap nhat" : "Tao san pham"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
