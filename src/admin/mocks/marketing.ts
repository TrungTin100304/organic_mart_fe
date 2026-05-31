import type { Promotion, Review } from "../types";

export const PROMOTIONS: Promotion[] = [
  { id: "pm1", code: "ORGANIC20", type: "percent", value: 20, minOrder: 200000, usageCount: 45, maxUsage: 100, status: "active", startDate: "2025-05-01", endDate: "2025-05-31" },
  { id: "pm2", code: "FREESHIP", type: "fixed", value: 30000, minOrder: 150000, usageCount: 120, maxUsage: 200, status: "active", startDate: "2025-05-01", endDate: "2025-06-30" },
  { id: "pm3", code: "WELCOME10", type: "percent", value: 10, minOrder: 0, usageCount: 89, maxUsage: 500, status: "active", startDate: "2025-01-01", endDate: "2025-12-31" },
  { id: "pm4", code: "TET2025", type: "percent", value: 25, minOrder: 300000, usageCount: 200, maxUsage: 200, status: "expired", startDate: "2025-01-20", endDate: "2025-02-10" },
];

export const REVIEWS: Review[] = [
  { id: "r1", productName: "Khoai mo Organic 300gr", customerName: "Nguyen Van An", rating: 5, comment: "Khoai rat ngon, bui va ngot tu nhien!", createdAt: "2025-05-15", status: "approved" },
  { id: "r2", productName: "Cai kale Organic 300gr", customerName: "Hoang Thu Ha", rating: 4, comment: "Cai tuoi, gion, dong goi can than.", createdAt: "2025-05-14", status: "approved" },
  { id: "r3", productName: "Granola huu co 500gr", customerName: "Tran Thi Bich", rating: 5, comment: "Granola rat ngon, an voi sua chua tuyet voi!", createdAt: "2025-05-16", status: "pending" },
  { id: "r4", productName: "Mat ong rung 500ml", customerName: "Pham Duc Dung", rating: 2, comment: "Mat ong hoi loang, khong dung nhu mo ta.", createdAt: "2025-05-13", status: "pending" },
  { id: "r5", productName: "Tao Fuji 1kg", customerName: "Dang Thi Mai", rating: 4, comment: "Tao ngot, gion, giao hang nhanh.", createdAt: "2025-05-12", status: "approved" },
];
