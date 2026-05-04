// src/components/auth/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LoadingFallback } from '../../components/ui';
import { Role } from '../../constants/role';

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

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. KIỂM TRA QUYỀN HẠN (ROLE-BASED)
  // Nếu không truyền allowedRoles => chỉ cần login là vào được
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user?.roles || [];

    // Normalize case/whitespace to prevent false 403 after merge/API casing differences
    const normalizedUserRoles = userRoles.map((role) => role.trim().toLowerCase());
    const normalizedAllowedRoles = allowedRoles.map((role) => role.trim().toLowerCase());
    const hasPermission = normalizedAllowedRoles.some((role) => normalizedUserRoles.includes(role));

    if (!hasPermission) {
      // Role-aware fallback to avoid locking valid users on wrong default route
      if (normalizedUserRoles.includes(Role.Student.toLowerCase())) {
        return <Navigate to="/student" replace />;
      }
      if (normalizedUserRoles.includes(Role.Lecturer.toLowerCase())) {
        return <Navigate to="/" replace />;
      }
      if (
        normalizedUserRoles.includes(Role.Manager.toLowerCase()) ||
        normalizedUserRoles.includes(Role.Admin.toLowerCase())
      ) {
        return <Navigate to="/labmanager/dashboard" replace />;
      }

      return <Navigate to="/unauthorized" replace />;
    }
  }

  // 4. HỢP LỆ: Render nội dung
  // Nếu có children thì render children, không thì render Outlet (cho Nested Routes)
  return children ? <>{children}</> : <Outlet />;
};