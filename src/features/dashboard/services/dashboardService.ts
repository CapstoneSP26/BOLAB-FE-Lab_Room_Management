import axiosInstance from '../../../api/axios';
import { 
  mockDashboardStats, 
  mockPendingRequests, 
  mockIncidents, 
  mockUserProfile,
  mockDelay 
} from '../mocks/dashboardMocks';

// Check if mock data should be used
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'false';

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
  checkinCompliancePercentage: number; // Check-in compliance percentage for today
}

export const getDashboardStats = async (): Promise<DashboardStatsDto> => {
  // If mock mode is enabled, return mock data immediately
  if (USE_MOCK_DATA) {
    console.log('[MOCK MODE] Returning mock dashboard stats');
    await mockDelay();
    return mockDashboardStats;
  }

  try {
    console.log('[API MODE] Fetching dashboard stats from API...');
    const response = await axiosInstance.get<DashboardStatsDto>(
      '/dashboard/stats'
    );
    return response.data;
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
  if (USE_MOCK_DATA) {
    console.log('[MOCK MODE] Returning mock pending requests');
    await mockDelay();
    return mockPendingRequests;
  }

  try {
    console.log('[API MODE] Fetching pending requests from API...');
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
  if (USE_MOCK_DATA) {
    console.log('[MOCK MODE] Returning mock unresolved incidents');
    await mockDelay();
    return mockIncidents;
  }

  try {
    console.log('[API MODE] Fetching unresolved incidents from API...');
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
  if (USE_MOCK_DATA) {
    console.log('[MOCK MODE] Returning mock user profile');
    await mockDelay();
    return mockUserProfile;
  }

  try {
    console.log('[API MODE] Fetching user profile from API...');
    const response = await axiosInstance.get<UserProfileDto>(
      '/users/me'
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user profile from API:', error);
    throw error;
  }
};
