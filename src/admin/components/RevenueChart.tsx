import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { REVENUE_7_DAYS } from "../mocks";

const data30 = Array.from({ length: 30 }, (_, i) => ({
  date: `${i + 1}/5`,
  revenue: 800000 + Math.floor(Math.random() * 2500000),
}));

export default function RevenueChart() {
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  const data = range === '7d' ? REVENUE_7_DAYS : data30;

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-on-surface">Doanh thu</h3>
        <div className="flex bg-surface-container-low rounded-xl p-0.5 border border-outline-variant/20">
          {(['7d', '30d'] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${range === r ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}>
              {r === '7d' ? '7 ngày' : '30 ngày'}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#486800" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#486800" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#c3c9b020" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#737a64' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#737a64' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
          <Tooltip formatter={(v: number) => [`${v.toLocaleString()}₫`, 'Doanh thu']}
            contentStyle={{ borderRadius: 12, border: '1px solid #c3c9b040', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
          <Area type="monotone" dataKey="revenue" stroke="#486800" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#486800', stroke: '#fff', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
