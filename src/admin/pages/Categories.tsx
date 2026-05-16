import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, FolderTree } from 'lucide-react';
import { CATEGORIES } from "../mocks";

export default function Categories() {
  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Danh mục</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{CATEGORIES.length} danh mục</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all">
          <Plus className="w-4 h-4" /> Thêm danh mục
        </button>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 hover:shadow-md hover:border-primary/10 transition-all group">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                <FolderTree className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-on-surface">{c.name}</h3>
                <p className="text-xs text-on-surface-variant">{c.slug}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">{c.productCount} sản phẩm</span>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
