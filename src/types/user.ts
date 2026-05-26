// Types for user domain
export interface Address {
  id?: string;
  label?: string;
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isPrimary?: boolean;
}

export interface Order {
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
  avatarUrl?: string | null;
  status?: string;
  isActive?: boolean;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  addresses?: Address[];
  recentOrders?: Order[];
}
