import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export interface AppRoute {
  path: string;
  element: LazyExoticComponent<ComponentType>;
  isPrivate: boolean;
  layout: 'auth' | 'main' | 'labmanager';
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


const ManagerDashboard = lazy(
  () => import("../pages/labmanager/ManagerDashboard"),
);
const UserProfilePage = lazy(
  () => import("../pages/labmanager/UserProfilePage"),
);
const LabSchedulerPage = lazy(
  () => import("../pages/labmanager/LabSchedulerPage"),
);
const BookingRequestsPendingPage = lazy(
  () => import("../pages/labmanager/BookingRequestsPendingPage.tsx"),
);
const BookingRequestsHistoryPage = lazy(
  () => import("../pages/labmanager/BookingRequestsHistoryPage.tsx"),
);
const ReportListPage = lazy(
  () => import("../pages/labmanager/ReportListPage.tsx"),
);
const ReportDetailPage = lazy(
  () => import("../pages/labmanager/ReportDetailPage.tsx"),
);
const IncidentHistoryPage = lazy(
  () => import("../pages/labmanager/IncidentHistoryPage.tsx"),
);

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


  {
    path: "/labmanager/dashboard",
    element: ManagerDashboard,
    isPrivate: false,
    layout: "labmanager",
  },
  {
    path: "/labmanager/user-profile",
    element: UserProfilePage,
    isPrivate: false, // nếu muốn bắt login thì đổi true
    layout: "labmanager",
  },
  {
    path: "/labmanager/lab-scheduler",
    element: LabSchedulerPage,
    isPrivate: false, // nếu muốn bắt login thì đổi true
    layout: "labmanager",
  },
  {
    path: "/labmanager/booking-requests/pending",
    element: BookingRequestsPendingPage,
    isPrivate: false, // nếu muốn bắt login thì đổi true
    layout: "labmanager",
  },
  {
    path: "/labmanager/booking-requests/history",
    element: BookingRequestsHistoryPage,
    isPrivate: false, // nếu muốn bắt login thì đổi true
    layout: "labmanager",
  },
  {
    path: "/labmanager/reports",
    element: ReportListPage,
    isPrivate: false, // nếu muốn bắt login thì đổi true
    layout: "labmanager",
  },
  {
    path: "/labmanager/reports/:id",
    element: ReportDetailPage,
    isPrivate: false,
    layout: "labmanager",
  },
  {
    path: "/labmanager/incident-history",
    element: IncidentHistoryPage,
    isPrivate: false,
    layout: "labmanager",
  },
];
