// Types for user domain
export type Role = 'ROLE_USER' | 'ROLE_ADMIN';

export type DietType = 'NORMAL' | 'VEGETARIAN' | 'VEGAN' | 'KETO' | 'PALEO' | 'GLUTEN_FREE';

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
  // Internal delivery fields
  buildingId?: number;
  buildingCode?: string;
  buildingName?: string;
  floor?: string;
  apartmentNumber?: string;
  deliveryNote?: string;
}

export interface Allergen {
  id: number;
  name: string;
  createdAt?: string;
}

export interface OrderItemSummary {
  name: string;
  imageUrl?: string;
  quantity?: number;
}

export interface OrderSummary {
  id: number;
  orderCode: string;
  date: string;
  status: 'PENDING' | 'PROCESSING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'Delivered' | 'Out for Delivery' | 'Processing' | 'Pending' | 'Cancelled' | string;
  total: number;
  itemCount?: number;
  items?: OrderItemSummary[];
}

export interface UserPreference {
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  healthGoal?: string;
  dietType?: DietType;
  dailyCalorieTarget?: number;
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
  allergens?: Allergen[];
  // Inline preference fields (populated from /users/me)
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  healthGoal?: string;
  dietType?: DietType;
  dailyCalorieTarget?: number;
}
