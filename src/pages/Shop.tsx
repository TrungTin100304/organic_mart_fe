import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, LayoutGrid, List } from "lucide-react";
import type { Product } from "../types";
import ProductCard from "../components/ProductCard";
import { AnimatePresence, motion } from "motion/react";
import { getProducts } from "../services/productService";
import { getProductCategories, type ProductCategory } from "../services/categoryService";
import { filterProductsByCategory, getChildCategories, getRootCategories } from "../utils/shopCategories";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [sort, setSort] = useState("default");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([getProducts({ page: 0, size: 100 }), getProductCategories()])
      .then(([productPage, categoryList]) => {
        if (!mounted) return;
        setProducts(productPage.content);
        setCategories(categoryList);
      })
      .catch((err: any) => {
        if (mounted) setError(err?.message || "Không thể tải sản phẩm.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const byCategory = filterProductsByCategory(products, categories, activeCategoryId);

    return [...byCategory].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      return 0;
    });
  }, [products, categories, activeCategoryId, sort]);

  const loadingCategories = isLoading && categories.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-10">
      <motion.nav {...fadeIn} className="flex items-center gap-2 mb-6 md:mb-8 text-on-surface-variant text-sm font-medium">
        <a href="/" className="hover:text-primary transition-colors">Trang chủ</a>
        <ChevronRight className="size-4" />
        <span className="text-primary font-bold">Cửa hàng</span>
      </motion.nav>

      <div className="flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-8">
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:col-span-3 space-y-6 md:space-y-10"
        >
          <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-4 md:p-6">
            <h3 className="text-primary font-bold mb-4">Danh mục</h3>
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => {
                  setActiveCategoryId(null);
                  setExpandedCategoryId(null);
                }}
                className={`flex-shrink-0 text-left px-4 py-2 md:p-3 rounded-xl transition-all text-sm font-medium flex items-center md:gap-3 whitespace-nowrap md:whitespace-normal ${
                  activeCategoryId === null ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                Tất cả
              </button>

              {loadingCategories ? (
                <div className="px-4 py-2 text-sm text-on-surface-variant">Đang tải...</div>
              ) : (
                getRootCategories(categories).map((parent) => {
                  const parentId = String(parent.id);
                  const children = getChildCategories(categories, parent.id);
                  const isExpanded = expandedCategoryId === parentId;

                  return (
                    <div key={parent.id} className="flex flex-col">
                      <button
                        onClick={() => {
                          setActiveCategoryId(parentId);
                          if (children.length > 0) {
                            setExpandedCategoryId(isExpanded ? null : parentId);
                          }
                        }}
                        aria-expanded={children.length > 0 ? isExpanded : undefined}
                        className={`flex-shrink-0 text-left px-4 py-2 md:p-3 rounded-xl transition-all text-sm font-medium flex items-center justify-between md:gap-3 whitespace-nowrap md:whitespace-normal ${
                          activeCategoryId === parentId ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
                        }`}
                      >
                        <span className="min-w-0 truncate md:whitespace-normal">{parent.name}</span>
                        {children.length > 0 && (
                          <span className="p-1 flex-shrink-0">
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </span>
                        )}
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && children.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col ml-3 mt-1 border-l-2 border-outline-variant/50 pl-2 space-y-1 mb-1">
                              {children.map((child) => {
                                const childId = String(child.id);

                                return (
                                  <button
                                    key={child.id}
                                    onClick={() => setActiveCategoryId(childId)}
                                    className={`text-left px-3 py-2 rounded-lg transition-all text-sm whitespace-nowrap md:whitespace-normal ${
                                      activeCategoryId === childId
                                        ? "text-primary font-bold bg-primary-container/30"
                                        : "text-on-surface-variant hover:bg-surface-container"
                                    }`}
                                  >
                                    {child.name}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="hidden md:block">
            <h3 className="font-bold mb-4 border-b border-outline-variant pb-2 uppercase text-xs tracking-widest opacity-60">Sản phẩm nổi bật</h3>
            <div className="space-y-4">
              {products.slice(0, 2).map((p) => (
                <div key={p.id} className="flex gap-4 group cursor-pointer">
                  <img src={p.image} className="size-16 object-cover rounded-lg border border-outline-variant" alt={p.name} />
                  <div>
                    <h4 className="text-xs font-semibold line-clamp-2 group-hover:text-primary">{p.name}</h4>
                    <p className="text-primary font-bold text-sm">{p.price.toLocaleString()}đ</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.aside>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full md:col-span-9"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 bg-white p-4 rounded-2xl border border-outline-variant gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <span className="font-bold hidden sm:block opacity-60">Hiển thị {filteredProducts.length}</span>
              <div className="flex gap-2">
                <button className="p-2 text-primary border border-primary rounded-lg bg-primary-container/20"><LayoutGrid size={20} /></button>
                <button className="p-2 text-on-surface-variant border border-transparent rounded-lg hover:text-primary hover:bg-surface-container"><List size={20} /></button>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
              <span className="text-sm font-semibold whitespace-nowrap">Sắp xếp:</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="flex-1 w-full border-outline-variant rounded-xl bg-surface-container-low text-sm px-4 py-2 focus:ring-primary focus:border-primary border outline-none"
              >
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="newest">Mới nhất</option>
              </select>
            </div>
          </div>

          {isLoading && <p className="text-on-surface-variant">Đang tải sản phẩm...</p>}
          {error && <p className="text-red-600 font-semibold">{error}</p>}
          {!isLoading && !error && (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={{
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
