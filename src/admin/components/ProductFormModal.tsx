import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Upload, X } from "lucide-react";
import type { AdminProduct } from "../types";
import type { ProductCategory } from "../../services/categoryService";
import type { ProductFormValues } from "../../services/productService";

interface ProductFormModalProps {
  product: AdminProduct | null;
  categories: ProductCategory[];
  open: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
}

export default function ProductFormModal({
  product,
  categories,
  open,
  isSubmitting = false,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    price: "",
    unit: "kg",
    status: "active",
    description: "",
    storageInstructions: "",
    detailedDescription: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      name: product?.name || "",
      categoryId: product?.categoryId || (categories[0]?.id ? String(categories[0].id) : ""),
      price: product?.price ? String(product.price) : "",
      unit: product?.unit || "kg",
      status: product?.status || "active",
      description: product?.description || "",
      storageInstructions: product?.storageInstructions || "",
      detailedDescription: product?.detailedDescription || "",
    });
    setImageFile(null);
  }, [open, product, categories]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit({
      name: form.name,
      categoryId: form.categoryId,
      price: form.price,
      unit: form.unit,
      description: form.description,
      storageInstructions: form.storageInstructions,
      detailedDescription: form.detailedDescription,
      isActive: form.status === "active",
      imageFile,
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
            className="fixed inset-4 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-2xl lg:max-h-[85vh] bg-surface-container-lowest rounded-2xl shadow-2xl z-50 overflow-y-auto"
          >
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">{product ? "Chinh sua san pham" : "Them san pham moi"}</h2>
                <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-outline-variant/40 rounded-2xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-on-surface-variant/40 mx-auto mb-2" />
                  <p className="text-sm text-on-surface-variant">{imageFile ? imageFile.name : "Click de tai anh san pham"}</p>
                  <p className="text-xs text-on-surface-variant/50 mt-1">PNG, JPG toi da 5MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                  />
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Ten san pham</label>
                    <input
                      required
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                      placeholder="VD: Rau cai organic 300gr"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Danh muc</label>
                    <select
                      required
                      value={form.categoryId}
                      onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                      className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Gia (d)</label>
                    <input
                      required
                      type="number"
                      value={form.price}
                      onChange={(event) => setForm({ ...form, price: event.target.value })}
                      className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Don vi</label>
                    <input
                      value={form.unit}
                      onChange={(event) => setForm({ ...form, unit: event.target.value })}
                      className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Trang thai</label>
                    <select
                      value={form.status}
                      onChange={(event) => setForm({ ...form, status: event.target.value })}
                      className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    >
                      <option value="active">Dang ban</option>
                      <option value="draft">Nhap</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Mo ta ngan</label>
                    <textarea
                      value={form.description}
                      onChange={(event) => setForm({ ...form, description: event.target.value })}
                      rows={2}
                      className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all resize-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Huong dan bao quan</label>
                    <input
                      value={form.storageInstructions}
                      onChange={(event) => setForm({ ...form, storageInstructions: event.target.value })}
                      className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Mo ta chi tiet</label>
                    <textarea
                      value={form.detailedDescription}
                      onChange={(event) => setForm({ ...form, detailedDescription: event.target.value })}
                      rows={3}
                      className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-outline-variant/30 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">Huy</button>
                  <button disabled={isSubmitting} type="submit" className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50">
                    {isSubmitting ? "Dang luu..." : product ? "Cap nhat" : "Tao san pham"}
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
