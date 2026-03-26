import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStudentGroups,
  getAvailableSlots,
  createBooking,
  getMyBookings,
} from "../api/room-bookingApi";
import type { CreateBookingRequest, GetMyBookingsRequest } from "../types/booking.type";
import type { GetStudentGroupByLecturerRequest } from "../../groups/types/group.type";
import type { GetAvailableSlotsRequest } from '../../slot/types/slot.types';

/**
 * ===== BUSINESS LOGIC LAYER =====
 * Rules:
 * - Tên bắt đầu bằng use
 * - Không viết JSX trong hook
 * - Sử dụng React Query để quản lý API state
 */

export const QUERY_KEYS = {
  LAB_ROOMS: "lab-rooms",
  STUDENT_GROUPS: "student-groups",
  AVAILABLE_SLOTS: "available-slots",
  MY_BOOKINGS: "my-bookings",
} as const;

// ===== QUERIES =====

interface UseStudentGroupsOptions {
  params?: GetStudentGroupByLecturerRequest;
  enabled?: boolean;
}

/**
 * Hook lấy danh sách nhóm sinh viên
 */
export const useStudentGroups = (options: UseStudentGroupsOptions = {}) => {
  const { params, enabled = true } = options;

  return useQuery({
    queryKey: [QUERY_KEYS.STUDENT_GROUPS, params],
    queryFn: () => getStudentGroups(params),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 phút
    gcTime: 30 * 60 * 1000, // 30 phút
  });
};

interface UseAvailableSlotsOptions {
  params: GetAvailableSlotsRequest;
  enabled?: boolean;
}

/**
 * Hook lấy danh sách slot trống
 */
export const useAvailableSlots = (options: UseAvailableSlotsOptions) => {
  const { params, enabled = true } = options;

  return useQuery({
    queryKey: [QUERY_KEYS.AVAILABLE_SLOTS, params],
    queryFn: () => getAvailableSlots(params),
    enabled: enabled && !!params.roomId,
    staleTime: 2 * 60 * 1000, // 2 phút - cần fresh data
    gcTime: 5 * 60 * 1000, // 5 phút
  });
};

interface UseMyBookingsOptions {
  params?: GetMyBookingsRequest;
  enabled?: boolean;
}

/**
 * Hook lấy danh sách booking của giảng viên
 */
export const useMyBookings = (options: UseMyBookingsOptions = {}) => {
  const { params, enabled = true } = options;

  return useQuery({
    queryKey: [QUERY_KEYS.MY_BOOKINGS, params],
    queryFn: () => getMyBookings(params),
    enabled,
    staleTime: 1 * 60 * 1000, // 1 phút
    gcTime: 5 * 60 * 1000, // 5 phút
  });
};

// ===== MUTATIONS =====

interface UseCreateBookingOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

/**
 * Hook tạo booking request mới
 */
export const useCreateBooking = (options: UseCreateBookingOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateBookingRequest) => createBooking(request),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_BOOKINGS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AVAILABLE_SLOTS] });

      options.onSuccess?.(data);
    },
    onError: options.onError,
  });
};
