import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { buildDashboardReportCsv } from "../src/admin/utils/dashboardReport.ts";
import type { AdminDashboardData } from "../src/services/adminDashboardService.ts";

const topbar = readFileSync(new URL("../src/admin/components/AdminTopbar.tsx", import.meta.url), "utf8");
const productsPage = readFileSync(new URL("../src/admin/pages/Products.tsx", import.meta.url), "utf8");

test("topbar add-product action opens the create modal on the products page", () => {
  assert.match(topbar, /\/admin\/products\?create=true/);
  assert.match(productsPage, /useSearchParams/);
  assert.match(productsPage, /searchParams\.get\("create"\)/);
  assert.match(productsPage, /setShowForm\(true\)/);
});

test("dashboard report CSV contains the full admin report", () => {
  const data: AdminDashboardData = {
    todayRevenue: 150000,
    todayOrders: 3,
    processingOrders: 1,
    deliveredOrders: 2,
    lowStockProducts: 4,
    newUsers: 5,
    averageOrderValue: 50000,
    orderStatusCounts: { PENDING: 1, DELIVERED: 2 },
    revenue: [{ date: "2026-06-12", revenue: 150000 }],
    topProducts: [{ name: "Rau cải, organic", sold: 8 }],
    categoryRevenue: [{ name: "Rau củ", revenue: 150000 }],
    recentOrders: [{
      id: 1,
      orderCode: "OM001",
      userFullName: "Nguyễn Văn A",
      status: "DELIVERED",
      totalAmount: 150000,
      itemCount: 2,
      createdAt: "2026-06-12T08:00:00Z",
    }],
  };

  const csv = buildDashboardReportCsv(data, 30, new Date("2026-06-12T10:00:00Z"));

  assert.match(csv, /TỔNG QUAN/);
  assert.match(csv, /DOANH THU 30 NGÀY/);
  assert.match(csv, /TRẠNG THÁI ĐƠN HÀNG/);
  assert.match(csv, /SẢN PHẨM BÁN CHẠY/);
  assert.match(csv, /ĐƠN HÀNG GẦN NHẤT/);
  assert.match(csv, /"Rau cải, organic"/);
  assert.match(csv, /OM001/);
});
