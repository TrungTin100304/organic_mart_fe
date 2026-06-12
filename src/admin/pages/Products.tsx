import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, Plus, Edit2, Trash2, Leaf, Package, PackagePlus, RefreshCw } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminConfirmModal from "../components/AdminConfirmModal";
import ProductFormModal from "../components/ProductFormModal";
import type { AdminProduct } from "../types";
import type { Product } from "../../types";
import { createProduct, deleteProduct, getProducts, updateProduct, type ProductFormValues } from "../../services/productService";
import { getProductCategories, type ProductCategory } from "../../services/categoryService";
import { getInventoryBatches, type InventoryBatch } from "../../services/inventoryBatchService";
import { loadAdminDataWithFallback, sourceLabel, type AdminDataSource } from "../utils/dataSource";
import { getMockAdminProducts, getMockInventoryBatches, getMockProductCategories } from "../utils/mockAdapters";
import { getCurrentUser } from "../../services/userService";
import { isAdminRole, normalizeRole } from "../../services/apiClient";

const statusMap: Record<AdminProduct["status"], { label: string; cls: string }> = {
  active: { label: "Đang bán", cls: "bg-emerald-50 text-emerald-700" },
  draft: { label: "Nháp", cls: "bg-surface-container-high text-on-surface-variant" },
  out_of_stock: { label: "Hết hàng", cls: "bg-red-50 text-red-600" },
};

const toAdminProduct = (product: Product, batches: InventoryBatch[]): AdminProduct => {
  const stock = batches
    .filter((batch) => String(batch.productId) === product.id)
    .reduce((sum, batch) => sum + Number(batch.quantityRemaining || 0), 0);
  const status: AdminProduct["status"] = product.isActive === false ? "draft" : stock <= 0 ? "out_of_stock" : "active";

  return {
    id: product.id,
    name: product.name,
    sku: product.slug || `SP-${product.id}`,
    category: product.category,
    categoryId: product.categoryId,
    price: product.price,
    stock,
    status,
    organic: product.organic,
    image: product.image,
    updatedAt: product.updatedAt || product.createdAt || "",
    unit: product.unit,
    description: product.description,
    storageInstructions: product.storageInstructions,
    detailedDescription: product.detailedDescription,
  };
};

