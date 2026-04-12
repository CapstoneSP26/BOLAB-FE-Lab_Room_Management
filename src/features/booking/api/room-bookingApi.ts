import axiosInstance from "../../../api/axios";
import type {
  GetAvailableSlotsRequest,
  GetAvailableSlotsResponse,
} from "../../slot/types/slot.types";
import type {

  GetMyBookingsRequest,
  GetMyBookingsResponse,
} from "../types/booking.type";
/**
 * ===== DATA ACCESS LAYER =====
 * Rules:
 * - Chỉ dùng axiosInstance
 * - Phải định nghĩa TypeScript Interface cho cả Request và Response
 * - Không được catch error (để UI hoặc React Query xử lý)
 */

const ROOM_BOOKING_API = {
  STUDENT_GROUPS: "/student-groups",
  AVAILABLE_SLOTS: "/available-slots",
  CREATE_BOOKING: "/bookings",
  MY_BOOKINGS: "/bookings/my-bookings",
  BOOKING: "/bookings",
  SCHEDULE: "/schedules",
};


/**
 * Lấy danh sách slot trống theo phòng và khoảng thời gian
 */
export const getAvailableSlots = async (
  params: GetAvailableSlotsRequest,
): Promise<GetAvailableSlotsResponse> => {
  const response = await axiosInstance.get<GetAvailableSlotsResponse>(
    ROOM_BOOKING_API.AVAILABLE_SLOTS,
    { params },
  );
  return response.data;
};

/**
 * Lấy danh sách booking của giảng viên
 */
export const getMyBookings = async (
  params: GetMyBookingsRequest = {},
): Promise<GetMyBookingsResponse> => {
  const response = await axiosInstance.get<GetMyBookingsResponse>(
    ROOM_BOOKING_API.MY_BOOKINGS,
    { params },
  );
  return response.data;
};
