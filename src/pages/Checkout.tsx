import { Link } from "react-router-dom";
import { ChevronRight, Truck, CreditCard, MapPin, Phone, User, Lock, ShieldCheck } from "lucide-react";
import { PRODUCTS } from "@/types/index";
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

export default function Checkout() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
      <motion.nav 
        {...fadeIn}
        className="flex items-center gap-2 mb-6 md:mb-10 text-on-surface-variant text-sm font-medium"
      >
        <Link to="/cart" className="hover:text-primary transition-colors">Giỏ hàng</Link>
        <ChevronRight className="size-4" />
        <span className="text-primary font-bold">Thanh toán</span>
        <ChevronRight className="size-4" />
        <span className="opacity-50">Xác nhận</span>
      </motion.nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Forms */}
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="lg:col-span-7 space-y-6 md:space-y-10 focus-within:z-10"
        >
          <motion.section variants={fadeIn} className="bg-white p-6 md:p-10 rounded-3xl border border-outline-variant shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
            <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 flex items-center gap-3 text-primary tracking-tight">
              <MapPin className="size-6" />
              Thông tin giao hàng
            </h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-outline" />
                  <input className="w-full h-14 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" placeholder="John Doe" type="text" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-outline" />
                  <input className="w-full h-14 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" placeholder="+1 (555) 000-0000" type="tel" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Thành phố</label>
                <input className="w-full h-14 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" placeholder="San Francisco" type="text" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Địa chỉ chi tiết</label>
                <textarea className="w-full p-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium min-h-[120px]" placeholder="Tên đường, số nhà, căn hộ..." />
              </div>
            </form>
          </motion.section>

          <motion.section variants={fadeIn} className="bg-white p-6 md:p-10 rounded-3xl border border-outline-variant shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/40" />
            <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 flex items-center gap-3 text-primary tracking-tight">
              <Truck className="size-6" />
              Phương thức vận chuyển
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <label className="relative flex items-center p-4 md:p-6 border-2 border-primary rounded-2xl cursor-pointer bg-primary-container/5 transition-all group ring-1 ring-primary/20">
                <input checked className="size-5 text-primary border-outline-variant focus:ring-primary" name="shipping" type="radio" value="standard" />
                <div className="ml-4 md:ml-5">
                  <span className="block font-bold text-on-surface">Giao hàng tiêu chuẩn</span>
                  <span className="text-xs font-medium text-on-surface-variant">3-5 ngày làm việc</span>
                </div>
                <span className="ml-auto font-bold text-primary text-sm md:text-base">20.000đ</span>
              </label>
              <label className="relative flex items-center p-4 md:p-6 border border-outline-variant rounded-2xl cursor-pointer hover:bg-surface-container-low transition-all group">
                <input className="size-5 text-primary border-outline-variant focus:ring-primary" name="shipping" type="radio" value="express" />
                <div className="ml-4 md:ml-5">
                  <span className="block font-bold text-on-surface">Giao hàng hỏa tốc</span>
                  <span className="text-xs font-medium text-on-surface-variant">Nhận hàng trong ngày</span>
                </div>
                <span className="ml-auto font-bold text-sm md:text-base">50.000đ</span>
              </label>
            </div>
          </motion.section>

          <motion.section variants={fadeIn} className="bg-white p-6 md:p-10 rounded-3xl border border-outline-variant shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20" />
            <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 flex items-center gap-3 text-primary tracking-tight">
              <CreditCard className="size-6" />
              Phương thức thanh toán
            </h2>
            <div className="space-y-4">
              {["Thanh toán khi nhận hàng (COD)", "Chuyển khoản ngân hàng", "Ví điện tử (Momo / ZaloPay)"].map((method, i) => (
                <label key={method} className="flex items-center p-4 md:p-5 border border-outline-variant rounded-2xl cursor-pointer hover:bg-primary-container/5 transition-all group">
                  <input defaultChecked={i === 0} className="size-5 text-primary border-outline-variant focus:ring-primary" name="payment" type="radio" value={method} />
                  <span className="ml-4 md:ml-5 font-bold text-on-surface text-sm md:text-base">{method}</span>
                </label>
              ))}
            </div>
          </motion.section>
        </motion.div>

        {/* Summary side */}
        <motion.aside 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-5 h-full"
        >
          <div className="sticky top-24 space-y-6 md:space-y-8">
            <div className="bg-white p-6 md:p-10 rounded-3xl border border-outline-variant shadow-xl ring-1 ring-white/50">
              <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 flex items-center justify-between tracking-tight">
                Tóm tắt đơn hàng
                <span className="text-xs font-bold uppercase tracking-widest opacity-40">3 Sản phẩm</span>
              </h2>
              
              <div className="divide-y divide-outline-variant/30 max-h-[320px] overflow-y-auto pr-2 mb-6 md:mb-8 custom-scrollbar">
                {[PRODUCTS[0], PRODUCTS[1], PRODUCTS[2]].map((item) => (
                  <div key={item.id} className="py-5 flex gap-5 items-center">
                    <div className="size-20 flex-shrink-0 bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30">
                      <img className="size-full object-cover" src={item.image} alt="" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-on-surface text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-xs font-medium text-on-surface-variant opacity-70 mt-1">500g • Không thuốc trừ sâu</p>
                      <p className="font-bold text-primary mt-2">{(item.price).toLocaleString()}đ</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 md:pt-6 border-t border-outline-variant/50">
                <div className="flex justify-between text-sm font-medium text-on-surface-variant">
                  <span>Tạm tính</span>
                  <span className="font-bold">197,000đ</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-on-surface-variant">
                  <span>Phí vận chuyển</span>
                  <span className="font-bold">20,000đ</span>
                </div>
                <div className="flex justify-between pt-4 items-end">
                  <span className="text-xl md:text-2xl font-bold tracking-tight">Tổng cộng</span>
                  <span className="text-2xl md:text-3xl font-bold text-primary">217,000đ</span>
                </div>
              </div>

              <button className="w-full bg-primary text-white h-16 rounded-2xl font-bold text-lg mt-10 hover:shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20">
                Hoàn tất đặt hàng
                <Lock size={20} />
              </button>
              
              <div className="text-center mt-6 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                <ShieldCheck size={14} className="text-primary" />
                Thanh toán bảo mật mã hóa SSL 256-bit
              </div>
            </div>

            <div className="bg-surface-container p-6 md:p-8 rounded-3xl border border-outline-variant/50">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4 ml-1">Mã giảm giá</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input className="w-full sm:flex-grow h-14 px-5 rounded-2xl border border-outline-variant bg-white outline-none focus:ring-2 focus:ring-primary/20 font-medium" placeholder="KHUYENMAI20" type="text" />
                <button className="w-full sm:w-auto px-8 h-14 bg-white border-2 border-primary text-primary rounded-2xl font-bold hover:bg-primary hover:text-white transition-all shadow-sm">Áp dụng</button>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
