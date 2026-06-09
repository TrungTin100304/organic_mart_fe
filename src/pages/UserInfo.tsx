import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileCard } from '@/components/ProfileCard';
import { useUser } from '@/hooks/useUser';
import * as addressService from '@/services/addressService';
import { getActiveBuildings, type ResidentialBuilding } from '@/services/buildingService';
import * as allergenService from '@/services/allergenService';
import { getMyOrders, type OrderStatus, type UserOrderSummary } from '@/services/orderService';
import type { Address, Allergen, DietType } from '@/types/user';
import type { DietType as MealDietType } from '@/types/mealPlan';
import { Scale, Target, Heart, X } from 'lucide-react';

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

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  READY_FOR_DELIVERY: 'Sẵn sàng giao',
  DELIVERING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
};

const UserInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading, error, refetch, updatePreference } = useUser();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressesLoading, setIsAddressesLoading] = useState(true);
  const [orders, setOrders] = useState<UserOrderSummary[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // Active sidebar tab
  const [activeTab, setActiveTab] = useState<TabKey>('profile');

  // Allergen state
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<number[]>([]);
  const [newAllergenName, setNewAllergenName] = useState('');
  const [isAddingAllergen, setIsAddingAllergen] = useState(false);

  // Health metrics / preference state
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [metricsForm, setMetricsForm] = useState({
    heightCm: '',
    weightKg: '',
    healthGoal: '',
    dietType: 'NORMAL' as DietType | '',
    dailyCalorieTarget: '',
  });
  const [isMetricsSubmitting, setIsMetricsSubmitting] = useState(false);

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' });
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressToDeleteId, setAddressToDeleteId] = useState<number | string | null>(null);
  const [buildings, setBuildings] = useState<ResidentialBuilding[]>([]);
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
  const [isAddressDeleting, setIsAddressDeleting] = useState(false);

  // Toast Notification State
  const [toasts, setToasts] = useState<Toast[]>([]);

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

  useEffect(() => {
    if (user && activeTab === 'orders') {
      void loadOrders();
    }
  }, [activeTab, user]);

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

  const loadOrders = async () => {
    setIsOrdersLoading(true);
    setOrdersError('');
    try {
      const page = await getMyOrders({ page: 0, size: 20 });
      setOrders(page.content);
    } catch (err: unknown) {
      setOrders([]);
      setOrdersError(err instanceof Error ? err.message : 'Không thể tải lịch sử mua hàng.');
    } finally {
      setIsOrdersLoading(false);
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
    // Load buildings when modal opens
    getActiveBuildings()
      .then(setBuildings)
      .catch(() => setBuildings([]));

    if (addr) {
      setEditingAddress(addr);
      setAddressForm({
        label: addr.label,
        customLabel: addr.customLabel || '',
        recipientName: addr.recipientName,
        recipientPhone: addr.recipientPhone,
        fullAddress: addr.fullAddress || '',
        ward: addr.ward || '',
        district: addr.district || '',
        city: addr.city || '',
        isDefault: addr.isDefault,
        buildingId: addr.buildingId,
        buildingCode: addr.buildingCode,
        buildingName: addr.buildingName,
        floor: addr.floor || '',
        apartmentNumber: addr.apartmentNumber || '',
        deliveryNote: addr.deliveryNote || '',
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        label: 'HOME',
        customLabel: '',
        recipientName: user?.fullName || '',
        recipientPhone: user?.phoneNumber || user?.phone || '',
        fullAddress: '',
        ward: '',
        district: '',
        city: '',
        isDefault: addresses.length === 0,
        buildingId: undefined,
        buildingCode: undefined,
        buildingName: undefined,
        floor: '',
        apartmentNumber: '',
        deliveryNote: '',
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
    // If a building is selected, all internal delivery fields are required
    if (addressForm.buildingId) {
      if (!addressForm.floor?.trim()) {
        showToast('Vui lòng nhập số tầng', 'error');
        return;
      }
      if (!addressForm.apartmentNumber?.trim()) {
        showToast('Vui lòng nhập số căn hộ', 'error');
        return;
      }
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

  const handleDeleteAddress = (id: number | string) => {
    setAddressToDeleteId(id);
  };

  const handleConfirmDeleteAddress = async () => {
    if (addressToDeleteId === null) return;
    setIsAddressDeleting(true);
    try {
      await addressService.deleteAddress(addressToDeleteId);
      showToast('Đã xoá địa chỉ', 'success');
      setAddressToDeleteId(null);
      await loadAddresses();
    } catch (err: any) {
      showToast(err.message || 'Không thể xoá địa chỉ', 'error');
    } finally {
      setIsAddressDeleting(false);
    }
  };

  const handleMetricsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const height = parseFloat(metricsForm.heightCm);
    const weight = parseFloat(metricsForm.weightKg);
    if (!height || height <= 0) { showToast('Chiều cao phải lớn hơn 0', 'error'); return; }
    if (!weight || weight <= 0) { showToast('Cân nặng phải lớn hơn 0', 'error'); return; }
    setIsMetricsSubmitting(true);
    try {
      await updatePreference({
        heightCm: height,
        weightKg: weight,
        healthGoal: metricsForm.healthGoal || undefined,
        dietType: metricsForm.dietType || undefined,
        dailyCalorieTarget: metricsForm.dailyCalorieTarget ? parseInt(metricsForm.dailyCalorieTarget) : undefined,
      });
      showToast('Cập nhật chỉ số sức khỏe thành công!', 'success');
      refetch();
      setIsMetricsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Không thể lưu chỉ số sức khỏe', 'error');
    } finally {
      setIsMetricsSubmitting(false);
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
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  if (!localStorage.getItem("accessToken") || error) {
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
                onClick={() => setActiveTab(tab.key)}
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
                onClick={() => setActiveTab(tab.key)}
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

              {/* Health Metrics Section */}
              <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-6 md:p-10">
                <div className="flex flex-col mb-6">
                  <h3 className="font-headline-md text-headline-md text-primary mb-1">Chỉ số sức khỏe</h3>
                  <p className="text-on-surface-variant text-body-md">
                    Cập nhật chiều cao, cân nặng và mục tiêu calo hàng ngày để nhận thực đơn phù hợp với cơ thể bạn.
                  </p>
                </div>

                {user.heightCm && user.weightKg && user.bmi ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-surface-container-low rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Scale className="w-4 h-4 text-on-surface-variant" />
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Chiều cao</span>
                      </div>
                      <p className="text-xl font-bold text-on-surface">{user.heightCm}</p>
                      <p className="text-xs text-on-surface-variant">cm</p>
                    </div>
                    <div className="bg-surface-container-low rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Scale className="w-4 h-4 text-on-surface-variant" />
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Cân nặng</span>
                      </div>
                      <p className="text-xl font-bold text-on-surface">{user.weightKg}</p>
                      <p className="text-xs text-on-surface-variant">kg</p>
                    </div>
                    <div className="bg-surface-container-low rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">BMI</span>
                      </div>
                      <p className={`text-xl font-bold ${user.bmi < 18.5 || user.bmi >= 25 ? 'text-red-500' : user.bmi >= 23 ? 'text-amber-500' : 'text-green-600'}`}>
                        {user.bmi}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {user.bmi < 18.5 ? 'Thiếu cân' : user.bmi < 23 ? 'Bình thường' : user.bmi < 25 ? 'Thừa cân' : 'Béo phì'}
                      </p>
                    </div>
                    <div className="bg-surface-container-low rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-on-surface-variant" />
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Calo/ngày</span>
                      </div>
                      <p className="text-xl font-bold text-on-surface">{user.dailyCalorieTarget ?? '—'}</p>
                      <p className="text-xs text-on-surface-variant">kcal</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-on-surface-variant text-body-md mb-4">
                    Bạn chưa nhập chỉ số sức khỏe. Cập nhật ngay để nhận thực đơn tốt nhất!
                  </p>
                )}

                <button
                  onClick={() => {
                    setMetricsForm({
                      heightCm: user.heightCm ? String(user.heightCm) : '',
                      weightKg: user.weightKg ? String(user.weightKg) : '',
                      healthGoal: user.healthGoal || '',
                      dietType: user.dietType || '',
                      dailyCalorieTarget: user.dailyCalorieTarget ? String(user.dailyCalorieTarget) : '',
                    });
                    setIsMetricsModalOpen(true);
                  }}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all active:scale-95 shadow-sm flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  {user.heightCm ? 'Cập nhật chỉ số' : 'Nhập chỉ số sức khỏe'}
                </button>
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
                                  {addr.buildingId && addr.buildingCode
                                    ? `Căn hộ ${addr.apartmentNumber || '?'}, tầng ${addr.floor || '?'}, tòa ${addr.buildingCode}`
                                    : addr.fullAddress}
                                  {addr.ward && `, ${addr.ward}`}
                                  {addr.district && `, ${addr.district}`}
                                  {addr.city && `, ${addr.city}`}
                                </p>
                                {addr.buildingId && addr.buildingName && (
                                  <p className="text-sm text-primary font-semibold">
                                    {addr.buildingName}
                                  </p>
                                )}
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
              {/* Recent Orders Section */}
              <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-6 md:p-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-headline-md text-headline-md text-primary">Đơn hàng gần đây</h3>
                  <button className="text-primary font-bold font-label-lg text-label-lg hover:underline transition-all">
                    Xem tất cả đơn hàng
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-outline-variant">
                      <tr>
                        <th className="pb-4 font-label-lg text-label-lg text-on-surface-variant">Mã đơn hàng</th>
                        <th className="pb-4 font-label-lg text-label-lg text-on-surface-variant">Ngày mua</th>
                        <th className="pb-4 font-label-lg text-label-lg text-on-surface-variant">Trạng thái</th>
                        <th className="pb-4 font-label-lg text-label-lg text-on-surface-variant text-right">Tổng cộng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {isOrdersLoading ? (
                        <tr>
                          <td className="py-8 text-center text-on-surface-variant" colSpan={4}>
                            Đang tải lịch sử mua hàng...
                          </td>
                        </tr>
                      ) : ordersError ? (
                        <tr>
                          <td className="py-8 text-center text-red-700" colSpan={4}>
                            <p>{ordersError}</p>
                            <button type="button" onClick={() => void loadOrders()} className="mt-3 font-bold text-primary hover:underline">
                              Thử lại
                            </button>
                          </td>
                        </tr>
                      ) : orders.length > 0 ? (
                        orders.map((o) => (
                          <tr key={o.id} className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                            <td className="py-4 font-body-md text-body-md font-bold text-primary">{o.orderCode}</td>
                            <td className="py-4 font-body-md text-body-md">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                            <td className="py-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${o.status === 'DELIVERING' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'} text-[12px] font-bold`}>
                                {o.status === 'DELIVERING' && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                                {ORDER_STATUS_LABELS[o.status]}
                              </span>
                            </td>
                            <td className="py-4 font-price-display text-price-display text-right">{o.totalAmount.toLocaleString('vi-VN')}đ</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-8 text-center text-on-surface-variant" colSpan={4}>
                            <div className="flex flex-col items-center gap-2">
                              <span className="material-symbols-outlined text-[32px] text-outline">receipt_long</span>
                              <p>Chưa có đơn hàng nào.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
                <label className="text-label-lg font-bold text-on-surface-variant">Tòa nhà</label>
                <select
                  value={addressForm.buildingId ?? ''}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : undefined;
                    const selected = buildings.find((b) => b.id === id);
                    setAddressForm({
                      ...addressForm,
                      buildingId: id,
                      buildingCode: selected?.code,
                      buildingName: selected?.name,
                    });
                  }}
                  className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md cursor-pointer"
                >
                  <option value="">-- Chọn tòa nhà --</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
                {!addressForm.buildingId && (
                  <p className="text-xs text-on-surface-variant/70">
                    Để trống nếu địa chỉ giao hàng bên ngoài khu chung cư
                  </p>
                )}
              </div>

              {addressForm.buildingId && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-label-lg font-bold text-on-surface-variant">Tầng *</label>
                      <input
                        type="text"
                        required
                        value={addressForm.floor ?? ''}
                        onChange={(e) => setAddressForm({ ...addressForm, floor: e.target.value })}
                        className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md"
                        placeholder="VD: 5"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-label-lg font-bold text-on-surface-variant">Căn hộ *</label>
                      <input
                        type="text"
                        required
                        value={addressForm.apartmentNumber ?? ''}
                        onChange={(e) => setAddressForm({ ...addressForm, apartmentNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md"
                        placeholder="VD: 501"
                      />
                    </div>
                  </div>
                  {addressForm.buildingCode && (
                    <div className="p-3 bg-primary-container/30 rounded-xl border border-primary/20">
                      <p className="text-sm font-semibold text-primary">
                        Địa chỉ giao hàng: Căn hộ {addressForm.apartmentNumber || '?'}, tầng {addressForm.floor || '?'}, tòa {addressForm.buildingCode}
                      </p>
                    </div>
                  )}
                </>
              )}

              {!addressForm.buildingId && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-label-lg font-bold text-on-surface-variant">Địa chỉ chi tiết</label>
                    <input
                      type="text"
                      value={addressForm.fullAddress}
                      onChange={(e) => setAddressForm({ ...addressForm, fullAddress: e.target.value })}
                      className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md"
                      placeholder="Số nhà, tên đường..."
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
                      <label className="text-label-lg font-bold text-on-surface-variant">Tỉnh/Thành phố</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md"
                        placeholder="Tỉnh/TP"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-label-lg font-bold text-on-surface-variant">Ghi chú giao hàng</label>
                <textarea
                  value={addressForm.deliveryNote ?? ''}
                  onChange={(e) => setAddressForm({ ...addressForm, deliveryNote: e.target.value })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md resize-none"
                  rows={2}
                  placeholder="VD: Gọi trước khi giao, để trước cửa..."
                />
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

      {addressToDeleteId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            if (!isAddressDeleting) setAddressToDeleteId(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-address-title"
            className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md p-6 md:p-8 shadow-2xl space-y-6 animate-in fade-in duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div className="min-w-0">
                <h3 id="delete-address-title" className="text-headline-md font-bold text-on-surface">Xoá địa chỉ</h3>
                <p className="text-body-md text-on-surface-variant mt-2">Bạn có chắc chắn muốn xoá địa chỉ này?</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAddressToDeleteId(null)}
                disabled={isAddressDeleting}
                className="px-5 py-2 rounded-full border border-outline text-on-surface-variant font-bold hover:bg-surface-container-high transition-all cursor-pointer disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAddress}
                disabled={isAddressDeleting}
                className="px-6 py-2 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isAddressDeleting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Health Metrics Modal */}
      {isMetricsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md p-6 md:p-8 shadow-2xl space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-headline-md font-bold text-primary">Chỉ số sức khỏe</h3>
              <button
                onClick={() => setIsMetricsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleMetricsSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-lg font-bold text-on-surface-variant">Chiều cao (cm) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={300}
                    placeholder="VD: 170"
                    value={metricsForm.heightCm}
                    onChange={(e) => setMetricsForm({ ...metricsForm, heightCm: e.target.value })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-lg font-bold text-on-surface-variant">Cân nặng (kg) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={500}
                    placeholder="VD: 65"
                    value={metricsForm.weightKg}
                    onChange={(e) => setMetricsForm({ ...metricsForm, weightKg: e.target.value })}
                    className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-lg font-bold text-on-surface-variant">Chế độ ăn</label>
                <select
                  value={metricsForm.dietType}
                  onChange={(e) => setMetricsForm({ ...metricsForm, dietType: e.target.value as DietType | '' })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md cursor-pointer"
                >
                  <option value="">Không chọn</option>
                  <option value="NORMAL">Bình thường</option>
                  <option value="VEGETARIAN">Chay</option>
                  <option value="VEGAN">Thuần chay</option>
                  <option value="KETO">Keto</option>
                  <option value="PALEO">Paleo</option>
                  <option value="GLUTEN_FREE">Không gluten</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-lg font-bold text-on-surface-variant">Mục tiêu calo/ngày</label>
                <input
                  type="number"
                  min={500}
                  max={10000}
                  placeholder="VD: 1800"
                  value={metricsForm.dailyCalorieTarget}
                  onChange={(e) => setMetricsForm({ ...metricsForm, dailyCalorieTarget: e.target.value })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-lg font-bold text-on-surface-variant">Mục tiêu sức khỏe</label>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="VD: Giảm cân, Tăng cơ..."
                  value={metricsForm.healthGoal}
                  onChange={(e) => setMetricsForm({ ...metricsForm, healthGoal: e.target.value })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-xl bg-surface-container-low focus:outline-none focus:border-primary font-body-md"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsMetricsModalOpen(false)}
                  className="px-5 py-2 rounded-full border border-outline text-on-surface-variant font-bold hover:bg-surface-container-high transition-all cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isMetricsSubmitting}
                  className="px-6 py-2 rounded-full bg-primary text-white font-bold hover:bg-primary/95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isMetricsSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  Lưu
                </button>
              </div>
            </form>
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
