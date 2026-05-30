// Types for user domain
export type Role = 'ROLE_USER' | 'ROLE_ADMIN';
export interface Address {
  id?: number;
  label: 'HOME' | 'WORK' | 'OTHER';
  customLabel?: string;
  recipientName: string;
  recipientPhone: string;
  fullAddress: string;
  ward?: string;
  district?: string;
  city?: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface Allergen {
  id: number;
  name: string;
  createdAt?: string;
}

export interface OrderSummary {
  id: string;
  date: string; // ISO string or human-friendly
  status: 'Delivered' | 'Out for Delivery' | 'Processing' | string;
  total: number;
}

export interface User {
  id: string | number;
  fullName: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  status?: string;
  role?: Role | string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  addresses?: Address[];
  recentOrders?: OrderSummary[];
  allergens?: Allergen[];
}
