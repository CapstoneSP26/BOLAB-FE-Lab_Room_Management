import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export interface AppRoute {
  path: string;
  element: LazyExoticComponent<ComponentType>;
  isPrivate: boolean;
  layout: 'auth' | 'main';
}

const LoginPage = lazy(() => import('../pages/LoginPage'));
const HomePage = lazy(() => import('../pages/HomePage'));
const BuildingDetail = lazy(() => import('../pages/BuildingDetail'));
const RoomBookingPage = lazy(() => import('../pages/RoomBookingPage'));
const BookingHistoryPage = lazy(() => import('../pages/BookingHistoryPage'));
const AttendanceManagementPage = lazy(() => import('../pages/AttendanceManagementPage'));
const QRDisplayPage = lazy(() => import('../pages/QRDisplayPage'));
const ScanAttendancePage = lazy(() => import('../pages/ScanAttendancePage'));
const ManualAttendancePage = lazy(() => import('../pages/ManualAttendancePage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));

export const appRoutes: AppRoute[] = [
  {
    path: '/login',
    element: LoginPage,
    isPrivate: false,
    layout: 'auth',
  },
  {
    path: '/',
    element: HomePage,
    isPrivate: false,
    layout: 'main',
  },
  {
    path: '/building/:id',
    element: BuildingDetail,
    isPrivate: false,
    layout: 'main',
  },
  {
    path: '/book-room',
    element: RoomBookingPage,
    isPrivate: true,
    layout: 'main',
  },
  {
    path: '/my-bookings',
    element: BookingHistoryPage,
    isPrivate: true,
    layout: 'main',
  },
  {
    path: '/attendance',
    element: AttendanceManagementPage,
    isPrivate: true,
    layout: 'main',
  },
  {
    path: '/qr-display/:sessionId',
    element: QRDisplayPage,
    isPrivate: true,
    layout: 'auth',
  },
  {
    path: '/scan-attendance/:sessionId',
    element: ScanAttendancePage,
    isPrivate: false,
    layout: 'auth',
  },
  {
    path: '/attendance/manual/:sessionId',
    element: ManualAttendancePage,
    isPrivate: true,
    layout: 'main',
  },
  {
    path: '/profile',
    element: ProfilePage,
    isPrivate: true,
    layout: 'main',
  },
];
