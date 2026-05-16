import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, Ticket, Copy } from 'lucide-react';
import { PROMOTIONS } from "../mocks";

const stMap: Record<string, { label: string; cls: string }> = {
  active: { label: 'Đang chạy', cls: 'bg-emerald-50 text-emerald-700' },
  expired: { label: 'Hết hạn', cls: 'bg-red-50 text-red-600' },
  scheduled: { label: 'Lên lịch', cls: 'bg-blue-50 text-blue-700' },
};

export default function Promotions() {
  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Khuyến mãi</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{PROMOTIONS.length} mã giảm giá</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all">
          <Plus className="w-4 h-4" /> Tạo mã mới
        </button>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROMOTIONS.map((p, i) => {
          const st = stMap[p.status];
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Ticket className="w-5 h-5" /></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-on-surface font-mono">{p.code}</h3>
                      <button className="p-1 rounded hover:bg-surface-container text-on-surface-variant/50 hover:text-primary"><Copy className="w-3.5 h-3.5" /></button>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {p.type === 'percent' ? `Giảm ${p.value}%` : `Giảm ${p.value.toLocaleString()}₫`}
                      {p.minOrder > 0 && ` · Đơn tối thiểu ${p.minOrder.toLocaleString()}₫`}
                    </p>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <span>Đã dùng: <strong className="text-on-surface">{p.usageCount}/{p.maxUsage}</strong></span>
                <span>{p.startDate} → {p.endDate}</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-2">
                <div className="bg-primary rounded-full h-1.5 transition-all" style={{ width: `${Math.min((p.usageCount / p.maxUsage) * 100, 100)}%` }} />
              </div>
              <div className="flex justify-end gap-1 mt-3">
                <button className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
