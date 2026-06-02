import type { Promotion, Review } from "../types";

export const PROMOTIONS: Promotion[] = [
  { id: "pm1", code: "ORGANIC20", type: "percent", value: 20, minOrder: 200000, usageCount: 45, maxUsage: 100, status: "active", startDate: "2025-05-01", endDate: "2025-05-31" },
  { id: "pm2", code: "FREESHIP", type: "fixed", value: 30000, minOrder: 150000, usageCount: 120, maxUsage: 200, status: "active", startDate: "2025-05-01", endDate: "2025-06-30" },
  { id: "pm3", code: "WELCOME10", type: "percent", value: 10, minOrder: 0, usageCount: 89, maxUsage: 500, status: "active", startDate: "2025-01-01", endDate: "2025-12-31" },
  { id: "pm4", code: "TET2025", type: "percent", value: 25, minOrder: 300000, usageCount: 200, maxUsage: 200, status: "expired", startDate: "2025-01-20", endDate: "2025-02-10" },
];

export const REVIEWS: Review[] = [
  { id: "r1", productName: "Khoai mỡ Organic 300gr", customerName: "Nguyễn Văn An", rating: 5, comment: "Khoai rất ngon, bùi và ngọt tự nhiên!", createdAt: "2025-05-15", status: "approved" },
  { id: "r2", productName: "Cải kale Organic 300gr", customerName: "Hoàng Thu Hà", rating: 4, comment: "Cải tươi, giòn, đóng gói cẩn thận.", createdAt: "2025-05-14", status: "approved" },
  { id: "r3", productName: "Granola hữu cơ 500gr", customerName: "Trần Thị Bích", rating: 5, comment: "Granola rất ngon, ăn với sữa chua tuyệt vời!", createdAt: "2025-05-16", status: "pending" },
  { id: "r4", productName: "Mật ong rừng 500ml", customerName: "Phạm Đức Dũng", rating: 2, comment: "Mật ong hơi loãng, không đúng như mô tả.", createdAt: "2025-05-13", status: "pending" },
  { id: "r5", productName: "Táo Fuji 1kg", customerName: "Đặng Thị Mai", rating: 4, comment: "Táo ngọt, giòn, giao hàng nhanh.", createdAt: "2025-05-12", status: "approved" },
];
