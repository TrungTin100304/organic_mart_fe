import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, ChevronDown, Download, Plus, User, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface AdminTopbarProps {
  onMenuClick: () => void;
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const notifications = [
    { id: 1, text: 'Đơn hàng #ORD-2025-001 mới cần xác nhận', time: '5 phút trước', unread: true },
    { id: 2, text: 'Nấm hương tươi sắp hết hàng (còn 3)', time: '15 phút trước', unread: true },
    { id: 3, text: 'Đánh giá mới cho Granola hữu cơ', time: '1 giờ trước', unread: false },
    { id: 4, text: 'Đơn #ORD-2025-004 đã giao thành công', time: '3 giờ trước', unread: false },
  ];

  return (
    <header className="h-16 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-surface-container text-on-surface-variant">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all w-64 lg:w-80">
          <Search className="w-4 h-4 text-on-surface-variant/50 shrink-0" />
          <input className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-on-surface-variant/40" placeholder="Tìm đơn hàng, sản phẩm, khách hàng..." />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Quick actions */}
        <Link to="/admin/products" className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all">
          <Plus className="w-3.5 h-3.5" /> Thêm sản phẩm
        </Link>
        <button className="hidden md:flex items-center gap-1.5 px-3 py-2 border border-outline-variant/40 text-on-surface-variant rounded-xl text-xs font-medium hover:bg-surface-container transition-all">
          <Download className="w-3.5 h-3.5" /> Xuất báo cáo
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }} className="relative p-2 rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>
          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-outline-variant/20 flex items-center justify-between">
                  <span className="font-bold text-sm">Thông báo</span>
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">2 mới</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 hover:bg-surface-container-low cursor-pointer transition-colors border-b border-outline-variant/10 ${n.unread ? 'bg-primary/[0.03]' : ''}`}>
                      <p className="text-sm text-on-surface leading-snug">{n.text}</p>
                      <p className="text-[11px] text-on-surface-variant/60 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-outline-variant/20 text-center">
                  <button className="text-xs font-bold text-primary hover:underline">Xem tất cả thông báo</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }} className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-surface-container transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xs">QH</div>
            <span className="hidden md:block text-sm font-medium text-on-surface">Quang Huy</span>
            <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant hidden md:block" />
          </button>
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 top-12 w-52 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xl overflow-hidden z-50 py-1"
              >
                <Link to="/admin/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors">
                  <User className="w-4 h-4 text-on-surface-variant" /> Hồ sơ
                </Link>
                <Link to="/admin/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors">
                  <Settings className="w-4 h-4 text-on-surface-variant" /> Cài đặt
                </Link>
                <hr className="border-outline-variant/20 my-1" />
                <Link to="/" className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
