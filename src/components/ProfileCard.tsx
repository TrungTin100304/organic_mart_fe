import React, { useRef, useState, useEffect } from 'react';
import type { User } from '@/types/user';

interface ProfileCardProps {
  user: User;
  onSave?: (formData: FormData) => Promise<void>;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user, onSave }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [fullName, setFullName] = useState(user.fullName);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber ?? user.phone ?? '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    setFullName(user.fullName);
    setPhoneNumber(user.phoneNumber ?? user.phone ?? '');
  }, [user]);

  const handleButtonClick = () => {
    if (!isEditing) return;
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setAvatarFile(file);
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('phoneNumber', phoneNumber);
      if (avatarFile) formData.append('avatar', avatarFile);

      await onSave(formData);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFullName(user.fullName);
    setPhoneNumber(user.phoneNumber ?? user.phone ?? '');
    setPreviewUrl(null);
    setAvatarFile(null);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="md:col-span-9 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-6 md:p-10 space-y-6">
      <section>
        <div className="flex justify-between items-start mb-8">
          <h3 className="font-headline-md text-headline-md text-primary">Thông tin cá nhân</h3>
          <div className="flex gap-3">
            {isEditing && (
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 border-2 border-outline-variant text-on-surface-variant font-bold rounded-full hover:bg-surface-container-high transition-all"
              >
                Hủy
              </button>
            )}
            <button
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-50"
              aria-label={isEditing ? "Lưu thay đổi" : "Chỉnh sửa hồ sơ"}
            >
              <span className="material-symbols-outlined text-[20px]" data-icon={isEditing ? "save" : "edit"}>
                {isEditing ? "save" : "edit"}
              </span>
              {isSaving ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Chỉnh sửa"}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container">
              <img
                alt={`${user.fullName} avatar`}
                src={previewUrl ?? user.avatarUrl ?? '/assets/hero.png'}
                className="w-full h-full object-cover"
              />
            </div>
            {isEditing && (
              <button
                onClick={handleButtonClick}
                className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer"
                aria-label="Thay đổi ảnh đại diện"
              >
                <span className="material-symbols-outlined text-[18px]" data-icon="photo_camera">
                  photo_camera
                </span>
              </button>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 w-full">
            <div>
              <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Họ và tên</p>
              {isEditing ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-primary rounded-md focus:outline-none focus:ring-1 focus:ring-primary font-body-lg text-body-lg bg-surface-container-lowest"
                  placeholder="Nhập họ và tên..."
                />
              ) : (
                <p className="font-body-lg text-body-lg font-semibold">{user.fullName}</p>
              )}
            </div>
            <div>
              <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Địa chỉ email</p>
              <p className="font-body-lg text-body-lg font-semibold opacity-70 cursor-not-allowed" title="Email không thể thay đổi">{user.email}</p>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Số điện thoại</p>
              {isEditing ? (
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-1.5 border border-primary rounded-md focus:outline-none focus:ring-1 focus:ring-primary font-body-lg text-body-lg bg-surface-container-lowest"
                  placeholder="Nhập số điện thoại..."
                />
              ) : (
                <p className="font-body-lg text-body-lg font-semibold">{user.phoneNumber ?? user.phone ?? 'Chưa cập nhật'}</p>
              )}
            </div>
            <div>
              <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Trạng thái khách hàng</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[12px] font-bold uppercase tracking-wider">
                {user.status ?? 'Thành viên'}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
