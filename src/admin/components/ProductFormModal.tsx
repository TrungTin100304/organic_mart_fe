import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ImageIcon, PackagePlus, Trash2, Upload, X } from "lucide-react";
import type { AdminProduct } from "../types";
import type { ProductCategory } from "../../services/categoryService";
import type { ProductFormValues } from "../../services/productService";
import { IMAGE_ACCEPT, validateImageFile } from "../../utils/imageUpload";

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
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setForm({
      name: product?.name || "",
      categoryId: product?.categoryId || (categories[0]?.id ? String(categories[0].id) : ""),
      price: product?.price ? String(product.price) : "",
      unit: product?.unit || "kg",
      status: product?.status === "draft" ? "draft" : "active",
      description: product?.description || "",
      storageInstructions: product?.storageInstructions || "",
      detailedDescription: product?.detailedDescription || "",
    });
    setImageFile(null);
    setPreviewUrl(product?.image || "");
    setImageError("");
    setSubmitError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open, product, categories]);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  const resetSelectedImage = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setImageFile(null);
    setPreviewUrl(product?.image || "");
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      setImageError(error);
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setImageFile(file);
    setPreviewUrl(objectUrl);
    setImageError("");
    setSubmitError("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError("");
    try {
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
    } catch (error: any) {
      setSubmitError(error?.message || "Không thể lưu sản phẩm.");
    }
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
                <h2 className="text-lg font-bold">{product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
                <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={IMAGE_ACCEPT}
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
                {previewUrl && (
                  <div className="flex flex-col gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-low/40 p-4 sm:flex-row">
                    <div className="aspect-square w-full shrink-0 overflow-hidden rounded-xl border border-outline-variant/30 bg-white sm:w-36">
                      <img src={previewUrl} alt="Xem trước ảnh sản phẩm" className="size-full object-contain" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <p className="truncate text-sm font-bold text-on-surface">{imageFile?.name || "Ảnh sản phẩm hiện tại"}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">JPEG, PNG hoặc WEBP, tối đa 5MB</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                        >
                          <Upload className="size-3.5" /> Đổi ảnh
                        </button>
                        {imageFile && (
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={resetSelectedImage}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/40 px-3 py-2 text-xs font-bold text-on-surface-variant disabled:opacity-50"
                          >
                            <Trash2 className="size-3.5" /> Xóa ảnh đã chọn
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {!previewUrl && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-outline-variant/40 rounded-2xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <ImageIcon className="w-8 h-8 text-on-surface-variant/40 mx-auto mb-2" />
                    <p className="text-sm font-bold text-on-surface">Chọn ảnh sản phẩm</p>
                    <p className="text-xs text-on-surface-variant/50 mt-1">JPEG, PNG hoặc WEBP, tối đa 5MB</p>
                  </button>
                )}
                {imageError && <p className="text-sm font-semibold text-red-600">{imageError}</p>}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Tên sản phẩm</label>
                    <input
                      required
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                      placeholder="VD: Rau cải organic 300gr"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Danh mục</label>
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
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Giá (đ)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(event) => setForm({ ...form, price: event.target.value })}
                      className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Đơn vị</label>
                    <input
                      value={form.unit}
                      onChange={(event) => setForm({ ...form, unit: event.target.value })}
                      onBlur={(event) => setForm({ ...form, unit: event.target.value.trim() || "kg" })}
                      className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                      placeholder="kg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Trạng thái</label>
                    <select
                      value={form.status}
                      onChange={(event) => setForm({ ...form, status: event.target.value })}
                      className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    >
                      <option value="active">Đang bán</option>
                      <option value="draft">Nháp</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Mô tả ngắn</label>
                    <textarea
                      value={form.description}
                      onChange={(event) => setForm({ ...form, description: event.target.value })}
                      rows={2}
                      className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all resize-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Hướng dẫn bảo quản</label>
                    <input
                      value={form.storageInstructions}
                      onChange={(event) => setForm({ ...form, storageInstructions: event.target.value })}
                      className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-on-surface-variant mb-1.5 block">Mô tả chi tiết</label>
                    <textarea
                      value={form.detailedDescription}
                      onChange={(event) => setForm({ ...form, detailedDescription: event.target.value })}
                      rows={3}
                      className="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm bg-surface-container-lowest outline-none focus:border-primary/40 transition-all resize-none"
                    />
                  </div>
                </div>
                {!product && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-primary/5 border border-primary/15 px-3.5 py-3 text-sm text-on-surface-variant">
                    <PackagePlus className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p><span className="font-bold text-on-surface">Số lượng được quản lý theo từng lô nhập kho.</span> Sau khi tạo sản phẩm, bấm biểu tượng nhập kho trên thẻ sản phẩm để thêm số lượng.</p>
                  </div>
                )}
                {submitError && (
                  <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-semibold text-red-700">
                    {submitError}
                  </p>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-outline-variant/30 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors">Hủy</button>
                  <button disabled={isSubmitting} type="submit" className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50">
                    {isSubmitting ? "Đang lưu..." : product ? "Cập nhật" : "Tạo sản phẩm"}
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
