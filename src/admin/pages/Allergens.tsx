import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Plus } from "lucide-react";
import type { Allergen } from "../../types/user";
import { createAllergen, getAllAllergens } from "../../services/allergenService";

export default function Allergens() {
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAllergens = async () => {
    setIsLoading(true);
    setError("");
    try {
      setAllergens(await getAllAllergens());
    } catch (err: any) {
      setError(err?.message || "Khong the tai chat gay di ung.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAllergens();
  }, []);

  const handleCreate = async () => {
    const name = window.prompt("Ten chat gay di ung");
    if (!name?.trim()) return;
    try {
      await createAllergen(name.trim());
      await loadAllergens();
    } catch (err: any) {
      alert(err?.message || "Khong the tao chat gay di ung.");
    }
  };

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Chat gay di ung</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{allergens.length} muc tu backend</p>
        </div>
        <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all">
          <Plus className="w-4 h-4" /> Them moi
        </button>
      </motion.div>

      {isLoading && <p className="text-on-surface-variant">Dang tai chat gay di ung...</p>}
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
              <div>
                <p className="font-bold text-sm text-on-surface">{allergen.name}</p>
                <p className="text-xs text-on-surface-variant">ID {allergen.id}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
