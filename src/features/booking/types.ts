// ===== DOMAIN MODELS =====

export interface Booking {
  id: string | number;
  roomId: string | number;
  roomName: string;
  buildingName: string;
  startTime: string;
  endTime: string;
  date: string;
  status: BookingStatus;
  purpose?: string;
  userName?: string;
  lecturerName?: string;
  scheduleType?: string;
  studentCount?: number;
  bookingSource?: 'AO_BOOK' | 'LECTURER_BOOK';
}

export type BookingStatus = 'All' | 'PendingApproval' | 'Approved' | 'Rejected' | 'Cancelled';
export type BookingStatusFilter = BookingStatus | 'all';

export interface BookingRequest {
  id: string | number;
  roomId: string | number;
  roomName: string;
  buildingName: string;
  requestedBy: string;
  requestedAt: string;
  startTime: string;
  endTime: string;
  date: string;
  status: RequestStatus;
  purpose?: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface BookingStats {
  totalAccepted: number;
  totalPending: number;
  totalRejected: number;
  upcomingBookings: number;
}

// ===== API REQUEST TYPES =====

export interface GetUpcomingBookingsRequest {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface GetBookingStatsRequest {
  startDate?: string;
  endDate?: string;
}

export interface GetRecentRequestsRequest {
  page?: number;
  limit?: number;
}

export interface GetBookingHistoryRequest {
  page?: number;
  limit?: number;
  status?: BookingStatusFilter;
  startDate?: string;
  endDate?: string;
}

// ===== API RESPONSE TYPES =====

export interface GetUpcomingBookingsResponse {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
}

export interface GetBookingStatsResponse {
  data: BookingStats;
}

export interface GetRecentRequestsResponse {
  data: BookingRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface GetBookingHistoryResponse {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
}
