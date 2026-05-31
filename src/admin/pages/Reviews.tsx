import { motion } from 'motion/react';
import { Star, Check, X, MessageSquare } from 'lucide-react';
import { REVIEWS } from "../mocks";
import { useState } from 'react';

const stMap: Record<string, { label: string; cls: string }> = {
  approved: { label: 'Đã duyệt', cls: 'bg-emerald-50 text-emerald-700' },
  pending: { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-700' },
  rejected: { label: 'Từ chối', cls: 'bg-red-50 text-red-600' },
};

export default function Reviews() {
  const [filter, setFilter] = useState('all');
  const filtered = REVIEWS.filter(r => filter === 'all' || r.status === filter);

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Đánh giá sản phẩm</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">{REVIEWS.filter(r => r.status === 'pending').length} đánh giá chờ duyệt</p>
      </motion.div>
      <div className="flex bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-0.5 self-start w-fit">
        {[{ v: 'all', l: 'Tất cả' }, { v: 'pending', l: 'Chờ duyệt' }, { v: 'approved', l: 'Đã duyệt' }, { v: 'rejected', l: 'Từ chối' }].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f.v ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}>
            {f.l}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map((r, i) => {
          const st = stMap[r.status];
          return (
            <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-primary-container/30 flex items-center justify-center text-primary font-bold text-sm">
                      {r.customerName.split(' ').slice(-1)[0][0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-on-surface">{r.customerName}</p>
                      <p className="text-[11px] text-on-surface-variant">{r.createdAt}</p>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-1.5">Sản phẩm: <strong className="text-on-surface">{r.productName}</strong></p>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`w-3.5 h-3.5 ${j < r.rating ? 'fill-amber-400 text-amber-400' : 'text-surface-container-high'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed">{r.comment}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                  {r.status === 'pending' && (
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"><Check className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
