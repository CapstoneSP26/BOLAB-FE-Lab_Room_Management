import axiosInstance from "../../../api/axios";
import { normalizeNotificationsResponse } from "../types/notification.mapper";
import type {
  GetNotificationsRequest,
  GetNotificationsResponse,
} from "../types/notification.type";

const NOTIFICATION_API = {
  LIST: "/notifications",
} as const;

export const notificationApi = {
  async getNotifications(
    params: GetNotificationsRequest = {},
  ): Promise<GetNotificationsResponse> {
    const response = await axiosInstance.get(NOTIFICATION_API.LIST, {
      params: {
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 8,
      },
    });

    return normalizeNotificationsResponse(response.data);
  },
};
