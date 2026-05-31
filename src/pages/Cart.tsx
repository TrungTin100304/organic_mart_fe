import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ChevronRight, ShoppingCart, ArrowLeft, ArrowRight, ShieldCheck, CreditCard, Landmark, Banknote } from "lucide-react";
import { motion } from "motion/react";
import { useCart } from "@/hooks/useCart";

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

export default function Cart() {
  const { cart, isLoadingCart, fetchCart, updateItem, isUpdating, removeItem, isRemoving } = useCart();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
      <motion.nav 
        {...fadeIn}
        className="flex items-center gap-2 mb-6 md:mb-10 text-on-surface-variant text-sm font-medium"
      >
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="size-4" />
        <span className="text-primary font-bold">Giỏ hàng</span>
      </motion.nav>

      <motion.h1 
        {...fadeIn}
        className="text-2xl md:text-3xl font-bold text-on-surface mb-6 md:mb-10 tracking-tight"
      >
        Giỏ hàng của bạn
      </motion.h1>
      
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 md:gap-10 items-start">
        <div className="w-full lg:col-span-8 flex flex-col gap-6 md:gap-8">
          <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.1em]">
                <tr>
                  <th className="px-8 py-5 w-[40%]">Sản phẩm</th>
                  <th className="px-6 py-5 text-center w-[15%]">Giá</th>
                  <th className="px-6 py-5 text-center w-[20%]">Số lượng</th>
                  <th className="px-6 py-5 text-right w-[15%]">Tạm tính</th>
                  <th className="px-4 py-5 w-[10%]"></th>
                </tr>
              </thead>
              <motion.tbody
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="divide-y divide-outline-variant"
              >
                {isLoadingCart ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-on-surface-variant font-medium">Đang tải giỏ hàng...</td>
                  </tr>
                ) : !cart || !cart.items || cart.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-on-surface-variant font-medium">Giỏ hàng của bạn đang trống.</td>
                  </tr>
                ) : (
                  cart.items.map((item) => (
                    <motion.tr
                      variants={fadeIn}
                      key={item.id}
                      className="group hover:bg-surface-bright/50 transition-colors"
                    >
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-6">
                          <div className="size-20 bg-surface-container rounded-xl overflow-hidden flex-shrink-0 border border-outline-variant/30">
                            <img src={item.imageUrl} alt="" className="size-full object-cover" />
                          </div>
                          <div>
                            <h3 className="font-bold text-on-surface leading-snug">{item.productName}</h3>
                            <p className="text-xs text-on-surface-variant mt-1 font-medium italic opacity-70">Nông trại tươi sạch • Hữu cơ</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-8 text-center font-bold text-on-surface whitespace-nowrap">
                        {item.unitPrice?.toLocaleString()}đ/{item.unit}
                      </td>
                      <td className="px-6 py-8">
                        <div className="flex items-center justify-center">
                          <div className="flex items-center border border-outline-variant rounded-full p-1 bg-surface-container-low">
                            <button disabled={isUpdating || item.quantity <= 1} onClick={() => updateItem(item.productId, item.quantity - 1)} className="size-8 flex items-center justify-center text-primary hover:bg-white rounded-full transition-all shadow-sm disabled:opacity-50"><Minus size={14} /></button>
                            <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                            <button disabled={isUpdating} onClick={() => updateItem(item.productId, item.quantity + 1)} className="size-8 flex items-center justify-center text-primary hover:bg-white rounded-full transition-all shadow-sm disabled:opacity-50"><Plus size={14} /></button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-8 text-right font-bold text-primary whitespace-nowrap">
                        {item.subtotal?.toLocaleString()}đ
                      </td>
                      <td className="px-4 py-8 text-right">
                        <button disabled={isRemoving} onClick={() => removeItem(item.productId)} className="text-on-surface-variant hover:text-error transition-colors p-2 hover:bg-error-container rounded-full disabled:opacity-50"><Trash2 size={18} /></button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </motion.tbody>
            </table>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 md:gap-6">
            <Link to="/shop" className="flex items-center gap-3 px-8 py-4 border-2 border-primary text-primary font-bold rounded-2xl hover:bg-primary hover:text-white transition-all w-full sm:w-auto justify-center group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        <motion.aside 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full lg:col-span-4 sticky top-24"
        >
          <div className="bg-surface-container-high rounded-3xl p-8 border border-outline-variant shadow-lg ring-1 ring-white/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-on-surface mb-8 tracking-tight">Tóm tắt đơn hàng</h2>
            <div className="space-y-6 pb-8 border-b border-outline-variant/50">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">Tạm tính</span>
                <span className="text-on-surface font-bold text-lg">{cart?.totalPrice?.toLocaleString() || 0}đ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">Phí vận chuyển</span>
                <span className="text-secondary font-bold text-lg">20.000đ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">Giảm giá</span>
                <span className="text-error font-bold text-lg">-0đ</span>
              </div>
            </div>

            <div className="py-8">
              <label className="block text-sm font-bold text-on-surface mb-3 tracking-wide uppercase opacity-70">Mã giảm giá / Voucher</label>
              <div className="flex gap-3">
                <input className="flex-1 bg-white border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium" placeholder="Nhập mã tại đây" type="text" />
                <button className="bg-primary-container text-on-primary-container px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-sm">Áp dụng</button>
              </div>
            </div>

            <div className="flex justify-between items-end mb-10">
              <span className="text-2xl font-bold text-on-surface tracking-tight">Tổng cộng</span>
              <div className="text-right">
                <span className="text-3xl font-bold text-primary">{((cart?.totalPrice || 0) + 20000).toLocaleString()}đ</span>
              </div>
            </div>

            <Link to="/checkout" className="w-full bg-primary-container text-on-primary-container py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
              Thanh toán
              <ArrowRight size={24} />
            </Link>

            <div className="mt-10 flex items-center justify-center gap-6 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <CreditCard size={32} />
              <Landmark size={32} />
              <Banknote size={32} />
            </div>
          </div>

          <div className="mt-8 p-6 bg-secondary-container/50 border border-secondary-container rounded-2xl flex items-center gap-5 ring-1 ring-white/50">
            <ShieldCheck className="text-on-secondary-container size-8 flex-shrink-0" />
            <p className="text-on-secondary-container text-sm font-bold leading-snug">Đảm bảo tươi ngon hoặc hoàn tiền trong 24 giờ.</p>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
