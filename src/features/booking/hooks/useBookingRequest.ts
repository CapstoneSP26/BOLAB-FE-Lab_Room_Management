import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingRequestApi } from "../api/bookingApi";
import type {
  GetBookingRequestsRequest,
  GetBookingRequestsResponse,
  GetBookingByIdResponse,
  GetBookingByScheduleIdResponse,
  UpdateBookingStatusRequest,
  UpdateBookingStatusResponse,
} from "../types/booking.type";

export const QUERY_KEYS = {
  BOOKING_REQUESTS: "booking-requests",
  BOOKING_REQUEST_HISTORY: "booking-request-history",
  BOOKING_REQUEST_DETAIL: "booking-request-detail",
  BOOKING_REQUEST_BY_SCHEDULE: "booking-request-by-schedule",
} as const;

export interface UseBookingRequestsOptions extends GetBookingRequestsRequest {
  enabled?: boolean;
}

/**
 * Hook lấy danh sách booking request chưa xử lý
 */
export const useBookingRequests = (options: UseBookingRequestsOptions = {}) => {
  const { enabled = true, ...params } = options;

  return useQuery<GetBookingRequestsResponse>({
    queryKey: [QUERY_KEYS.BOOKING_REQUESTS, params],
    queryFn: () => bookingRequestApi.getBookingRequests(params),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled,
  });
};

/**
 * Hook lấy lịch sử booking request
 */
export const useBookingRequestHistory = (
  options: UseBookingRequestsOptions = {},
) => {
  const { enabled = true, ...params } = options;

  return useQuery<GetBookingRequestsResponse>({
    queryKey: [QUERY_KEYS.BOOKING_REQUEST_HISTORY, params],
    queryFn: () => bookingRequestApi.getBookingHistory(params),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled,
  });
};

export interface UseBookingRequestDetailOptions {
  id?: string;
  enabled?: boolean;
}

/**
 * Hook lấy detail booking request theo id
 */
export const useBookingRequestDetail = (
  options: UseBookingRequestDetailOptions,
) => {
  const { id, enabled = true } = options;

  return useQuery<GetBookingByIdResponse>({
    queryKey: [QUERY_KEYS.BOOKING_REQUEST_DETAIL, id],
    queryFn: () => bookingRequestApi.getBookingById(String(id)),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: enabled && !!id,
  });
};

export interface UseBookingRequestByScheduleOptions {
  scheduleId?: string;
  enabled?: boolean;
}

/**
 * Hook lấy booking request theo scheduleId
 */
export const useBookingRequestBySchedule = (
  options: UseBookingRequestByScheduleOptions,
) => {
  const { scheduleId, enabled = true } = options;

  return useQuery<GetBookingByScheduleIdResponse>({
    queryKey: [QUERY_KEYS.BOOKING_REQUEST_BY_SCHEDULE, scheduleId],
    queryFn: () => bookingRequestApi.getBookingByScheduleId(String(scheduleId)),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: enabled && !!scheduleId,
  });
};

export interface UseUpdateBookingStatusOptions {
  onSuccess?: (data: UpdateBookingStatusResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook cập nhật trạng thái booking request
 */
export const useUpdateBookingStatus = (
  options: UseUpdateBookingStatusOptions = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateBookingStatusRequest;
    }) => bookingRequestApi.updateBookingStatus(id, body),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BOOKING_REQUESTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BOOKING_REQUEST_HISTORY],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BOOKING_REQUEST_DETAIL],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.BOOKING_REQUEST_BY_SCHEDULE],
      });

      options.onSuccess?.(data);
    },

    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};
