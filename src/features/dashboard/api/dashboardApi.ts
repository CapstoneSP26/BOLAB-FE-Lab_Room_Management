import axiosInstance from "../../../api/axios";
import { getRole } from "../../../utils/role";
import type {
  DashboardRoleScope,
  DashboardStatsDto,
  IncidentDto,
  LecturerBookingRequestStat,
  PendingRequestDto,
  RoomBookingStat,
  UserProfileDto,
} from "../types/dashboard.type";

type MaybeRecord = Record<string, unknown>;

const DASHBOARD_API = {
  OVERVIEW: "/dashboard/overview",
  LEGACY_STATS: "/dashboard/stats",
  PENDING_REQUESTS: "/dashboard/pending-requests",
  UNRESOLVED_INCIDENTS: "/incidents/unresolved",
  USER_PROFILE: "/users/me",
} as const;

const asRecord = (value: unknown): MaybeRecord =>
  value && typeof value === "object" ? (value as MaybeRecord) : {};

const unwrapData = (value: unknown): unknown => {
  const record = asRecord(value);

  if ("data" in record && record.data !== undefined) {
    return unwrapData(record.data);
  }

  return value;
};

const toStringValue = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }

  return "";
};

const toNumberValue = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const toArrayValue = (value: unknown) => (Array.isArray(value) ? value : []);

const toRoleScope = (value: unknown): DashboardRoleScope => {
  const normalized = String(value ?? "").trim().toUpperCase();

  if (normalized === "ADMIN") {
    return "ADMIN";
  }

  return "LAB_MANAGER";
};

const toPercentage = (value: unknown, fallback = 0) => {
  const numericValue = toNumberValue(value, fallback);
  return Math.max(0, Math.min(100, numericValue));
};

const mapLecturerBookingRequestStat = (
  item: unknown,
): LecturerBookingRequestStat => {
  const record = asRecord(item);

  return {
    lecturerId: toStringValue(
      record.lecturerId,
      record.LecturerId,
      record.userId,
      record.UserId,
      record.id,
      record.Id,
    ),
    lecturerName: toStringValue(
      record.lecturerName,
      record.LecturerName,
      record.fullName,
      record.FullName,
      record.name,
      record.Name,
    ),
    lecturerEmail: toStringValue(
      record.lecturerEmail,
      record.LecturerEmail,
      record.email,
      record.Email,
    ),
    bookingRequestCount: toNumberValue(
      record.bookingRequestCount ??
        record.BookingRequestCount ??
        record.requestCount ??
        record.RequestCount ??
        record.totalBookings ??
        record.TotalBookings,
    ),
    approvedBookingCount: toNumberValue(
      record.approvedBookingCount ?? record.ApprovedBookingCount,
    ),
    roomCount: toNumberValue(record.roomCount ?? record.RoomCount),
    latestRequestAt: toStringValue(
      record.latestRequestAt,
      record.LatestRequestAt,
      record.lastRequestedAt,
      record.LastRequestedAt,
    ),
  };
};

const mapRoomBookingStat = (item: unknown): RoomBookingStat => {
  const record = asRecord(item);

  return {
    roomId: toStringValue(record.roomId, record.RoomId, record.id, record.Id),
    roomName: toStringValue(
      record.roomName,
      record.RoomName,
      record.labRoomName,
      record.LabRoomName,
      record.name,
      record.Name,
    ),
    buildingName: toStringValue(record.buildingName, record.BuildingName),
    bookingCount: toNumberValue(
      record.bookingCount ??
        record.BookingCount ??
        record.totalBookings ??
        record.TotalBookings,
    ),
    approvedBookingCount: toNumberValue(
      record.approvedBookingCount ?? record.ApprovedBookingCount,
    ),
    incidentReportCount: toNumberValue(
      record.incidentReportCount ?? record.IncidentReportCount,
    ),
    utilizationRate: toPercentage(
      record.utilizationRate ?? record.UtilizationRate,
    ),
  };
};