export default function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [productSource, setProductSource] = useState<AdminDataSource>("api");
  const [dataNotice, setDataNotice] = useState("");
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);
  const [isDeleteProcessing, setIsDeleteProcessing] = useState(false);
  const [currentRole, setCurrentRole] = useState<string>(() => {
    try {
      return localStorage.getItem("userRole") || "ROLE_USER";
    } catch {
      return "ROLE_USER";
    }
  });

  const loadData = async () => {
    setIsLoading(true);
    setError("");
    setDataNotice("");
    try {
      const [productResult, batchesResult, categoryResult] = await Promise.all([
        loadAdminDataWithFallback<Product[]>(
          async () => {
            const productPage = await getProducts({ page: 0, size: 200 });
            return productPage.content;
          },
          () => getMockAdminProducts() as unknown as Product[],
        ),
        loadAdminDataWithFallback(getInventoryBatches, getMockInventoryBatches),
        loadAdminDataWithFallback(getProductCategories, getMockProductCategories),
      ]);

      setProducts(productResult.data.map((product) => toAdminProduct(product, batchesResult.data)));
      setCategories(categoryResult.data);
      setProductSource(productResult.source);
      setDataNotice(
        [productResult.error, categoryResult.error].filter(Boolean).join(" ") ||
          (productResult.source === "mock" || categoryResult.source === "mock"
            ? "Đang hiển thị dữ liệu mẫu."
            : ""),
      );
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách sản phẩm.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    void syncRole();
  }, []);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setEditProduct(null);
      setShowForm(true);
    }
  }, [searchParams]);

  const closeProductForm = () => {
    setShowForm(false);
    setEditProduct(null);
    if (searchParams.has("create")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("create");
      setSearchParams(nextParams, { replace: true });
    }
  };

  const syncRole = async () => {
    try {
      const me = await getCurrentUser();
      const role = normalizeRole(me.role);
      setCurrentRole(role);
      if (!isAdminRole(role)) {
        setDataNotice(`Cảnh báo: Tài khoản hiện tại có role "${role}" — không phải admin. Một số thao tác sẽ bị từ chối.`);
      }
    } catch (err: any) {
      // ignore — admin guard already handles 401
    }
  };

  const filtered = useMemo(() => products.filter((product) => {
    if (search && !product.name.toLowerCase().includes(search.toLowerCase()) && !product.sku.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    if (catFilter !== "all" && product.categoryId !== catFilter && product.category !== catFilter) {
      return false;
    }

    return true;
  }), [products, search, catFilter]);

  const handleSubmit = async (values: ProductFormValues) => {
    if (!values.name.trim()) {
      alert("Vui lòng nhập tên sản phẩm.");
      return;
    }
    if (!values.categoryId) {
      alert("Vui lòng chọn danh mục.");
      return;
    }
    const priceValue = Number(values.price);
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      alert("Giá sản phẩm phải là số >= 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ProductFormValues = {
        ...values,
        name: values.name.trim(),
        price: priceValue,
        unit: (values.unit || "kg").trim() || "kg",
      };
      if (editProduct) {
        await updateProduct(editProduct.id, payload);
      } else {
        await createProduct(payload);
      }
      closeProductForm();
      await loadData();
    } catch (err: any) {
      throw new Error(err?.message || "Không thể lưu sản phẩm.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (product: AdminProduct) => {
    setProductToDelete(product);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleteProcessing(true);
    try {
      await deleteProduct(productToDelete.id);
      await loadData();
      setProductToDelete(null);
    } catch (err: any) {
      const message = err?.message || "Không thể xóa sản phẩm.";
      if (/403|forbidden/i.test(message)) {
        alert(`403 — Backend từ chối quyền xóa sản phẩm.\n\nChi tiết: ${message}`);
      } else {
        alert(message);
      }
    } finally {
      setIsDeleteProcessing(false);
    }
  };

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Sản phẩm</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {products.length} sản phẩm {sourceLabel(productSource)} · Role: <span className={`font-bold ${currentRole === "ROLE_ADMIN" ? "text-primary" : "text-red-600"}`}>{currentRole}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void syncRole()} className="flex items-center gap-2 px-3 py-2.5 border border-outline-variant/30 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container" title="Đồng bộ role từ /users/me">
            <RefreshCw className="w-4 h-4" /> Sync role
          </button>
          <button onClick={() => { setEditProduct(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all self-start">
            <Plus className="w-4 h-4" /> Thêm sản phẩm
          </button>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-2 flex-1 max-w-md focus-within:border-primary/40 transition-colors">
          <Search className="w-4 h-4 text-on-surface-variant/50" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-on-surface-variant/40" placeholder="Tìm theo tên, SKU..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[{ value: "all", label: "Tất cả" }, ...categories.map((category) => ({ value: category.name, label: category.name }))].map((filter) => (
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

      {isLoading && <p className="text-on-surface-variant">Đang tải sản phẩm...</p>}
      {dataNotice && !isLoading && <p className="text-amber-700 text-sm font-semibold">{dataNotice}</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {!isLoading && !error && (
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
                  </div>
                  <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${status.cls}`}>{status.label}</span>
                </div>
                <div className="p-4">
                  <p className="text-[11px] text-on-surface-variant font-medium mb-1">{product.sku} | {product.category}</p>
                  <h3 className="font-bold text-sm text-on-surface line-clamp-1 mb-2">{product.name}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-bold text-primary">{product.price.toLocaleString()}đ</span>
                    <span className="text-xs text-on-surface-variant">/{product.unit || "kg"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${product.stock <= 5 ? "text-red-600" : product.stock <= 15 ? "text-amber-600" : "text-on-surface-variant"}`}>
                      Tồn kho: {product.stock}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => navigate(`/admin/inventory?productId=${product.id}`)}
                        title="Nhập kho"
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { setEditProduct(product); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(product)} className="p-1.5 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <ProductFormModal
        product={editProduct}
        categories={categories}
        open={showForm}
        isSubmitting={isSubmitting}
        onClose={closeProductForm}
        onSubmit={handleSubmit}
      />
      <AdminConfirmModal
        open={Boolean(productToDelete)}
        title="Xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${productToDelete?.name || ""}" khỏi hệ thống?`}
        confirmLabel="Xóa"
        isProcessing={isDeleteProcessing}
        onClose={() => {
          if (!isDeleteProcessing) setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
