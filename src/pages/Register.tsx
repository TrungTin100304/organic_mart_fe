import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "motion/react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};


export default function Register() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-stack-lg px-margin-mobile md:px-margin-desktop bg-surface">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="shadow-sm border border-outline-variant overflow-hidden max-w-[1000px] w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[32px]"
      >
        {/* Side Image */}
        <div className="hidden md:block relative h-full min-h-[600px]">
          <img 
            alt="Fresh organic vegetables" 
            className="absolute inset-0 w-full h-full object-cover" 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop" 
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
          <div className="absolute bottom-10 left-10 right-10">
            <div className="bg-surface/80 backdrop-blur-md p-stack-md rounded-2xl border border-outline-variant/30">
              <p className="font-headline-md text-headline-md text-on-primary-fixed mb-2">Gia nhập cộng đồng sống xanh</p>
              <p className="font-body-md text-body-md text-on-surface-variant">Thưởng thức thực phẩm tươi sạch mỗi ngày trực tiếp từ nông trại đến bàn ăn của bạn.</p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <motion.div 
          {...fadeIn}
          className="p-stack-lg md:p-12 flex flex-col justify-center"
        >
          <div className="mb-stack-lg">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Tạo tài khoản</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Điền thông tin bên dưới để bắt đầu mua sắm sản phẩm hữu cơ.</p>
          </div>

          <form className="space-y-stack-md" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block font-label-lg text-label-lg text-on-surface mb-1.5 ml-1">Họ và Tên</label>
              <input 
                className="w-full px-4 py-3.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-md placeholder:text-outline/60" 
                placeholder="Nguyễn Văn A" 
                type="text" 
              />
            </div>

            <div>
              <label className="block font-label-lg text-label-lg text-on-surface mb-1.5 ml-1">Email</label>
              <input 
                className="w-full px-4 py-3.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-md placeholder:text-outline/60" 
                placeholder="example@email.com" 
                type="email" 
              />
            </div>

            <div>
              <label className="block font-label-lg text-label-lg text-on-surface mb-1.5 ml-1">Số điện thoại</label>
              <input 
                className="w-full px-4 py-3.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-md placeholder:text-outline/60" 
                placeholder="090 1234 567" 
                type="tel" 
              />
            </div>

            <div>
              <label className="block font-label-lg text-label-lg text-on-surface mb-1.5 ml-1">Mật khẩu</label>
              <div className="relative">
                <input 
                  className="w-full px-4 py-3.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-md placeholder:text-outline/60" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"} 
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-start gap-stack-sm py-2 px-1">
              <input 
                className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary" 
                id="terms" 
                type="checkbox" 
              />
              <label className="font-body-md text-body-md text-on-surface-variant leading-tight" htmlFor="terms">
                Tôi đồng ý với <Link className="text-primary font-bold hover:underline" to="/terms">Điều khoản dịch vụ</Link> và <Link className="text-primary font-bold hover:underline" to="/privacy">Chính sách bảo mật</Link>.
              </label>
            </div>

            <button 
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-full shadow-sm hover:shadow-md transition-all duration-300 scale-100 active:scale-[0.98] font-headline-md mt-2" 
              type="submit"
            >
              Đăng ký
            </button>
          </form>

          <div className="mt-stack-lg pt-stack-md border-t border-outline-variant flex flex-col items-center gap-stack-sm text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">Bạn đã có tài khoản?</p>
            <Link className="text-primary font-bold font-body-md hover:underline decoration-2 underline-offset-4" to="/login">
              Đăng nhập ngay
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
