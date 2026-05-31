import { AnimatePresence, motion } from "motion/react";
import { Check, CreditCard, FileText, MapPin, Package, PackageCheck, Printer, Truck, X, XCircle } from "lucide-react";
import type { AdminOrder } from "../types";

const paymentMap: Record<AdminOrder["paymentStatus"], { label: string; cls: string }> = {
  paid: { label: "Da TT", cls: "text-emerald-700 bg-emerald-50" },
  pending: { label: "Cho TT", cls: "text-amber-700 bg-amber-50" },
  refunded: { label: "Hoan tien", cls: "text-red-600 bg-red-50" },
};

const timelineSteps = ["Dat hang", "Xac nhan", "Dong goi", "Giao hang", "Hoan tat"];
const statusToStep: Record<AdminOrder["orderStatus"], number> = {
  pending: 0,
  processing: 1,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
};

interface OrderDetailDrawerProps {
  onClose: () => void;
  order: AdminOrder | null;
}

export default function OrderDetailDrawer({ onClose, order }: OrderDetailDrawerProps) {
  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-surface-container-lowest shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-primary">{order.code}</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">{new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Tien trinh</h4>
                <div className="flex items-center gap-1">
                  {timelineSteps.map((step, index) => {
                    const current = statusToStep[order.orderStatus];
                    const done = current >= 0 && index <= current;
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${done ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant/50"}`}>
                          {done ? <Check className="w-3.5 h-3.5" /> : index + 1}
                        </div>
                        <span className={`text-[10px] text-center ${done ? "text-primary font-semibold" : "text-on-surface-variant/50"}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {order.orderStatus !== "delivered" && order.orderStatus !== "cancelled" && (
                <div className="flex gap-2 mb-6 flex-wrap">
                  {order.orderStatus === "pending" && <button className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:brightness-110"><Check className="w-3.5 h-3.5" />Xac nhan</button>}
                  {order.orderStatus === "processing" && <button className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:brightness-110"><Truck className="w-3.5 h-3.5" />Giao hang</button>}
                  {order.orderStatus === "shipped" && <button className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:brightness-110"><PackageCheck className="w-3.5 h-3.5" />Hoan tat</button>}
                  <button className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50"><XCircle className="w-3.5 h-3.5" />Huy don</button>
                  <button className="flex items-center gap-1.5 px-3 py-2 border border-outline-variant/30 text-on-surface-variant rounded-xl text-xs font-bold hover:bg-surface-container"><Printer className="w-3.5 h-3.5" />In hoa don</button>
                </div>
              )}

              <div className="mb-6">
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">San pham</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{item.name}</p>
                          <p className="text-[11px] text-on-surface-variant">x{item.qty}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-sm">{(item.price * item.qty).toLocaleString()}₫</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-low rounded-xl p-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-on-surface-variant">Tam tinh</span><span>{(order.total - order.shippingFee + order.discount).toLocaleString()}₫</span></div>
                <div className="flex justify-between"><span className="text-on-surface-variant">Phi giao hang</span><span>{order.shippingFee.toLocaleString()}₫</span></div>
                {order.discount > 0 && <div className="flex justify-between"><span className="text-on-surface-variant">Giam gia</span><span className="text-red-600">-{order.discount.toLocaleString()}₫</span></div>}
                <hr className="border-outline-variant/20" />
                <div className="flex justify-between font-bold text-base"><span>Tong cong</span><span className="text-primary">{order.total.toLocaleString()}₫</span></div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low">
                  <MapPin className="w-4 h-4 text-on-surface-variant mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{order.customerName}</p>
                    <p className="text-xs text-on-surface-variant">{order.shippingAddress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low">
                  <CreditCard className="w-4 h-4 text-on-surface-variant shrink-0" />
                  <span className="text-sm">{order.paymentMethod}</span>
                  <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full ${paymentMap[order.paymentStatus].cls}`}>{paymentMap[order.paymentStatus].label}</span>
                </div>
                {order.note && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                    <FileText className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-700 mb-0.5">Ghi chu</p>
                      <p className="text-sm text-on-surface">{order.note}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
