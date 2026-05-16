import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "motion/react";
import { signup } from "@/services/authService";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signup(formData);
      navigate("/login"); // Redirect to login on success
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại, vui lòng kiểm tra lại thông tin");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-6 md:py-10 px-4 md:px-10 bg-surface">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="shadow-sm border border-outline-variant overflow-hidden max-w-[1000px] w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl md:rounded-[32px]"
      >
        {/* Side Image */}
        <div className="hidden md:block relative h-full min-h-[400px] md:min-h-[600px]">
          <img
            alt="Fresh organic vegetables" 
            className="absolute inset-0 w-full h-full object-cover" 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop" 
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
          <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10">
            <div className="bg-surface/80 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-outline-variant/30">
              <p className="text-xl md:text-2xl font-bold text-on-primary-fixed mb-2">Gia nhập cộng đồng sống xanh</p>
              <p className="text-sm md:text-base text-on-surface-variant">Thưởng thức thực phẩm tươi sạch mỗi ngày trực tiếp từ nông trại đến bàn ăn của bạn.</p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <motion.div 
          {...fadeIn}
          className="p-6 sm:p-10 md:p-12 flex flex-col justify-center"
        >
          <div className="mb-6 md:mb-8 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-2">Tạo tài khoản</h1>
            <p className="text-sm md:text-base text-on-surface-variant">Điền thông tin bên dưới để bắt đầu mua sắm sản phẩm hữu cơ.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5 ml-1">Họ và Tên</label>
              <input
                className="w-full px-4 py-3 md:py-3.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm md:text-base placeholder:text-outline/60"
                placeholder="Nguyễn Văn A"
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5 ml-1">Email</label>
              <input
                className="w-full px-4 py-3 md:py-3.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm md:text-base placeholder:text-outline/60"
                placeholder="example@email.com"
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5 ml-1">Số điện thoại</label>
              <input
                className="w-full px-4 py-3 md:py-3.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm md:text-base placeholder:text-outline/60"
                placeholder="090 1234 567"
                type="tel" 
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5 ml-1">Mật khẩu</label>
              <div className="relative">
                <input 
                  className="w-full px-4 py-3 md:py-3.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm md:text-base placeholder:text-outline/60"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
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
                required
              />
              <label className="font-body-md text-body-md text-on-surface-variant leading-tight" htmlFor="terms">
                Tôi đồng ý với <Link className="text-primary font-bold hover:underline" to="/terms">Điều khoản dịch vụ</Link> và <Link className="text-primary font-bold hover:underline" to="/privacy">Chính sách bảo mật</Link>.
              </label>
            </div>

            <button 
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-full shadow-sm hover:shadow-md transition-all duration-300 scale-100 active:scale-[0.98] font-headline-md mt-2 disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
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
