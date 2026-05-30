import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Edit2, Leaf, Plus, Trash2 } from "lucide-react";
import { createFarm, deleteFarm, getFarms, updateFarm, type Farm } from "../../services/farmService";

export default function Farms() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFarms = async () => {
    setIsLoading(true);
    setError("");
    try {
      setFarms(await getFarms());
    } catch (err: any) {
      setError(err?.message || "Khong the tai nong trai.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadFarms();
  }, []);

  const handleCreate = async () => {
    const name = window.prompt("Ten nong trai");
    if (!name?.trim()) return;
    const location = window.prompt("Dia diem") || "";
    try {
      await createFarm({ name: name.trim(), location, certification: "", contactPhone: "", contactEmail: "" });
      await loadFarms();
    } catch (err: any) {
      alert(err?.message || "Khong the tao nong trai.");
    }
  };

  const handleEdit = async (farm: Farm) => {
    const name = window.prompt("Ten nong trai", farm.name);
    if (!name?.trim()) return;
    const location = window.prompt("Dia diem", farm.location || "") || "";
    try {
      await updateFarm(farm.id, {
        name: name.trim(),
        location,
        certification: farm.certification || "",
        contactPhone: farm.contactPhone || "",
        contactEmail: farm.contactEmail || "",
      });
      await loadFarms();
    } catch (err: any) {
      alert(err?.message || "Khong the cap nhat nong trai.");
    }
  };

  const handleDelete = async (farm: Farm) => {
    if (!window.confirm(`Xoa nong trai "${farm.name}"?`)) return;
    try {
      await deleteFarm(farm.id);
      await loadFarms();
    } catch (err: any) {
      alert(err?.message || "Khong the xoa nong trai.");
    }
  };

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Nong trai</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{farms.length} nong trai tu backend</p>
        </div>
        <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all">
          <Plus className="w-4 h-4" /> Them nong trai
        </button>
      </motion.div>

      {isLoading && <p className="text-on-surface-variant">Dang tai nong trai...</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {farms.map((farm, index) => (
            <motion.div
              key={farm.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Leaf className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-on-surface">{farm.name}</h3>
                  <p className="text-sm text-on-surface-variant mt-1">{farm.location || "Chua co dia diem"}</p>
                  {farm.certification && <p className="text-xs text-primary font-bold mt-2">{farm.certification}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(farm)} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(farm)} className="p-1.5 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
