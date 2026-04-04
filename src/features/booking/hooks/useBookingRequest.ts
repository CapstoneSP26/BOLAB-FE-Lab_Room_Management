import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingRequestApi } from "../api/bookingApi";
import type {
  ApproveBookingRequestResponse,
  GetBookingByIdResponse,
  GetBookingByScheduleIdResponse,
  GetBookingRequestsRequest,
  GetBookingRequestsResponse,
  RejectBookingRequestResponse,
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

interface BookingRequestMutationOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

const invalidateBookingRequestQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
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
};

export const useApproveBookingRequest = (
  options: BookingRequestMutationOptions<ApproveBookingRequestResponse> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingRequestApi.approveBookingRequest(id),
    onSuccess: (data) => {
      invalidateBookingRequestQueries(queryClient);
      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};

export const useRejectBookingRequest = (
  options: BookingRequestMutationOptions<RejectBookingRequestResponse> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookingRequestApi.rejectBookingRequest(id),
    onSuccess: (data) => {
      invalidateBookingRequestQueries(queryClient);
      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};
