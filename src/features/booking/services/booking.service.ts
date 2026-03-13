import axiosInstance from '../../../api/axios';
import type {
  GetUpcomingBookingsRequest,
  GetUpcomingBookingsResponse,
  GetBookingStatsRequest,
  GetBookingStatsResponse,
  GetRecentRequestsRequest,
  GetRecentRequestsResponse,
  GetBookingHistoryRequest,
  GetBookingHistoryResponse,
} from '../types';

/**
 * ===== DATA ACCESS LAYER =====
 * Rules:
 * - Chỉ dùng axiosInstance
 * - Phải định nghĩa TypeScript Interface cho cả Request và Response
 * - Không được catch error (để UI hoặc React Query xử lý)
 */

const BOOKING_API = {
  UPCOMING: '/api/bookings/upcoming',
  STATS: '/api/bookings/stats',
  RECENT_REQUESTS: '/api/booking-requests/recent',
  HISTORY: '/api/bookings/history',
};

/**
 * Lấy danh sách lịch booking sắp tới
 */
export const getUpcomingBookings = async (
  params: GetUpcomingBookingsRequest = {}
): Promise<GetUpcomingBookingsResponse> => {
  const response = await axiosInstance.get<GetUpcomingBookingsResponse>(
    BOOKING_API.UPCOMING,
    { params }
  );
  return response.data;
};

/**
 * Lấy thống kê booking requests
 */
export const getBookingStats = async (
  params: GetBookingStatsRequest = {}
): Promise<GetBookingStatsResponse> => {
  const response = await axiosInstance.get<GetBookingStatsResponse>(
    BOOKING_API.STATS,
    { params }
  );
  return response.data;
};

/**
 * Lấy danh sách booking requests gần đây
 */
export const getRecentRequests = async (
  params: GetRecentRequestsRequest = {}
): Promise<GetRecentRequestsResponse> => {
  const response = await axiosInstance.get<GetRecentRequestsResponse>(
    BOOKING_API.RECENT_REQUESTS,
    { params }
  );
  return response.data;
};

/**
 * Lấy lịch sử booking của user
 */
export const getBookingHistory = async (
  params: GetBookingHistoryRequest = {}
): Promise<GetBookingHistoryResponse> => {
  const response = await axiosInstance.get<GetBookingHistoryResponse>(
    BOOKING_API.HISTORY,
    { params }
  );
  return response.data;
};
