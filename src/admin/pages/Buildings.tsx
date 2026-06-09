import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Building2, Plus, Edit2, Power, Trash2 } from "lucide-react";
import AdminConfirmModal from "../components/AdminConfirmModal";
import {
  getAllBuildings,
  createBuilding,
  updateBuilding,
  toggleBuildingStatus,
  type ResidentialBuilding,
} from "../../services/adminBuildingService";

export default function Buildings() {
  const [buildings, setBuildings] = useState<ResidentialBuilding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [buildingToToggle, setBuildingToToggle] = useState<ResidentialBuilding | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadBuildings = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getAllBuildings();
      setBuildings(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể tải tòa nhà.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadBuildings(); }, []);

  const handleCreate = async () => {
    const code = window.prompt("Mã tòa nhà (VD: A, B, C):");
    if (!code?.trim()) return;
    const name = window.prompt("Tên tòa nhà:");
    if (!name?.trim()) return;
    const description = window.prompt("Mô tả (tuỳ chọn):") || "";
    const displayOrder = parseInt(window.prompt("Thứ tự hiển thị:", "0") || "0", 10);

    setIsProcessing(true);
    try {
      await createBuilding({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description,
        displayOrder,
        isActive: true,
      });
      await loadBuildings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Không thể tạo tòa nhà.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = async (building: ResidentialBuilding) => {
    const name = window.prompt("Tên tòa nhà:", building.name);
    if (!name?.trim()) return;
    const description = window.prompt("Mô tả:", building.description || "") || "";
    const displayOrder = parseInt(window.prompt("Thứ tự hiển thị:", String(building.displayOrder)) || String(building.displayOrder), 10);

    setIsProcessing(true);
    try {
      await updateBuilding(building.id, {
        code: building.code,
        name: name.trim(),
        description,
        displayOrder,
        isActive: building.isActive,
      });
      await loadBuildings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Không thể cập nhật tòa nhà.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggle = (building: ResidentialBuilding) => {
    setBuildingToToggle(building);
  };

  const handleConfirmToggle = async () => {
    if (!buildingToToggle) return;
    setIsProcessing(true);
    try {
      await toggleBuildingStatus(buildingToToggle.id, !buildingToToggle.isActive);
      await loadBuildings();
      setBuildingToToggle(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Không thể cập nhật trạng thái.");
    } finally {
      setIsProcessing(false);
    }
  };

  const activeCount = buildings.filter((b) => b.isActive).length;

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Tòa nhà</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {activeCount} / {buildings.length} tòa nhà đang hoạt động
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={isProcessing}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Thêm tòa nhà
        </button>
      </motion.div>

      {isLoading && <p className="text-on-surface-variant">Đang tải tòa nhà...</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {!isLoading && !error && (
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/20">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-high text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Mã</th>
                <th className="px-4 py-3 text-left">Tên tòa nhà</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Mô tả</th>
                <th className="px-4 py-3 text-center">Thứ tự</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {buildings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-on-surface-variant">
                    Chưa có tòa nhà nào.
                  </td>
                </tr>
              ) : (
                buildings.map((building) => (
                  <tr key={building.id} className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-bold text-primary">{building.code}</td>
                    <td className="px-4 py-3 font-semibold text-on-surface">{building.name}</td>
                    <td className="px-4 py-3 text-on-surface-variant hidden md:table-cell">{building.description || "—"}</td>
                    <td className="px-4 py-3 text-center text-on-surface-variant">{building.displayOrder}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                        building.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}>
                        {building.isActive ? "Hoạt động" : "Tắt"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(building)}
                          className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                          title="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggle(building)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            building.isActive
                              ? "hover:bg-red-50 text-on-surface-variant hover:text-red-600"
                              : "hover:bg-emerald-50 text-on-surface-variant hover:text-emerald-600"
                          }`}
                          title={building.isActive ? "Tắt tòa nhà" : "Bật tòa nhà"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <AdminConfirmModal
        open={Boolean(buildingToToggle)}
        title={buildingToToggle?.isActive ? "Tắt tòa nhà" : "Bật tòa nhà"}
        message={
          buildingToToggle?.isActive
            ? `Tắt tòa nhà "${buildingToToggle?.name}"? Cư dân sẽ không thể chọn tòa nhà này khi giao hàng.`
            : `Bật tòa nhà "${buildingToToggle?.name}"?`
        }
        confirmLabel={buildingToToggle?.isActive ? "Tắt" : "Bật"}
        isProcessing={isProcessing}
        onClose={() => !isProcessing && setBuildingToToggle(null)}
        onConfirm={handleConfirmToggle}
      />
    </div>
  );
}
