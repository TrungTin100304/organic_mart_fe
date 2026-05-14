import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegisterPage = location.pathname === "/register";
  const [isLogin, setIsLogin] = useState(!isRegisterPage);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsLogin(location.pathname === "/login");
  }, [location]);

  const toggleAuth = () => {
    const newPath = isLogin ? "/register" : "/login";
    navigate(newPath);
  };

  return (
    <div className="h-[calc(100vh-80px)] flex items-center justify-center p-4 md:p-margin-desktop bg-surface overflow-hidden">
      {/* Main Container */}
      <div className="relative w-full max-w-[1000px] h-full max-h-[650px] bg-white rounded-[40px] shadow-2xl overflow-hidden border border-outline-variant/30 flex">
        
        {/* Back to Home Button */}
        <Link 
          to="/" 
          className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:bg-white transition-all shadow-sm font-bold text-sm"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Trang chủ</span>
        </Link>
        
        {/* Layout 1: Forms (Left and Right halves of the white container) */}
        <div className="flex w-full h-full relative">
          
          {/* Login Form (Left Half) */}
          <div className="w-1/2 h-full flex items-center justify-center p-8 lg:p-16">
            <div className="w-full max-w-sm">
              <h1 className="text-3xl font-bold text-on-surface mb-2">Đăng nhập</h1>
              <p className="text-on-surface-variant mb-8 text-sm">Chào mừng bạn quay trở lại.</p>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">EMAIL</label>
                  <input 
                    type="email" 
                    placeholder="example@email.com" 
                    className="w-full px-4 py-3 bg-surface-container-low/50 rounded-2xl border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">MẬT KHẨU</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full px-4 py-3 bg-surface-container-low/50 rounded-2xl border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                  />
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary" />
                    <span className="text-on-surface-variant group-hover:text-primary transition-colors">Ghi nhớ</span>
                  </label>
                  <Link to="/forgot-password" px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 className="text-primary font-bold hover:underline">Quên mật khẩu?</Link>
                </div>
                <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all active:scale-[0.98] mt-4">
                  Đăng nhập
                </button>
              </form>
              <div className="mt-8 text-center">
                <p className="text-sm text-on-surface-variant">
                  Chưa có tài khoản?{" "}
                  <button onClick={toggleAuth} className="text-primary font-bold hover:underline">Đăng ký ngay</button>
                </p>
              </div>
            </div>
          </div>

          {/* Register Form (Right Half) */}
          <div className="w-1/2 h-full flex items-center justify-center p-8 lg:p-12">
            <div className="w-full max-w-sm">
              <h1 className="text-3xl font-bold text-on-surface mb-2">Đăng ký</h1>
              <p className="text-on-surface-variant mb-6 text-xs">Gia nhập cộng đồng Organic Mart.</p>

              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface mb-1 uppercase">Họ và Tên</label>
                    <input type="text" placeholder="Họ tên" className="w-full px-4 py-2.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/30 focus:border-primary outline-none text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface mb-1 uppercase">Số điện thoại</label>
                    <input type="tel" placeholder="SĐT" className="w-full px-4 py-2.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/30 focus:border-primary outline-none text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface mb-1 uppercase">Email</label>
                  <input type="email" placeholder="Email" className="w-full px-4 py-2.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/30 focus:border-primary outline-none text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface mb-1 uppercase">Mật khẩu</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/30 focus:border-primary outline-none text-xs" />
                </div>
                <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] mt-2">
                  Tạo tài khoản
                </button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-xs text-on-surface-variant">
                  Đã có tài khoản?{" "}
                  <button onClick={toggleAuth} className="text-primary font-bold hover:underline">Đăng nhập ngay</button>
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Layout 2: Animated Image Overlay (Moves from left to right) */}
        <div 
          className={`absolute top-0 bottom-0 w-1/2 transition-all duration-700 ease-in-out z-30 hidden md:block overflow-hidden ${
            isLogin ? "translate-x-full" : "translate-x-0"
          }`}
          style={{ left: 0 }}
        >
          {/* We use translate-x instead of left to avoid layout recalculations and keep it smooth */}
          <div className="absolute inset-0 bg-primary/20 mix-blend-multiply z-10"></div>
          <img 
            src="https://scontent-sin2-1.xx.fbcdn.net/v/t39.30808-6/472232135_613967387979244_6726330731394391250_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=JHIYo9MOEwEQ7kNvwEri9gQ&_nc_oc=Adpaql36RViKG34xfk-dP5pkynTQWLlvbORA3gBVkOntqpBOdks8qVHfwHvy22lfP57tTIyE0Z8xJGWujXuLkSsv&_nc_zt=23&_nc_ht=scontent-sin2-1.xx&_nc_gid=jyBm6r2O-ny1thEQhg6ChA&_nc_ss=7b289&oh=00_Af47fug2kXy9Em43cHeaLolJalDjnhWYorWU8J0Lyi8cJg&oe=6A0B80F4" 
            alt="Organic Food" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-12 text-white z-20">
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              {isLogin ? "Chào mừng trở lại!" : "Bắt đầu sống xanh!"}
            </h2>
            <p className="text-lg opacity-90 max-w-sm">
              {isLogin 
                ? "Đăng nhập để tiếp tục hành trình mua sắm thực phẩm sạch." 
                : "Gia nhập cộng đồng Organic Mart để nhận những ưu đãi tốt nhất."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
