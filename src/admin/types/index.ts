export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "customer" | "staff";
  status: "active" | "locked";
  avatar: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  address?: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  salePrice?: number;
  stock: number;
  status: "active" | "draft" | "out_of_stock";
  organic: boolean;
  image: string;
  updatedAt: string;
  featured?: boolean;
  isNew?: boolean;
}

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  image: string;
}

export interface AdminOrder {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "refunded";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: string;
  createdAt: string;
  note?: string;
  shippingFee: number;
  discount: number;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  image: string;
}

export interface Promotion {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  usageCount: number;
  maxUsage: number;
  status: "active" | "expired" | "scheduled";
  startDate: string;
  endDate: string;
}

export interface Review {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: "approved" | "pending" | "rejected";
}

export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  lowStockProducts: number;
  newUsers: number;
  conversionRate: number;
  avgOrderValue: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface CategoryRevenuePoint {
  name: string;
  value: number;
}
