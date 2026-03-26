import { axiosInstance } from "../../../api";
import type { PagedResponse } from "../../../types/pagination.types";
import type { BookingDto, GetBookingHistoryRequest, GetBookingHistoryResponse, GetBookingsParams, GetBookingStatsRequest, GetBookingStatsResponse, GetRecentRequestsRequest, GetRecentRequestsResponse, GetUpcomingBookingsRequest, GetUpcomingBookingsResponse } from "../types/booking.type";

const BOOKING_API = {
  BOOKS: '/bookings',
  BOOKING_ATTENDANCE: '/bookings/booking-attendance',
  UPCOMING: '/bookings/upcoming',
  STATS: '/bookings/stats',
  RECENT_REQUESTS: '/booking-requests/recent',
  HISTORY: '/bookings/history',
};

export const bookingApi = {
  getBookings: (params: GetBookingsParams) =>
    axiosInstance.get<PagedResponse<BookingDto>>(BOOKING_API.BOOKS, {
      params,
    }),

  getBookingAttendance: (params: GetBookingsParams) =>
    axiosInstance.get<PagedResponse<BookingDto>>(BOOKING_API.BOOKING_ATTENDANCE, {
      params,
    }),

  /**
   * Lấy danh sách lịch booking sắp tới
   */
  getUpcomingBookings: (params: GetUpcomingBookingsRequest) =>
    axiosInstance.get<GetUpcomingBookingsResponse>(BOOKING_API.UPCOMING, {
      params,
    }).then(res => res.data),

  /**
  * Lấy thống kê booking requests
  */
  getBookingStats: (params: GetBookingStatsRequest) =>
    axiosInstance.get<GetBookingStatsResponse>(BOOKING_API.STATS, {
      params,
    }).then(res => res.data),

  /**
  * Lấy danh sách booking requests gần đây
  */
  getRecentRequests: (params: GetRecentRequestsRequest) =>
    axiosInstance.get<GetRecentRequestsResponse>(BOOKING_API.RECENT_REQUESTS, {
      params,
    }).then(res => res.data),

  /**
  * Lấy lịch sử booking của user
  */
  getBookingHistory: (params: GetBookingHistoryRequest) =>
    axiosInstance.get<GetBookingHistoryResponse>(BOOKING_API.HISTORY, {
      params,
    }).then(res => res.data),
}