const normalizeDashboardOverview = (
  raw: unknown,
  dataSource: "api" | "legacy",
): DashboardStatsDto => {
  const payload = unwrapData(raw);
  const record = asRecord(payload);
  const stats = asRecord(record.stats);
  const incidentStats = asRecord(
    record.incidentReportsInSchedules ??
      record.IncidentReportsInSchedules ??
      record.incidentStats ??
      record.IncidentStats,
  );
  const utilization = asRecord(
    record.labUtilization ??
      record.LabUtilization ??
      record.roomUtilization ??
      record.RoomUtilization,
  );

  const totalRooms = toNumberValue(
    record.totalRooms ?? record.TotalRooms ?? stats.totalRooms ?? stats.TotalRooms,
  );
  const availableRooms = toNumberValue(
    record.availableRooms ??
      record.AvailableRooms ??
      stats.availableRooms ??
      stats.AvailableRooms,
  );
  const approvedBookingsToday = toNumberValue(
    record.approvedBookingsToday ??
      record.ApprovedBookingsToday ??
      stats.approvedBookingsToday ??
      stats.ApprovedBookingsToday ??
      record.approvedBookingRequestsToday ??
      record.ApprovedBookingRequestsToday,
  );
  const checkedInBookingsToday = toNumberValue(
    record.checkedInBookingsToday ??
      record.CheckedInBookingsToday ??
      stats.checkedInBookingsToday ??
      stats.CheckedInBookingsToday,
  );

  const incidentReportsCount = toNumberValue(
    incidentStats.totalIncidentReports ??
      incidentStats.TotalIncidentReports ??
      record.totalIncidentReports ??
      record.TotalIncidentReports ??
      record.totalIncidents ??
      record.TotalIncidents,
  );
  const schedulesWithIncidents = toNumberValue(
    incidentStats.totalSchedulesWithIncidentReports ??
      incidentStats.TotalSchedulesWithIncidentReports ??
      record.totalSchedulesWithIncidentReports ??
      record.TotalSchedulesWithIncidentReports,
  );

  const lecturerBookingRequests = toArrayValue(
    record.lecturerBookingRequests ??
      record.LecturerBookingRequests ??
      record.lecturerStats ??
      record.LecturerStats ??
      record.bookingsByLecturer ??
      record.BookingsByLecturer,
  ).map(mapLecturerBookingRequestStat);

  const roomBookingStats = toArrayValue(
    record.roomBookingStats ??
      record.RoomBookingStats ??
      record.bookingsByRoom ??
      record.BookingsByRoom ??
      record.roomStats ??
      record.RoomStats,
  ).map(mapRoomBookingStat);

  const usedRooms = toNumberValue(
    utilization.usedRooms ??
      utilization.UsedRooms ??
      record.usedRooms ??
      record.UsedRooms,
    Math.max(totalRooms - availableRooms, 0),
  );
  const utilizationRate = toPercentage(
    utilization.utilizationRate ??
      utilization.UtilizationRate ??
      record.utilizationRate ??
      record.UtilizationRate,
    totalRooms > 0 ? (usedRooms / totalRooms) * 100 : 0,
  );

  return {
    totalBookings: toNumberValue(
      record.totalBookings ?? record.TotalBookings ?? stats.totalBookings ?? stats.TotalBookings,
    ),
    pendingBookings: toNumberValue(
      record.pendingBookings ?? record.PendingBookings ?? stats.pendingBookings ?? stats.PendingBookings,
    ),
    approvedBookings: toNumberValue(
      record.approvedBookings ?? record.ApprovedBookings ?? stats.approvedBookings ?? stats.ApprovedBookings,
    ),
    rejectedBookings: toNumberValue(
      record.rejectedBookings ?? record.RejectedBookings ?? stats.rejectedBookings ?? stats.RejectedBookings,
    ),
    totalIncidents: toNumberValue(
      record.totalIncidents ?? record.TotalIncidents ?? stats.totalIncidents ?? stats.TotalIncidents,
      incidentReportsCount,
    ),
    unresolvedIncidents: toNumberValue(
      record.unresolvedIncidents ??
        record.UnresolvedIncidents ??
        stats.unresolvedIncidents ??
        stats.UnresolvedIncidents,
    ),
    totalRooms,
    availableRooms,
    totalStudents: toNumberValue(
      record.totalStudents ?? record.TotalStudents ?? stats.totalStudents ?? stats.TotalStudents,
    ),
    totalLecturers: toNumberValue(
      record.totalLecturers ?? record.TotalLecturers ?? stats.totalLecturers ?? stats.TotalLecturers,
      lecturerBookingRequests.length,
    ),
    averageBookingDuration: toNumberValue(
      record.averageBookingDuration ??
        record.AverageBookingDuration ??
        stats.averageBookingDuration ??
        stats.AverageBookingDuration,
    ),
    mostBookedRoom: toStringValue(
      record.mostBookedRoom,
      record.MostBookedRoom,
      stats.mostBookedRoom,
      stats.MostBookedRoom,
    ),
    busiestHourOfDay: toNumberValue(
      record.busiestHourOfDay ??
        record.BusiestHourOfDay ??
        stats.busiestHourOfDay ??
        stats.BusiestHourOfDay,
    ),
    monthlyBookings: toArrayValue(
      record.monthlyBookings ?? record.MonthlyBookings ?? stats.monthlyBookings ?? stats.MonthlyBookings,
    ).map((item) => toNumberValue(item)),
    monthlyIncidents: toArrayValue(
      record.monthlyIncidents ?? record.MonthlyIncidents ?? stats.monthlyIncidents ?? stats.MonthlyIncidents,
    ).map((item) => toNumberValue(item)),
    approvedBookingsToday,
    checkedInBookingsToday,
    noCheckInBookingsToday: toNumberValue(
      record.noCheckInBookingsToday ??
        record.NoCheckInBookingsToday ??
        stats.noCheckInBookingsToday ??
        stats.NoCheckInBookingsToday,
      Math.max(approvedBookingsToday - checkedInBookingsToday, 0),
    ),
    checkInCompliancePercentage: toPercentage(
      record.checkInCompliancePercentage ??
        record.CheckInCompliancePercentage ??
        record.checkinCompliancePercentage ??
        stats.checkInCompliancePercentage ??
        stats.CheckInCompliancePercentage ??
        stats.checkinCompliancePercentage,
      approvedBookingsToday > 0
        ? (checkedInBookingsToday / approvedBookingsToday) * 100
        : 0,
    ),
    approvedBookingRequestsToday: toNumberValue(
      record.approvedBookingRequestsToday ??
        record.ApprovedBookingRequestsToday,
      approvedBookingsToday,
    ),
    lecturerBookingRequests,
    incidentReportsInSchedules: {
      totalIncidentReports: incidentReportsCount,
      totalSchedulesWithIncidentReports: schedulesWithIncidents,
    },
    labUtilization: {
      utilizationRate,
      usedRooms,
      totalRooms,
      usedSchedules: toNumberValue(
        utilization.usedSchedules ??
          utilization.UsedSchedules ??
          record.usedSchedules ??
          record.UsedSchedules,
      ),
      totalSchedules: toNumberValue(
        utilization.totalSchedules ??
          utilization.TotalSchedules ??
          record.totalSchedules ??
          record.TotalSchedules,
      ),
    },
    roomBookingStats,
    scope: toRoleScope(record.scope ?? record.Scope ?? getRole()),
    generatedAt: toStringValue(record.generatedAt, record.GeneratedAt),
    dataSource,
  };
};

