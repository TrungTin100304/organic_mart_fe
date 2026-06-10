import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { VietQrPayment } from "../services/paymentService";

interface VietQrPaymentModalProps {
  payment: VietQrPayment | null;
  errorMessage?: string;
  isRefreshing?: boolean;
  isCompletingOrder?: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onCompleteOrder: () => void;
}

const STATUS_CONFIG: Record<
  VietQrPayment["status"],
  {
    label: string;
    icon: React.ElementType;
    bgCls: string;
    textCls: string;
    borderCls: string;
  }
> = {
  PENDING: {
    label: "Chờ thanh toán",
    icon: Clock,
    bgCls: "bg-amber-50",
    textCls: "text-amber-700",
    borderCls: "border-amber-200",
  },
  PAID: {
    label: "Đã thanh toán",
    icon: CheckCircle2,
    bgCls: "bg-emerald-50",
    textCls: "text-emerald-700",
    borderCls: "border-emerald-200",
  },
  EXPIRED: {
    label: "Đã hết hạn",
    icon: AlertTriangle,
    bgCls: "bg-red-50",
    textCls: "text-red-700",
    borderCls: "border-red-200",
  },
  CANCELLED: {
    label: "Đã hủy",
    icon: XCircle,
    bgCls: "bg-red-50",
    textCls: "text-red-700",
    borderCls: "border-red-200",
  },
};

const copyText = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // Clipboard unavailable in restricted contexts
  }
};

export default function VietQrPaymentModal({
  payment,
  errorMessage = "",
  isRefreshing = false,
  isCompletingOrder = false,
  onClose,
  onRefresh,
  onCompleteOrder,
}: VietQrPaymentModalProps) {
  if (!payment) return null;

  const status = STATUS_CONFIG[payment.status];
  const StatusIcon = status.icon;
  const isTerminal = payment.status !== "PENDING";
  const isPaid = payment.status === "PAID";

  const expiresAt = payment.expiresAt ? new Date(payment.expiresAt) : null;
  const isExpired = payment.status === "EXPIRED";
  const bankName = payment.bankId === "TPB" ? "TPBank (TPB)" : payment.bankId || "Chưa xác định";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={isCompletingOrder || isTerminal ? undefined : onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vietqr-title"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        className="fixed inset-4 z-50 m-auto h-fit max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-outline-variant bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-outline-variant/40 bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-bold uppercase text-primary">VietQR</p>
            <h2 id="vietqr-title" className="text-lg font-bold text-on-surface">Thanh toán chuyển khoản</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isCompletingOrder}
            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container disabled:opacity-40 transition-colors"
            title="Đóng"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-4 sm:p-6">
          {/* QR code */}
          {payment.qrUrl && (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex aspect-square w-[280px] max-w-full items-center justify-center rounded-2xl border border-outline-variant/60 bg-white p-3 shadow-lg shadow-primary/10 sm:w-[320px]">
                <img
                  src={payment.qrUrl}
                  alt={`VietQR ${payment.transferCode}`}
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="max-w-md text-xs font-medium leading-relaxed text-on-surface-variant">
                Mở ứng dụng ngân hàng, quét mã QR và giữ nguyên số tiền cùng nội dung chuyển khoản.
              </p>
            </div>
          )}

          {/* Details */}
          <div className="mx-auto max-w-xl space-y-4">
            {/* Status badge */}
            <div className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold border ${status.bgCls} ${status.textCls} ${status.borderCls}`}>
              <StatusIcon className="size-4 shrink-0" />
              {status.label}
            </div>

            <div className="space-y-4 rounded-2xl border border-outline-variant/50 bg-surface-container-low/60 p-4 sm:p-5">
              {/* Amount */}
              <PaymentValue
                label="Số tiền"
                value={`${payment.amount.toLocaleString("vi-VN")}đ`}
                onCopy={() => copyText(String(payment.amount))}
              />

              {/* Transfer code */}
              <PaymentValue
                label="Nội dung chuyển khoản"
                value={payment.transferCode}
                onCopy={() => copyText(payment.transferCode)}
                highlight
              />

              {/* Account number */}
              <PaymentValue
                label="Số tài khoản"
                value={payment.accountNo}
                onCopy={() => copyText(payment.accountNo)}
              />

              {/* Bank + account name */}
              <div className="grid gap-3 border-t border-outline-variant/40 pt-4 sm:grid-cols-2">
                <PaymentDetail label="Ngân hàng" value={bankName} />
                <PaymentDetail label="Tên tài khoản" value={payment.accountName} />
              </div>
            </div>

            {/* Expiry */}
            {expiresAt && !isExpired && (
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <Clock className="size-3.5" />
                <span>
                  Mã thanh toán hết hạn lúc{" "}
                  {expiresAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                  {" — "}
                  {expiresAt.toLocaleDateString("vi-VN")}
                </span>
              </div>
            )}

            {/* Order info shown when payment leads to an order */}
            {payment.orderId && payment.orderCode && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800">
                <p className="font-bold">Mã đơn hàng: {payment.orderCode}</p>
              </div>
            )}

            {/* Error message */}
            {errorMessage && (
              <div role="alert" className="rounded-xl bg-red-50 p-3 text-xs font-semibold leading-relaxed text-red-700 flex items-start gap-2">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                {errorMessage}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-outline-variant/40 bg-surface-container-low/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
            <ShieldCheck className="size-4 text-primary" />
            Không đổi số tiền hoặc nội dung
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {/* PENDING actions */}
            {payment.status === "PENDING" && (
              <>
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary/30 px-3 py-2 text-sm font-bold text-primary hover:bg-primary/5 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  Kiểm tra
                </button>
                              </>
            )}

            {/* PAID action */}
            {isPaid && (
              <button
                type="button"
                onClick={onCompleteOrder}
                disabled={isCompletingOrder}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white hover:brightness-105 disabled:opacity-50 transition-colors"
              >
                {isCompletingOrder ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    Hoàn tất đặt hàng
                  </>
                )}
              </button>
            )}

            {/* Terminal states: show close button */}
            {isTerminal && !isPaid && (
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-outline-variant px-5 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function PaymentValue({
  label,
  value,
  onCopy,
  highlight = false,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-on-surface-variant">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <p
          className={`min-w-0 flex-1 break-all text-sm font-bold ${
            highlight ? "text-primary" : "text-on-surface"
          }`}
        >
          {value}
        </p>
        <button
          type="button"
          onClick={onCopy}
          aria-label={`Sao chép ${label.toLowerCase()}`}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-outline-variant/60 bg-white px-2.5 py-1.5 text-xs font-bold text-on-surface-variant transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          title={`Sao chép ${label.toLowerCase()}`}
        >
          <Copy className="size-4" />
          <span className="hidden sm:inline">Sao chép</span>
        </button>
      </div>
    </div>
  );
}

function PaymentDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-on-surface-variant">{label}</p>
      <p className="break-words text-sm font-bold text-on-surface">{value}</p>
    </div>
  );
}
