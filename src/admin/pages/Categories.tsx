import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Plus, FolderTree } from "lucide-react";
import CategoryFormModal, { type CategoryFormValues } from "../components/CategoryFormModal";
import { createProductCategory, getProductCategories, type ProductCategory } from "../../services/categoryService";
import { loadAdminDataWithFallback, sourceLabel, type AdminDataSource } from "../utils/dataSource";
import { getMockProductCategories } from "../utils/mockAdapters";

export default function Categories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dataSource, setDataSource] = useState<AdminDataSource>("api");
  const [dataNotice, setDataNotice] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCategories = async () => {
    setIsLoading(true);
    setError("");
    setDataNotice("");
    try {
      const result = await loadAdminDataWithFallback(getProductCategories, getMockProductCategories);
      setCategories(result.data);
      setDataSource(result.source);
      setDataNotice(result.error || (result.source === "mock" ? "Đang hiển thị dữ liệu mẫu." : ""));
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh mục.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadCategories(); }, []);

  const handleFormSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      if (dataSource === "mock") {
        setCategories((current) => [
          ...current,
          {
            id: Date.now(),
            name: values.name,
            slug: values.name.toLowerCase().replace(/\s+/g, "-"),
            parentId: null,
            sortOrder: current.length + 1,
          },
        ]);
        setIsFormModalOpen(false);
        return;
      }
      await createProductCategory({ name: values.name, sortOrder: categories.length + 1 });
      setIsFormModalOpen(false);
      await loadCategories();
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Danh mục</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{categories.length} danh mục {sourceLabel(dataSource)}</p>
        </div>
        <button onClick={() => setIsFormModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all">
          <Plus className="w-4 h-4" /> Thêm danh mục
        </button>
      </motion.div>

      {isLoading && <p className="text-on-surface-variant">Đang tải danh mục...</p>}
      {dataNotice && !isLoading && <p className="text-amber-700 text-sm font-semibold">{dataNotice}</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 hover:shadow-md hover:border-primary/10 transition-all group"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                  <FolderTree className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-on-surface">{category.name}</p>
                  <p className="text-xs text-on-surface-variant">{category.slug}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">Thứ tự: {category.sortOrder}</span>
                <span className="text-xs text-on-surface-variant">ID {category.id}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CategoryFormModal
        open={isFormModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
