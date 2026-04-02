import axiosInstance from "../../../api/axios";
import type {
  GetBookingRequestsRequest,
  GetBookingRequestsResponse,
  GetBookingHistoryRequest,
  GetBookingHistoryResponse,
  GetBookingByIdResponse,
  GetBookingByScheduleIdResponse,
  UpdateBookingStatusRequest,
  UpdateBookingStatusResponse,
} from "../types/bookingRequest.type";

const BOOKING_REQUEST_API = {
  LIST: "/bookings/get-unchecked-booking-request",
  HISTORY: "/booking-requests/history",
  BY_ID: (id: string) => `/booking-requests/${id}`,
  BY_SCHEDULE: (scheduleId: string) =>
    `/booking-requests/by-schedule/${scheduleId}`,
  UPDATE_STATUS: (id: string) => `/booking-requests/${id}/status`,
  STATUS_LOOKUP: "/booking-requests/status",
};

/** Pending booking requests
 * Có thể lọc theo room bằng params.labRoomId
 */
export const getBookingRequests = async (
  params: GetBookingRequestsRequest = {},
): Promise<GetBookingRequestsResponse> => {
  const response = await axiosInstance.get<GetBookingRequestsResponse>(
    BOOKING_REQUEST_API.LIST,
    { params },
  );
  return response.data;
};

/** Booking history
 * Có thể lọc theo room bằng params.labRoomId
 */
export const getBookingRequestHistory = async (
  params: GetBookingHistoryRequest = {},
): Promise<GetBookingHistoryResponse> => {
  const response = await axiosInstance.get<GetBookingHistoryResponse>(
    BOOKING_REQUEST_API.HISTORY,
    { params },
  );
  return response.data;
};

/** Get booking by booking id */
export const getBookingRequestById = async (
  id: string,
): Promise<GetBookingByIdResponse> => {
  const response = await axiosInstance.get<GetBookingByIdResponse>(
    BOOKING_REQUEST_API.BY_ID(id),
  );
  return response.data;
};

/** Get booking by scheduleId */
export const getBookingRequestByScheduleId = async (
  scheduleId: string,
): Promise<GetBookingByScheduleIdResponse> => {
  const response = await axiosInstance.get<GetBookingByScheduleIdResponse>(
    BOOKING_REQUEST_API.BY_SCHEDULE(scheduleId),
  );
  return response.data;
};

/** Update booking status */
export const updateBookingRequestStatus = async (
  id: string,
  body: UpdateBookingStatusRequest,
): Promise<UpdateBookingStatusResponse> => {
  const response = await axiosInstance.patch<UpdateBookingStatusResponse>(
    BOOKING_REQUEST_API.UPDATE_STATUS(id),
    body,
  );
  return response.data;
};
