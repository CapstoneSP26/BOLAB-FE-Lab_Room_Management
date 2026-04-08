import axiosInstance from '../../api/axios';
import type { NotificationDto } from './notification.mapper';

interface PagedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface NotificationListResult {
  items: NotificationDto[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export const notificationApi = {
  async getMyNotifications(page: number = 1, pageSize: number = 10): Promise<NotificationListResult> {
    const response = await axiosInstance.get<ApiResponse<PagedList<NotificationDto>>>(
      '/Profile/notifications',
      {
        params: {
          Page: page,
          PageSize: pageSize,
        },
      },
    );

    const payload = response.data?.data;
    const items = Array.isArray(payload?.items) ? payload.items : [];

    return {
      items,
      pageNumber: payload?.pageNumber ?? page,
      pageSize: payload?.pageSize ?? pageSize,
      totalPages: payload?.totalPages ?? 1,
      totalCount: payload?.totalCount ?? items.length,
    };
  },

  async markAsRead(notificationId: number): Promise<void> {
    await axiosInstance.put(`/Profile/notifications/${notificationId}/read`);
  },
};
