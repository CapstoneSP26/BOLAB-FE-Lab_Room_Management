import type { Role } from "../../../utils/role";

export type DashboardRoleScope = Extract<Role, "ADMIN" | "LAB_MANAGER">;

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
