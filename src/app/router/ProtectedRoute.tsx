// src/components/auth/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LoadingFallback } from '../../components/ui';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: React.ReactNode; // Cho phép bọc trực tiếp hoặc dùng Outlet
}

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // 1. TRẠNG THÁI LOADING: Tránh việc bị đá văng ra Login khi đang check session
  if (isLoading) {
    return <LoadingFallback />;
  }

  // 2. CHƯA ĐĂNG NHẬP: Lưu lại trang định vào để sau khi login thì quay lại (state: from)
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. KIỂM TRA QUYỀN HẠN (ROLE-BASED)
  // Nếu không truyền allowedRoles => chỉ cần login là vào được
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user?.roles || [];
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));

    if (!hasPermission) {
      // Nếu sai quyền, đẩy về trang chủ hoặc trang 403 chuyên dụng
      // Không nên đẩy về /login vì họ đã đăng nhập rồi
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // 4. HỢP LỆ: Render nội dung
  // Nếu có children thì render children, không thì render Outlet (cho Nested Routes)
  return children ? <>{children}</> : <Outlet />;
};