import { Package, UserPlus, ShoppingCart, CheckCircle, Star } from 'lucide-react';

const activities = [
  { icon: ShoppingCart, color: 'bg-primary', text: 'Đơn hàng mới #ORD-2025-001 từ Nguyễn Văn An', time: '5 phút trước' },
  { icon: CheckCircle, color: 'bg-emerald-600', text: 'Đơn #ORD-2025-004 đã giao thành công', time: '3 giờ trước' },
  { icon: UserPlus, color: 'bg-blue-600', text: 'Người dùng mới: Bùi Văn Nam đăng ký', time: '5 giờ trước' },
  { icon: Star, color: 'bg-amber-500', text: 'Đánh giá 5⭐ mới cho Granola hữu cơ', time: '6 giờ trước' },
  { icon: Package, color: 'bg-secondary', text: 'Cập nhật tồn kho: Cải kale Organic còn 8', time: '8 giờ trước' },
];

export default function ActivityTimeline() {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5">
      <h3 className="font-bold text-on-surface mb-4">Hoạt động gần đây</h3>
      <div className="space-y-0">
        {activities.map((a, i) => (
          <div key={i} className="flex gap-3 relative">
            {i < activities.length - 1 && (
              <div className="absolute left-[15px] top-9 bottom-0 w-px bg-outline-variant/20" />
            )}
            <div className={`w-8 h-8 ${a.color} rounded-lg flex items-center justify-center shrink-0 z-10`}>
              <a.icon className="w-4 h-4 text-white" />
            </div>
            <div className="pb-5">
              <p className="text-sm text-on-surface leading-snug">{a.text}</p>
              <p className="text-[11px] text-on-surface-variant/60 mt-0.5">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
