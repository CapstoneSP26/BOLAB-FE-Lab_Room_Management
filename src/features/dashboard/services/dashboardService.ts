import axiosInstance from '../../../api/axios';

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
  monthlyBookings: number[]; // 12 months of booking data
  monthlyIncidents: number[]; // 12 months of incident data
  approvedBookingsToday: number;
  checkedInBookingsToday: number;
  noCheckInBookingsToday: number;
  checkInCompliancePercentage: number; // Check-in compliance percentage for today
}

export const getDashboardStats = async (): Promise<DashboardStatsDto> => {
  try {
    const response = await axiosInstance.get<
      DashboardStatsDto & { checkinCompliancePercentage?: number }
    >(
      '/dashboard/stats'
    );
    const stats = response.data;
    const approvedBookingsToday = stats.approvedBookingsToday ?? 0;
    const checkedInBookingsToday = stats.checkedInBookingsToday ?? 0;
    const noCheckInBookingsToday =
      stats.noCheckInBookingsToday ??
      Math.max(approvedBookingsToday - checkedInBookingsToday, 0);
    const checkInCompliancePercentage =
      stats.checkInCompliancePercentage ?? stats.checkinCompliancePercentage ?? 0;

    return {
      ...stats,
      approvedBookingsToday,
      checkedInBookingsToday,
      noCheckInBookingsToday,
      checkInCompliancePercentage,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats from API:', error);
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

export const getPendingRequests = async (
): Promise<PendingRequestDto[]> => {
  try {
    const response = await axiosInstance.get<PendingRequestDto[]>(
      '/dashboard/pending-requests'
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
      '/incidents/unresolved'
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
    const response = await axiosInstance.get<UserProfileDto>(
      '/users/me'
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user profile from API:', error);
    throw error;
  }
};
