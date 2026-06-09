import type { ReactElement } from "react";
import type { LucideIcon } from "lucide-react";
import {
  FolderTree,
  AlertTriangle,
  LayoutDashboard,
  Leaf,
  Package,
  Settings,
  ShoppingCart,
  Star,
  Ticket,
  Users,
  Warehouse,
  Building2,
  Clock,
  Truck,
  Landmark,
} from "lucide-react";
import Categories from "../pages/Categories";
import Allergens from "../pages/Allergens";
import Dashboard from "../pages/Dashboard";
import Farms from "../pages/Farms";
import Inventory from "../pages/Inventory";
import Orders from "../pages/Orders";
import Products from "../pages/Products";
import Promotions from "../pages/Promotions";
import Reviews from "../pages/Reviews";
import SettingsPage from "../pages/Settings";
import UsersPage from "../pages/Users";
import Buildings from "../pages/Buildings";
import DeliverySlots from "../pages/DeliverySlots";
import DeliveryOrders from "../pages/DeliveryOrders";
import PaymentAudit from "../pages/PaymentAudit";

export interface AdminRouteConfig {
  key: string;
  path?: string;
  index?: boolean;
  to: string;
  label: string;
  group: "overview" | "management" | "marketing" | "system";
  icon: LucideIcon;
  element: ReactElement;
  badge?: number;
}

export const ADMIN_ROUTE_SECTIONS = [
  { key: "overview", label: "Tổng quan" },
  { key: "management", label: "Quản lý" },
  { key: "marketing", label: "Marketing" },
  { key: "system", label: "Hệ thống" },
] as const;

export const ADMIN_ROUTES: AdminRouteConfig[] = [
  { key: "dashboard", index: true, to: "/admin", label: "Dashboard", group: "overview", icon: LayoutDashboard, element: <Dashboard /> },
  { key: "orders", path: "orders", to: "/admin/orders", label: "Đơn hàng", group: "management", icon: ShoppingCart, element: <Orders /> },
  { key: "delivery-orders", path: "delivery-orders", to: "/admin/delivery-orders", label: "Giao nội khu", group: "management", icon: Truck, element: <DeliveryOrders /> },
  { key: "payment-audit", path: "payment-audit", to: "/admin/payment-audit", label: "Đối soát thanh toán", group: "management", icon: Landmark, element: <PaymentAudit /> },
  { key: "buildings", path: "buildings", to: "/admin/buildings", label: "Tòa nhà", group: "management", icon: Building2, element: <Buildings /> },
  { key: "delivery-slots", path: "delivery-slots", to: "/admin/delivery-slots", label: "Khung giờ", group: "management", icon: Clock, element: <DeliverySlots /> },
  { key: "products", path: "products", to: "/admin/products", label: "Sản phẩm", group: "management", icon: Package, element: <Products /> },
  { key: "users", path: "users", to: "/admin/users", label: "Người dùng", group: "management", icon: Users, element: <UsersPage /> },
  { key: "categories", path: "categories", to: "/admin/categories", label: "Danh mục", group: "management", icon: FolderTree, element: <Categories /> },
  { key: "farms", path: "farms", to: "/admin/farms", label: "Nông trại", group: "management", icon: Leaf, element: <Farms /> },
  { key: "inventory", path: "inventory", to: "/admin/inventory", label: "Tồn kho", group: "management", icon: Warehouse, element: <Inventory /> },
  { key: "allergens", path: "allergens", to: "/admin/allergens", label: "Dị ứng", group: "management", icon: AlertTriangle, element: <Allergens /> },
  { key: "promotions", path: "promotions", to: "/admin/promotions", label: "Khuyến mãi", group: "marketing", icon: Ticket, element: <Promotions /> },
  { key: "reviews", path: "reviews", to: "/admin/reviews", label: "Đánh giá", group: "marketing", icon: Star, element: <Reviews /> },
  { key: "settings", path: "settings", to: "/admin/settings", label: "Cài đặt", group: "system", icon: Settings, element: <SettingsPage /> },
];
