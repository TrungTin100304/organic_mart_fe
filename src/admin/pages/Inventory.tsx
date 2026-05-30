import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Search } from "lucide-react";
import { getInventoryBatches, type InventoryBatch } from "../../services/inventoryBatchService";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    getInventoryBatches()
      .then((data) => {
        if (mounted) setBatches(data);
      })
      .catch((err: any) => {
        if (mounted) setError(err?.message || "Khong the tai ton kho.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const productStock = useMemo(() => {
    const map = new Map<number, { productId: number; productName: string; quantity: number; batchCount: number; expiredCount: number }>();
    batches.forEach((batch) => {
      const current = map.get(batch.productId) || {
        productId: batch.productId,
        productName: batch.productName,
        quantity: 0,
        batchCount: 0,
        expiredCount: 0,
      };
      current.quantity += Number(batch.quantityRemaining || 0);
      current.batchCount += 1;
      current.expiredCount += batch.expired ? 1 : 0;
      map.set(batch.productId, current);
    });
    return [...map.values()].sort((a, b) => a.quantity - b.quantity);
  }, [batches]);

  const filtered = productStock.filter((item) => !search || item.productName.toLowerCase().includes(search.toLowerCase()));
  const outOfStock = productStock.filter((item) => item.quantity === 0).length;
  const lowStock = productStock.filter((item) => item.quantity > 0 && item.quantity <= 10).length;

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Quan ly ton kho</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">{lowStock} san pham can bo sung</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Tong san pham", value: productStock.length, cls: "text-primary" },
          { label: "Het hang", value: outOfStock, cls: "text-red-600" },
          { label: "Sap het (<=10)", value: lowStock, cls: "text-amber-600" },
          { label: "Lo hang", value: batches.length, cls: "text-emerald-700" },
        ].map((s, i) => (
          <div key={i} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-4 text-center">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-on-surface-variant mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-2 max-w-md focus-within:border-primary/40 transition-colors">
        <Search className="w-4 h-4 text-on-surface-variant/50" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-on-surface-variant/40" placeholder="Tim san pham..." />
      </div>

      {isLoading && <p className="text-on-surface-variant">Dang tai ton kho...</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {!isLoading && !error && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="text-left text-on-surface-variant/70 text-xs border-b border-outline-variant/20 bg-surface-container-low/30">
                  <th className="px-5 py-3 font-semibold">San pham</th>
                  <th className="px-5 py-3 font-semibold">ID</th>
                  <th className="px-5 py-3 font-semibold">So lo</th>
                  <th className="px-5 py-3 font-semibold">Ton kho</th>
                  <th className="px-5 py-3 font-semibold">Lo het han</th>
                  <th className="px-5 py-3 font-semibold">Trang thai</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.productId} className="border-b border-outline-variant/10 hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-5 py-3 font-semibold text-on-surface">{item.productName}</td>
                    <td className="px-5 py-3 text-on-surface-variant">{item.productId}</td>
                    <td className="px-5 py-3 text-on-surface-variant">{item.batchCount}</td>
                    <td className="px-5 py-3">
                      <span className={`font-bold ${item.quantity === 0 ? "text-red-600" : item.quantity <= 10 ? "text-amber-600" : "text-emerald-700"}`}>{item.quantity}</span>
                    </td>
                    <td className="px-5 py-3 text-on-surface-variant">{item.expiredCount}</td>
                    <td className="px-5 py-3">
                      {item.quantity === 0 ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-red-600"><AlertTriangle className="w-3.5 h-3.5" />Het hang</span>
                      ) : item.quantity <= 10 ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600"><AlertTriangle className="w-3.5 h-3.5" />Sap het</span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700">Du hang</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
