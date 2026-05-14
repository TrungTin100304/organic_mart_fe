import { LayoutGrid, List, ChevronRight, Search } from "lucide-react";
import { PRODUCTS } from "../types";
import ProductCard from "../components/ProductCard";
import { motion } from "motion/react";

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
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
      <motion.nav 
        {...fadeIn}
        className="flex items-center gap-2 mb-8 text-on-surface-variant text-sm font-medium"
      >
        <a href="/" className="hover:text-primary transition-colors">Trang chủ</a>
        <ChevronRight className="size-4" />
        <span className="text-primary font-bold">Rau củ hữu cơ</span>
      </motion.nav>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar */}
        <motion.aside 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-3 space-y-10"
        >
          <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-6">
            <h3 className="text-primary font-bold mb-4">Danh mục</h3>
            <div className="space-y-1">
              {["Rau củ", "Trái cây", "Thịt & Hải sản", "Sữa", "Đồ khô"].map((cat) => (
                <button 
                  key={cat}
                  className={`w-full text-left p-3 rounded-xl transition-all text-sm font-medium flex items-center gap-3 ${cat === "Vegetables" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-outline-variant rounded-2xl p-6">
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
              {PRODUCTS.slice(0, 2).map((p) => (
                <div key={p.id} className="flex gap-4 group cursor-pointer">
                  <img src={p.image} className="size-16 object-cover rounded-lg border border-outline-variant" alt="" />
                  <div>
                    <h4 className="text-xs font-semibold line-clamp-2 group-hover:text-primary">{p.name}</h4>
                    <p className="text-primary font-bold text-sm">{(p.price).toLocaleString()}đ</p>
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
          className="md:col-span-9"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-4 rounded-2xl border border-outline-variant gap-4">
            <div className="flex items-center gap-4">
              <button className="p-2 text-primary border border-primary rounded-lg bg-primary-container/20"><LayoutGrid size={20} /></button>
              <button className="p-2 text-on-surface-variant hover:text-primary"><List size={20} /></button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold whitespace-nowrap">Sắp xếp theo:</span>
              <select className="border-outline-variant rounded-xl bg-surface-container-low text-sm px-4 py-2 focus:ring-primary focus:border-primary border">
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
            {PRODUCTS.map((product, idx) => (
              <motion.div
                key={product.id}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 }
                }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-12 flex justify-center gap-2">
            {[1, 2, 3].map((n) => (
              <button 
                key={n}
                className={`size-10 rounded-full border border-outline-variant flex items-center justify-center transition-all ${n === 2 ? "bg-primary text-on-primary font-bold" : "hover:bg-primary-container"}`}
              >
                {n}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
