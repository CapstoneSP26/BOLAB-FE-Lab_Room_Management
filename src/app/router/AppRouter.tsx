import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout, AuthLayout } from '../../layouts';
import ManagerLayout from '../../layouts/labmanager/ManagerLayout';
import { publicRoutes, sharedRoutes, lecturerRoutes, managerRoutes, adminRoutes, studentRoutes } from './routes';
import { Role } from '../../constants/role';

export const AppRouter = () => {
  return (
    <Routes>
      {/* NHÓM 1: PUBLIC - Không cần login */}
      <Route element={<AuthLayout />}>
        {publicRoutes.map(r => <Route key={r.path} path={r.path} element={<r.element />} />)}
      </Route>

      {/* NHÓM 2: PRIVATE - Cần login chung (MainLayout) */}
      <Route element={<MainLayout />}>
        {sharedRoutes.map(r => (
          <Route key={r.path} path={r.path} element={<ProtectedRoute allowedRoles={r.roles}><r.element /></ProtectedRoute>} />
        ))}
        {lecturerRoutes.map(r => (
          <Route key={r.path} path={r.path} element={<ProtectedRoute allowedRoles={r.roles}><r.element /></ProtectedRoute>} />
        ))}
        {studentRoutes.map(r => (
          <Route key={r.path} path={r.path} element={<ProtectedRoute allowedRoles={r.roles}><r.element /></ProtectedRoute>} />
        ))}
      </Route>

      {/* NHÓM 3: MANAGER & ADMIN - Giao diện quản trị (ManagerLayout) */}
      <Route element={<ProtectedRoute allowedRoles={[Role.Manager, Role.Admin]} />}>
        <Route element={<ManagerLayout />}>
          {managerRoutes.map(r => <Route key={r.path} path={r.path} element={<r.element />} />)}
          {adminRoutes.map(r => <Route key={r.path} path={r.path} element={<r.element />} />)}
        </Route>
      </Route>

      {/* CATCH ALL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};