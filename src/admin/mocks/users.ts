import type { AdminUser } from "../types";

const nonAdminMockUsers: AdminUser[] = [
  { id: "u1", name: "Nguyễn Văn An", email: "an.nguyen@email.com", phone: "0901234567", role: "customer", status: "active", avatar: "", createdAt: "2024-12-15", totalOrders: 12, totalSpent: 2450000, address: "123 Nguyễn Huệ, Q.1, TP.HCM" },
  { id: "u2", name: "Trần Thị Bích", email: "bich.tran@email.com", phone: "0912345678", role: "customer", status: "active", avatar: "", createdAt: "2025-01-20", totalOrders: 8, totalSpent: 1890000, address: "456 Lê Lợi, Q.3, TP.HCM" },
  { id: "u3", name: "Phạm Đức Dũng", email: "dung.pham@email.com", phone: "0934567890", role: "customer", status: "locked", avatar: "", createdAt: "2025-02-10", totalOrders: 3, totalSpent: 670000, address: "321 CMT8, Q.10, TP.HCM" },
  { id: "u4", name: "Hoàng Thu Hà", email: "ha.hoang@email.com", phone: "0945678901", role: "customer", status: "active", avatar: "", createdAt: "2025-03-01", totalOrders: 15, totalSpent: 3200000, address: "654 Điện Biên Phủ, Bình Thạnh" },
  { id: "u5", name: "Đặng Thị Mai", email: "mai.dang@email.com", phone: "0967890123", role: "customer", status: "active", avatar: "", createdAt: "2025-04-12", totalOrders: 6, totalSpent: 1100000, address: "12 Pasteur, Q.1, TP.HCM" },
  { id: "u6", name: "Bùi Văn Nam", email: "nam.bui@email.com", phone: "0978901234", role: "customer", status: "active", avatar: "", createdAt: "2025-05-01", totalOrders: 2, totalSpent: 380000 },
];

export const ADMIN_USERS: AdminUser[] = nonAdminMockUsers.filter((user) => user.role !== "admin");

