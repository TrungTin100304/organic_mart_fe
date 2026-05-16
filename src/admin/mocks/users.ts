import type { AdminUser } from "../types";

export const ADMIN_USERS: AdminUser[] = [
  { id: "u1", name: "Nguyen Van An", email: "an.nguyen@email.com", phone: "0901234567", role: "customer", status: "active", avatar: "", createdAt: "2024-12-15", totalOrders: 12, totalSpent: 2450000, address: "123 Nguyen Hue, Q.1, TP.HCM" },
  { id: "u2", name: "Tran Thi Bich", email: "bich.tran@email.com", phone: "0912345678", role: "customer", status: "active", avatar: "", createdAt: "2025-01-20", totalOrders: 8, totalSpent: 1890000, address: "456 Le Loi, Q.3, TP.HCM" },
  { id: "u3", name: "Le Minh Chau", email: "chau.le@email.com", phone: "0923456789", role: "staff", status: "active", avatar: "", createdAt: "2024-11-05", totalOrders: 0, totalSpent: 0, address: "789 Tran Hung Dao, Q.5, TP.HCM" },
  { id: "u4", name: "Pham Duc Dung", email: "dung.pham@email.com", phone: "0934567890", role: "customer", status: "locked", avatar: "", createdAt: "2025-02-10", totalOrders: 3, totalSpent: 670000, address: "321 CMT8, Q.10, TP.HCM" },
  { id: "u5", name: "Hoang Thu Ha", email: "ha.hoang@email.com", phone: "0945678901", role: "customer", status: "active", avatar: "", createdAt: "2025-03-01", totalOrders: 15, totalSpent: 3200000, address: "654 Dien Bien Phu, Binh Thanh" },
  { id: "u6", name: "Vo Quang Huy", email: "huy.vo@email.com", phone: "0956789012", role: "admin", status: "active", avatar: "", createdAt: "2024-10-01", totalOrders: 0, totalSpent: 0 },
  { id: "u7", name: "Dang Thi Mai", email: "mai.dang@email.com", phone: "0967890123", role: "customer", status: "active", avatar: "", createdAt: "2025-04-12", totalOrders: 6, totalSpent: 1100000, address: "12 Pasteur, Q.1, TP.HCM" },
  { id: "u8", name: "Bui Van Nam", email: "nam.bui@email.com", phone: "0978901234", role: "customer", status: "active", avatar: "", createdAt: "2025-05-01", totalOrders: 2, totalSpent: 380000 },
];
