import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login, signup } from "@/services/authService";

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegisterPage = location.pathname === "/register";
  const [isLogin, setIsLogin] = useState(!isRegisterPage);

  // States cho form đăng nhập
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // States cho form đăng ký
  const [regFullName, setRegFullName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  useEffect(() => {
    setIsLogin(location.pathname === "/login");
    // Clear errors khi đổi tab
    setLoginError("");
    setRegError("");
    setRegSuccess("");
  }, [location]);

  const toggleAuth = () => {
    const newPath = isLogin ? "/register" : "/login";
    navigate(newPath);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting login in Auth.tsx...", { email: loginEmail, password: loginPassword });
    setLoginLoading(true);
    setLoginError("");

    try {
      const response = await login({ email: loginEmail, password: loginPassword });
      console.log("Login success:", response);

      if (response.data) {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
      navigate("/");
    } catch (err: any) {
      console.error("Login Error:", err);
      let errorMessage = err.message || "Đăng nhập thất bại, vui lòng kiểm tra lại ID/Mật khẩu";
      if (errorMessage.includes("Invalid email or password") || err?.response?.data?.message === "Invalid email or password" || err?.message === "Invalid email or password") {
         errorMessage = "Email hoặc mật khẩu không chính xác.";
      }
      setLoginError(errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");
    setRegSuccess("");

    try {
      await signup({
        fullName: regFullName,
        phoneNumber: regPhone,
        email: regEmail,
        password: regPassword
      });
      setRegSuccess("Đăng ký thành công! Đang chuyển sang đăng nhập...");
      setTimeout(() => {
        navigate("/login");
        setIsLogin(true);
      }, 2000);
    } catch (err: any) {
      let errorMessage = err.message || "Đăng ký thất bại, vui lòng kiểm tra lại thông tin";
      if (errorMessage.includes("users_phone_number_key") || errorMessage.includes("phone_number")) {
        errorMessage = "Số điện thoại này đã được đăng ký. Vui lòng sử dụng số khác.";
      } else if (errorMessage.includes("users_email_key") || errorMessage.includes("duplicate key value violates unique constraint \"users_email_key\"")) {
        errorMessage = "Email này đã được đăng ký. Vui lòng sử dụng email khác.";
      }
      setRegError(errorMessage);
    } finally {
      setRegLoading(false);
    }
  };

  const renderLoginForm = () => (
    <div className="w-full max-w-sm pt-8 md:pt-0">
      <h1 className="text-3xl font-bold text-on-surface mb-2">Đăng nhập</h1>
      <p className="text-on-surface-variant mb-8 text-sm">Chào mừng bạn quay trở lại.</p>

      {loginError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {loginError}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleLoginSubmit}>
        <div>
          <label className="block text-xs font-bold text-on-surface mb-1">EMAIL</label>
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full px-4 py-3 bg-surface-container-low/50 rounded-2xl border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-on-surface mb-1">MẬT KHẨU</label>
          <div className="relative">
            <input
              type={showLoginPassword ? "text" : "password"}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-surface-container-low/50 rounded-2xl border border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowLoginPassword(!showLoginPassword)}
              className="absolute right-3 flex items-center justify-center top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-primary transition-colors focus:outline-none rounded-full hover:bg-black/5"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showLoginPassword ? "visibility" : "visibility_off"}
              </span>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
            <span className="text-on-surface-variant group-hover:text-on-surface transition-colors">Ghi nhớ đăng nhập</span>
          </label>
          <Link to="/forgot-password" className="text-primary font-bold hover:underline px-2 py-2 rounded-full text-sm transition-all duration-300">Quên mật khẩu?</Link>
        </div>
        <button
          type="submit"
          disabled={loginLoading}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-md hover:shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {loginLoading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>
      <div className="mt-8 text-center pb-8 md:pb-0">
        <p className="text-sm text-on-surface-variant">
          Chưa có tài khoản?{" "}
          <button onClick={toggleAuth} className="text-primary font-bold hover:underline">Đăng ký ngay</button>
        </p>
      </div>
    </div>
  );

  const renderRegisterForm = () => (
    <div className="w-full max-w-sm pt-8 md:pt-0">
      <h1 className="text-3xl font-bold text-on-surface mb-2">Đăng ký</h1>
      <p className="text-on-surface-variant mb-6 text-xs">Gia nhập cộng đồng Organic Mart.</p>

      {regError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {regError}
        </div>
      )}
      {regSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
          {regSuccess}
        </div>
      )}

      <form className="space-y-3" onSubmit={handleRegisterSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-on-surface mb-1 uppercase">Họ và Tên</label>
            <input
              type="text"
              value={regFullName}
              onChange={(e) => setRegFullName(e.target.value)}
              placeholder="Họ tên"
              className="w-full px-4 py-2.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/30 focus:border-primary outline-none text-xs"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface mb-1 uppercase">Số điện thoại</label>
            <input
              type="tel"
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              placeholder="SĐT"
              className="w-full px-4 py-2.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/30 focus:border-primary outline-none text-xs"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-on-surface mb-1 uppercase">Email</label>
          <input
            type="email"
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/30 focus:border-primary outline-none text-xs"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-on-surface mb-1 uppercase">Mật khẩu</label>
          <div className="relative">
            <input
              type={showRegPassword ? "text" : "password"}
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/30 focus:border-primary outline-none text-xs pr-9"
              required
            />
            <button
              type="button"
              onClick={() => setShowRegPassword(!showRegPassword)}
              className="absolute right-2 flex items-center justify-center top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-primary transition-colors focus:outline-none rounded-full hover:bg-black/5"
            >
              <span className="material-symbols-outlined text-[16px]">
                {showRegPassword ? "visibility" : "visibility_off"}
              </span>
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={regLoading}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] mt-2 disabled:opacity-50"
        >
          {regLoading ? "Đang xử lý..." : "Tạo tài khoản"}
        </button>
      </form>
      <div className="mt-6 text-center pb-8 md:pb-0">
        <p className="text-xs text-on-surface-variant">
          Đã có tài khoản?{" "}
          <button onClick={toggleAuth} className="text-primary font-bold hover:underline">Đăng nhập ngay</button>
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 md:p-8 bg-surface">

      {/* Main Container */}
      <div className="relative w-full max-w-[1000px] bg-white rounded-3xl md:rounded-[40px] shadow-2xl border border-outline-variant/30 flex overflow-hidden min-h-[650px]">

        {/* Back to Home Button (Fixed position inside) */}
        <Link
          to="/"
          className="absolute top-6 left-6 md:top-8 md:left-8 z-[100] flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full border border-outline-variant/50 text-on-surface hover:text-primary hover:bg-white transition-all shadow-md font-bold text-sm"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="hidden sm:inline">Trang chủ</span>
        </Link>

        {/* MOBILE VIEW (< lg breakpoint) */}
        <div className="flex lg:hidden w-full flex-col h-full flex-1 relative overflow-y-auto px-6 py-8 pt-24 items-center justify-center">
           {isLogin ? renderLoginForm() : renderRegisterForm()}
        </div>

        {/* DESKTOP VIEW (>= lg breakpoint) */}
        <div className="hidden lg:flex w-full flex-1 relative items-stretch">

          {/* Login Form (Left Half) */}
          <div className="w-1/2 p-12 xl:p-16 pt-24 flex items-center justify-center bg-white z-10">
             <div className="mt-8">{renderLoginForm()}</div>
          </div>

          {/* Register Form (Right Half) */}
          <div className="w-1/2 p-12 xl:p-16 pt-24 flex items-center justify-center bg-white z-10">
             <div className="mt-8">{renderRegisterForm()}</div>
          </div>

          {/* Slider Overlay (Split Screen Image) */}
          <div
            className={`absolute top-0 bottom-0 w-1/2 transition-transform duration-700 ease-in-out z-40 overflow-hidden ${
              isLogin ? "translate-x-full" : "translate-x-0"
            }`}
          >
            <div className="absolute inset-0 bg-primary/20 mix-blend-multiply z-10"></div>
            <img
              src="https://scontent-sin2-1.xx.fbcdn.net/v/t39.30808-6/472232135_613967387979244_6726330731394391250_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=JHIYo9MOEwEQ7kNvwEri9gQ&_nc_oc=Adpaql36RViKG34xfk-dP5pkynTQWLlvbORA3gBVkOntqpBOdks8qVHfwHvy22lfP57tTIyE0Z8xJGWujXuLkSsv&_nc_zt=23&_nc_ht=scontent-sin2-1.xx&_nc_gid=jyBm6r2O-ny1thEQhg6ChA&_nc_ss=7b289&oh=00_Af47fug2kXy9Em43cHeaLolJalDjnhWYorWU8J0Lyi8cJg&oe=6A0B80F4"
              alt="Organic Food"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col justify-end p-10 text-white z-20">
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
    </div>
  );
}