export const getDashboardStats = async (): Promise<DashboardStatsDto> => {
  try {
    const overviewResponse = await axiosInstance.get(DASHBOARD_API.OVERVIEW);
    return normalizeDashboardOverview(overviewResponse.data, "api");
  } catch (overviewError) {
    try {
      const legacyResponse = await axiosInstance.get(DASHBOARD_API.LEGACY_STATS);
      return normalizeDashboardOverview(legacyResponse.data, "legacy");
    } catch (legacyError) {
      console.error("Failed to fetch dashboard overview:", {
        overviewError,
        legacyError,
      });
      throw legacyError;
    }
  }
};

export const getPendingRequests = async (): Promise<PendingRequestDto[]> => {
  const response = await axiosInstance.get<PendingRequestDto[]>(
    DASHBOARD_API.PENDING_REQUESTS,
  );
  return response.data || [];
};

export const getUnresolvedIncidents = async (): Promise<IncidentDto[]> => {
  const response = await axiosInstance.get<IncidentDto[]>(
    DASHBOARD_API.UNRESOLVED_INCIDENTS,
  );
  return response.data || [];
};

export const getUserProfile = async (): Promise<UserProfileDto> => {
  const response = await axiosInstance.get<UserProfileDto>(
    DASHBOARD_API.USER_PROFILE,
  );
  return response.data;
};
