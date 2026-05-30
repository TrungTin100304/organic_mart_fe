import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getCurrentCart } from "@/services/cartService";

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const hasToken = !!localStorage.getItem("accessToken");
    setIsLoggedIn(hasToken);
    if (!hasToken) {
      setCartCount(0);
      return;
    }

    getCurrentCart()
      .then((cart) => setCartCount(cart.distinctItemCount || 0))
      .catch(() => setCartCount(0));
  }, [location]);

  if (isAdmin || isAuthPage) return null;

  return (
    <header className="fixed w-full z-50 bg-surface border-b border-outline-variant">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between px-4 md:px-10 h-16 md:h-20 gap-4">
        {/* Left Section: Logo */}
        <div className="flex-1 md:flex-none flex items-center">
          <button className="md:hidden p-2 -ml-2 mr-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <Link to="/" className="text-xl md:text-headline-md font-bold text-primary shrink-0 hover:brightness-90 transition-all">
            Organic Mart
          </Link>
        </div>

        {/* Center Section: Navigation (Pill Design) */}
        <div className="hidden md:flex flex-shrink-0 justify-center px-4 flex-1">
          <nav className="flex items-center bg-surface-container-low/80 backdrop-blur-lg px-1.5 py-1.5 rounded-full border border-outline-variant/20 shadow-sm">
            <Link 
              to="/" 
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${location.pathname === "/" ? "bg-primary text-white shadow-md" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"}`}
            >
              Trang chủ
            </Link>
            <Link 
              to="/shop" 
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${location.pathname === "/shop" ? "bg-primary text-white shadow-md" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"}`}
            >
              Cửa hàng
            </Link>
            <Link 
              to="/meal-plan" 
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${location.pathname === "/meal-plan" ? "bg-primary text-white shadow-md" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"}`}
            >
              Thực đơn
            </Link>
            <Link 
              to="/about" 
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${location.pathname === "/about" ? "bg-primary text-white shadow-md" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"}`}
            >
              Giới thiệu
            </Link>
          </nav>
        </div>

        {/* Right Section: Actions & Search */}
        <div className="flex items-center justify-end gap-1 md:gap-2 xl:gap-3">
          <div className="hidden lg:flex items-center bg-surface-container-low border border-outline-variant/30 rounded-full px-3 py-1.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">search</span>
            <input 
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-20 xl:w-28 outline-none placeholder:text-on-surface-variant/50" 
              placeholder="Tìm kiếm..." 
              type="text" 
            />
          </div>
          <div className="flex items-center">
            <button className="lg:hidden p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-full transition-all">
              <span className="material-symbols-outlined text-[24px]">search</span>
            </button>
            <Link to={isLoggedIn ? "/account" : "/login"} className="hidden sm:block p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-full transition-all">
              <span className="material-symbols-outlined text-[24px]">person</span>
            </Link>
            <Link to="/cart" className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-full transition-all relative group">
              <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-primary text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 font-bold border-2 border-surface">{cartCount}</span>
              )}
            </Link>
            <button className="hidden sm:block p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-full transition-all">
              <span className="material-symbols-outlined text-[24px]">support_agent</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
