import { useEffect, useState } from "react";
import { LayoutGrid, List, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/productService";
import type { Product } from "../types";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};


export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getProducts(page, size);

        if (!isMounted) return;

        setProducts(response.items);
        setTotalPages(response.totalPages);
      } catch (err) {
        if (!isMounted) return;

        setError(err instanceof Error ? err.message : "Không thể tải danh sách sản phẩm");
        setProducts([]);
        setTotalPages(0);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [page, size]);

  const visiblePages =
    totalPages > 0
      ? Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
          if (totalPages <= 5 || page < 2) return index;
          if (page > totalPages - 3) return totalPages - Math.min(totalPages, 5) + index;
          return page - 2 + index;
        }).filter((value, index, self) => self.indexOf(value) === index && value >= 0 && value < totalPages)
      : [];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-10">
      <motion.nav 
        {...fadeIn}
        className="flex items-center gap-2 mb-6 md:mb-8 text-on-surface-variant text-sm font-medium"
      >
        <a href="/" className="hover:text-primary transition-colors">Trang chủ</a>
        <ChevronRight className="size-4" />
        <span className="text-primary font-bold">Rau củ hữu cơ</span>
      </motion.nav>

      <div className="flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-8">
        {/* Sidebar */}
        <motion.aside 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:col-span-3 space-y-6 md:space-y-10"
        >
          <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-4 md:p-6">
            <h3 className="text-primary font-bold mb-4">Danh mục</h3>
            <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
              {["Rau củ", "Trái cây", "Thịt & Hải sản", "Sữa", "Đồ khô"].map((cat) => (
                <button 
                  key={cat}
                  className={`flex-shrink-0 text-left px-4 py-2 md:p-3 rounded-xl transition-all text-sm font-medium flex items-center md:gap-3 ${cat === "Vegetables" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container whitespace-nowrap md:whitespace-normal"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-outline-variant rounded-2xl p-4 md:p-6">
            <h3 className="font-bold mb-4 border-b border-outline-variant pb-2">KHOẢNG GIÁ</h3>
            <div className="space-y-3">
              {["Dưới 100.000đ", "100.000đ - 200.000đ", "200.000đ - 500.000đ"].map((range) => (
                <label key={range} className="flex items-center gap-3 text-sm cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-outline text-primary focus:ring-primary" />
                  {range}
                </label>
              ))}
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

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full md:col-span-9"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 bg-white p-4 rounded-2xl border border-outline-variant gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <span className="font-bold hidden sm:block opacity-60">Hiển thị</span>
              <div className="flex gap-2">
                <button className="p-2 text-primary border border-primary rounded-lg bg-primary-container/20"><LayoutGrid size={20} /></button>
                <button className="p-2 text-on-surface-variant border border-transparent rounded-lg hover:text-primary hover:bg-surface-container"><List size={20} /></button>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
              <span className="text-sm font-semibold whitespace-nowrap">Sắp xếp:</span>
              <select className="flex-1 w-full border-outline-variant rounded-xl bg-surface-container-low text-sm px-4 py-2 focus:ring-primary focus:border-primary border outline-none">
                <option>Mặc định</option>
                <option>Giá tăng dần</option>
                <option>Giá giảm dần</option>
                <option>Mới nhất</option>
              </select>
            </div>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading ? (
              <div className="col-span-full rounded-2xl border border-outline-variant bg-white p-8 text-center text-on-surface-variant">
                Đang tải sản phẩm từ API...
              </div>
            ) : error ? (
              <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
                <p className="font-semibold mb-1">Không tải được sản phẩm</p>
                <p className="text-sm">{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-outline-variant bg-white p-8 text-center text-on-surface-variant">
                Không có sản phẩm nào để hiển thị.
              </div>
            ) : (
              products.map((product) => (
                <motion.div
                  key={product.id}
                  variants={{
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 }
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </motion.div>

          <div className="mt-8 md:mt-12 flex justify-center gap-2">
            {visiblePages.map((n) => (
              <button 
                key={n}
                onClick={() => setPage(n)}
                disabled={loading}
                className={`size-10 rounded-full border border-outline-variant flex items-center justify-center transition-all ${page === n ? "bg-primary text-on-primary font-bold" : "hover:bg-primary-container"} disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {n + 1}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
