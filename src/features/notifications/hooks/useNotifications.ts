import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "../api/notificationApi";
import type {
  GetNotificationsRequest,
  GetNotificationsResponse,
  NotificationItem,
} from "../types/notification.type";

export const NOTIFICATION_QUERY_KEYS = {
  LIST: "notifications",
  BOOKING: (bookingId: string) => ["booking-notification", bookingId],
} as const;

export interface UseNotificationsOptions extends GetNotificationsRequest {
  enabled?: boolean;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { enabled = true, ...params } = options;

  return useQuery<GetNotificationsResponse>({
    queryKey: [NOTIFICATION_QUERY_KEYS.LIST, params],
    queryFn: () => notificationApi.getNotifications(params),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled,
  });
};

export const useMarkAsReadNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATION_QUERY_KEYS.LIST],
      });
    },
  });
};

export const useMarkAllReadNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATION_QUERY_KEYS.LIST],
      });
    },
  });
};

export const useBookingNotification = (bookingId: string, enabled = true) => {
  return useQuery<NotificationItem>({
    queryKey: NOTIFICATION_QUERY_KEYS.BOOKING(bookingId),
    queryFn: () => notificationApi.getBookingNotification(bookingId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled,
  });
};
