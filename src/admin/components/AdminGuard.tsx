import { Navigate } from 'react-router-dom';

/**
 * AdminGuard — Chặn user thường truy cập /admin.
 * Kiểm tra: đã login (có accessToken) + role === "ADMIN"
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
  if (role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
