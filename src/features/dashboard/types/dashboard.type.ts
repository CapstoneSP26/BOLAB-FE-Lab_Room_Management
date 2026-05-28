import type { Role } from "../../../utils/role";

export type DashboardRoleScope = Extract<Role, "ADMIN" | "LAB_MANAGER">;

export type TimeFilter = "1d" | "1w" | "4m" | "8m" | "1y";

export interface DateRange {
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string;   // ISO date string YYYY-MM-DD
}

export const TIME_FILTER_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: "1d", label: "1 Day" },
  { value: "1w", label: "1 Week" },
  { value: "4m", label: "4 Months" },
  { value: "8m", label: "8 Months" },
  { value: "1y", label: "1 Year" },
];

export function getDateRangeFromFilter(filter: TimeFilter): DateRange {
  const now = new Date();
  const end = now.toISOString().slice(0, 10);
  let start: Date;

  switch (filter) {
    case "1d":
      start = new Date(now);
      break;
    case "1w":
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      break;
    case "4m":
      start = new Date(now);
      start.setMonth(now.getMonth() - 4);
      break;
    case "8m":
      start = new Date(now);
      start.setMonth(now.getMonth() - 8);
      break;
    case "1y":
    default:
      start = new Date(now);
      start.setFullYear(now.getFullYear() - 1);
      break;
  }

  return { startDate: start.toISOString().slice(0, 10), endDate: end };
}

export interface LecturerBookingRequestStat {
  lecturerId: string;
  lecturerName: string;
  lecturerEmail?: string;
  bookingRequestCount: number;
  approvedBookingCount?: number;
  roomCount?: number;
  latestRequestAt?: string;
}

export interface IncidentReportsInSchedules {
  totalIncidentReports: number;
  totalSchedulesWithIncidentReports: number;
}

export interface LabUtilizationOverview {
  utilizationRate: number;
  usedRooms: number;
  totalRooms: number;
  usedSchedules?: number;
  totalSchedules?: number;
}

export interface RoomBookingStat {
  roomId: string;
  roomName: string;
  buildingName?: string;
  bookingCount: number;
  approvedBookingCount?: number;
  incidentReportCount?: number;
  utilizationRate?: number;
}

export interface DashboardStatsDto {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  rejectedBookings: number;
  totalIncidents: number;
  unresolvedIncidents: number;
  totalRooms: number;
  availableRooms: number;
  totalStudents: number;
  totalLecturers: number;
  averageBookingDuration: number;
  mostBookedRoom: string;
  busiestHourOfDay: number;
  monthlyBookings: number[];
  monthlyIncidents: number[];
  approvedBookingsToday: number;
  checkedInBookingsToday: number;
  noCheckInBookingsToday: number;
  checkInCompliancePercentage: number;
  approvedBookingRequestsToday: number;
  lecturerBookingRequests: LecturerBookingRequestStat[];
  incidentReportsInSchedules: IncidentReportsInSchedules;
  labUtilization: LabUtilizationOverview;
  roomBookingStats: RoomBookingStat[];
  scope: DashboardRoleScope;
  generatedAt?: string;
  dataSource: "api" | "legacy";
}

export interface PendingRequestDto {
  bookingId: string;
  labRoomName: string;
  buildingName: string;
  requesterName: string;
  requesterEmail: string;
  startTime: string;
  endTime: string;
  expectedStudents: number;
  purpose: string;
  requestedAt: string;
}

export interface IncidentDto {
  incidentId: string;
  labRoomName: string;
  description: string;
  isResolved: boolean;
  createdAt: string;
  createdByName: string;
  daysOpenCount: number;
}

export interface UserProfileDto {
  id: string;
  email: string;
  fullName: string;
  userCode: string;
  campusName: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
