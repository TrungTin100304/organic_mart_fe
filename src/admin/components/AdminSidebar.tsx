import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Leaf, LogOut, X } from "lucide-react";
import { ADMIN_ROUTES, ADMIN_ROUTE_SECTIONS } from "../AdminRoutes";
import { getCurrentUser } from "../../services/userService";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: AdminSidebarProps) {
  const location = useLocation();
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    getCurrentUser()
      .then((user) => setAdminName(user.fullName || user.email))
      .catch(() => setAdminName("Admin"));
  }, []);

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 h-16 border-b border-outline-variant/30 shrink-0">
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <span className="font-bold text-primary text-sm whitespace-nowrap">RAU NHA MINH</span>
            <span className="block text-[10px] text-on-surface-variant font-medium -mt-0.5">Admin Panel</span>
          </motion.div>
        )}
        <button onClick={onMobileClose} className="ml-auto lg:hidden p-1 rounded-lg hover:bg-surface-container">
          <X className="w-5 h-5 text-on-surface-variant" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {ADMIN_ROUTE_SECTIONS.map((section) => (
          <div key={section.key}>
            {!collapsed && (
              <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest px-3 mb-2">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {ADMIN_ROUTES.filter((route) => route.group === section.key).map((item) => {
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.key}
                    to={item.to}
                    onClick={onMobileClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                      active
                        ? "bg-primary text-white shadow-sm"
                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    }`}
                  >
                    <item.icon className={`w-[18px] h-[18px] shrink-0 ${active ? "text-white" : "text-on-surface-variant group-hover:text-primary"}`} />
                    {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="hidden lg:block border-t border-outline-variant/30 p-3">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Thu gon</span></>}
        </button>
      </div>

      {!collapsed && (
        <div className="border-t border-outline-variant/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">{adminName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface truncate">{adminName}</p>
              <p className="text-[11px] text-on-surface-variant truncate">Admin</p>
            </div>
            <Link to="/" className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors" title="Ve storefront">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside className={`hidden lg:flex flex-col bg-surface-container-lowest border-r border-outline-variant/30 h-screen sticky top-0 transition-all duration-300 shrink-0 ${collapsed ? "w-[72px]" : "w-[260px]"}`}>
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-surface-container-lowest z-50 lg:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
