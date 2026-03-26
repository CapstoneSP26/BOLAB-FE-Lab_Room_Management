import axiosInstance from '../../../api/axios';
import type { GetStudentGroupByLecturerRequest, GetStudentGroupsByLecturerResponse } from '../../groups/types/group.type';
import type { GetAvailableSlotsRequest, GetAvailableSlotsResponse } from '../../slot/types/slot.types';
import type {
  CreateBookingRequest,
  CreateBookingResponse,
  GetMyBookingsRequest,
  GetMyBookingsResponse,
} from '../types/booking.type';
/**
 * ===== DATA ACCESS LAYER =====
 * Rules:
 * - Chỉ dùng axiosInstance
 * - Phải định nghĩa TypeScript Interface cho cả Request và Response
 * - Không được catch error (để UI hoặc React Query xử lý)
 */

const ROOM_BOOKING_API = {
  STUDENT_GROUPS: '/student-groups',
  AVAILABLE_SLOTS: '/available-slots',
  CREATE_BOOKING: '/bookings',
  MY_BOOKINGS: '/bookings/my-bookings',
  BOOKING: '/bookings',
  SCHEDULE: '/schedules',
};

/**
 * Lấy danh sách nhóm sinh viên của giảng viên
 */
export const getStudentGroups = async (
  params: GetStudentGroupByLecturerRequest = {}
): Promise<GetStudentGroupsByLecturerResponse> => {
  const response = await axiosInstance.get<GetStudentGroupsByLecturerResponse>(
    ROOM_BOOKING_API.STUDENT_GROUPS,
    { params }
  );
  return response.data;
};

/**
 * Lấy danh sách slot trống theo phòng và khoảng thời gian
 */
export const getAvailableSlots = async (
  params: GetAvailableSlotsRequest
): Promise<GetAvailableSlotsResponse> => {
  const response = await axiosInstance.get<GetAvailableSlotsResponse>(
    ROOM_BOOKING_API.AVAILABLE_SLOTS,
    { params }
  );
  return response.data;
};

/**
 * Tạo booking request mới
 */
export const createBooking = async (
  request: CreateBookingRequest
): Promise<CreateBookingResponse> => {
  const response = await axiosInstance.post<CreateBookingResponse>(
    ROOM_BOOKING_API.CREATE_BOOKING,
    request.bookingData
  );
  return response.data;
};

/**
 * Lấy danh sách booking của giảng viên
 */
export const getMyBookings = async (
  params: GetMyBookingsRequest = {}
): Promise<GetMyBookingsResponse> => {
  const response = await axiosInstance.get<GetMyBookingsResponse>(
    ROOM_BOOKING_API.MY_BOOKINGS,
    { params }
  );
  return response.data;
};

