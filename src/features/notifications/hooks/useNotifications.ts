import { useQuery } from "@tanstack/react-query";
import { notificationApi } from "../api/notificationApi";
import type {
  GetNotificationsRequest,
  GetNotificationsResponse,
} from "../types/notification.type";

export const NOTIFICATION_QUERY_KEYS = {
  LIST: "notifications",
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
    refetchInterval: 60 * 1000,
    enabled,
  });
};
