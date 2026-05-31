import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { getInventoryBatches, type InventoryBatch } from "../../services/inventoryBatchService";
import { loadAdminDataWithFallback } from "../utils/dataSource";
import { getMockInventoryBatches } from "../utils/mockAdapters";

export default function LowStockAlert() {
  const [batches, setBatches] = useState<InventoryBatch[]>([]);

  useEffect(() => {
    loadAdminDataWithFallback(getInventoryBatches, getMockInventoryBatches)
      .then((result) => setBatches(result.data))
      .catch(() => setBatches([]));
  }, []);

  const lowStock = useMemo(() => {
    const stockMap = new Map<number, { id: number; name: string; stock: number }>();
    batches.forEach((batch) => {
      const current = stockMap.get(batch.productId) || { id: batch.productId, name: batch.productName, stock: 0 };
      current.stock += Number(batch.quantityRemaining || 0);
      stockMap.set(batch.productId, current);
    });
    return [...stockMap.values()].filter((product) => product.stock <= 10 && product.stock > 0).sort((a, b) => a.stock - b.stock);
  }, [batches]);

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-on-surface flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" /> Canh bao ton kho
        </h3>
        <Link to="/admin/inventory" className="text-xs font-bold text-primary hover:underline">Xem kho</Link>
      </div>
      <div className="space-y-3">
        {lowStock.map((product) => (
          <div key={product.id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
              <Package className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface truncate">{product.name}</p>
              <p className="text-[11px] text-on-surface-variant">ID {product.id}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${product.stock <= 5 ? "text-red-600" : "text-amber-600"}`}>Con {product.stock}</p>
            </div>
          </div>
        ))}
        {lowStock.length === 0 && (
          <p className="text-sm text-on-surface-variant text-center py-4">Ton kho on dinh</p>
        )}
      </div>
    </div>
  );
}
