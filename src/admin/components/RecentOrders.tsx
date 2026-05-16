import { ADMIN_ORDERS } from "../mocks";
import { Eye, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusMap: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Chờ xác nhận', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  processing: { label: 'Đang xử lý', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  shipped: { label: 'Đang giao', cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  delivered: { label: 'Đã giao', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Đã hủy', cls: 'bg-red-50 text-red-700 border-red-200' },
};

const paymentMap: Record<string, { label: string; cls: string }> = {
  paid: { label: 'Đã thanh toán', cls: 'text-emerald-700' },
  pending: { label: 'Chờ TT', cls: 'text-amber-700' },
  refunded: { label: 'Hoàn tiền', cls: 'text-red-600' },
};

export default function RecentOrders() {
  const orders = ADMIN_ORDERS.slice(0, 5);
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-on-surface">Đơn hàng mới nhất</h3>
        <Link to="/admin/orders" className="text-xs font-bold text-primary hover:underline">Xem tất cả</Link>
      </div>
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-left text-on-surface-variant/70 text-xs border-b border-outline-variant/20">
              <th className="pb-3 font-semibold">Mã đơn</th>
              <th className="pb-3 font-semibold">Khách hàng</th>
              <th className="pb-3 font-semibold">Tổng tiền</th>
              <th className="pb-3 font-semibold">Thanh toán</th>
              <th className="pb-3 font-semibold">Trạng thái</th>
              <th className="pb-3 font-semibold text-right">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const st = statusMap[o.orderStatus];
              const pm = paymentMap[o.paymentStatus];
              return (
                <tr key={o.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3 font-bold text-primary">{o.code}</td>
                  <td className="py-3">
                    <p className="font-medium text-on-surface">{o.customerName}</p>
                  </td>
                  <td className="py-3 font-semibold">{o.total.toLocaleString()}₫</td>
                  <td className="py-3"><span className={`text-xs font-bold ${pm.cls}`}>{pm.label}</span></td>
                  <td className="py-3">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="py-3 text-right text-on-surface-variant text-xs">
                    {new Date(o.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
