import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import UserDetailDrawer from "../components/UserDetailDrawer";
import type { AdminUser } from "../types";
import type { User } from "../../types/user";
import { deleteUser, getUsers } from "../../services/adminUserService";
import { ADMIN_USERS } from "../mocks/users";
import { loadAdminDataWithFallback, sourceLabel, type AdminDataSource } from "../utils/dataSource";

const roleMap: Record<AdminUser["role"], { label: string; cls: string }> = {
  admin: { label: "Admin", cls: "bg-primary/10 text-primary border-primary/20" },
  staff: { label: "Nhân viên", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  customer: { label: "Khách hàng", cls: "bg-surface-container-high text-on-surface-variant border-outline-variant/30" },
};

const statusMap: Record<AdminUser["status"], { label: string; cls: string }> = {
  active: { label: "Hoạt động", cls: "bg-emerald-50 text-emerald-700" },
  locked: { label: "Đã khóa", cls: "bg-red-50 text-red-600" },
};

const toAdminUser = (user: User): AdminUser => ({
  id: String(user.id),
  name: user.fullName,
  email: user.email,
  phone: user.phoneNumber || user.phone || "",
  role: user.role === "ROLE_ADMIN" ? "admin" : "customer",
  status: user.isActive === false ? "locked" : "active",
  avatar: user.avatarUrl || "",
  createdAt: user.createdAt || "",
  totalOrders: 0,
  totalSpent: 0,
});

export default function Users() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AdminUser["role"]>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dataSource, setDataSource] = useState<AdminDataSource>("api");
  const [dataNotice, setDataNotice] = useState("");

  const loadUsers = async () => {
    setIsLoading(true);
    setError("");
    setDataNotice("");
    try {
      const result = await loadAdminDataWithFallback(
        async () => (await getUsers()).map(toAdminUser),
        () => ADMIN_USERS,
      );
      setUsers(result.data);
      setDataSource(result.source);
      setDataNotice(result.error || (result.source === "mock" ? "Đang hiển thị dữ liệu mẫu." : ""));
    } catch (err: any) {
      setError(err?.message || "Không thể tải người dùng.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filtered = useMemo(() => users.filter((user) => {
    if (search && !user.name.toLowerCase().includes(search.toLowerCase()) && !user.email.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    if (roleFilter !== "all" && user.role !== roleFilter) {
      return false;
    }

    return true;
  }), [users, search, roleFilter]);

  const handleDelete = async (user: AdminUser) => {
    if (!window.confirm(`Xóa người dùng "${user.name}"?`)) return;
    if (dataSource === "mock") {
      setUsers((current) => current.filter((item) => item.id !== user.id));
      setSelectedUser(null);
      return;
    }

    try {
      await deleteUser(user.id);
      await loadUsers();
      setSelectedUser(null);
    } catch (err: any) {
      alert(err?.message || "Không thể xóa người dùng.");
    }
  };

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Người dùng</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{users.length} người dùng {sourceLabel(dataSource)}</p>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-3 py-2 flex-1 max-w-md focus-within:border-primary/40 transition-colors">
          <Search className="w-4 h-4 text-on-surface-variant/50 shrink-0" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-on-surface-variant/40" placeholder="Tìm theo tên, email..." />
        </div>
        <div className="flex bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-0.5 self-start">
          {[
            { value: "all", label: "Tất cả" },
            { value: "customer", label: "Khách hàng" },
            { value: "admin", label: "Admin" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setRoleFilter(filter.value as "all" | AdminUser["role"])}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${roleFilter === filter.value ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-primary"}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-on-surface-variant">Đang tải người dùng...</p>}
      {dataNotice && !isLoading && <p className="text-amber-700 text-sm font-semibold">{dataNotice}</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {!isLoading && !error && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="text-left text-on-surface-variant/70 text-xs border-b border-outline-variant/20 bg-surface-container-low/30">
                  <th className="px-5 py-3 font-semibold">Người dùng</th>
                  <th className="px-5 py-3 font-semibold">Liên hệ</th>
                  <th className="px-5 py-3 font-semibold">Vai trò</th>
                  <th className="px-5 py-3 font-semibold">Trạng thái</th>
                  <th className="px-5 py-3 font-semibold">Ngày tạo</th>
                  <th className="px-5 py-3 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, index) => {
                  const role = roleMap[user.role];
                  const status = statusMap[user.status];

                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-outline-variant/10 hover:bg-surface-container-low/40 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-container/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {user.name.split(" ").slice(-1)[0]?.[0] || "U"}
                          </div>
                          <span className="font-semibold text-on-surface">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs text-on-surface-variant">{user.email}</p>
                        <p className="text-xs text-on-surface-variant/60">{user.phone}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${role.cls}`}>{role.label}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${status.cls}`}>{status.label}</span>
                      </td>
                      <td className="px-5 py-3.5 text-on-surface-variant text-xs">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "-"}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setSelectedUser(user)} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors" title="Xem">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(user)} className="p-1.5 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-600 transition-colors" title="Xóa">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-t border-outline-variant/20">
            <span className="text-xs text-on-surface-variant">Hiển thị {filtered.length} / {users.length}</span>
            <div className="flex gap-1">
              <button className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant"><ChevronLeft className="w-4 h-4" /></button>
              <button className="w-8 h-8 rounded-lg bg-primary text-white text-xs font-bold">1</button>
              <button className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}

      <UserDetailDrawer orders={[]} user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}
