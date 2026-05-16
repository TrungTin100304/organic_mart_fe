import React from 'react';
import type { User } from '@/types/user';

interface ProfileCardProps {
  user: User;
  onEdit?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user, onEdit }) => {
  return (
    <div className="md:col-span-9 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-6 md:p-10 space-y-6">
      <section>
        <div className="flex justify-between items-start mb-8">
          <h3 className="font-headline-md text-headline-md text-primary">Personal Information</h3>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-6 py-2 border-2 border-primary text-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all duration-300"
            aria-label="Edit profile"
          >
            <span className="material-symbols-outlined text-[20px]" data-icon="edit">
              edit
            </span>
            Edit
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container">
              <img
                alt={`${user.fullName} avatar`}
                src={user.avatarUrl ?? '/assets/hero.png'}
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-md hover:scale-110 transition-transform" aria-label="Change avatar">
              <span className="material-symbols-outlined text-[18px]" data-icon="photo_camera">photo_camera</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 w-full">
            <div>
              <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Full Name</p>
              <p className="font-body-lg text-body-lg font-semibold">{user.fullName}</p>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Email Address</p>
              <p className="font-body-lg text-body-lg font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Phone Number</p>
              <p className="font-body-lg text-body-lg font-semibold">{user.phone ?? '—'}</p>
            </div>
            <div>
              <p className="text-on-surface-variant font-label-lg text-label-lg mb-1">Customer Status</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[12px] font-bold uppercase tracking-wider">
                {user.status ?? 'Member'}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
