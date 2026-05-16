import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { REVENUE_BY_CATEGORY } from "../mocks";

const topProducts = [
  { name: 'Khoai mỡ Organic', sold: 156 },
  { name: 'Cải kale Organic', sold: 132 },
  { name: 'Chanh Organic', sold: 118 },
  { name: 'Ớt chuông đỏ', sold: 95 },
  { name: 'Granola hữu cơ', sold: 87 },
];

export function TopProductsChart() {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5">
      <h3 className="font-bold text-on-surface mb-4">Top sản phẩm bán chạy</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#c3c9b020" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#737a64' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#434936' }} axisLine={false} tickLine={false} width={100} />
          <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #c3c9b040' }} />
          <Bar dataKey="sold" fill="#80b400" radius={[0, 6, 6, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryRevenueChart() {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5">
      <h3 className="font-bold text-on-surface mb-4">Doanh thu theo danh mục</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={REVENUE_BY_CATEGORY}>
          <CartesianGrid strokeDasharray="3 3" stroke="#c3c9b020" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#737a64' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#737a64' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
          <Tooltip formatter={(v: number) => [`${v.toLocaleString()}₫`, 'Doanh thu']} contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #c3c9b040' }} />
          <Bar dataKey="value" fill="#486800" radius={[6, 6, 0, 0]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
