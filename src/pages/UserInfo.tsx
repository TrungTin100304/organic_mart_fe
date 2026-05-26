import React, { useEffect, useState } from 'react';
import { ProfileCard } from '@/components/ProfileCard';
import { useUser } from '@/hooks/useUser';
import { updateCurrentUser } from '@/services/userService';
import { getUserAddresses, createUserAddress } from '@/services/addressService';
import type { UserAddress } from '@/types/address';

const UserInfoPage: React.FC = () => {
  const { user, isLoading, error, refetch } = useUser();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<UserAddress, 'id'>>({
    label: 'HOME',
    customLabel: '',
    recipientName: '',
    recipientPhone: '',
    fullAddress: '',
    ward: '',
    district: '',
    city: '',
    isDefault: false
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const data = await getUserAddresses();
      setAddresses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (formData: FormData) => {
    try {
      await updateCurrentUser(formData);
      refetch(); // Refresh user data to show changes
      alert('Cập nhật thông tin thành công!');
    } catch (e: any) {
      alert(e.message || 'Cập nhật thất bại. Vui lòng thử lại sau.');
    }
  };

  if (isLoading) return <div className="pt-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">Đang tải thông tin người dùng...</div>;
  if (error) return <div className="pt-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-red-600">{error}</div>;
  if (!user) return <div className="pt-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">Không tìm thấy người dùng.</div>;

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserAddress(newAddress);
      setShowAddressModal(false);
      setNewAddress({
        label: 'HOME',
        customLabel: '',
        recipientName: '',
        recipientPhone: '',
        fullAddress: '',
        ward: '',
        district: '',
        city: '',
        isDefault: false
      });
      fetchAddresses();
      alert('Thêm địa chỉ thành công!');
    } catch (err: any) {
      alert(err.message || 'Thêm địa chỉ thất bại.');
    }
  };

  return (
    <main className="pt-24 pb-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <aside className="md:col-span-3 space-y-2">
          <h2 className="font-headline-md text-headline-md mb-6 px-4">Tài khoản của tôi</h2>
          <nav className="space-y-1">
            <a className="flex items-center gap-4 px-4 py-3 bg-primary-container text-on-primary-container rounded-xl font-label-lg text-label-lg transition-all" href="#">
              <span className="material-symbols-outlined" data-icon="person" data-weight="fill" style={{ fontVariationSettings: `"FILL" 1` }}>person</span>
              Thông tin cá nhân
            </a>
            <a className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl font-label-lg text-label-lg transition-all" href="#">Lịch sử đơn hàng</a>
            <a className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl font-label-lg text-label-lg transition-all" href="#">Sổ địa chỉ</a>
            <a className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl font-label-lg text-label-lg transition-all" href="#">Cài đặt</a>
          </nav>
        </aside>

        <div className="md:col-span-9 space-y-12">
          <ProfileCard user={user} onSave={handleSaveProfile} />

          <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-6 md:p-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-headline-md text-primary">Sổ địa chỉ</h3>
              <button onClick={() => setShowAddressModal(true)} className="text-primary font-bold font-label-lg text-label-lg hover:underline transition-all">Thêm địa chỉ mới</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses && addresses.length > 0 ? (
                addresses.map((addr, index) => (
                  <div key={addr.id || index} className="p-5 border-2 border-primary bg-surface-container-low rounded-xl relative">
                    {addr.isDefault && <span className="absolute top-4 right-4 bg-primary text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">Mặc định</span>}
                    <div className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-primary" data-icon="home">home</span>
                      <div>
                        <p className="font-bold font-body-lg text-body-lg mb-1">{addr.label === 'CUSTOM' ? addr.customLabel : addr.label}</p>
                        <p className="font-body-md text-body-md font-bold mb-1">{addr.recipientName} - {addr.recipientPhone}</p>
                        <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed">{addr.fullAddress}<br />{addr.ward}, {addr.district}, {addr.city}</p>
                        <div className="mt-4 flex gap-4">
                          <button className="text-primary font-bold text-label-lg">Sửa</button>
                          <button className="text-on-surface-variant font-bold text-label-lg">Xóa</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div onClick={() => setShowAddressModal(true)} className="p-5 border border-outline-variant hover:border-primary transition-colors rounded-xl flex items-center justify-center border-dashed cursor-pointer">
                  <div className="text-center space-y-2">
                    <span className="material-symbols-outlined text-outline" data-icon="add_location">add_location</span>
                    <p className="text-outline font-label-lg">Thêm địa chỉ phụ</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {showAddressModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">Thêm địa chỉ mới</h3>
                <form onSubmit={handleAddAddress} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Loại địa chỉ</label>
                    <select
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="HOME">Nhà riêng</option>
                      <option value="WORK">Công ty</option>
                      <option value="CUSTOM">Khác</option>
                    </select>
                  </div>
                  {newAddress.label === 'CUSTOM' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Tên địa chỉ</label>
                      <input
                        type="text"
                        value={newAddress.customLabel}
                        onChange={(e) => setNewAddress({ ...newAddress, customLabel: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1">Tên người nhận</label>
                    <input
                      type="text"
                      value={newAddress.recipientName}
                      onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      value={newAddress.recipientPhone}
                      onChange={(e) => setNewAddress({ ...newAddress, recipientPhone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Thành phố/Tỉnh</label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quận/Huyện</label>
                    <input
                      type="text"
                      value={newAddress.district}
                      onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phường/Xã</label>
                    <input
                      type="text"
                      value={newAddress.ward}
                      onChange={(e) => setNewAddress({ ...newAddress, ward: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Địa chỉ cụ thể (Số nhà, tên đường)</label>
                    <input
                      type="text"
                      value={newAddress.fullAddress}
                      onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                    />
                    <label htmlFor="isDefault">Đặt làm địa chỉ mặc định</label>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(false)}
                      className="px-4 py-2 border rounded-md hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                      Lưu địa chỉ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-6 md:p-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-headline-md text-primary">Đơn hàng gần đây</h3>
              <button className="text-primary font-bold font-label-lg text-label-lg hover:underline transition-all">Xem tất cả đơn hàng</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-outline-variant">
                  <tr>
                    <th className="pb-4 font-label-lg text-label-lg text-on-surface-variant">Mã đơn hàng</th>
                    <th className="pb-4 font-label-lg text-label-lg text-on-surface-variant">Ngày đặt</th>
                    <th className="pb-4 font-label-lg text-label-lg text-on-surface-variant">Trạng thái</th>
                    <th className="pb-4 font-label-lg text-label-lg text-on-surface-variant text-right">Tổng tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {user.recentOrders && user.recentOrders.length > 0 ? (
                    user.recentOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                        <td className="py-4 font-body-md text-body-md font-bold text-primary">{o.id}</td>
                        <td className="py-4 font-body-md text-body-md">{new Date(o.date).toLocaleDateString('vi-VN')}</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${o.status === 'Out for Delivery' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'} text-[12px] font-bold`}>
                            {o.status === 'Out for Delivery' && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                            {o.status}
                          </span>
                        </td>
                        <td className="py-4 font-price-display text-price-display text-right">${o.total.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-4" colSpan={4}>Chưa có đơn hàng nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default UserInfoPage;
