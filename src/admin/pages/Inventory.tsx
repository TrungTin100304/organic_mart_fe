import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, PackagePlus, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  createInventoryBatch,
  getInventoryBatches,
  type InventoryBatch,
  type InventoryBatchRequest,
} from "../../services/inventoryBatchService";
import { getProducts } from "../../services/productService";
import { getFarms, type Farm } from "../../services/farmService";
import type { Product } from "../../types";
import InventoryBatchFormModal from "../components/InventoryBatchFormModal";
import { loadAdminDataWithFallback, sourceLabel, type AdminDataSource } from "../utils/dataSource";
import { getMockAdminProducts, getMockInventoryBatches } from "../utils/mockAdapters";
import { ADMIN_FARMS } from "../mocks/farms";
import { buildInventoryProductStock } from "../utils/inventoryEntry";

export default function Inventory() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [dataSource, setDataSource] = useState<AdminDataSource>("api");
  const [dataNotice, setDataNotice] = useState("");
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [entryProductId, setEntryProductId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError("");
    setDataNotice("");
    try {
      const [batchResult, productResult, farmResult] = await Promise.all([
        loadAdminDataWithFallback(getInventoryBatches, getMockInventoryBatches),
        loadAdminDataWithFallback<Product[]>(
          async () => (await getProducts({ page: 0, size: 500 })).content,
          () => getMockAdminProducts() as unknown as Product[],
        ),
        loadAdminDataWithFallback(getFarms, () => ADMIN_FARMS),
      ]);
      setBatches(batchResult.data);
      setProducts(productResult.data);
      setFarms(farmResult.data);
      setDataSource(batchResult.source);
      setDataNotice(
        [batchResult.error, productResult.error, farmResult.error].filter(Boolean).join(" ") ||
          ([batchResult.source, productResult.source, farmResult.source].includes("mock")
            ? "Đang hiển thị dữ liệu mẫu."
            : ""),
      );
    } catch (err: any) {
      setError(err?.message || "Không thể tải tồn kho.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    const productId = searchParams.get("productId");
    if (!productId) return;
    setEntryProductId(productId);
    setShowEntryForm(true);
  }, [searchParams]);

  const productStock = useMemo(
    () => buildInventoryProductStock(products, batches),
    [products, batches],
  );

  const openEntryForm = (productId?: string | number) => {
    setEntryProductId(productId === undefined ? null : String(productId));
    setShowEntryForm(true);
  };

  const handleCreateBatch = async (payload: InventoryBatchRequest) => {
    setIsSubmitting(true);
    try {
      await createInventoryBatch(payload);
      setShowEntryForm(false);
      setEntryProductId(null);
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Không thể nhập kho sản phẩm.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = productStock.filter((item) => !search || item.productName.toLowerCase().includes(search.toLowerCase()));
  const outOfStock = productStock.filter((item) => item.quantity === 0).length;
  const lowStock = productStock.filter((item) => item.quantity > 0 && item.quantity <= 10).length;

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Quản lý tồn kho</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{lowStock} sản phẩm cần bổ sung, {sourceLabel(dataSource)}</p>
        </div>
        <button onClick={() => openEntryForm()} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all self-start">
          <PackagePlus className="w-4 h-4" /> Nhập kho
        </button>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Tổng sản phẩm", value: productStock.length, cls: "text-primary" },
          { label: "Hết hàng", value: outOfStock, cls: "text-red-600" },
          { label: "Sắp hết (<=10)", value: lowStock, cls: "text-amber-600" },
          { label: "Lô hàng", value: batches.length, cls: "text-emerald-700" },
        ].map((s, i) => (
          <div key={i} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-4 text-center">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-on-surface-variant mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-2 max-w-md focus-within:border-primary/40 transition-colors">
        <Search className="w-4 h-4 text-on-surface-variant/50" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-on-surface-variant/40" placeholder="Tìm sản phẩm..." />
      </div>

      {isLoading && <p className="text-on-surface-variant">Đang tải tồn kho...</p>}
      {dataNotice && !isLoading && <p className="text-amber-700 text-sm font-semibold">{dataNotice}</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {!isLoading && !error && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="text-left text-on-surface-variant/70 text-xs border-b border-outline-variant/20 bg-surface-container-low/30">
                  <th className="px-5 py-3 font-semibold">Sản phẩm</th>
                  <th className="px-5 py-3 font-semibold">ID</th>
                  <th className="px-5 py-3 font-semibold">Số lô</th>
                  <th className="px-5 py-3 font-semibold">Tồn kho</th>
                  <th className="px-5 py-3 font-semibold">Lô hết hạn</th>
                  <th className="px-5 py-3 font-semibold">Trạng thái</th>
                  <th className="px-5 py-3 font-semibold text-right">Thao tác</th>
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
                        <span className="flex items-center gap-1 text-[11px] font-bold text-red-600"><AlertTriangle className="w-3.5 h-3.5" />Hết hàng</span>
                      ) : item.quantity <= 10 ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600"><AlertTriangle className="w-3.5 h-3.5" />Sắp hết</span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700">Đủ hàng</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => openEntryForm(item.productId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-colors"
                      >
                        <PackagePlus className="w-3.5 h-3.5" /> Nhập kho
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InventoryBatchFormModal
        open={showEntryForm}
        products={products}
        farms={farms}
        initialProductId={entryProductId}
        isSubmitting={isSubmitting}
        onClose={() => {
          if (!isSubmitting) setShowEntryForm(false);
        }}
        onSubmit={handleCreateBatch}
      />
    </div>
  );
}
