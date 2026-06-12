import type { AdminDashboardData } from "../../services/adminDashboardService";

const csvCell = (value: unknown) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const row = (...values: unknown[]) => values.map(csvCell).join(",");

export const buildDashboardReportCsv = (
  data: AdminDashboardData,
  days: number,
  generatedAt = new Date(),
) => {
  const rows: string[] = [
    row("BÁO CÁO QUẢN TRỊ ORGANIC MART"),
    row("Thời điểm xuất", generatedAt.toLocaleString("vi-VN")),
    "",
    row("TỔNG QUAN"),
    row("Chỉ số", "Giá trị"),
    row("Doanh thu hôm nay", data.todayRevenue),
    row("Đơn hàng hôm nay", data.todayOrders),
    row("Đơn đang xử lý", data.processingOrders),
    row("Đơn đã giao", data.deliveredOrders),
    row("Sản phẩm sắp hết hàng", data.lowStockProducts),
    row("Người dùng mới 7 ngày", data.newUsers),
    row("Giá trị đơn trung bình", data.averageOrderValue),
    "",
    row(`DOANH THU ${days} NGÀY`),
    row("Ngày", "Doanh thu"),
    ...data.revenue.map((item) => row(item.date, item.revenue)),
    "",
    row("TRẠNG THÁI ĐƠN HÀNG"),
    row("Trạng thái", "Số lượng"),
    ...Object.entries(data.orderStatusCounts).map(([status, count]) => row(status, count)),
    "",
    row("SẢN PHẨM BÁN CHẠY"),
    row("Sản phẩm", "Số lượng bán"),
    ...data.topProducts.map((item) => row(item.name, item.sold)),
    "",
    row("DOANH THU THEO DANH MỤC"),
    row("Danh mục", "Doanh thu"),
    ...data.categoryRevenue.map((item) => row(item.name, item.revenue)),
    "",
    row("ĐƠN HÀNG GẦN NHẤT"),
    row("Mã đơn", "Khách hàng", "Sản phẩm", "Tổng tiền", "Trạng thái", "Thời gian"),
    ...data.recentOrders.map((order) => row(
      order.orderCode,
      order.userFullName || `User #${order.userId ?? ""}`,
      order.itemCount,
      order.totalAmount,
      order.status,
      order.createdAt,
    )),
  ];

  return rows.join("\r\n");
};

export const downloadDashboardReport = (
  data: AdminDashboardData,
  days = 30,
  generatedAt = new Date(),
) => {
  const csv = buildDashboardReportCsv(data, days, generatedAt);
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `organic-mart-report-${generatedAt.toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
