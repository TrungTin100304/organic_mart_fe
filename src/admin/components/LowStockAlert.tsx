import { AlertTriangle } from 'lucide-react';
import { ADMIN_PRODUCTS } from "../mocks";
import { Link } from 'react-router-dom';

export default function LowStockAlert() {
  const lowStock = ADMIN_PRODUCTS.filter(p => p.stock <= 10 && p.stock > 0).sort((a, b) => a.stock - b.stock);

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-on-surface flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" /> Cảnh báo tồn kho
        </h3>
        <Link to="/admin/inventory" className="text-xs font-bold text-primary hover:underline">Xem kho</Link>
      </div>
      <div className="space-y-3">
        {lowStock.map(p => (
          <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
            {p.image ? (
              <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-xs text-on-surface-variant">📦</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface truncate">{p.name}</p>
              <p className="text-[11px] text-on-surface-variant">{p.sku}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${p.stock <= 5 ? 'text-red-600' : 'text-amber-600'}`}>Còn {p.stock}</p>
            </div>
          </div>
        ))}
        {lowStock.length === 0 && (
          <p className="text-sm text-on-surface-variant text-center py-4">Tồn kho ổn định 👍</p>
        )}
      </div>
    </div>
  );
}
