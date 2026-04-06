import axiosInstance from '../../../api/axios';

export interface MonthlyDataPointDto {
  month: number; // 1..12
  label: string; // January..December
  value: number;
}

export interface DashboardStatisticsDto {
  monthlyIncidents: MonthlyDataPointDto[];
  monthlyApprovedBookings: MonthlyDataPointDto[];
  monthlyPendingBookings: MonthlyDataPointDto[];
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
  year: number;
  monthlyBookings: MonthlyDataPointDto[];
  statistics: DashboardStatisticsDto;
  approvedBookingsToday: number;
  checkedInBookingsToday: number;
  noCheckInBookingsToday: number;
  checkInCompliancePercentage: number; // Check-in compliance percentage for today
}

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const normalizeMonthSeries = (series: unknown): MonthlyDataPointDto[] => {
  if (!Array.isArray(series)) {
    return MONTH_LABELS.map((label, index) => ({
      month: index + 1,
      label,
      value: 0,
    }));
  }

  if (series.length > 0 && typeof series[0] === 'number') {
    return MONTH_LABELS.map((label, index) => ({
      month: index + 1,
      label,
      value: Number(series[index] ?? 0),
    }));
  }

  const mapped = (series as MonthlyDataPointDto[])
    .map((point, index) => ({
      month: Number(point?.month ?? index + 1),
      label: point?.label ?? MONTH_LABELS[index] ?? `Month ${index + 1}`,
      value: Number(point?.value ?? 0),
    }))
    .sort((a, b) => a.month - b.month);

  return MONTH_LABELS.map((label, index) => {
    const month = index + 1;
    const point = mapped.find((item) => item.month === month);

    return {
      month,
      label: point?.label ?? label,
      value: Number(point?.value ?? 0),
    };
  });
};

const normalizeStatistics = (statistics: unknown): DashboardStatisticsDto => {
  const source = (statistics as Partial<DashboardStatisticsDto>) ?? {};

  return {
    monthlyIncidents: normalizeMonthSeries(source.monthlyIncidents),
    monthlyApprovedBookings: normalizeMonthSeries(source.monthlyApprovedBookings),
    monthlyPendingBookings: normalizeMonthSeries(source.monthlyPendingBookings),
  };
};

const normalizeDashboardStats = (stats: Partial<DashboardStatsDto>): DashboardStatsDto => {
  const approvedBookingsToday = stats.approvedBookingsToday ?? 0;
  const checkedInBookingsToday = stats.checkedInBookingsToday ?? 0;

  return {
    totalBookings: stats.totalBookings ?? 0,
    pendingBookings: stats.pendingBookings ?? 0,
    approvedBookings: stats.approvedBookings ?? 0,
    rejectedBookings: stats.rejectedBookings ?? 0,
    totalIncidents: stats.totalIncidents ?? 0,
    unresolvedIncidents: stats.unresolvedIncidents ?? 0,
    totalRooms: stats.totalRooms ?? 0,
    availableRooms: stats.availableRooms ?? 0,
    totalStudents: stats.totalStudents ?? 0,
    totalLecturers: stats.totalLecturers ?? 0,
    averageBookingDuration: stats.averageBookingDuration ?? 0,
    mostBookedRoom: stats.mostBookedRoom ?? '-',
    busiestHourOfDay: stats.busiestHourOfDay ?? 0,
    year: stats.year ?? new Date().getFullYear(),
    monthlyBookings: normalizeMonthSeries(stats.monthlyBookings),
    statistics: normalizeStatistics(stats.statistics),
    approvedBookingsToday,
    checkedInBookingsToday,
    noCheckInBookingsToday:
      stats.noCheckInBookingsToday ??
      Math.max(approvedBookingsToday - checkedInBookingsToday, 0),
    checkInCompliancePercentage:
      stats.checkInCompliancePercentage ??
      // backward compatibility for old typo casing if any
      (stats as DashboardStatsDto & { checkinCompliancePercentage?: number })
        .checkinCompliancePercentage ??
      0,
  };
};

export const getDashboardStats = async (): Promise<DashboardStatsDto> => {
  try {
    const response = await axiosInstance.get<Partial<DashboardStatsDto>>(
      '/dashboard/stats',
    );

    return normalizeDashboardStats(response.data ?? {});
  } catch (error) {
    console.error('Failed to fetch dashboard stats from API:', error);
    throw error;
  }
};

export interface MonthlyBookingsResponseDto {
  year: number;
  monthlyBookings: MonthlyDataPointDto[];
}

export const getMonthlyBookings = async (): Promise<MonthlyBookingsResponseDto> => {
  try {
    const response = await axiosInstance.get<MonthlyBookingsResponseDto>(
      '/dashboard/monthly-bookings',
    );

    return {
      year: response.data?.year ?? new Date().getFullYear(),
      monthlyBookings: normalizeMonthSeries(response.data?.monthlyBookings),
    };
  } catch (error) {
    console.error('Failed to fetch monthly bookings from API:', error);
    throw error;
  }
};

export interface DashboardStatisticsResponseDto {
  year: number;
  statistics: DashboardStatisticsDto;
}

export const getDashboardStatistics = async (): Promise<DashboardStatisticsResponseDto> => {
  try {
    const response = await axiosInstance.get<DashboardStatisticsResponseDto>(
      '/dashboard/statistics',
    );

    return {
      year: response.data?.year ?? new Date().getFullYear(),
      statistics: normalizeStatistics(response.data?.statistics),
    };
  } catch (error) {
    console.error('Failed to fetch dashboard statistics from API:', error);
    throw error;
  }
};

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

export const getPendingRequests = async (): Promise<PendingRequestDto[]> => {
  try {
    const response = await axiosInstance.get<PendingRequestDto[]>(
      '/dashboard/pending-requests',
    );
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch pending requests from API:', error);
    throw error;
  }
};

export interface IncidentDto {
  incidentId: string;
  labRoomName: string;
  description: string;
  isResolved: boolean;
  createdAt: string;
  createdByName: string;
  daysOpenCount: number;
}

export const getUnresolvedIncidents = async (): Promise<IncidentDto[]> => {
  try {
    const response = await axiosInstance.get<IncidentDto[]>(
      '/incidents/unresolved',
    );
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch incidents from API:', error);
    throw error;
  }
};

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

export const getUserProfile = async (): Promise<UserProfileDto> => {
  try {
    const response = await axiosInstance.get<UserProfileDto>('/users/me');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user profile from API:', error);
    throw error;
  }
};
