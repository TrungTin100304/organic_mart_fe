import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ChevronRight, ShoppingCart, ArrowLeft, ArrowRight, ShieldCheck, CreditCard, Landmark, Banknote } from "lucide-react";
import { motion } from "motion/react";
import type { Cart as CartModel, CartItem } from "../services/cartService";
import { clearCart, decreaseCartItem, getCurrentCart, addCartItem, removeCartItem, getCartItemImage } from "../services/cartService";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCart = async () => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      setCart(await getCurrentCart());
    } catch (err: any) {
      const message = err?.message || "";
      if (message.includes("read-only") || message.includes("read only")) {
        setError("Hệ thống đang bảo trì. Vui lòng thử lại sau.");
      } else {
        setError(message || "Không thể tải giỏ hàng.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCart();
  }, []);

  const mutateCart = async (action: () => Promise<CartModel>) => {
    try {
      setCart(await action());
    } catch (err: any) {
      const message = err?.message || "";
      if (message.includes("read-only") || message.includes("read only")) {
        setError("Hệ thống đang bảo trì. Vui lòng thử lại sau.");
      } else {
        setError(message || "Không thể cập nhật giỏ hàng.");
      }
    }
  };

  const shippingFee = cart && cart.totalPrice > 0 ? 20000 : 0;
  const discount = 0;
  const total = (cart?.totalPrice || 0) + shippingFee - discount;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
      <motion.nav {...fadeIn} className="flex items-center gap-2 mb-6 md:mb-10 text-on-surface-variant text-sm font-medium">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="size-4" />
        <span className="text-primary font-bold">Giỏ hàng</span>
      </motion.nav>

      <motion.h1 {...fadeIn} className="text-2xl md:text-3xl font-bold text-on-surface mb-6 md:mb-10 tracking-tight">
        Giỏ hàng của bạn
      </motion.h1>

      {isLoading && <p className="text-on-surface-variant">Đang tải giỏ hàng...</p>}
      {error && <p className="text-red-600 font-semibold mb-4">{error}</p>}

      {!isLoading && (
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 md:gap-10 items-start">
          <div className="w-full lg:col-span-8 flex flex-col gap-6 md:gap-8">
            <div className="bg-white border border-outline-variant rounded-2xl overflow-x-auto shadow-sm">
              <table className="w-full min-w-[600px] text-left border-collapse">
                <thead className="bg-surface-container-low text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.1em]">
                  <tr>
                    <th className="px-8 py-5">Sản phẩm</th>
                    <th className="px-6 py-5 text-center">Giá</th>
                    <th className="px-6 py-5 text-center">Số lượng</th>
                    <th className="px-6 py-5 text-right">Tạm tính</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {cart?.items.length ? (
                    cart.items.map((item) => (
                      <tr key={item.productId} className="group hover:bg-surface-bright/50 transition-colors">
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-6">
                            <div className="size-20 bg-surface-container rounded-xl overflow-hidden flex-shrink-0 border border-outline-variant/30">
                              <img src={getCartItemImage(item) || "/assets/hero.png"} alt={item.productName} className="size-full object-cover" />
                            </div>
                            <div>
                              <h3 className="font-bold text-on-surface leading-snug">{item.productName}</h3>
                              <p className="text-xs text-on-surface-variant mt-1 font-medium italic opacity-70">{item.unit || "kg"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-8 text-center font-bold text-on-surface whitespace-nowrap">
                          {item.unitPrice.toLocaleString()}đ
                        </td>
                        <td className="px-6 py-8">
                          <div className="flex items-center justify-center">
                            <div className="flex items-center border border-outline-variant rounded-full p-1 bg-surface-container-low">
                              <button onClick={() => mutateCart(() => decreaseCartItem(item.productId, 1))} className="size-8 flex items-center justify-center text-primary hover:bg-white rounded-full transition-all shadow-sm"><Minus size={14} /></button>
                              <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                              <button onClick={() => mutateCart(() => addCartItem(item.productId, 1))} className="size-8 flex items-center justify-center text-primary hover:bg-white rounded-full transition-all shadow-sm"><Plus size={14} /></button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-8 text-right font-bold text-primary whitespace-nowrap">
                          {item.subtotal.toLocaleString()}đ
                        </td>
                        <td className="px-8 py-8 text-right">
                          <button onClick={() => mutateCart(() => removeCartItem(item.productId))} className="text-on-surface-variant hover:text-error transition-colors p-2 hover:bg-error-container rounded-full"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-8 py-10 text-center text-on-surface-variant" colSpan={5}>Giỏ hàng đang trống.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 md:gap-6">
              <Link to="/shop" className="flex items-center gap-3 px-8 py-4 border-2 border-primary text-primary font-bold rounded-2xl hover:bg-primary hover:text-white transition-all w-full sm:w-auto justify-center group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Tiếp tục mua sắm
              </Link>
              <button onClick={() => mutateCart(clearCart)} className="flex items-center gap-2 px-8 py-4 text-on-surface-variant font-bold rounded-2xl hover:bg-surface-container-high transition-all w-full sm:w-auto justify-center">
                <ShoppingCart size={20} />
                Xóa giỏ hàng
              </button>
            </div>
          </div>

          <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="w-full lg:col-span-4 sticky top-24">
            <div className="bg-surface-container-high rounded-3xl p-8 border border-outline-variant shadow-lg ring-1 ring-white/50 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-on-surface mb-8 tracking-tight">Tóm tắt đơn hàng</h2>
              <div className="space-y-6 pb-8 border-b border-outline-variant/50">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">Tạm tính</span>
                  <span className="text-on-surface font-bold text-lg">{(cart?.totalPrice || 0).toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">Phí vận chuyển</span>
                  <span className="text-secondary font-bold text-lg">{shippingFee.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">Giảm giá</span>
                  <span className="text-error font-bold text-lg">-{discount.toLocaleString()}đ</span>
                </div>
              </div>

              <div className="flex justify-between items-end my-10">
                <span className="text-2xl font-bold text-on-surface tracking-tight">Tổng cộng</span>
                <div className="text-right">
                  <span className="text-3xl font-bold text-primary">{total.toLocaleString()}đ</span>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] mt-1 font-bold">Đã bao gồm VAT nếu có</p>
                </div>
              </div>

              <Link to="/checkout" className={`w-full py-5 rounded-2xl font-bold text-xl shadow-xl transition-all flex items-center justify-center gap-3 ${cart?.items.length ? "bg-primary-container text-on-primary-container hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]" : "bg-surface-container text-on-surface-variant pointer-events-none"}`}>
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
      )}
    </div>
  );
}
