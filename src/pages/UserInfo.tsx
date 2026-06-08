import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileCard } from '@/components/ProfileCard';
import { useUser } from '@/hooks/useUser';
import * as addressService from '@/services/addressService';
import * as allergenService from '@/services/allergenService';
import { getMyOrders, getOrderDetail, type OrderListItem, type PaginatedOrders, type Order } from '@/services/orderService';
import type { Address, Allergen } from '@/types/user';

type OrderStatus = 'Tất cả' | 'Chờ xác nhận' | 'Đã xác nhận' | 'Đang xử lý' | 'Đã giao hàng' | 'Đã hủy' | 'Đã hoàn tiền';

const ORDER_STATUS_FILTERS: OrderStatus[] = [
  'Tất cả', 'Chờ xác nhận', 'Đã xác nhận', 'Đang xử lý', 'Đã giao hàng', 'Đã hủy', 'Đã hoàn tiền',
];

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const TABS = [
  { key: 'profile' as const, label: 'Thông tin cá nhân', icon: 'person' },
  { key: 'orders' as const, label: 'Lịch sử mua hàng', icon: 'history' },
  { key: 'addresses' as const, label: 'Sổ địa chỉ', icon: 'location_on' },
  { key: 'settings' as const, label: 'Cài đặt', icon: 'settings' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const UserInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading, error, refetch } = useUser();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressesLoading, setIsAddressesLoading] = useState(true);

  // Active sidebar tab
  const [activeTab, setActiveTab] = useState<TabKey>('profile');

  // Allergen state
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<number[]>([]);
  const [newAllergenName, setNewAllergenName] = useState('');
  const [isAddingAllergen, setIsAddingAllergen] = useState(false);

  // Order history state
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus>('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 5;

  // Order list API state
  const [orderList, setOrderList] = useState<OrderListItem[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [ordersTotalElements, setOrdersTotalElements] = useState(0);

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' });
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>({
    label: 'HOME',
    customLabel: '',
    recipientName: '',
    recipientPhone: '',
    fullAddress: '',
    ward: '',
    district: '',
    city: '',
    isDefault: false,
  });
  const [isAddressSubmitting, setIsAddressSubmitting] = useState(false);

  // Toast Notification State
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Order Detail Modal State
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [orderDetail, setOrderDetail] = useState<Order | null>(null);
  const [isOrderDetailLoading, setIsOrderDetailLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate('/login');
    }
  }, [error, navigate]);

  useEffect(() => {
    if (user) {
      loadAddresses();
      loadAllergens(user.id);
    }
  }, [user]);

  const loadAddresses = async () => {
    setIsAddressesLoading(true);
    try {
      const list = await addressService.getAllAddresses();
      setAddresses(list);
    } catch (err: any) {
      showToast(err.message || 'Không thể tải danh sách địa chỉ', 'error');
    } finally {
      setIsAddressesLoading(false);
    }
  };

  const loadAllergens = async (userId: string | number) => {
    try {
      const list = await allergenService.getAllAllergens();
      setAllergens(list);

      const saved = localStorage.getItem(`user_allergens_${userId}`);
      if (saved) {
        setSelectedAllergens(JSON.parse(saved));
      }
    } catch (err: any) {
      console.error('Failed to load allergens:', err);
    }
  };

  const handleToggleAllergen = (id: number) => {
    if (!user) return;
    let updated: number[];
    if (selectedAllergens.includes(id)) {
      updated = selectedAllergens.filter((x) => x !== id);
    } else {
      updated = [...selectedAllergens, id];
    }
    setSelectedAllergens(updated);
    localStorage.setItem(`user_allergens_${user.id}`, JSON.stringify(updated));
    showToast('Đã cập nhật tuỳ chọn chế độ ăn!', 'success');
  };

  const handleAddAllergen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedName = newAllergenName.trim();
    if (!trimmedName) {
      showToast('Tên dị ứng không được để trống!', 'error');
      return;
    }

    // Validate no duplicates (case-insensitive check against current list of allergens)
    const isDuplicate = allergens.some(
      (a) => a.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      showToast('Tên dị ứng này đã tồn tại!', 'error');
      return;
    }

    setIsAddingAllergen(true);
    try {
      const newAllergen = await allergenService.createAllergen(trimmedName);
      
      // Append returned allergen to the list
      setAllergens((prev) => [...prev, newAllergen]);

      // Auto select the new allergen ID
      const updatedSelected = [...selectedAllergens, newAllergen.id];
      setSelectedAllergens(updatedSelected);
      localStorage.setItem(`user_allergens_${user.id}`, JSON.stringify(updatedSelected));

      // Clear input field
      setNewAllergenName('');
      showToast('Thêm dị ứng mới thành công!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Không thể thêm dị ứng mới', 'error');
    } finally {
      setIsAddingAllergen(false);
    }
  };

  // Profile Edit
  const handleOpenProfileModal = () => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
      });
      setIsProfileModalOpen(true);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) {
      showToast('Họ và tên không được để trống', 'error');
      return;
    }
    setIsProfileSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fullName', profileForm.fullName.trim());
      formData.append('phoneNumber', profileForm.phone.trim());

      const { updateCurrentUser } = await import('@/services/userService');
      await updateCurrentUser(formData);
      showToast('Cập nhật thông tin thành công!', 'success');
      refetch();
      setIsProfileModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Không thể cập nhật thông tin', 'error');
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  // Address CRUD
  const handleOpenAddressModal = (addr?: Address) => {
    if (addr) {
      setEditingAddress(addr);
      setAddressForm({
        label: addr.label,
        customLabel: addr.customLabel || '',
        recipientName: addr.recipientName,
        recipientPhone: addr.recipientPhone,
        fullAddress: addr.fullAddress,
        ward: addr.ward || '',
        district: addr.district || '',
        city: addr.city || '',
        isDefault: addr.isDefault,
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        label: 'HOME',
        customLabel: '',
        recipientName: user?.fullName || '',
        recipientPhone: user?.phone || '',
        fullAddress: '',
        ward: '',
        district: '',
        city: '',
        isDefault: addresses.length === 0,
      });
    }
    setIsAddressModalOpen(true);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.recipientName.trim()) {
      showToast('Tên người nhận không được để trống', 'error');
      return;
    }
    if (!addressForm.recipientPhone.trim()) {
      showToast('Số điện thoại người nhận không được để trống', 'error');
      return;
    }
    if (!addressForm.fullAddress.trim()) {
      showToast('Địa chỉ chi tiết không được để trống', 'error');
      return;
    }
    if (!addressForm.city?.trim()) {
      showToast('Tỉnh/Thành phố không được để trống', 'error');
      return;
    }

    setIsAddressSubmitting(true);
    try {
      if (editingAddress && editingAddress.id !== undefined) {
        await addressService.updateAddress(editingAddress.id, {
          ...addressForm,
          id: editingAddress.id,
        });
        showToast('Cập nhật địa chỉ thành công!', 'success');
      } else {
        await addressService.createAddress(addressForm);
        showToast('Thêm địa chỉ thành công!', 'success');
      }
      await loadAddresses();
      setIsAddressModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Không thể lưu địa chỉ', 'error');
    } finally {
      setIsAddressSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: number | string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá địa chỉ này?')) return;
    try {
      await addressService.deleteAddress(id);
      showToast('Đã xoá địa chỉ', 'success');
      await loadAddresses();
    } catch (err: any) {
      showToast(err.message || 'Không thể xoá địa chỉ', 'error');
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        const { logout } = await import("@/services/authService");
        await logout({ refreshToken });
      } catch (err) {
        console.warn("Backend logout failed, clearing local session anyway.", err);
      }
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    showToast("Đăng xuất thành công!", "success");
    navigate("/login", { replace: true });
  };

  const mapStatusToFilter = (status: string): OrderStatus => {
    const map: Record<string, OrderStatus> = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      PROCESSING: 'Đang xử lý',
      SHIPPED: 'Đã giao hàng',
      DELIVERED: 'Đã giao hàng',
      CANCELLED: 'Đã hủy',
      REFUNDED: 'Đã hoàn tiền',
    };
    return map[status] ?? 'Chờ xác nhận';
  };

  // Get display badge info for a backend status
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; label: string }> = {
      PENDING:      { bg: 'bg-yellow-100 text-yellow-800',                               label: 'CHỜ XÁC NHẬN'  },
      CONFIRMED:    { bg: 'bg-cyan-100 text-cyan-800',                                     label: 'ĐÃ XÁC NHẬN'   },
      PROCESSING:   { bg: 'bg-blue-100 text-blue-800',                                     label: 'ĐANG XỬ LÝ'    },
      SHIPPED:      { bg: 'bg-secondary-container text-on-secondary-container',             label: 'ĐÃ GIAO HÀNG' },
      DELIVERED:    { bg: 'bg-surface-container-high text-on-surface-variant',             label: 'ĐÃ GIAO HÀNG' },
      CANCELLED:    { bg: 'bg-error-container text-on-error-container',                    label: 'ĐÃ HỦY'       },
      REFUNDED:     { bg: 'bg-orange-100 text-orange-800',                                 label: 'ĐÃ HOÀN TIỀN'  },
    };
    return badges[status] ?? badges['PENDING'];
  };

  // Map frontend filter label to backend status
  const filterToBackendStatus = (filter: OrderStatus): string | null => {
    const map: Record<OrderStatus, string | null> = {
      'Tất cả':         null,
      'Chờ xác nhận':  'PENDING',
      'Đã xác nhận':   'CONFIRMED',
      'Đang xử lý':     'PROCESSING',
      'Đã giao hàng':  'DELIVERED',
      'Đã hủy':        'CANCELLED',
      'Đã hoàn tiền':  'REFUNDED',
    };
    return map[filter] ?? null;
  };

  const loadMyOrders = async (page: number) => {
    setIsOrdersLoading(true);
    try {
      const data: PaginatedOrders = await getMyOrders(page - 1, ORDERS_PER_PAGE);
      setOrderList(data.content);
      setOrdersTotalPages(data.totalPages);
      setOrdersTotalElements(data.totalElements);
    } catch (err: any) {
      showToast(err.message || 'Không thể tải danh sách đơn hàng', 'error');
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // Load orders whenever filter or page changes on the orders tab
  useEffect(() => {
    if (activeTab === 'orders') {
      loadMyOrders(currentPage);
    }
  }, [activeTab, currentPage, orderStatusFilter]);

  // Open order detail modal and fetch full details
  const handleOpenOrderDetail = async (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsOrderDetailLoading(true);
    setIsOrderDetailOpen(true);
    try {
      const detail: Order = await getOrderDetail(orderId);
      setOrderDetail(detail);
    } catch (err: any) {
      showToast(err.message || 'Không thể tải chi tiết đơn hàng', 'error');
      setIsOrderDetailOpen(false);
    } finally {
      setIsOrderDetailLoading(false);
    }
  };

  if (error) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="pt-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop font-sans">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-on-surface-variant font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const recentOrders = user.recentOrders || [];

  return (
    <main className="pt-24 pb-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto font-sans">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar — hidden on mobile, replaced by horizontal tabs */}
        <aside className="hidden md:block md:col-span-3 space-y-2">
          {/* Mini user card on sidebar */}
          <div className="flex items-center gap-3 px-4 py-4 mb-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
            <img
              src={user.avatarUrl ?? '/assets/hero.png'}
              alt={user.fullName}
              className="w-10 h-10 rounded-full object-cover border-2 border-surface-container"
            />
            <div className="min-w-0">
              <p className="font-bold text-body-md truncate">{user.fullName}</p>
              <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
            </div>
          </div>
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-label-lg text-label-lg transition-all active:scale-95 text-left cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-primary text-white shadow-md font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-high font-medium'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === tab.key ? `"FILL" 1` : `"FILL" 0` }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl font-label-lg text-label-lg transition-all cursor-pointer text-left"
            >
              <span className="material-symbols-outlined">logout</span>
              Đăng xuất
            </button>
          </nav>
        </aside>

        {/* Mobile horizontal tabs */}
        <div className="md:hidden -mx-margin-mobile px-margin-mobile overflow-x-auto scrollbar-none">
          <div className="flex gap-2 pb-4 min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: activeTab === tab.key ? `"FILL" 1` : `"FILL" 0` }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-all cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Đăng xuất
            </button>
          </div>
        </div>

        <div className="md:col-span-9 space-y-8">
          {activeTab === 'profile' && (
            <div className="space-y-8">
              {/* Personal Info Card */}
              <ProfileCard
                user={user}
                onEdit={handleOpenProfileModal}
                onUpdateSuccess={refetch}
                onShowNotification={showToast}
              />

              {/* Allergens Selection Section */}
              <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-6 md:p-10">
                <div className="flex flex-col mb-6">
                  <h3 className="font-headline-md text-headline-md text-primary mb-1">Dị ứng & Chế độ ăn</h3>
                  <p className="text-on-surface-variant text-body-md">
                    Chọn các chất gây dị ứng hoặc chế độ ăn của bạn để chúng tôi có thể đưa ra cảnh báo an toàn khi bạn mua sắm thực phẩm.
                  </p>
                </div>

                {allergens.length > 0 ? (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {allergens.map((allergen) => {
                      const isSelected = selectedAllergens.includes(allergen.id);
                      return (
                        <button
                          key={allergen.id}
                          onClick={() => handleToggleAllergen(allergen.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-body-md font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
                            isSelected
                              ? 'bg-primary text-white border-primary shadow-sm'
                              : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:bg-surface-container-high'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isSelected ? 'check_circle' : 'add_circle'}
                          </span>
                          {allergen.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-on-surface-variant text-body-md mb-6">Đang tải tuỳ chọn chế độ ăn...</p>
                )}

                {/* Add custom allergen input field */}
                <div className="border-t border-outline-variant/30 pt-6 mt-6">
                  <form onSubmit={handleAddAllergen} className="max-w-md">
                    <label htmlFor="newAllergenInput" className="block text-label-lg font-bold text-on-surface-variant mb-2">
                      Nhập tên dị ứng hoặc chế độ ăn mới
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="newAllergenInput"
                        type="text"
                        value={newAllergenName}
                        onChange={(e) => setNewAllergenName(e.target.value)}
                        placeholder="VD: Không ăn tinh bột, Dị ứng kiwi..."
                        className="flex-1 px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md"
                        disabled={isAddingAllergen}
                      />
                      <button
                        type="submit"
                        disabled={isAddingAllergen}
                        className="px-5 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                      >
                        {isAddingAllergen ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span className="material-symbols-outlined text-[20px]">add</span>
                        )}
                        Thêm mới
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-8">
              {/* Address Book Section */}
              <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-6 md:p-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline-md text-headline-md text-primary">Sổ địa chỉ nhận hàng</h3>
                  <button
                    onClick={() => handleOpenAddressModal()}
                    className="text-primary font-bold font-label-lg text-label-lg hover:underline transition-all cursor-pointer"
                  >
                    Thêm địa chỉ mới
                  </button>
                </div>

                {isAddressesLoading ? (
                  <p className="text-on-surface-variant text-body-md">Đang tải địa chỉ...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.length > 0 ? (
                      addresses.map((addr) => {
                        const displayLabel = addr.label === 'OTHER' ? (addr.customLabel || 'Khác') : (addr.label === 'HOME' ? 'Nhà riêng' : 'Văn phòng');
                        const iconName = addr.label === 'HOME' ? 'home' : addr.label === 'WORK' ? 'work' : 'location_on';

                        return (
                          <div key={addr.id} className="p-5 border border-outline-variant bg-surface-container-low rounded-xl relative hover:border-primary/50 transition-all">
                            {addr.isDefault && (
                              <span className="absolute top-4 right-4 bg-primary text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                Mặc định
                              </span>
                            )}
                            <div className="flex items-start gap-4">
                              <span className="material-symbols-outlined text-primary text-[24px]" data-icon={iconName}>
                                {iconName}
                              </span>
                              <div className="space-y-2 w-full pr-12">
                                <p className="font-bold font-body-lg text-body-lg mb-1 flex items-center gap-2">
                                  {displayLabel}
                                </p>
                                <p className="font-semibold text-body-md text-on-surface">
                                  {addr.recipientName} ({addr.recipientPhone})
                                </p>
                                <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed">
                                  {addr.fullAddress}
                                  {addr.ward && `, ${addr.ward}`}
                                  {addr.district && `, ${addr.district}`}
                                  {addr.city && `, ${addr.city}`}
                                </p>
                                <div className="pt-2 flex gap-4 border-t border-outline-variant/30">
                                  <button
                                    onClick={() => handleOpenAddressModal(addr)}
                                    className="text-primary hover:text-primary-container font-bold text-label-lg transition-colors cursor-pointer"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() => addr.id && handleDeleteAddress(addr.id)}
                                    className="text-on-surface-variant hover:text-red-600 font-bold text-label-lg transition-colors cursor-pointer"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div
                        onClick={() => handleOpenAddressModal()}
                        className="p-8 border border-outline-variant hover:border-primary transition-colors rounded-xl flex items-center justify-center border-dashed cursor-pointer min-h-[160px] w-full col-span-2"
                      >
                        <div className="text-center space-y-2">
                          <span className="material-symbols-outlined text-outline text-[32px]">
                            add_location
                          </span>
                          <p className="text-outline font-label-lg">Thêm địa chỉ nhận hàng</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-8">
              {/* Order History Header */}
              <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface">Lịch sử mua hàng</h3>
                    <p className="text-on-surface-variant text-body-md mt-1">
                      Xem và quản lý tất cả các đơn hàng thực phẩm sạch của bạn.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant text-body-md">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    <span>{ordersTotalElements} đơn hàng</span>
                  </div>
                </div>

                {/* Status Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  {ORDER_STATUS_FILTERS.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setOrderStatusFilter(status);
                        setCurrentPage(1);
                      }}
                      className={`px-5 py-2.5 rounded-full font-label-lg text-label-lg font-semibold transition-all active:scale-95 cursor-pointer ${
                        orderStatusFilter === status
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-surface-container-high text-on-surface-variant hover:bg-outline-variant'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Loading State */}
                {isOrdersLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest border border-outline-variant rounded-2xl">
                    <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-on-surface-variant font-medium">Đang tải danh sách đơn hàng...</p>
                  </div>
                ) : orderList.length === 0 ? (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest border border-outline-variant rounded-2xl text-center">
                    <span className="material-symbols-outlined text-[48px] text-outline mb-3">receipt_long</span>
                    <p className="text-on-surface-variant font-label-lg">
                      {orderStatusFilter === 'Tất cả'
                        ? 'Bạn chưa có đơn hàng nào.'
                        : `Không có đơn hàng nào ở trạng thái "${orderStatusFilter}".`}
                    </p>
                    {orderStatusFilter !== 'Tất cả' && (
                      <button
                        onClick={() => { setOrderStatusFilter('Tất cả'); setCurrentPage(1); }}
                        className="mt-4 px-5 py-2.5 bg-primary text-white rounded-full font-label-lg font-bold hover:bg-primary/95 transition-all active:scale-95 cursor-pointer"
                      >
                        Xem tất cả đơn hàng
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Order Cards */}
                    <div className="space-y-4">
                      {orderList.map((order) => {
                        const badge = getStatusBadge(order.status);
                        const isCancelled = order.status === 'CANCELLED';
                        const isShipped = order.status === 'SHIPPED';
                        const isDelivered = order.status === 'DELIVERED';
                        const isRefunded = order.status === 'REFUNDED';
                        const displayDate = new Date(order.createdAt).toLocaleDateString('vi-VN');
                        const displayTime = new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

                        return (
                          <div
                            key={order.id}
                            className={`bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                              isCancelled ? 'opacity-70 grayscale-[0.3]' : ''
                            }`}
                          >
                            {/* Card Header */}
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-outline-variant/50">
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                <span className="font-price-display text-price-display text-on-surface font-bold">#{order.orderCode}</span>
                                <span className="text-body-md text-on-surface-variant flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                  {displayDate} · {displayTime}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${badge.bg}`}>
                                  {badge.label}
                                </span>
                              </div>
                              <div className="text-right">
                                {isShipped && (
                                  <>
                                    <p className="text-body-md text-on-surface-variant">Dự kiến giao:</p>
                                    <p className="font-label-lg text-primary">Hôm nay, 14:00 - 16:00</p>
                                  </>
                                )}
                                {isDelivered && (
                                  <>
                                    <p className="text-body-md text-on-surface-variant">Ngày giao hàng:</p>
                                    <p className="font-label-lg text-on-surface">
                                      {new Date(new Date(order.createdAt).getTime() + 86400000).toLocaleDateString('vi-VN')}, 10:30
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 pt-4">
                              {/* Item Count & Info */}
                              <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-surface-container-highest border border-outline-variant">
                                  <span className="material-symbols-outlined text-[28px] text-on-surface-variant">inventory_2</span>
                                </div>
                                <div className="space-y-1">
                                  <p className="font-label-lg font-bold text-on-surface">
                                    {order.itemCount} {order.itemCount === 1 ? 'sản phẩm' : 'sản phẩm'}
                                  </p>
                                  <p className="text-body-md text-on-surface-variant">
                                    Mã đơn: <span className="font-semibold">{order.orderCode}</span>
                                  </p>
                                </div>
                              </div>

                              {/* Price & Actions */}
                              <div className="flex flex-col items-end gap-3">
                                <p className={`font-price-display text-price-display ${isCancelled ? 'text-on-surface-variant line-through' : 'text-primary'} font-bold`}>
                                  {order.totalAmount.toLocaleString()}đ
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleOpenOrderDetail(order.id)}
                                    className="px-4 py-2 border border-primary text-primary rounded-xl font-label-lg text-label-lg hover:shadow-md transition-shadow active:scale-95 cursor-pointer"
                                  >
                                    Xem chi tiết
                                  </button>
                                  {!isCancelled && !isRefunded && (
                                    <button className="px-4 py-2 bg-primary text-white rounded-xl font-label-lg text-label-lg hover:shadow-md transition-shadow active:scale-95 cursor-pointer">
                                      Mua lại
                                    </button>
                                  )}
                                  {(isCancelled || isRefunded) && (
                                    <button className="px-4 py-2 border border-outline text-on-surface-variant rounded-xl font-label-lg text-label-lg cursor-pointer">
                                      {isRefunded ? 'Chi tiết hoàn tiền' : 'Chi tiết hủy'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {ordersTotalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 pt-4">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-variant transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        {Array.from({ length: ordersTotalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-full font-bold font-label-lg transition-all cursor-pointer ${
                              currentPage === page
                                ? 'bg-primary text-white shadow-sm'
                                : 'border border-outline-variant hover:bg-surface-variant'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(ordersTotalPages, p + 1))}
                          disabled={currentPage === ordersTotalPages}
                          className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-variant transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-6 md:p-10 space-y-4">
                <h3 className="font-headline-md text-headline-md text-primary">Cài đặt tài khoản</h3>
                <p className="text-on-surface-variant text-body-md">
                  Chức năng cấu hình bảo mật, đổi mật khẩu và thiết lập quyền riêng tư đang được phát triển. Vui lòng quay lại sau!
                </p>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md p-6 md:p-8 shadow-2xl space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-headline-md font-bold text-primary">Chỉnh sửa hồ sơ</h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-label-lg font-bold text-on-surface-variant">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md"
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-lg font-bold text-on-surface-variant">Số điện thoại</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-5 py-2 rounded-full border border-outline text-on-surface-variant font-bold hover:bg-surface-container-high transition-all cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isProfileSubmitting}
                  className="px-6 py-2 rounded-full bg-primary text-white font-bold hover:bg-primary/95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isProfileSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address Form Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-headline-md font-bold text-primary">
                {editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              {/* Type selector (HOME, WORK, OTHER) */}
              <div className="flex flex-col gap-2">
                <label className="text-label-lg font-bold text-on-surface-variant">Loại địa chỉ</label>
                <div className="flex gap-2">
                  {([
                    { key: 'HOME' as const, label: 'Nhà riêng' },
                    { key: 'WORK' as const, label: 'Văn phòng' },
                    { key: 'OTHER' as const, label: 'Khác' },
                  ]).map((lbl) => (
                    <button
                      key={lbl.key}
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, label: lbl.key })}
                      className={`flex-1 py-2 border rounded-xl font-label-lg font-semibold transition-all cursor-pointer ${
                        addressForm.label === lbl.key
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {lbl.label}
                    </button>
                  ))}
                </div>
              </div>

              {addressForm.label === 'OTHER' && (
                <div className="flex flex-col gap-1">
                  <label className="text-label-lg font-bold text-on-surface-variant">Tên tuỳ chỉnh</label>
                  <input
                    type="text"
                    value={addressForm.customLabel}
                    onChange={(e) => setAddressForm({ ...addressForm, customLabel: e.target.value })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md"
                    placeholder="VD: Nhà bà ngoại"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-lg font-bold text-on-surface-variant">Tên người nhận *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.recipientName}
                    onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md"
                    placeholder="Họ và tên người nhận"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-lg font-bold text-on-surface-variant">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={addressForm.recipientPhone}
                    onChange={(e) => setAddressForm({ ...addressForm, recipientPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md"
                    placeholder="SĐT người nhận"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-lg font-bold text-on-surface-variant">Địa chỉ chi tiết *</label>
                <input
                  type="text"
                  required
                  value={addressForm.fullAddress}
                  onChange={(e) => setAddressForm({ ...addressForm, fullAddress: e.target.value })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md"
                  placeholder="Số nhà, tên đường, toà nhà..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-lg font-bold text-on-surface-variant">Phường/Xã</label>
                  <input
                    type="text"
                    value={addressForm.ward}
                    onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md"
                    placeholder="Phường/Xã"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-lg font-bold text-on-surface-variant">Quận/Huyện</label>
                  <input
                    type="text"
                    value={addressForm.district}
                    onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md"
                    placeholder="Quận/Huyện"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-lg font-bold text-on-surface-variant">Tỉnh/Thành phố *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md"
                    placeholder="Tỉnh/TP"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefaultAddress"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 text-primary bg-surface-container-low border-outline-variant rounded focus:ring-primary focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="isDefaultAddress" className="text-body-md font-semibold text-on-surface select-none cursor-pointer">
                  Đặt làm địa chỉ giao hàng mặc định
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-5 py-2 rounded-full border border-outline text-on-surface-variant font-bold hover:bg-surface-container-high transition-all cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isAddressSubmitting}
                  className="px-6 py-2 rounded-full bg-primary text-white font-bold hover:bg-primary/95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isAddressSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  Lưu địa chỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {isOrderDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-5xl animate-in fade-in duration-200">
            {isOrderDetailLoading ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 flex flex-col items-center justify-center shadow-2xl">
                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-on-surface-variant font-medium">Đang tải chi tiết đơn hàng...</p>
              </div>
            ) : orderDetail ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl overflow-hidden">
                {/* ─── Header ─── */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-outline-variant bg-surface">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-xl font-bold text-on-surface">#{orderDetail.orderCode}</h2>
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          orderDetail.status === 'DELIVERED' || orderDetail.status === 'SHIPPED' ? 'bg-surface-container-high text-on-surface-variant' :
                          orderDetail.status === 'CANCELLED' ? 'bg-error-container text-on-error-container' :
                          orderDetail.status === 'REFUNDED' ? 'bg-orange-100 text-orange-800' :
                          orderDetail.status === 'CONFIRMED' ? 'bg-cyan-100 text-cyan-800' :
                          orderDetail.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                          'bg-primary text-white'
                        }`}>
                          {orderDetail.status === 'PENDING' ? 'CHỜ XÁC NHẬN' :
                           orderDetail.status === 'CONFIRMED' ? 'ĐÃ XÁC NHẬN' :
                           orderDetail.status === 'PROCESSING' ? 'ĐANG XỬ LÝ' :
                           orderDetail.status === 'SHIPPED' ? 'ĐÃ GIAO HÀNG' :
                           orderDetail.status === 'DELIVERED' ? 'ĐÃ GIAO HÀNG' :
                           orderDetail.status === 'CANCELLED' ? 'ĐÃ HỦY' :
                           orderDetail.status === 'REFUNDED' ? 'ĐÃ HOÀN TIỀN' : orderDetail.status}
                        </span>
                      </div>
                      <p className="text-on-surface-variant text-sm">
                        Đặt {new Date(orderDetail.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} · {orderDetail.details.length} sản phẩm
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {orderDetail.status !== 'CANCELLED' && orderDetail.status !== 'DELIVERED' && orderDetail.status !== 'REFUNDED' && orderDetail.status !== 'SHIPPED' && (
                      <button className="px-4 py-2 bg-primary text-white rounded-full font-bold text-sm hover:opacity-90 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">support_agent</span>
                        Hỗ trợ
                      </button>
                    )}
                    <button
                      onClick={() => { setIsOrderDetailOpen(false); setOrderDetail(null); setSelectedOrderId(null); }}
                      className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>

                {/* ─── Progress Tracker ─── */}
                <div className="px-6 py-5 border-b border-outline-variant bg-surface-container-low">
                  <div className="relative flex justify-between items-start">
                    <div className="absolute top-4 left-0 w-full h-0.5 bg-surface-container-highest -z-0">
                      {(() => {
                        const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
                        const isTerminal = ['CANCELLED', 'REFUNDED'].includes(orderDetail.status);
                        const lineIdx = isTerminal ? -1 : statusOrder.indexOf(orderDetail.status);
                        const linePercent = lineIdx <= 0 ? 0 : lineIdx === 1 ? 25 : lineIdx === 2 ? 50 : lineIdx === 3 ? 75 : 100;
                        return <div className="h-full bg-primary rounded-full" style={{ width: `${linePercent}%` }}></div>;
                      })()}
                    </div>
                    {[
                      { label: 'Đã đặt', icon: 'check_circle', getSub: () => `${new Date(orderDetail.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} · ${new Date(orderDetail.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` },
                      { label: 'Xác nhận', icon: 'task_alt', getSub: () => 'Đã xác nhận' },
                      { label: 'Xử lý', icon: 'inventory_2', getSub: () => 'Đang chuẩn bị' },
                      { label: 'Vận chuyển', icon: 'local_shipping', getSub: () => orderDetail.status === 'SHIPPED' ? 'Đang giao' : orderDetail.status === 'DELIVERED' ? 'Đã giao' : 'Sắp tới' },
                      { label: 'Hoàn thành', icon: 'home', getSub: () => orderDetail.status === 'DELIVERED' ? 'Đã nhận hàng' : 'Dự kiến' },
                    ].map((step, i) => {
                      const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
                      const active = statusOrder.indexOf(orderDetail.status);
                      const isTerminal = ['CANCELLED', 'REFUNDED'].includes(orderDetail.status);
                      const isDone = !isTerminal && active > i;
                      const isCurrent = !isTerminal && active === i;
                      return (
                        <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                            isTerminal ? 'bg-surface-container-high text-on-surface-variant' :
                            isDone || isCurrent ? 'bg-primary text-white shadow-md' : 'bg-surface-container-high text-on-surface-variant'
                          }`}>
                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: `"FILL" ${isDone || isCurrent ? 1 : 0}` }}>
                              {isCurrent ? 'check_circle' : step.icon}
                            </span>
                          </div>
                          <div className="text-center">
                            <p className={`text-sm font-semibold ${isTerminal ? 'text-on-surface-variant' : isDone || isCurrent ? 'text-on-surface' : 'text-on-surface-variant'}`}>{step.label}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">{step.getSub()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ─── Main Content Grid ─── */}
                <div className="grid grid-cols-12 divide-x divide-outline-variant">
                  {/* Left column: Shipping + Payment (8/12) */}
                  <div className="col-span-12 lg:col-span-8 divide-y divide-outline-variant">
                    {/* Shipping Info */}
                    <div className="p-5">
                      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                        Thông tin giao hàng
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                          <p className="text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wide">Địa chỉ giao hàng</p>
                          <p className="text-sm text-on-surface leading-relaxed">{orderDetail.shippingAddressSnapshot}</p>
                        </div>
                        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                          <p className="text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wide">Người nhận</p>
                          <p className="text-sm text-on-surface font-medium">{orderDetail.shippingRecipientSnapshot}</p>
                          <p className="text-sm text-on-surface-variant">{orderDetail.shippingPhoneSnapshot}</p>
                        </div>
                        {orderDetail.note && (
                          <div className="col-span-2 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                            <p className="text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wide">Ghi chú</p>
                            <p className="text-sm text-on-surface-variant">{orderDetail.note}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="p-5">
                      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">receipt_long</span>
                        Thông tin thanh toán
                      </h3>
                      <div className="space-y-2.5 max-w-sm">
                        <div className="flex justify-between text-sm text-on-surface-variant">
                          <span>Tạm tính ({orderDetail.details.length} sản phẩm)</span>
                          <span>{orderDetail.subtotal.toLocaleString()}đ</span>
                        </div>
                        {orderDetail.discountAmount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Giảm giá</span>
                            <span>-{orderDetail.discountAmount.toLocaleString()}đ</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm text-on-surface-variant">
                          <span>Phí giao hàng</span>
                          <span className="text-primary font-bold">
                            {orderDetail.shippingFee === 0 ? 'MIỄN PHÍ' : `${orderDetail.shippingFee.toLocaleString()}đ`}
                          </span>
                        </div>
                        <hr className="border-outline-variant" />
                        <div className="flex justify-between text-base font-bold text-on-surface">
                          <span>Tổng cộng</span>
                          <span className="text-primary">{orderDetail.totalAmount.toLocaleString()}đ</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-secondary-container/20 rounded-xl text-on-secondary-container">
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: `"FILL" 1` }}>verified_user</span>
                          <p className="text-xs">Qua {orderDetail.shippingProviderNameSnapshot || 'hệ thống'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right column: Items + History (4/12) */}
                  <div className="col-span-12 lg:col-span-4 divide-y divide-outline-variant">
                    {/* Order Items */}
                    <div className="p-5">
                      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">shopping_bag</span>
                        Sản phẩm
                        <span className="ml-auto text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full font-semibold">{orderDetail.details.length}</span>
                      </h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                        {orderDetail.details.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant flex-shrink-0">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">image</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-on-surface truncate">{item.productName}</p>
                              <p className="text-xs text-on-surface-variant">{item.quantity} {item.unit}</p>
                            </div>
                            <p className="text-sm font-bold text-on-surface flex-shrink-0">{item.lineSubtotal.toLocaleString()}đ</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status History */}
                    {orderDetail.statusHistories && orderDetail.statusHistories.length > 0 && (
                      <div className="p-5">
                        <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">history</span>
                          Lịch sử
                        </h3>
                        <div className="space-y-3 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                          {[...orderDetail.statusHistories].reverse().map((h) => (
                            <div key={h.id} className="flex items-start gap-2.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                              <div>
                                <p className="text-xs font-semibold text-on-surface">
                                  {h.toStatus === 'PENDING' ? 'Chờ xác nhận' :
                                   h.toStatus === 'CONFIRMED' ? 'Đã xác nhận' :
                                   h.toStatus === 'PROCESSING' ? 'Đang xử lý' :
                                   h.toStatus === 'SHIPPED' ? 'Đã giao hàng' :
                                   h.toStatus === 'DELIVERED' ? 'Đã giao hàng' :
                                   h.toStatus === 'CANCELLED' ? 'Đã hủy' :
                                   h.toStatus === 'REFUNDED' ? 'Đã hoàn tiền' : h.toStatus}
                                  {h.note && <span className="text-on-surface-variant font-normal ml-1">— {h.note}</span>}
                                </p>
                                <p className="text-[11px] text-on-surface-variant mt-0.5">
                                  {h.changedByName} · {new Date(h.createdAt).toLocaleDateString('vi-VN')} {new Date(h.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Slide-in Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-4 rounded-xl shadow-lg border text-body-md font-semibold animate-in slide-in-from-bottom-5 duration-300 ${
              toast.type === 'success'
                ? 'bg-primary-container border-primary/20 text-on-primary-container'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">
                {toast.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-on-surface-variant hover:text-on-surface ml-4 p-0.5 rounded-full hover:bg-black/5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        ))}
      </div>
    </main>
  );
};

export default UserInfoPage;
