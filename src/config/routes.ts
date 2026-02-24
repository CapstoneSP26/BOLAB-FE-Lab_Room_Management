import { lazy, type LazyExoticComponent } from "react";

export type LayoutKey = "auth" | "labmanager";

export interface AppRoute {
  path: string;
  element: LazyExoticComponent<React.ComponentType>;
  isPrivate: boolean;
  layout: LayoutKey;
}

const LoginPage = lazy(() => import("../pages/LoginPage.tsx"));
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
    path: "/login",
    element: LoginPage,
    isPrivate: false,
    layout: "auth",
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
