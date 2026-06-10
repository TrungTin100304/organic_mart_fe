import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, Trash2, Eye, Edit2, Plus, ChevronLeft, ChevronRight, Lock, Unlock } from "lucide-react";
import AdminConfirmModal from "../components/AdminConfirmModal";
import UserDetailDrawer from "../components/UserDetailDrawer";
import UserFormModal, { type UserFormValues } from "../components/UserFormModal";
import type { AdminUser } from "../types";
import type { User } from "../../types/user";
import { createUser, deleteUser, getUsers, updateUser, updateUserStatus } from "../../services/adminUserService";
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

const getCurrentUserEmail = () => {
  try {
    return localStorage.getItem("userEmail") || "";
  } catch {
    return "";
  }
};

const isCurrentUser = (user: AdminUser) => {
  const email = getCurrentUserEmail();
  return Boolean(email) && email.toLowerCase() === (user.email || "").toLowerCase();
};

type UserConfirmAction =
  | { type: "delete"; user: AdminUser }
  | { type: "status"; user: AdminUser };

export default function Users() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "customer">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminUser["status"]>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<UserConfirmAction | null>(null);
  const [isConfirmProcessing, setIsConfirmProcessing] = useState(false);
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
      const safeUsers = result.data.filter((user) => user.role !== "admin");
      setUsers(safeUsers);
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
    if (user.role === "admin") return false;
    if (search && !user.name.toLowerCase().includes(search.toLowerCase()) && !user.email.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (roleFilter !== "all" && user.role !== roleFilter) {
      return false;
    }
    if (statusFilter !== "all" && user.status !== statusFilter) {
      return false;
    }
    return true;
  }), [users, search, roleFilter, statusFilter]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    if (user.role === "admin") {
      alert("Không thể chỉnh sửa tài khoản quản trị viên.");
      return;
    }
    setEditingUser(user);
    setShowForm(true);
  };

  const handleSubmit = async (values: UserFormValues) => {
    if (String(values.role) === "ROLE_ADMIN") {
      alert("Không được tạo hoặc chỉnh sửa tài khoản quản trị viên.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          fullName: values.fullName,
          phoneNumber: values.phoneNumber,
        });
      } else {
        await createUser({
          fullName: values.fullName,
          email: values.email,
          phoneNumber: values.phoneNumber,
          password: values.password,
          role: values.role,
        });
      }
      setShowForm(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err: any) {
      const message = err?.message || "Không thể lưu người dùng.";
      if (/403|forbidden/i.test(message)) {
        alert("Bạn không có quyền thực hiện thao tác này. Vui lòng kiểm tra tài khoản admin.");
      } else {
        alert(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (user: AdminUser) => {
    if (user.role === "admin") {
      alert("Không thể xóa tài khoản quản trị viên.");
      return;
    }
    if (isCurrentUser(user)) {
      alert("Bạn không thể tự xóa chính mình.");
      return;
    }
    setConfirmAction({ type: "delete", user });
  };

  const handleToggleStatus = (user: AdminUser) => {
    if (user.role === "admin") {
      alert("Khong the doi trang thai tai khoan quan tri vien.");
      return;
    }
    if (isCurrentUser(user)) {
      alert("Ban khong the tu khoa hoac mo khoa chinh minh.");
      return;
    }
    setConfirmAction({ type: "status", user });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { user } = confirmAction;

    setIsConfirmProcessing(true);
    try {
      if (confirmAction.type === "delete") {
        await deleteUser(user.id);
        await loadUsers();
        setSelectedUser(null);
        setConfirmAction(null);
        return;
      }

      const nextIsActive = user.status !== "active";
      if (dataSource === "mock") {
        setUsers((current) =>
          current.map((item) =>
            item.id === user.id ? { ...item, status: nextIsActive ? "active" : "locked" } : item,
          ),
        );
        setConfirmAction(null);
        return;
      }

      setStatusUpdatingId(user.id);
      await updateUserStatus(user.id, nextIsActive);
      await loadUsers();
      setConfirmAction(null);
    } catch (err: any) {
      const fallbackMessage = confirmAction.type === "delete"
        ? "Không thể xóa người dùng."
        : "Khong the cap nhat trang thai nguoi dung.";
      const message = err?.message || fallbackMessage;
      if (/403|forbidden/i.test(message)) {
        alert(confirmAction.type === "delete"
          ? "Bạn không có quyền xóa người dùng này."
          : "Ban khong co quyen cap nhat trang thai nguoi dung nay.");
      } else {
        alert(message);
      }
    } finally {
      setStatusUpdatingId(null);
      setIsConfirmProcessing(false);
    }
  };

  const confirmTitle = confirmAction?.type === "delete"
    ? "Xóa người dùng"
    : confirmAction?.user.status === "active"
      ? "Inactive user"
      : "Active user";
  const confirmMessage = !confirmAction
    ? ""
    : confirmAction.type === "delete"
      ? `Bạn có chắc chắn muốn xóa người dùng "${confirmAction.user.name}"?`
      : confirmAction.user.status === "active"
        ? `Bạn có chắc chắn muốn inactive user "${confirmAction.user.name}"?`
        : `Bạn có chắc chắn muốn active user "${confirmAction.user.name}"?`;
  const confirmLabel = confirmAction?.type === "delete"
    ? "Xóa"
    : confirmAction?.user.status === "active"
      ? "Inactive"
      : "Active";

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Người dùng</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{users.length} người dùng {sourceLabel(dataSource)}</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all self-start">
          <Plus className="w-4 h-4" /> Thêm người dùng
        </button>
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
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setRoleFilter(filter.value as "all" | "customer")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${roleFilter === filter.value ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-primary"}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="flex bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-0.5 self-start">
          {[
            { value: "all", label: "Tat ca" },
            { value: "active", label: "Active" },
            { value: "locked", label: "Inactive" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value as "all" | AdminUser["status"])}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === filter.value ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-primary"}`}
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
            <table className="w-full text-sm min-w-[860px]">
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
                  const isStatusUpdating = statusUpdatingId === user.id;
                  const isActive = user.status === "active";

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
                          <button onClick={() => handleOpenEdit(user)} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors" title="Sửa">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => void handleToggleStatus(user)}
                            disabled={isStatusUpdating || isCurrentUser(user)}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                              isActive
                                ? "hover:bg-amber-50 text-on-surface-variant hover:text-amber-700"
                                : "hover:bg-emerald-50 text-on-surface-variant hover:text-emerald-700"
                            }`}
                            title={isCurrentUser(user) ? "Khong the doi trang thai cua ban" : isActive ? "Inactive user" : "Active user"}
                          >
                            {isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={isCurrentUser(user)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title={isCurrentUser(user) ? "Không thể tự xóa" : "Xóa"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-on-surface-variant text-sm">
                      Không có người dùng nào.
                    </td>
                  </tr>
                )}
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
      <UserFormModal
        user={editingUser}
        open={showForm}
        isSubmitting={isSubmitting}
        onClose={() => { setShowForm(false); setEditingUser(null); }}
        onSubmit={handleSubmit}
      />
      <AdminConfirmModal
        open={Boolean(confirmAction)}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirmLabel}
        isProcessing={isConfirmProcessing}
        onClose={() => {
          if (!isConfirmProcessing) setConfirmAction(null);
        }}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
