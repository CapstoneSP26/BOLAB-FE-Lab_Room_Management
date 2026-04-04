import { useQuery } from "@tanstack/react-query";
import { notificationApi } from "../api/notificationApi";
import type {
  GetNotificationsRequest,
  GetNotificationsResponse,
} from "../types/notification.type";

export const NOTIFICATION_QUERY_KEYS = {
  LIST: "notifications",
} as const;

export const useNotificationsList = (
  params: GetNotificationsRequest = {},
  enabled = true,
) =>
  useQuery<GetNotificationsResponse>({
    queryKey: [NOTIFICATION_QUERY_KEYS.LIST, params],
    queryFn: () => notificationApi.getNotifications(params),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
    enabled,
  });
