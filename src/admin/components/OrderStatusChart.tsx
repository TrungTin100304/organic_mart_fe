import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Chờ xác nhận', value: 5, color: '#d97706' },
  { name: 'Đang xử lý', value: 8, color: '#486800' },
  { name: 'Đang giao', value: 4, color: '#0891b2' },
  { name: 'Đã giao', value: 42, color: '#16a34a' },
  { name: 'Đã hủy', value: 3, color: '#dc2626' },
];

export default function OrderStatusChart() {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5">
      <h3 className="font-bold text-on-surface mb-4">Trạng thái đơn hàng</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" strokeWidth={0}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #c3c9b040' }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
