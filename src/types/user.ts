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

export interface OrderSummary {
  id: string;
  date: string; // ISO string or human-friendly
  status: 'Delivered' | 'Out for Delivery' | 'Processing' | string;
  total: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  status?: string;
  addresses?: Address[];
  recentOrders?: OrderSummary[];
}

