import type { AdminOrder, OrderItem } from "../types";

const mkItem = (name: string, qty: number, price: number): OrderItem => ({
  name,
  qty,
  price,
  image: "",
});

export const ADMIN_ORDERS: AdminOrder[] = [
  { id: "o1", code: "ORD-2025-001", customerName: "Nguyen Van An", customerEmail: "an.nguyen@email.com", items: [mkItem("Khoai mo Organic 300gr", 2, 27000), mkItem("Cai kale Organic 300gr", 1, 36000)], total: 120000, paymentMethod: "COD", paymentStatus: "pending", orderStatus: "pending", shippingAddress: "123 Nguyen Hue, Q.1, TP.HCM", createdAt: "2025-05-16T09:30:00", shippingFee: 30000, discount: 0 },
  { id: "o2", code: "ORD-2025-002", customerName: "Hoang Thu Ha", customerEmail: "ha.hoang@email.com", items: [mkItem("Ot chuong do Organic", 3, 42000), mkItem("Chanh Organic", 2, 29000)], total: 214000, paymentMethod: "Momo", paymentStatus: "paid", orderStatus: "processing", shippingAddress: "654 Dien Bien Phu, Binh Thanh", createdAt: "2025-05-16T08:15:00", shippingFee: 25000, discount: 15000, note: "Giao buoi chieu giup em" },
  { id: "o3", code: "ORD-2025-003", customerName: "Tran Thi Bich", customerEmail: "bich.tran@email.com", items: [mkItem("Granola huu co 500gr", 1, 155000)], total: 180000, paymentMethod: "Banking", paymentStatus: "paid", orderStatus: "shipped", shippingAddress: "456 Le Loi, Q.3, TP.HCM", createdAt: "2025-05-15T14:20:00", shippingFee: 25000, discount: 0 },
  { id: "o4", code: "ORD-2025-004", customerName: "Dang Thi Mai", customerEmail: "mai.dang@email.com", items: [mkItem("Tao Fuji 1kg", 2, 75000), mkItem("Sua hanh nhan 1L", 1, 120000)], total: 295000, paymentMethod: "Momo", paymentStatus: "paid", orderStatus: "delivered", shippingAddress: "12 Pasteur, Q.1, TP.HCM", createdAt: "2025-05-14T10:00:00", shippingFee: 25000, discount: 0 },
  { id: "o5", code: "ORD-2025-005", customerName: "Pham Duc Dung", customerEmail: "dung.pham@email.com", items: [mkItem("Mat ong rung 500ml", 1, 280000)], total: 305000, paymentMethod: "COD", paymentStatus: "refunded", orderStatus: "cancelled", shippingAddress: "321 CMT8, Q.10, TP.HCM", createdAt: "2025-05-13T16:45:00", shippingFee: 25000, discount: 0, note: "Huy do doi y" },
  { id: "o6", code: "ORD-2025-006", customerName: "Bui Van Nam", customerEmail: "nam.bui@email.com", items: [mkItem("Trung ga tha vuon", 3, 65000), mkItem("Nam huong tuoi", 1, 45000)], total: 265000, paymentMethod: "Banking", paymentStatus: "paid", orderStatus: "processing", shippingAddress: "88 Hai Ba Trung, Q.1, TP.HCM", createdAt: "2025-05-16T07:00:00", shippingFee: 25000, discount: 0 },
];
