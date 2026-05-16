import { useState } from "react";
import { motion } from "motion/react";
import { Search, Plus, Edit2, Trash2, Leaf, Package } from "lucide-react";
import { ADMIN_PRODUCTS, CATEGORIES } from "../mocks";
import ProductFormModal from "../components/ProductFormModal";
import type { AdminProduct } from "../types";

const statusMap: Record<AdminProduct["status"], { label: string; cls: string }> = {
  active: { label: "Dang ban", cls: "bg-emerald-50 text-emerald-700" },
  draft: { label: "Nhap", cls: "bg-surface-container-high text-on-surface-variant" },
  out_of_stock: { label: "Het hang", cls: "bg-red-50 text-red-600" },
};

export default function Products() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);

  const filtered = ADMIN_PRODUCTS.filter((product) => {
    if (
      search &&
      !product.name.toLowerCase().includes(search.toLowerCase()) &&
      !product.sku.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    if (catFilter !== "all" && product.category !== catFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface">San pham</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{ADMIN_PRODUCTS.length} san pham</p>
        </div>
        <button onClick={() => { setEditProduct(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all self-start">
          <Plus className="w-4 h-4" /> Them san pham
        </button>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-2 flex-1 max-w-md focus-within:border-primary/40 transition-colors">
          <Search className="w-4 h-4 text-on-surface-variant/50" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-on-surface-variant/40" placeholder="Tim theo ten, SKU..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[{ value: "all", label: "Tat ca" }, ...CATEGORIES.map((category) => ({ value: category.name, label: category.name }))].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setCatFilter(filter.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${catFilter === filter.value ? "bg-primary text-white border-primary shadow-sm" : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:border-primary/30"}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((product, index) => {
          const status = statusMap[product.status];

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden group hover:shadow-lg hover:border-primary/10 transition-all"
            >
              <div className="relative aspect-[4/3] bg-surface-container-low overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                    <Package className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  {product.organic && (
                    <span className="flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <Leaf className="w-3 h-3" />
                      Organic
                    </span>
                  )}
                  {product.isNew && <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Moi</span>}
                </div>
                <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${status.cls}`}>{status.label}</span>
              </div>
              <div className="p-4">
                <p className="text-[11px] text-on-surface-variant font-medium mb-1">{product.sku} · {product.category}</p>
                <h3 className="font-bold text-sm text-on-surface line-clamp-1 mb-2">{product.name}</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  {product.salePrice ? (
                    <>
                      <span className="font-bold text-primary">{product.salePrice.toLocaleString()}₫</span>
                      <span className="text-xs text-on-surface-variant line-through">{product.price.toLocaleString()}₫</span>
                    </>
                  ) : (
                    <span className="font-bold text-primary">{product.price.toLocaleString()}₫</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${product.stock <= 5 ? "text-red-600" : product.stock <= 15 ? "text-amber-600" : "text-on-surface-variant"}`}>
                    Ton kho: {product.stock}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditProduct(product); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-600 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <ProductFormModal product={editProduct} open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
