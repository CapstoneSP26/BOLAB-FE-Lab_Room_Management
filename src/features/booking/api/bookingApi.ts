import { axiosInstance } from "../../../api";
import type { PagedResponse } from "../../../types/pagination.types";
import type {
  BookingDto,
  CreateBookingCommand,
  CreateBookingResponse,
  GetBookingHistoryRequest,
  GetBookingHistoryResponse,
  GetBookingsParams,
  GetBookingStatsRequest,
  GetBookingStatsResponse,
  GetRecentRequestsRequest,
  GetRecentRequestsResponse,
  GetUpcomingBookingsRequest,
  GetUpcomingBookingsResponse,
  PurposeTypeDto,
  GetBookingRequestsResponse,
  GetBookingRequestsRequest,
  GetBookingByIdResponse,
  GetBookingByScheduleIdResponse,
  UpdateBookingStatusRequest,
  UpdateBookingStatusResponse,
  GetBookingStatusLookupResponse,
} from "../types/booking.type";

const BOOKING_API = {
  BOOKS: "/bookings",
  BOOKING_ATTENDANCE: "/bookings/booking-attendance",
  UPCOMING: "/bookings/upcoming",
  STATS: "/bookings/stats",
  RECENT_REQUESTS: "/booking-requests/recent",
  HISTORY: "/bookings/history",
  PURPOSE: "/bookings/purposes",
};

const BOOKING_REQUEST_API = {
  LIST: "/bookings/get-unchecked-booking-request",
  HISTORY: "/booking-requests/history",
  BY_ID: (id: string) => `/booking-requests/${id}`,
  BY_SCHEDULE: (scheduleId: string) =>
    `/booking-requests/by-schedule/${scheduleId}`,
  UPDATE_STATUS: (id: string) => `/booking-requests/${id}/status`,
  STATUS_LOOKUP: "/booking-requests/status",
};

export const bookingApi = {
  getBookings: (params: GetBookingsParams) =>
    axiosInstance
      .get<PagedResponse<BookingDto>>(BOOKING_API.BOOKS, {
        params,
      })
      .then((res) => res.data),

  getBookingAttendance: (params: GetBookingsParams) =>
    axiosInstance.get<PagedResponse<BookingDto>>(
      BOOKING_API.BOOKING_ATTENDANCE,
      {
        params,
      },
    ),

  /**
   * Lấy danh sách lịch booking sắp tới
   */
  getUpcomingBookings: (params: GetUpcomingBookingsRequest) =>
    axiosInstance
      .get<GetUpcomingBookingsResponse>(BOOKING_API.UPCOMING, {
        params,
      })
      .then((res) => res.data),

  /**
   * Lấy thống kê booking requests
   */
  getBookingStats: (params: GetBookingStatsRequest) =>
    axiosInstance
      .get<GetBookingStatsResponse>(BOOKING_API.STATS, {
        params,
      })
      .then((res) => res.data),

  /**
   * Lấy danh sách booking requests gần đây
   */
  getRecentRequests: (params: GetRecentRequestsRequest) =>
    axiosInstance
      .get<GetRecentRequestsResponse>(BOOKING_API.RECENT_REQUESTS, {
        params,
      })
      .then((res) => res.data),

  /**
   * Lấy lịch sử booking của user
   */
  getBookingHistory: (params: GetBookingHistoryRequest) =>
    axiosInstance
      .get<GetBookingHistoryResponse>(BOOKING_API.HISTORY, {
        params,
      })
      .then((res) => res.data),

  /**
   * tạo booking
   */
  createBooking: (command: CreateBookingCommand) =>
    axiosInstance
      .post<CreateBookingResponse>(BOOKING_API.BOOKS, command)
      .then((response) => response.data),

  /**
   * Lấy Purposes cho Booking
   */
  getPurposes: () =>
    axiosInstance
      .get<PagedResponse<PurposeTypeDto>>(BOOKING_API.PURPOSE)
      .then((response) => response.data),
};

export const bookingRequestApi = {
  getBookingRequests: (params: GetBookingRequestsRequest = {}) =>
    axiosInstance
      .get<GetBookingRequestsResponse>(BOOKING_REQUEST_API.LIST, { params })
      .then((res) => res.data),

  getBookingHistory: (params: GetBookingRequestsRequest = {}) =>
    axiosInstance
      .get<GetBookingRequestsResponse>(BOOKING_REQUEST_API.HISTORY, {
        params,
      })
      .then((res) => res.data),

  getBookingById: (id: string) =>
    axiosInstance
      .get<GetBookingByIdResponse>(BOOKING_REQUEST_API.BY_ID(id))
      .then((res) => res.data),

  getBookingByScheduleId: (scheduleId: string) =>
    axiosInstance
      .get<GetBookingByScheduleIdResponse>(
        BOOKING_REQUEST_API.BY_SCHEDULE(scheduleId),
      )
      .then((res) => res.data),

  updateBookingStatus: (id: string, body: UpdateBookingStatusRequest) =>
    axiosInstance
      .patch<UpdateBookingStatusResponse>(
        BOOKING_REQUEST_API.UPDATE_STATUS(id),
        body,
      )
      .then((res) => res.data),
  getBookingStatusLookup: () =>
    axiosInstance
      .get<GetBookingStatusLookupResponse>(BOOKING_REQUEST_API.STATUS_LOOKUP)
      .then((res) => res.data),
};
