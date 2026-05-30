import { Navigate } from 'react-router-dom';
import { isAdminRole } from '../../services/apiClient';

/**
 * AdminGuard — Chặn user thường truy cập /admin.
 * Kiểm tra: đã login (có accessToken) + role === "ROLE_ADMIN"
 * Nếu không đủ điều kiện → redirect về /login
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('userRole');

  // Chưa đăng nhập → về trang login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Đã đăng nhập nhưng không phải ADMIN → về trang chủ
  if (!isAdminRole(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
