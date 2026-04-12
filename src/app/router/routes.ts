import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { Role } from "../../constants/role";
export interface AppRoute {
  path: string;
  element: LazyExoticComponent<ComponentType>;
  roles?: Role[];
}
const LoginPage = lazy(() => import("../../pages/user/LoginPage.tsx"));
const UnauthorizedPage = lazy(() => import("../../pages/user/UnauthorizedPage.tsx"));
const HomePage = lazy(() => import("../../pages/user/HomePage.tsx"));
const BuildingDetail = lazy(() => import("../../pages/user/BuildingDetail.tsx"));
const RoomBookingPage = lazy(() => import("../../pages/lecturer/RoomBookingPage.tsx"));
const CalendarTabletPage = lazy(() => import("../../pages/user/CalendarTabletPage.tsx"));
// const LabRoomDetailsPage = lazy(
//   () => import("../../pages/lecturer/LabRoomDetailsPage.tsx"),
// );
const BookingHistoryPage = lazy(() => import("../../pages/lecturer/BookingHistoryPage.tsx"));
const NotificationsPage = lazy(() => import("../../pages/lecturer/NotificationsPage.tsx"));
const AttendanceManagementPage = lazy(() => import("../../pages/lecturer/AttendanceManagementPage.tsx"));
const QRDisplayPage = lazy(() => import("../../pages/lecturer/QRDisplayPage.tsx"));
const ManualAttendancePage = lazy(() => import("../../pages/lecturer/ManualAttendancePage.tsx"));
const ProfilePage = lazy(() => import("../../pages/lecturer/ProfilePage.tsx"));
const StudentGroupsPage = lazy(() => import("../../pages/lecturer/StudentGroupsPage.tsx"));
const GroupOverviewPage = lazy(() => import("../../pages/lecturer/GroupOverviewPage.tsx"));

const ManagerDashboard = lazy(() => import("../../pages/labmanager/ManagerDashboard.tsx"));
const UserProfilePage = lazy(() => import("../../pages/labmanager/UserProfilePage.tsx"));
const LabSchedulerPage = lazy(() => import("../../pages/labmanager/LabSchedulerPage.tsx"));
const BookingRequestsPendingPage = lazy(() => import("../../pages/labmanager/BookingRequestsPendingPage.tsx"));
const BookingRequestsHistoryPage = lazy(() => import("../../pages/labmanager/BookingRequestsHistoryPage.tsx"));
const ImportBookingPage = lazy(() => import("../../pages/labmanager/ImportBookingPage.tsx"));
const ImportUserPage = lazy(() => import("../../pages/labmanager/ImportUserPage.tsx"));
const ImportGroupPage = lazy(() => import("../../pages/labmanager/ImportGroupPage.tsx"));
const ReportListPage = lazy(() => import("../../pages/labmanager/ReportListPage.tsx"));
const ReportDetailPage = lazy(() => import("../../pages/labmanager/ReportDetailPage.tsx"));
const IncidentHistoryPage = lazy(() => import("../../pages/labmanager/ReportHistoryPage.tsx"));

const RoomManagementPage = lazy(() => import("../../pages/admin/RoomManagementPage.tsx"))
const ScheduleManagementPage = lazy(() => import("../../pages/admin/ScheduleManagementPage.tsx"));

const StudentLandingPage = lazy(() => import("../../pages/student/StudentLandingPage.tsx"));
const StudentProfilePage = lazy(() => import("../../pages/student/StudentProfilePage.tsx"));
const StudentAttendanceScanPage = lazy(() => import("../../pages/student/StudentAttendanceScanPage.tsx"));

export const publicRoutes: AppRoute[] = [
  { path: "/login", element: LoginPage },
  { path: "/unauthorized", element: UnauthorizedPage },
  { path: "/calendar/:labRoomId", element: CalendarTabletPage },
];

export const sharedRoutes: AppRoute[] = [
];

export const studentRoutes: AppRoute[] = [
  { path: "/student", element: StudentLandingPage, roles: [Role.Student] },
  { path: "/student/profile", element: StudentProfilePage, roles: [Role.Student] },
  { path: "/student/scan-attendance/:scheduleId", element: StudentAttendanceScanPage, roles: [Role.Student] },
]

export const lecturerRoutes: AppRoute[] = [
  { path: "/profile", element: ProfilePage, roles: [Role.Lecturer] },
  { path: "/", element: HomePage, roles: [Role.Lecturer] },
  { path: "/buildings/:id", element: BuildingDetail, roles: [Role.Lecturer] },
  { path: "/my-bookings", element: BookingHistoryPage, roles: [Role.Lecturer] },
  { path: "/book-room", element: RoomBookingPage, roles: [Role.Lecturer] },
  { path: "/attendance", element: AttendanceManagementPage, roles: [Role.Lecturer] },
  { path: "/attendance/manual/:sessionId", element: ManualAttendancePage, roles: [Role.Lecturer] },
  { path: "/qr-display/:sessionId", element: QRDisplayPage, roles: [Role.Lecturer] },
  { path: "/student-groups", element: StudentGroupsPage, roles: [Role.Lecturer] },
  { path: "/student-groups/:groupId", element: GroupOverviewPage, roles: [Role.Lecturer] },
  { path: "/notifications", element: NotificationsPage, roles: [Role.Lecturer] },
];

export const managerRoutes: AppRoute[] = [
  { path: "/labmanager/dashboard", element: ManagerDashboard, roles: [Role.Manager] },
  { path: "/labmanager/lab-scheduler", element: LabSchedulerPage, roles: [Role.Manager] },
  { path: "/labmanager/booking-requests/pending", element: BookingRequestsPendingPage, roles: [Role.Manager] },
  { path: "/labmanager/booking-requests/history", element: BookingRequestsHistoryPage, roles: [Role.Manager] },
  { path: "/labmanager/booking-requests/import", element: ImportBookingPage, roles: [Role.Manager] },
  { path: "/labmanager/users/import", element: ImportUserPage, roles: [Role.Manager] },
  { path: "/labmanager/groups/import", element: ImportGroupPage, roles: [Role.Manager] },
  { path: "/labmanager/user-profile", element: UserProfilePage, roles: [Role.Manager] },
  { path: "/labmanager/reports", element: ReportListPage, roles: [Role.Manager, Role.Admin] },
  { path: "/labmanager/reports/:id", element: ReportDetailPage, roles: [Role.Manager, Role.Admin] },
  { path: "/labmanager/incident-history", element: IncidentHistoryPage, roles: [Role.Manager, Role.Admin] },
  { path: "/labmanager/room-management", element: RoomManagementPage, roles: [Role.Admin, Role.Manager] },
  { path: "/labmanager/slot-management", element: ScheduleManagementPage, roles: [Role.Admin] }
];

export const adminRoutes = [
  { path: "/admin/users/import", element: ImportUserPage, roles: [Role.Admin] },
];