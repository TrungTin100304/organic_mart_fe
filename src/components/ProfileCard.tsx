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
      onShowNotification('Uploading new avatar...', 'success');
    }

    try {
      await updateCurrentUser(formData);
      if (onShowNotification) {
        onShowNotification('Avatar updated successfully!', 'success');
      }
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (err: any) {
      console.error(err);
      if (onShowNotification) {
        onShowNotification(err.message || 'Failed to upload avatar', 'error');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-6 md:p-10 space-y-6">
      <section>
        <div className="flex justify-between items-start mb-8">
          <h3 className="font-headline-md text-headline-md text-primary">Personal Information</h3>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-6 py-2 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300 active:scale-95 cursor-pointer"
            aria-label="Edit profile"
          >
            <span className="material-symbols-outlined text-[20px]" data-icon="edit">
              edit
            </span>
            Edit Profile
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container relative">
              <img
                alt={`${user.fullName} avatar`}
                src={user.avatarUrl ?? '/assets/hero.png'}
                className="w-full h-full object-cover"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              aria-label="Change avatar"
            >
              <span className="material-symbols-outlined text-[18px]" data-icon="photo_camera">
                photo_camera
              </span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 w-full">
            <div>
              <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Họ và Tên</p>
              <p className="font-body-lg text-body-lg font-semibold">{user.fullName}</p>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Địa chỉ Email</p>
              <p className="font-body-lg text-body-lg font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Số điện thoại</p>
              <p className="font-body-lg text-body-lg font-semibold">{user.phone || '—'}</p>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Loại tài khoản</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[12px] font-bold uppercase tracking-wider">
                {user.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
              </span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Trạng thái tài khoản</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider ${user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {user.isActive !== false ? 'Đang hoạt động' : 'Tạm khóa'}
              </span>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Ngày tham gia</p>
              <p className="font-body-lg text-body-lg font-semibold">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
