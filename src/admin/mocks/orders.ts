import type { AdminOrder, OrderItem } from "../types";

const mkItem = (name: string, qty: number, price: number): OrderItem => ({
  name,
  qty,
  price,
  image: "",
});

export const ADMIN_ORDERS: AdminOrder[] = [
  { id: "o1", code: "ORD-2025-001", customerName: "Nguyễn Văn An", customerEmail: "an.nguyen@email.com", items: [mkItem("Khoai mỡ Organic 300gr", 2, 27000), mkItem("Cải kale Organic 300gr", 1, 36000)], total: 120000, paymentMethod: "COD", paymentStatus: "pending", orderStatus: "pending", shippingAddress: "123 Nguyễn Huệ, Q.1, TP.HCM", createdAt: "2025-05-16T09:30:00", shippingFee: 30000, discount: 0 },
  { id: "o2", code: "ORD-2025-002", customerName: "Hoàng Thu Hà", customerEmail: "ha.hoang@email.com", items: [mkItem("Ớt chuông đỏ Organic", 3, 42000), mkItem("Chanh Organic", 2, 29000)], total: 214000, paymentMethod: "Momo", paymentStatus: "paid", orderStatus: "processing", shippingAddress: "654 Điện Biên Phủ, Bình Thạnh", createdAt: "2025-05-16T08:15:00", shippingFee: 25000, discount: 15000, note: "Giao buổi chiều giúp em" },
  { id: "o3", code: "ORD-2025-003", customerName: "Trần Thị Bích", customerEmail: "bich.tran@email.com", items: [mkItem("Granola hữu cơ 500gr", 1, 155000)], total: 180000, paymentMethod: "Banking", paymentStatus: "paid", orderStatus: "shipped", shippingAddress: "456 Lê Lợi, Q.3, TP.HCM", createdAt: "2025-05-15T14:20:00", shippingFee: 25000, discount: 0 },
  { id: "o4", code: "ORD-2025-004", customerName: "Đặng Thị Mai", customerEmail: "mai.dang@email.com", items: [mkItem("Táo Fuji 1kg", 2, 75000), mkItem("Sữa hạnh nhân 1L", 1, 120000)], total: 295000, paymentMethod: "Momo", paymentStatus: "paid", orderStatus: "delivered", shippingAddress: "12 Pasteur, Q.1, TP.HCM", createdAt: "2025-05-14T10:00:00", shippingFee: 25000, discount: 0 },
  { id: "o5", code: "ORD-2025-005", customerName: "Phạm Đức Dũng", customerEmail: "dung.pham@email.com", items: [mkItem("Mật ong rừng 500ml", 1, 280000)], total: 305000, paymentMethod: "COD", paymentStatus: "refunded", orderStatus: "cancelled", shippingAddress: "321 CMT8, Q.10, TP.HCM", createdAt: "2025-05-13T16:45:00", shippingFee: 25000, discount: 0, note: "Hủy do đổi ý" },
  { id: "o6", code: "ORD-2025-006", customerName: "Bùi Văn Nam", customerEmail: "nam.bui@email.com", items: [mkItem("Trứng gà thả vườn", 3, 65000), mkItem("Nấm hương tươi", 1, 45000)], total: 265000, paymentMethod: "Banking", paymentStatus: "paid", orderStatus: "processing", shippingAddress: "88 Hai Bà Trưng, Q.1, TP.HCM", createdAt: "2025-05-16T07:00:00", shippingFee: 25000, discount: 0 },
];
