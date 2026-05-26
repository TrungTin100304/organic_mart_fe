import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative hidden sm:block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-full transition-all block"
      >
        <span className="material-symbols-outlined text-[24px]">person</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-surface border border-outline-variant rounded-md shadow-lg overflow-hidden z-[60]">
          <div className="p-3 border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
            <Link to="/user-info" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                U
              </div>
              <div>
                <div className="font-bold text-sm text-on-surface">Tài khoản của tôi</div>
                <div className="text-xs text-on-surface-variant">Xem hồ sơ</div>
              </div>
            </Link>
          </div>
          <div className="flex flex-col py-1">
            <Link
              to="/account"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors text-left font-medium"
            >
              Thông tin cá nhân
            </Link>
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors text-left font-medium text-error"
            >
              Đăng xuất
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

