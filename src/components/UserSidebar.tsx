import { Link, useNavigate } from 'react-router-dom';
import type { User } from '@/types/user';

export interface SidebarTab {
  key: string;
  label: string;
  icon: string;
}

export const USER_TABS: SidebarTab[] = [
  { key: 'profile', label: 'Thông tin cá nhân', icon: 'person' },
  { key: 'orders', label: 'Lịch sử mua hàng', icon: 'history' },
  { key: 'addresses', label: 'Sổ địa chỉ', icon: 'location_on' },
  { key: 'settings', label: 'Cài đặt', icon: 'settings' },
];

interface UserSidebarProps {
  user?: User | null;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onLogout?: () => void;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({
  user,
  activeTab,
  onTabChange,
  onLogout,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      navigate("/login", { replace: true });
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 p-stack-md space-y-stack-sm bg-surface-container-low dark:bg-inverse-surface rounded-xl h-fit border-r border-outline-variant dark:border-outline">
      {/* Mini user card */}
      <div className="flex items-center gap-3 px-2 mb-2">
        <img
          src={user?.avatarUrl ?? '/assets/hero.png'}
          alt={user?.fullName ?? 'User'}
          className="w-10 h-10 rounded-full object-cover border-2 border-surface-container"
        />
        <div className="min-w-0">
          <p className="font-bold text-body-md truncate">{user?.fullName ?? 'Khách hàng Organic'}</p>
          <p className="text-xs text-on-surface-variant truncate">{user?.email ?? 'organicmart@example.com'}</p>
        </div>
      </div>

      <nav className="space-y-1">
        {USER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              if (onTabChange) {
                onTabChange(tab.key);
              } else {
                navigate(`/user?tab=${tab.key}`);
              }
            }}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-label-lg text-label-lg transition-all active:scale-95 text-left cursor-pointer ${
              (activeTab ?? 'profile') === tab.key
                ? 'bg-primary text-white shadow-md font-bold'
                : 'text-on-surface-variant hover:bg-surface-variant font-medium'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: (activeTab ?? 'profile') === tab.key ? `"FILL" 1` : `"FILL" 0`,
              }}
            >
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto pt-4 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl font-label-lg text-label-lg transition-all cursor-pointer text-left"
        >
          <span className="material-symbols-outlined">logout</span>
          Đăng xuất
        </button>
        <Link
          to="/shop"
          className="block w-full py-3 bg-primary-container text-on-primary-container rounded-full font-bold font-label-lg text-label-lg hover:opacity-90 transition-opacity text-center"
        >
          Quay lại cửa hàng
        </Link>
      </div>
    </aside>
  );
};
