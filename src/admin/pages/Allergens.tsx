import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Edit2, Plus, Trash2 } from "lucide-react";
import AdminConfirmModal from "../components/AdminConfirmModal";
import AllergenFormModal, { type AllergenFormValues } from "../components/AllergenFormModal";
import type { Allergen } from "../../types/user";
import { createAllergen, deleteAllergen, getAllAllergens, updateAllergen } from "../../services/allergenService";
import { ADMIN_ALLERGENS } from "../mocks/allergens";
import { loadAdminDataWithFallback, sourceLabel, type AdminDataSource } from "../utils/dataSource";

export default function Allergens() {
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAllergen, setEditingAllergen] = useState<Allergen | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Allergen | null>(null);
  const [error, setError] = useState("");
  const [dataSource, setDataSource] = useState<AdminDataSource>("api");
  const [dataNotice, setDataNotice] = useState("");

  const loadAllergens = async () => {
    setIsLoading(true);
    setError("");
    setDataNotice("");
    try {
      const result = await loadAdminDataWithFallback(getAllAllergens, () => ADMIN_ALLERGENS);
      setAllergens(result.data);
      setDataSource(result.source);
      setDataNotice(result.error || (result.source === "mock" ? "Đang hiển thị dữ liệu mẫu." : ""));
    } catch (err: any) {
      setError(err?.message || "Không thể tải chất gây dị ứng.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAllergens();
  }, []);

  const handleCreate = () => {
    setEditingAllergen(null);
    setShowForm(true);
  };

  const handleEdit = (allergen: Allergen) => {
    setEditingAllergen(allergen);
    setShowForm(true);
  };

  const handleSubmit = async ({ name }: AllergenFormValues) => {
    const nextName = name.trim();
    if (!nextName) return;

    if (dataSource === "mock") {
      setAllergens((current) =>
        editingAllergen
          ? current.map((allergen) => (allergen.id === editingAllergen.id ? { ...allergen, name: nextName } : allergen))
          : [{ id: Date.now(), name: nextName }, ...current],
      );
      setShowForm(false);
      setEditingAllergen(null);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAllergen) {
        await updateAllergen(editingAllergen.id, nextName);
      } else {
        await createAllergen(nextName);
      }
      setShowForm(false);
      setEditingAllergen(null);
      await loadAllergens();
    } catch (err: any) {
      alert(err?.message || "Không thể lưu chất gây dị ứng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (allergen: Allergen) => {
    setDeleteTarget(allergen);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (dataSource === "mock") {
      setAllergens((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAllergen(deleteTarget.id);
      setDeleteTarget(null);
      await loadAllergens();
    } catch (err: any) {
      alert(err?.message || "Không thể xóa chất gây dị ứng.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Chất gây dị ứng</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{allergens.length} mục {sourceLabel(dataSource)}</p>
        </div>
        <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all">
          <Plus className="w-4 h-4" /> Thêm mới
        </button>
      </motion.div>

      {isLoading && <p className="text-on-surface-variant">Đang tải chất gây dị ứng...</p>}
      {dataNotice && !isLoading && <p className="text-amber-700 text-sm font-semibold">{dataNotice}</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {allergens.map((allergen, index) => (
            <motion.div
              key={allergen.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-on-surface">{allergen.name}</p>
                <p className="text-xs text-on-surface-variant">ID {allergen.id}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleEdit(allergen)} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors" title="Sửa">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(allergen)} className="p-1.5 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-600 transition-colors" title="Xóa">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AllergenFormModal
        open={showForm}
        initialName={editingAllergen?.name || ""}
        isSubmitting={isSubmitting}
        onClose={() => { setShowForm(false); setEditingAllergen(null); }}
        onSubmit={handleSubmit}
      />
      <AdminConfirmModal
        open={Boolean(deleteTarget)}
        title="Xóa chất gây dị ứng"
        message={deleteTarget ? `Bạn có chắc chắn muốn xóa "${deleteTarget.name}"?` : ""}
        confirmLabel="Xóa"
        isProcessing={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
