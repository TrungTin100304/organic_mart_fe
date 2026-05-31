import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronRight, Star, Truck, CheckCircle2, ShoppingCart, Minus, Plus } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { motion } from "motion/react";
import type { Product } from "../types";
import { getProductById, getProducts } from "../services/productService";
import { addCartItem } from "../services/cartService";
import { getAllergenDisplayName, getAllergenKey } from "../utils/productAllergens";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setIsLoading(true);
    Promise.all([getProductById(id), getProducts({ page: 0, size: 6 })])
      .then(([detail, productPage]) => {
        if (!mounted) return;
        setProduct(detail);
        setRelated(productPage.content.filter((item) => item.id !== detail.id).slice(0, 4));
      })
      .catch((err: any) => {
        if (mounted) setError(err?.message || "Khong the tai san pham.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
      return;
    }
    setIsAdding(true);
    try {
      await addCartItem(product.id, quantity);
    } catch (err: any) {
      alert(err?.message || "Khong the them vao gio hang.");
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 text-on-surface-variant">Dang tai san pham...</div>;
  }

  if (error || !product) {
    return <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 text-red-600 font-semibold">{error || "Khong tim thay san pham."}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
      <nav className="flex items-center gap-2 flex-wrap mb-6 md:mb-10 text-on-surface-variant text-sm">
        <Link to="/" className="hover:text-primary transition-colors font-medium">Trang chu</Link>
        <ChevronRight className="size-4" />
        <Link to="/shop" className="hover:text-primary transition-colors font-medium">{product.category}</Link>
        <ChevronRight className="size-4 flex-shrink-0" />
        <span className="text-primary font-bold line-clamp-1 truncate">{product.name}</span>
      </nav>

      <motion.div initial="initial" animate="animate" className="flex flex-col lg:grid lg:grid-cols-12 gap-8 md:gap-12 mb-12 md:mb-20">
        <motion.div variants={fadeIn} className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4 w-full">
          <div className="flex-1 aspect-square md:aspect-auto md:h-[500px] rounded-2xl overflow-hidden bg-white border border-outline-variant relative group">
            <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
            {product.organic && (
              <div className="absolute top-6 right-6 bg-primary-container text-on-primary-container px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">HUU CO</div>
            )}
          </div>
          <div className="flex flex-row md:flex-col gap-4 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className={`size-20 md:size-24 flex-shrink-0 rounded-xl border-2 overflow-hidden cursor-pointer ${i === 0 ? "border-primary" : "border-outline-variant hover:border-primary"}`}>
                <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeIn} className="lg:col-span-5 flex flex-col w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-2">{product.name}</h1>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center text-primary">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={18} fill={s <= Math.round(product.rating || 5) ? "currentColor" : "none"} />
              ))}
            </div>
            <span className="text-sm text-on-surface-variant font-medium">({product.reviews || 0} danh gia)</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-primary mb-6 md:mb-8">{product.price.toLocaleString()}d</div>

          <div className="space-y-6 mb-8 md:mb-10">
            <p className="text-base md:text-lg text-on-surface-variant leading-relaxed font-medium">
              {product.description || product.detailedDescription || "San pham dang duoc cap nhat mo ta."}
            </p>
            {product.allergens && product.allergens.length > 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h4 className="font-bold text-base text-amber-800 mb-3">Các chất gây dị ứng</h4>
                <div className="flex flex-wrap gap-2">
                  {product.allergens.map((allergen) => (
                    <span key={getAllergenKey(allergen)} className="inline-flex items-center px-3 py-1 rounded-full border border-amber-300 bg-amber-100 text-amber-900 text-sm">
                      {getAllergenDisplayName(allergen)}
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
                <span className="text-sm font-bold opacity-80">Nguon goc minh bach</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="text-primary size-5" />
                <span className="text-sm font-bold opacity-80">Giao hang trong ngay</span>
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-6">
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <span className="text-sm font-bold uppercase tracking-widest opacity-60">So luong</span>
              <div className="flex items-center border border-outline-variant rounded-xl bg-surface-container-low p-1">
                <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="p-3 hover:bg-surface-container rounded-lg transition-colors text-primary"><Minus size={16} /></button>
                <span className="px-6 font-bold text-lg min-w-[60px] text-center">{quantity}</span>
                <button onClick={() => setQuantity((value) => value + 1)} className="p-3 hover:bg-surface-container rounded-lg transition-colors text-primary"><Plus size={16} /></button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingCart size={20} />
                {isAdding ? "DANG THEM" : "THEM VAO GIO"}
              </button>
              <button
                onClick={async () => {
                  if (!localStorage.getItem("accessToken")) {
                    navigate("/login");
                    return;
                  }
                  await handleAddToCart();
                  navigate("/checkout");
                }}
                className="w-full sm:flex-1 border-2 border-primary text-primary py-4 rounded-2xl font-bold hover:bg-primary-container/20 transition-all active:scale-95"
              >
                MUA NGAY
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div {...fadeIn} className="border-b border-outline-variant mb-10 flex overflow-x-auto gap-8">
        <button className="px-4 py-4 text-sm font-bold border-b-2 border-primary text-primary whitespace-nowrap">Mo ta</button>
        <button className="px-4 py-4 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap">Dinh duong</button>
        <button className="px-4 py-4 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap">Di ung</button>
      </motion.div>

      <motion.div {...fadeIn} className="flex flex-col md:grid md:grid-cols-3 gap-8 md:gap-12 mb-20 md:mb-32">
        <div className="md:col-span-2 space-y-6 md:space-y-8">
          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed font-medium">
            {product.detailedDescription || product.description || "Thong tin chi tiet san pham dang duoc cap nhat."}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 bg-white border border-outline-variant rounded-2xl">
              <h4 className="font-bold text-on-surface mb-2 tracking-wide uppercase text-xs opacity-50">Danh muc</h4>
              <p className="text-base font-semibold">{product.category}</p>
            </div>
            <div className="p-6 bg-white border border-outline-variant rounded-2xl">
              <h4 className="font-bold text-on-surface mb-2 tracking-wide uppercase text-xs opacity-50">Bao quan</h4>
              <p className="text-base font-semibold">{product.storageInstructions || "Theo huong dan tren bao bi"}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-low p-8 rounded-3xl h-fit border border-outline-variant">
          <h3 className="text-xl font-bold text-primary mb-6">Canh bao di ung</h3>
          {product.allergens && product.allergens.length > 0 ? (
            <ul className="space-y-3">
              {product.allergens.map((allergen) => (
                <li key={getAllergenKey(allergen)} className="flex gap-3">
                  <CheckCircle2 className="text-primary size-5 flex-shrink-0" />
                  <span className="text-sm font-medium text-on-surface-variant">{getAllergenDisplayName(allergen)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm font-medium text-on-surface-variant">Chua co thong tin di ung cho san pham nay.</p>
          )}
        </div>
      </motion.div>

      {related.length > 0 && (
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-primary mb-6">San pham lien quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      )}
    </div>
  );
}
