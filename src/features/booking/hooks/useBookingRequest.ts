import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingRequestApi } from "../api/bookingApi";
import type {
  ApproveBookingRequestResponse,
  BookingRequest,
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

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const isSameBookingRequest = (left: BookingRequest, right: BookingRequest) =>
  String(left.id) === String(right.id);

const removeFromBookingRequestResponse = (
  response: GetBookingRequestsResponse | undefined,
  targetId: string,
) => {
  if (!response) {
    return response;
  }

  const nextItems = response.data.filter(
    (item) => String(item.id) !== String(targetId),
  );

  if (nextItems.length === response.data.length) {
    return response;
  }

  return {
    ...response,
    data: nextItems,
    total: Math.max(0, (response.total ?? response.data.length) - 1),
  };
};

const matchesHistoryQuery = (
  item: BookingRequest,
  params?: GetBookingRequestsRequest,
) => {
  if (!params) {
    return true;
  }

  if (params.status && params.status !== "All") {
    if (normalizeText(item.status) !== normalizeText(params.status)) {
      return false;
    }
  }

  if (
    params.labRoomId !== undefined &&
    String(item.roomId) !== String(params.labRoomId)
  ) {
    return false;
  }

  if (
    params.buildingId !== undefined &&
    String(item.buildingId) !== String(params.buildingId)
  ) {
    return false;
  }

  if (params.keyword) {
    const keyword = normalizeText(params.keyword);
    const haystack = [
      item.id,
      item.requestedBy,
      item.roomName,
      item.buildingName,
      item.purpose,
      item.status,
    ]
      .map(normalizeText)
      .join(" ");

    if (!haystack.includes(keyword)) {
      return false;
    }
  }

  const itemDate = new Date(item.startTime);
  if (!Number.isNaN(itemDate.getTime())) {
    if (params.startDate) {
      const startDate = new Date(params.startDate);
      startDate.setHours(0, 0, 0, 0);
      if (itemDate < startDate) {
        return false;
      }
    }

    if (params.endDate) {
      const endDate = new Date(params.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (itemDate > endDate) {
        return false;
      }
    }
  }

  return true;
};

const upsertIntoHistoryResponse = (
  response: GetBookingRequestsResponse | undefined,
  item: BookingRequest,
) => {
  if (!response) {
    return response;
  }

  const existed = response.data.some((current) =>
    isSameBookingRequest(current, item),
  );
  const mergedItems = [
    item,
    ...response.data.filter((current) => !isSameBookingRequest(current, item)),
  ];

  const nextLimit = response.limit ?? mergedItems.length;

  return {
    ...response,
    data: mergedItems.slice(0, nextLimit),
    total: existed
      ? (response.total ?? response.data.length)
      : (response.total ?? response.data.length) + 1,
  };
};

const syncBookingRequestCaches = (
  queryClient: ReturnType<typeof useQueryClient>,
  item: BookingRequest,
) => {
  const targetId = String(item.id);

  queryClient.setQueriesData<GetBookingRequestsResponse>(
    { queryKey: [QUERY_KEYS.BOOKING_REQUESTS] },
    (current) => removeFromBookingRequestResponse(current, targetId),
  );

  const historyQueries = queryClient.getQueriesData<GetBookingRequestsResponse>(
    {
      queryKey: [QUERY_KEYS.BOOKING_REQUEST_HISTORY],
    },
  );

  historyQueries.forEach(([queryKey, response]) => {
    const params =
      (queryKey[1] as GetBookingRequestsRequest | undefined) ?? undefined;

    if (!matchesHistoryQuery(item, params)) {
      return;
    }

    queryClient.setQueryData<GetBookingRequestsResponse>(queryKey, (current) =>
      upsertIntoHistoryResponse(current ?? response, item),
    );
  });

  queryClient.setQueryData<GetBookingByIdResponse>(
    [QUERY_KEYS.BOOKING_REQUEST_DETAIL, targetId],
    { data: item },
  );
};

const invalidateBookingRequestQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
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

    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: [QUERY_KEYS.BOOKING_REQUESTS],
      });

      const previousPendingQueries =
        queryClient.getQueriesData<GetBookingRequestsResponse>({
          queryKey: [QUERY_KEYS.BOOKING_REQUESTS],
        });

      queryClient.setQueriesData<GetBookingRequestsResponse>(
        { queryKey: [QUERY_KEYS.BOOKING_REQUESTS] },
        (current) => removeFromBookingRequestResponse(current, id),
      );

      return { previousPendingQueries };
    },

    onSuccess: async (data) => {
      syncBookingRequestCaches(queryClient, data.data);
      await invalidateBookingRequestQueries(queryClient);
      options.onSuccess?.(data);
    },

    onError: (error: Error, _id, context) => {
      context?.previousPendingQueries?.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });

      options.onError?.(error);
    },
  });
};

export const useRejectBookingRequest = (
  options: BookingRequestMutationOptions<RejectBookingRequestResponse> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      bookingRequestApi.rejectBookingRequest(id, reason),
    onSuccess: async (data) => {
      syncBookingRequestCaches(queryClient, data.data);
      await invalidateBookingRequestQueries(queryClient);
      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
};
