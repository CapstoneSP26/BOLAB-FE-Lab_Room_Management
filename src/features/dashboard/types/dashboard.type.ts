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
  const pad = (n: number) => n.toString().padStart(2, "0");
  const getLocalDateString = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const year = now.getFullYear();
  const month = now.getMonth();

  // 0 = Jan-Apr (Term 1), 1 = May-Aug (Term 2), 2 = Sep-Dec (Term 3)
  let currentTermIndex = 0;
  if (month >= 4 && month <= 7) currentTermIndex = 1;
  else if (month >= 8) currentTermIndex = 2;

  const termStarts = ["01-01", "05-01", "09-01"];
  const termEnds = ["05-01", "09-01", "01-01"];

  let startDate = "";
  let endDate = "";

  switch (filter) {
    case "1d": {
      startDate = getLocalDateString(now);
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      endDate = getLocalDateString(tomorrow);
      break;
    }
    case "1w": {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      startDate = getLocalDateString(start);
      endDate = getLocalDateString(now);
      break;
    }
    case "4m":
    case "8m":
    case "1y": {
      let numTerms = 1;
      if (filter === "8m") numTerms = 2;
      if (filter === "1y") numTerms = 3;

      const startTermIndex = currentTermIndex - (numTerms - 1);

      let startYear = year;
      let normalizedStartTerm = startTermIndex;
      while (normalizedStartTerm < 0) {
        startYear--;
        normalizedStartTerm += 3;
      }

      startDate = `${startYear}-${termStarts[normalizedStartTerm]}`;
      
      let endYear = year;
      // Kỳ 3 (index 2) kết thúc vào 1/1 năm sau
      if (currentTermIndex === 2) {
        endYear = year + 1;
      }
      endDate = `${endYear}-${termEnds[currentTermIndex]}`;
      break;
    }
  }

  return { startDate, endDate };
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
