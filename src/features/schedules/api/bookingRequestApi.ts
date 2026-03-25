import axiosInstance from "../../../api/axios";
import type {
  BuildingOption,
  RoomOption,
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
  LIST: "/bookings",
  HISTORY: "/booking-requests/history",
  BY_ID: (id: string) => `/booking-requests/${id}`,
  BY_SCHEDULE: (scheduleId: string) =>
    `/booking-requests/by-schedule/${scheduleId}`,
  UPDATE_STATUS: (id: string) => `/booking-requests/${id}/status`,
};

const BOOKING_LOOKUP_API = {
  BUILDINGS: "/buildings",
  LAB_ROOMS: "/lab-rooms",
};

/** Pending booking requests */
export const getBookingRequests = async (
  params: GetBookingRequestsRequest = {},
): Promise<GetBookingRequestsResponse> => {
  const response = await axiosInstance.get<GetBookingRequestsResponse>(
    `${BOOKING_REQUEST_API.LIST}/get-unchecked-booking-request`,
    { params },
  );
  return response.data;
};

/** History */
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

/** Get booking by scheduleId */
export const getBookingRequestByScheduleId = async (
  scheduleId: string,
): Promise<GetBookingByScheduleIdResponse> => {
  const response = await axiosInstance.get<GetBookingByScheduleIdResponse>(
    BOOKING_REQUEST_API.BY_SCHEDULE(scheduleId),
  );
  return response.data;
};

/** Update status */
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

/** Lookup: buildings */
export const getBuildingOptions = async (): Promise<BuildingOption[]> => {
  const response = await axiosInstance.get<BuildingOption[]>(
    BOOKING_LOOKUP_API.BUILDINGS,
  );
  return response.data;
};

/** Lookup: rooms */
export const getRoomOptions = async (): Promise<RoomOption[]> => {
  const response = await axiosInstance.get<RoomOption[]>(
    BOOKING_LOOKUP_API.LAB_ROOMS,
  );
  return response.data;
};
