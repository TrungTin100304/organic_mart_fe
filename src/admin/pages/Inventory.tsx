import { motion } from 'motion/react';
import { AlertTriangle, Search, ArrowUpDown } from 'lucide-react';
import { ADMIN_PRODUCTS } from "../mocks";
import { useState } from 'react';

export default function Inventory() {
  const [search, setSearch] = useState('');
  const sorted = [...ADMIN_PRODUCTS].sort((a, b) => a.stock - b.stock);
  const filtered = sorted.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Quản lý tồn kho</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">{ADMIN_PRODUCTS.filter(p => p.stock <= 10).length} sản phẩm cần bổ sung</p>
      </motion.div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Tổng SKU', value: ADMIN_PRODUCTS.length, cls: 'text-primary' },
          { label: 'Hết hàng', value: ADMIN_PRODUCTS.filter(p => p.stock === 0).length, cls: 'text-red-600' },
          { label: 'Sắp hết (<10)', value: ADMIN_PRODUCTS.filter(p => p.stock > 0 && p.stock <= 10).length, cls: 'text-amber-600' },
          { label: 'Đủ hàng', value: ADMIN_PRODUCTS.filter(p => p.stock > 10).length, cls: 'text-emerald-700' },
        ].map((s, i) => (
          <div key={i} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-4 text-center">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-on-surface-variant mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-2 max-w-md focus-within:border-primary/40 transition-colors">
        <Search className="w-4 h-4 text-on-surface-variant/50" />
        <input value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-on-surface-variant/40" placeholder="Tìm sản phẩm..." />
      </div>
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left text-on-surface-variant/70 text-xs border-b border-outline-variant/20 bg-surface-container-low/30">
                <th className="px-5 py-3 font-semibold">Sản phẩm</th>
                <th className="px-5 py-3 font-semibold">SKU</th>
                <th className="px-5 py-3 font-semibold">Danh mục</th>
                <th className="px-5 py-3 font-semibold">Tồn kho</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/40 transition-colors">
                  <td className="px-5 py-3 font-semibold text-on-surface">{p.name}</td>
                  <td className="px-5 py-3 text-on-surface-variant">{p.sku}</td>
                  <td className="px-5 py-3 text-on-surface-variant">{p.category}</td>
                  <td className="px-5 py-3">
                    <span className={`font-bold ${p.stock === 0 ? 'text-red-600' : p.stock <= 10 ? 'text-amber-600' : 'text-emerald-700'}`}>{p.stock}</span>
                  </td>
                  <td className="px-5 py-3">
                    {p.stock === 0 ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-red-600"><AlertTriangle className="w-3.5 h-3.5" />Hết hàng</span>
                    ) : p.stock <= 10 ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600"><AlertTriangle className="w-3.5 h-3.5" />Sắp hết</span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700">Đủ hàng</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
