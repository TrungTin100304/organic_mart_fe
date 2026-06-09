import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";
import {
  getPaymentAudit,
  getWebhookAudit,
  type PaymentAuditItem,
  type PaymentAuditStatus,
  type WebhookAuditItem,
  type WebhookAuditStatus,
} from "../../services/adminPaymentAuditService";

const money = (value: number) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;
const dateTime = (value?: string) => value ? new Date(value).toLocaleString("vi-VN") : "—";

export default function PaymentAudit() {
  const [tab, setTab] = useState<"payments" | "webhooks">("payments");
  const [payments, setPayments] = useState<PaymentAuditItem[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookAuditItem[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async (targetPage = page) => {
    setLoading(true);
    setError("");
    try {
      const result = tab === "payments"
        ? await getPaymentAudit({ status: status as PaymentAuditStatus | "", search: search.trim() || undefined, page: targetPage, size: 20 })
        : await getWebhookAudit({ status: status as WebhookAuditStatus | "", search: search.trim() || undefined, page: targetPage, size: 20 });
      if (tab === "payments") setPayments(result.content as PaymentAuditItem[]);
      else setWebhooks(result.content as WebhookAuditItem[]);
      setPage(result.number);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu đối soát.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setStatus("");
    setPage(0);
    void load(0);
  }, [tab]);

  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <div>
        <h1 className="text-xl font-bold text-on-surface lg:text-2xl">Đối soát VietQR / SePay</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Màn hình chỉ đọc, không hiển thị secret hoặc raw webhook payload.</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab("payments")} className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === "payments" ? "bg-primary text-white" : "bg-surface-container-high"}`}>Yêu cầu thanh toán</button>
        <button onClick={() => setTab("webhooks")} className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === "webhooks" ? "bg-primary text-white" : "bg-surface-container-high"}`}>Webhook SePay</button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center rounded-xl border border-outline-variant/30 bg-white px-3 py-2">
          <Search className="h-4 w-4 text-on-surface-variant" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void load(0)} className="ml-2 w-full border-none bg-transparent text-sm outline-none" placeholder="Mã chuyển khoản, mã giao dịch hoặc mã đơn" />
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-outline-variant/30 bg-white px-3 py-2 text-sm">
          <option value="">Tất cả trạng thái</option>
          {(tab === "payments" ? ["PENDING", "PAID", "EXPIRED", "CANCELLED"] : ["RECEIVED", "PROCESSED", "REJECTED"]).map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <button onClick={() => void load(0)} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Tải dữ liệu</button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

      <div className="overflow-x-auto rounded-2xl border border-outline-variant/20 bg-white">
        {tab === "payments" ? (
          <table className="w-full min-w-[950px] text-sm">
            <thead className="bg-surface-container-low text-left text-xs"><tr><th className="p-3">Mã chuyển khoản</th><th className="p-3">Khách hàng</th><th className="p-3">Số tiền</th><th className="p-3">Trạng thái</th><th className="p-3">Đơn hàng</th><th className="p-3">Giao nội khu</th><th className="p-3">Tạo / Hết hạn</th></tr></thead>
            <tbody>{payments.length ? payments.map((item) => <tr key={item.id} className="border-t border-outline-variant/10"><td className="p-3 font-bold text-primary">{item.transferCode}<div className="text-xs font-normal text-on-surface-variant">{item.transactionId || "Chưa có giao dịch"}</div></td><td className="p-3">{item.userName || `User #${item.userId}`}</td><td className="p-3 font-bold">{money(item.amount)}</td><td className="p-3">{item.status}</td><td className="p-3">{item.orderCode || "Chưa tạo đơn"}</td><td className="p-3">{item.buildingCode ? `${item.buildingCode} · căn ${item.apartmentNumber || "?"}` : "—"}</td><td className="p-3 text-xs">{dateTime(item.createdAt)}<br />{dateTime(item.expiresAt)}</td></tr>) : <tr><td colSpan={7} className="p-12 text-center text-on-surface-variant">{loading ? "Đang tải..." : "Không có yêu cầu thanh toán."}</td></tr>}</tbody>
          </table>
        ) : (
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-surface-container-low text-left text-xs"><tr><th className="p-3">SePay Transaction</th><th className="p-3">Mã chuyển khoản</th><th className="p-3">Số tiền</th><th className="p-3">Gateway</th><th className="p-3">Trạng thái</th><th className="p-3">Lý do từ chối</th><th className="p-3">Thời gian</th></tr></thead>
            <tbody>{webhooks.length ? webhooks.map((item) => <tr key={item.id} className="border-t border-outline-variant/10"><td className="p-3 font-bold">{item.sepayTransactionId}</td><td className="p-3 text-primary">{item.transferCode || item.referenceCode || "—"}</td><td className="p-3 font-bold">{money(item.transferAmount)}</td><td className="p-3">{item.gateway || "—"}</td><td className="p-3">{item.status}</td><td className="p-3 text-red-700">{item.rejectionReason || "—"}</td><td className="p-3 text-xs">{dateTime(item.createdAt)}</td></tr>) : <tr><td colSpan={7} className="p-12 text-center text-on-surface-variant">{loading ? "Đang tải..." : "Không có webhook."}</td></tr>}</tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-on-surface-variant"><span>{totalElements} bản ghi</span><div className="flex items-center gap-2"><button disabled={page === 0 || loading} onClick={() => void load(page - 1)} className="rounded-lg border p-2 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><span>{totalPages ? page + 1 : 0} / {totalPages}</span><button disabled={page + 1 >= totalPages || loading} onClick={() => void load(page + 1)} className="rounded-lg border p-2 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button></div></div>
    </div>
  );
}
