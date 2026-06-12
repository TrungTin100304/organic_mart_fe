import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useState } from "react";
import { login } from "@/services/authService";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await login({ email, password });
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("userEmail", response.email);
      localStorage.setItem("userRole", response.role);

      navigate("/"); // Redirect to home on success
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || "Đăng nhập thất bại, vui lòng kiểm tra lại ID/Mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-8 md:py-10 px-4 md:px-10 bg-surface">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl w-full mx-auto rounded-[24px]"
      >
        <div className="bg-surface-container-lowest overflow-hidden shadow-sm border border-outline-variant flex flex-col md:flex-row min-h-[600px] rounded-3xl md:rounded-[40px]">

          {/* Split Screen Image */}
          <div className="w-full md:w-1/2 relative min-h-[250px] md:min-h-full overflow-hidden hidden sm:block">
            <img
              alt="Fresh organic vegetables"
              className="absolute inset-0 w-full h-full object-cover"
              src="https://scontent-sin2-1.xx.fbcdn.net/v/t39.30808-6/472232135_613967387979244_6726330731394391250_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=JHIYo9MOEwEQ7kNvwEri9gQ&_nc_oc=Adpaql36RViKG34xfk-dP5pkynTQWLlvbORA3gBVkOntqpBOdks8qVHfwHvy22lfP57tTIyE0Z8xJGWujXuLkSsv&_nc_zt=23&_nc_ht=scontent-sin2-1.xx&_nc_gid=jyBm6r2O-ny1thEQhg6ChA&_nc_ss=7b289&oh=00_Af47fug2kXy9Em43cHeaLolJalDjnhWYorWU8J0Lyi8cJg&oe=6A0B80F4"
            />
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
            <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 text-white z-10 pr-6 md:pr-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Tươi Ngon Mỗi Ngày</h2>
              <p className="text-sm md:text-base opacity-90 max-w-sm">Khám phá thế giới thực phẩm sạch, hữu cơ được tuyển chọn kỹ lưỡng cho sức khỏe gia đình bạn.</p>
            </div>
          </div>

          {/* Login Form Side */}
          <div className="w-full sm:w-full md:w-1/2 flex items-center justify-center p-6 sm:p-10 md:p-12 bg-white">
            <motion.div
              {...fadeIn}
              className="w-full max-w-md"
            >
              <div className="mb-8 md:mb-10 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-2">Chào mừng trở lại</h1>
                <p className="text-sm md:text-base text-on-surface-variant">Đăng nhập để quản lý đơn hàng và nhận ưu đãi riêng cho bạn.</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="email">Email</label>
                  <input
                    className="w-full px-4 md:px-5 py-3 rounded-xl border border-outline-variant bg-surface-container-low focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm md:text-base"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    type="email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2" htmlFor="password">Mật khẩu</label>
                  <input
                    className="w-full px-4 md:px-5 py-3 rounded-xl border border-outline-variant bg-surface-container-low focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm md:text-base"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type="password"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input className="w-4 h-4 md:w-5 md:h-5 rounded border-outline text-primary focus:ring-primary transition-colors cursor-pointer" type="checkbox" />
                    <span className="text-sm md:text-base text-on-surface-variant group-hover:text-primary transition-colors">Ghi nhớ tôi</span>
                  </label>
                  <Link className="text-sm md:text-base text-primary font-bold hover:underline transition-all" to="/forgot-password">Quên mật khẩu?</Link>
                </div>

                <button
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 md:py-4 rounded-xl shadow-sm transition-all transform active:scale-95 text-base md:text-lg disabled:opacity-50 mt-2"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </form>

              <div className="mt-6 md:mt-8 flex items-center gap-4">
                <div className="h-px flex-grow bg-outline-variant"></div>
                <span className="text-sm font-medium text-on-surface-variant">Hoặc</span>
                <div className="h-px flex-grow bg-outline-variant"></div>
              </div>

              <div className="mt-4 md:mt-6">
                <button className="w-full flex items-center justify-center gap-3 bg-white border border-outline-variant hover:bg-surface-container-low text-on-surface font-bold py-3 md:py-3.5 shadow-sm transition-all transform active:scale-95 text-sm md:text-base rounded-xl">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span>Đăng nhập với Google</span>
                </button>
              </div>

              <div className="mt-6 md:mt-8 text-center">
                <p className="text-sm md:text-base text-on-surface-variant">
                  Chưa có tài khoản?
                  <Link className="text-primary font-bold hover:underline ml-1" to="/register">Đăng ký ngay</Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
