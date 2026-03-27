import { axiosInstance } from "../../../api";
import type { PagedResponse } from "../../../types/pagination.types";
import type { BookingDto, CreateBookingCommand, CreateBookingResponse, GetBookingHistoryRequest, GetBookingHistoryResponse, GetBookingsParams, GetBookingStatsRequest, GetBookingStatsResponse, GetRecentRequestsRequest, GetRecentRequestsResponse, GetUpcomingBookingsRequest, GetUpcomingBookingsResponse, PurposeTypeDto } from "../types/booking.type";

const BOOKING_API = {
  BOOKS: '/bookings',
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

  /**
  * tạo booking
  */
  createBooking: (command: CreateBookingCommand) =>
    axiosInstance
      .post<CreateBookingResponse>(BOOKING_API.BOOKS, command)
      .then(response => response.data),

  /**
  * Lấy Purposes cho Booking
  */
  getPurposes: () =>
    axiosInstance
      .get<PagedResponse<PurposeTypeDto>>('/Bookings/purposes',)
      .then(response => response.data),
}


