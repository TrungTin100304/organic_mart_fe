import React, { useRef, useState } from 'react';
import type { User } from '@/types/user';
import { updateCurrentUser } from '@/services/userService';

interface ProfileCardProps {
  user: User;
  onEdit?: () => void;
  onUpdateSuccess?: () => void;
  onShowNotification?: (message: string, type: 'success' | 'error') => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  onEdit,
  onUpdateSuccess,
  onShowNotification,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('fullName', user.fullName);
    formData.append('phoneNumber', user.phone || '');
    formData.append('avatar', file);

    setIsUploading(true);
    if (onShowNotification) {
      onShowNotification('Đang tải ảnh đại diện...', 'success');
    }

    try {
      await updateCurrentUser(formData);
      if (onShowNotification) {
        onShowNotification('Cập nhật ảnh đại diện thành công!', 'success');
      }
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (err: any) {
      console.error(err);
      if (onShowNotification) {
        onShowNotification(err.message || 'Không thể tải ảnh đại diện', 'error');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const roleLabel = user.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Khách hàng';
  const isActive = user.isActive !== false;

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
      {/* Cover Banner */}
      <div className="relative h-32 md:h-40 bg-gradient-to-br from-primary via-primary/80 to-secondary overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
            <path d="M0,100 C200,150 400,50 600,120 C700,150 750,80 800,100 L800,200 L0,200 Z" fill="white" opacity="0.15" />
            <path d="M0,140 C150,100 350,180 500,130 C650,80 750,140 800,120 L800,200 L0,200 Z" fill="white" opacity="0.1" />
          </svg>
        </div>
        {/* Edit button positioned on the banner */}
        <button
          onClick={onEdit}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-4 py-1.5 bg-white/20 backdrop-blur-md text-white font-bold text-xs rounded-full hover:bg-white/30 transition-all active:scale-95 cursor-pointer border border-white/20"
          aria-label="Chỉnh sửa hồ sơ"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          Chỉnh sửa
        </button>
      </div>

      {/* Profile Content */}
      <div className="px-6 md:px-10 pb-8">
        {/* Avatar overlapping the banner */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 -mt-16 md:-mt-14 mb-6">
          <div className="relative group shrink-0">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-surface-container-lowest shadow-lg bg-surface-container-lowest">
              <img
                alt={`${user.fullName} avatar`}
                src={user.avatarUrl ?? '/assets/hero.png'}
                className="w-full h-full object-cover"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="absolute bottom-1 right-1 w-9 h-9 aspect-square flex-shrink-0 flex items-center justify-center bg-primary text-white rounded-full shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 border-2 border-surface-container-lowest"
              aria-label="Đổi ảnh đại diện"
            >
              <span className="material-symbols-outlined text-[16px] flex-shrink-0">photo_camera</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Name + role next to avatar with high-contrast glassmorphism overlay */}
          <div className="text-center md:text-left flex-grow bg-white/90 backdrop-blur-md px-5 py-4 rounded-2xl border border-outline-variant/20 shadow-sm md:translate-y-4 max-w-lg">
            <h3 className="text-xl md:text-2xl font-bold text-neutral-900 leading-tight">{user.fullName}</h3>
            <p className="text-neutral-600 text-body-md mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-3 justify-center md:justify-start flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px]">{user.role === 'ROLE_ADMIN' ? 'admin_panel_settings' : 'person'}</span>
                {roleLabel}
              </span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                {isActive ? 'Hoạt động' : 'Tạm khóa'}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/30 hover:border-primary/20 transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">badge</span>
            </div>
            <div className="min-w-0">
              <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-0.5">Họ và tên</p>
              <p className="text-body-md font-semibold text-on-surface truncate">{user.fullName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/30 hover:border-primary/20 transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </div>
            <div className="min-w-0">
              <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-0.5">Email</p>
              <p className="text-body-md font-semibold text-on-surface truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/30 hover:border-primary/20 transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">call</span>
            </div>
            <div className="min-w-0">
              <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-0.5">Số điện thoại</p>
              <p className="text-body-md font-semibold text-on-surface">{user.phone || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/30 hover:border-primary/20 transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">shield_person</span>
            </div>
            <div className="min-w-0">
              <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-0.5">Loại tài khoản</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold uppercase tracking-wider">
                {roleLabel}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/30 hover:border-primary/20 transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
            <div className="min-w-0">
              <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-0.5">Trạng thái</p>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isActive ? 'Đang hoạt động' : 'Tạm khóa'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/30 hover:border-primary/20 transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            </div>
            <div className="min-w-0">
              <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-0.5">Ngày tham gia</p>
              <p className="text-body-md font-semibold text-on-surface">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
