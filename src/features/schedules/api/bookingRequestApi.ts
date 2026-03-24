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
} from "../type";

/**
 * ===== DATA ACCESS LAYER =====
 * Rules:
 * - Chỉ dùng axiosInstance
 * - Phải định nghĩa TypeScript Interface cho cả Request và Response
 * - Không được catch error (để UI hoặc React Query xử lý)
 */

const BOOKING_REQUEST_API = {
  LIST: "/booking-requests", // GET ?status=PENDING...
  HISTORY: "/booking-requests/history", // GET
  BY_ID: (id: string) => `/booking-requests/${id}`, // GET
  BY_SCHEDULE: (scheduleId: string) =>
    `/booking-requests/by-schedule/${scheduleId}`, // GET
  UPDATE_STATUS: (id: string) => `/booking-requests/${id}/status`, // PATCH { status }
};

/** List booking requests (lọc theo status PENDING/APPROVED/REJECTED nếu backend hỗ trợ) */
export const getBookingRequests = async (
  params: GetBookingRequestsRequest = {},
): Promise<GetBookingRequestsResponse> => {
  const response = await axiosInstance.get<GetBookingRequestsResponse>(
    BOOKING_REQUEST_API.LIST,
    { params },
  );
  return response.data;
};

/** History (thường APPROVED + REJECTED) */
export const getBookingRequestHistory = async (
  params: GetBookingHistoryRequest = {},
): Promise<GetBookingHistoryResponse> => {
  const response = await axiosInstance.get<GetBookingHistoryResponse>(
    BOOKING_REQUEST_API.HISTORY,
    { params },
  );
  return response.data;
};

/** Get by booking id */
export const getBookingRequestById = async (
  id: string,
): Promise<GetBookingByIdResponse> => {
  const response = await axiosInstance.get<GetBookingByIdResponse>(
    BOOKING_REQUEST_API.BY_ID(id),
  );
  return response.data;
};

/** Get booking by scheduleId (cho modal click schedule) */
export const getBookingRequestByScheduleId = async (
  scheduleId: string,
): Promise<GetBookingByScheduleIdResponse> => {
  const response = await axiosInstance.get<GetBookingByScheduleIdResponse>(
    BOOKING_REQUEST_API.BY_SCHEDULE(scheduleId),
  );
  return response.data;
};

/** Update status (approve/reject) */
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
