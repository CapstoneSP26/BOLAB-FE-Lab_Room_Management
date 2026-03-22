import axiosInstance from '../../../api/axios';
import type {
  GetLabRoomsRequest,
  GetLabRoomsResponse,
  GetStudentGroupsRequest,
  GetStudentGroupsResponse,
  GetAvailableSlotsRequest,
  GetAvailableSlotsResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  GetMyBookingsRequest,
  GetMyBookingsResponse,
} from '../types';

/**
 * ===== DATA ACCESS LAYER =====
 * Rules:
 * - Chỉ dùng axiosInstance
 * - Phải định nghĩa TypeScript Interface cho cả Request và Response
 * - Không được catch error (để UI hoặc React Query xử lý)
 */

const ROOM_BOOKING_API = {
  LAB_ROOMS: '/api/lab-rooms',
  STUDENT_GROUPS: '/api/student-groups',
  AVAILABLE_SLOTS: '/api/available-slots',
  CREATE_BOOKING: '/api/bookings',
  MY_BOOKINGS: '/api/bookings/my-bookings',
  BOOKING: '/api/bookings',
  SCHEDULE: '/api/schedules',
};

/**
 * Lấy danh sách phòng lab
 */
export const getLabRooms = async (
  params: GetLabRoomsRequest = {}
): Promise<GetLabRoomsResponse> => {
  const response = await axiosInstance.get<GetLabRoomsResponse>(
    ROOM_BOOKING_API.LAB_ROOMS,
    { params }
  );
  return response.data;
};

/**
 * Lấy danh sách nhóm sinh viên của giảng viên
 */
export const getStudentGroups = async (
  params: GetStudentGroupsRequest = {}
): Promise<GetStudentGroupsResponse> => {
  const response = await axiosInstance.get<GetStudentGroupsResponse>(
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

