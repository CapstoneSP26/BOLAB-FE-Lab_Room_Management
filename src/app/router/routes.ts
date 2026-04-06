import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export interface AppRoute {
  path: string;
  element: LazyExoticComponent<ComponentType>;
  isPrivate: boolean;
  layout: "auth" | "main" | "labmanager";
}

const LoginPage = lazy(() => import("../../pages/user/LoginPage.tsx"));
const HomePage = lazy(() => import("../../pages/user/HomePage.tsx"));
const BuildingDetail = lazy(
  () => import("../../pages/user/BuildingDetail.tsx"),
);
const RoomBookingPage = lazy(
  () => import("../../pages/lecturer/RoomBookingPage.tsx"),
);
const LabRoomDetailsPage = lazy(
  () => import("../../pages/lecturer/LabRoomDetailsPage.tsx"),
);
const BookingHistoryPage = lazy(
  () => import("../../pages/lecturer/BookingHistoryPage.tsx"),
);
const NotificationsPage = lazy(
  () => import("../../pages/lecturer/NotificationsPage.tsx"),
);
const AttendanceManagementPage = lazy(
  () => import("../../pages/lecturer/AttendanceManagementPage.tsx"),
);
const QRDisplayPage = lazy(
  () => import("../../pages/lecturer/QRDisplayPage.tsx"),
);
const ScanAttendancePage = lazy(
  () => import("../../pages/lecturer/ScanAttendancePage.tsx"),
);
const ManualAttendancePage = lazy(
  () => import("../../pages/lecturer/ManualAttendancePage.tsx"),
);
const CameraAttendancePage = lazy(
  () => import("../../pages/labmanager/CameraAttendancePage.tsx"),
);
const ProfilePage = lazy(() => import("../../pages/lecturer/ProfilePage.tsx"));
const StudentGroupsPage = lazy(
  () => import("../../pages/lecturer/StudentGroupsPage.tsx"),
);
const GroupOverviewPage = lazy(
  () => import("../../pages/lecturer/GroupOverviewPage.tsx"),
);

const ManagerDashboard = lazy(
  () => import("../../pages/labmanager/ManagerDashboard.tsx"),
);
const UserProfilePage = lazy(
  () => import("../../pages/labmanager/UserProfilePage.tsx"),
);
const LabSchedulerPage = lazy(
  () => import("../../pages/labmanager/LabSchedulerPage.tsx"),
);
const BookingRequestsPendingPage = lazy(
  () => import("../../pages/labmanager/BookingRequestsPendingPage.tsx"),
);
const BookingRequestsHistoryPage = lazy(
  () => import("../../pages/labmanager/BookingRequestsHistoryPage.tsx"),
);
const ImportBookingPage = lazy(
  () => import("../../pages/labmanager/ImportBookingPage.tsx"),
);
const ReportListPage = lazy(
  () => import("../../pages/labmanager/ReportListPage.tsx"),
);
const ReportDetailPage = lazy(
  () => import("../../pages/labmanager/ReportDetailPage.tsx"),
);
const IncidentHistoryPage = lazy(
  () => import("../../pages/labmanager/ReportHistoryPage.tsx"),
);

export const appRoutes: AppRoute[] = [
  {
    path: "/login",
    element: LoginPage,
    isPrivate: false,
    layout: "auth",
  },
  {
    path: "/",
    element: HomePage,
    isPrivate: false,
    layout: "main",
  },
  {
    path: "/building/:id",
    element: BuildingDetail,
    isPrivate: false,
    layout: "main",
  },
  {
    path: "/book-room",
    element: RoomBookingPage,
    isPrivate: true,
    layout: "main",
  },
  {
    path: "/lab-room/:roomId",
    element: LabRoomDetailsPage,
    isPrivate: true,
    layout: "main",
  },
  {
    path: "/my-bookings",
    element: BookingHistoryPage,
    isPrivate: true,
    layout: "main",
  },
  {
    path: "/notifications",
    element: NotificationsPage,
    isPrivate: true,
    layout: "main",
  },
  {
    path: "/attendance",
    element: AttendanceManagementPage,
    isPrivate: true,
    layout: "main",
  },
  {
    path: "/qr-display/:sessionId",
    element: QRDisplayPage,
    isPrivate: true,
    layout: "auth",
  },
  {
    path: "/scan-attendance/:sessionId",
    element: ScanAttendancePage,
    isPrivate: false,
    layout: "auth",
  },
  {
    path: "/attendance/manual/:sessionId",
    element: ManualAttendancePage,
    isPrivate: true,
    layout: "main",
  },
  {
    path: "/attendance/camera",
    element: CameraAttendancePage,
    isPrivate: true,
    layout: "main",
  },
  {
    path: "/profile",
    element: ProfilePage,
    isPrivate: true,
    layout: "main",
  },
  {
    path: "/student-groups",
    element: StudentGroupsPage,
    isPrivate: true,
    layout: "main",
  },
  {
    path: "/student-groups/:groupId",
    element: GroupOverviewPage,
    isPrivate: true,
    layout: "main",
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
    path: "/labmanager/booking-requests/import",
    element: ImportBookingPage,
    isPrivate: false,
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
