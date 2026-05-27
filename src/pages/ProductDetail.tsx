import { useParams, Link } from "react-router-dom";
import { ChevronRight, Star, Truck, CheckCircle2, ShoppingCart, Minus, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useProduct } from '@/hooks/useProduct';

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

export default function ProductDetail() {
  const { id } = useParams();
  const { product, isLoading, error } = useProduct(id as string | undefined);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div className="text-center py-20">Đang tải sản phẩm…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div className="text-center text-red-600 py-20">Lỗi: {error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div className="text-center py-20">Sản phẩm không tồn tại.</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
      <nav className="flex items-center gap-2 flex-wrap mb-6 md:mb-10 text-on-surface-variant text-sm">
        <Link to="/" className="hover:text-primary transition-colors font-medium">Trang chủ</Link>
        <ChevronRight className="size-4" />
        <Link to="/shop" className="hover:text-primary transition-colors font-medium">Rau củ</Link>
        <ChevronRight className="size-4 flex-shrink-0" />
        <span className="text-primary font-bold line-clamp-1 truncate">{product.name}</span>
      </nav>

      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="flex flex-col lg:grid lg:grid-cols-12 gap-8 md:gap-12 mb-12 md:mb-20"
      >
        {/* Gallery */}
        <motion.div variants={fadeIn} className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4 w-full">
          <div className="flex-1 aspect-square md:aspect-auto md:h-[500px] rounded-2xl overflow-hidden bg-white border border-outline-variant relative group">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" 
            />
            {product.organic && (
              <div className="absolute top-6 right-6 bg-primary-container text-on-primary-container px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">{product.category}</div>
            )}
          </div>
          <div className="flex flex-row md:flex-col gap-4 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className={`size-20 md:size-24 flex-shrink-0 rounded-xl border-2 overflow-hidden cursor-pointer ${i === 0 ? "border-primary" : "border-outline-variant hover:border-primary"}`}>
                <img src={product.image} className="w-full h-full object-cover" alt="" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div variants={fadeIn} className="lg:col-span-5 flex flex-col w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-2">{product.name}</h1>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center text-primary">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={18} fill={s <= 4 ? "currentColor" : "none"} />
              ))}
            </div>
            <span className="text-sm text-on-surface-variant font-medium">(48 Đánh giá)</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-primary mb-6 md:mb-8">{product.price.toLocaleString()}đ</div>
          
          <div className="space-y-6 mb-8 md:mb-10">
            <p className="text-base md:text-lg text-on-surface-variant leading-relaxed font-medium">
              {product.description}
            </p>
            {product.allergens && product.allergens.length > 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h4 className="font-bold text-base text-amber-800 mb-3">Các chất gây dị ứng</h4>
                <div className="flex flex-wrap gap-2">
                  {product.allergens.map((allergen) => (
                    <span key={allergen} className="inline-flex items-center px-3 py-1 rounded-full border border-amber-300 bg-amber-100 text-amber-900 text-sm">
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-surface-variant bg-surface-container p-4 text-sm text-on-surface-variant">
                Sản phẩm không chứa thành phần gây dị ứng phổ biến.
              </div>
            )}
            <div className="p-5 bg-surface-container rounded-2xl border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-primary size-5" />
                <span className="text-sm font-bold opacity-80">Chứng nhận hữu cơ</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="text-primary size-5" />
                <span className="text-sm font-bold opacity-80">Giao hàng trong ngày</span>
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-6">
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <span className="text-sm font-bold uppercase tracking-widest opacity-60">Số lượng</span>
              <div className="flex items-center border border-outline-variant rounded-xl bg-surface-container-low p-1">
                <button className="p-3 hover:bg-surface-container rounded-lg transition-colors text-primary"><Minus size={16} /></button>
                <span className="px-6 font-bold text-lg min-w-[60px] text-center">1</span>
                <button className="p-3 hover:bg-surface-container rounded-lg transition-colors text-primary"><Plus size={16} /></button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
                <ShoppingCart size={20} />
                THÊM VÀO GIỎ
              </button>
              <button className="w-full sm:flex-1 border-2 border-primary text-primary py-4 rounded-2xl font-bold hover:bg-primary-container/20 transition-all active:scale-95">
                MUA NGAY
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <motion.div 
        {...fadeIn}
        className="border-b border-outline-variant mb-10 flex overflow-x-auto gap-8"
      >
        <button className="px-4 py-4 text-sm font-bold border-b-2 border-primary text-primary whitespace-nowrap">Mô tả</button>
        <button className="px-4 py-4 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap">Dinh dưỡng</button>
        <button className="px-4 py-4 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap">Đánh giá (48)</button>
      </motion.div>
      
      <motion.div 
        {...fadeIn}
        className="flex flex-col md:grid md:grid-cols-3 gap-8 md:gap-12 mb-20 md:mb-32"
      >
        <div className="md:col-span-2 space-y-6 md:space-y-8">
          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed font-medium">
            Khoai mỡ là một trong những loại củ chứa nhiều tinh bột và vitamin, đặc biệt là anthocyanin - một chất chống oxy hóa mạnh mẽ tạo nên màu tím đặc trưng. Các sản phẩm tại Organic Mart được tuyển chọn từ các nông trại hữu cơ tại Long An, đảm bảo không có dư lượng thuốc trừ sâu.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 bg-white border border-outline-variant rounded-2xl">
              <h4 className="font-bold text-on-surface mb-2 tracking-wide uppercase text-xs opacity-50">Nguồn gốc</h4>
              <p className="text-base font-semibold">Long An, Việt Nam</p>
            </div>
            <div className="p-6 bg-white border border-outline-variant rounded-2xl">
              <h4 className="font-bold text-on-surface mb-2 tracking-wide uppercase text-xs opacity-50">Bảo quản</h4>
              <p className="text-base font-semibold">Nơi khô ráo, thoáng mát</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-low p-8 rounded-3xl h-fit border border-outline-variant">
          <h3 className="text-xl font-bold text-primary mb-6">Mẹo từ đầu bếp</h3>
          <ul className="space-y-6">
            <li className="flex gap-3 md:gap-4">
              <CheckCircle2 className="text-primary size-5 md:size-6 flex-shrink-0" />
              <p className="text-sm font-medium text-on-surface-variant leading-relaxed">Bạn nên nấu canh khoai mỡ với tôm hoặc thịt băm để dậy mùi thơm bùi đặc trưng.</p>
            </li>
            <li className="flex gap-3 md:gap-4">
              <CheckCircle2 className="text-primary size-5 md:size-6 flex-shrink-0" />
              <p className="text-sm font-medium text-on-surface-variant leading-relaxed">Có thể dùng làm bánh khoai mỡ chiên giòn rụm bên ngoài, dẻo ngọt bên trong cho bữa xế.</p>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
