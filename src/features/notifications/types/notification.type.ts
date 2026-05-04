import type { PagedResponse } from "../../../types/pagination.types";

export type NotificationType = "info" | "warning" | "success" | "error";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string | null;
  timeLabel: string;
  referencePath: string | null;
}

export interface GetNotificationsRequest {
  pageNumber?: number;
  pageSize?: number;
}

export type GetNotificationsResponse = PagedResponse<NotificationItem>;
