import { create } from 'zustand';
import axiosInstance from '../api/axios';

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

interface NotificationDto {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

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

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: NotificationType;
  createdAt: string;
  readAt?: string | null;
  relatedPath?: string;
}

interface NotificationStore {
  notifications: AppNotification[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  fetchNotifications: (page?: number, pageSize?: number) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => void;
  removeNotification: (id: number) => void;
  clearReadNotifications: () => void;
}

const toRelativeTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Just now';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleString();
};

const mapNotificationType = (rawType?: string): NotificationType => {
  const type = (rawType || '').toLowerCase();

  if (type.includes('error') || type.includes('failed') || type.includes('reject')) {
    return 'error';
  }

  if (type.includes('warning') || type.includes('alert')) {
    return 'warning';
  }

  if (type.includes('success') || type.includes('approve') || type.includes('completed')) {
    return 'success';
  }

  return 'info';
};

const mapNotificationDto = (dto: NotificationDto): AppNotification => ({
  id: dto.id,
  title: dto.title,
  message: dto.message,
  time: toRelativeTime(dto.createdAt),
  isRead: dto.isRead,
  type: mapNotificationType(dto.type),
  createdAt: dto.createdAt,
  readAt: dto.readAt ?? null,
  relatedPath: '/notifications',
});

const getUnreadCountFromItems = (items: AppNotification[]) =>
  items.reduce((count, item) => (item.isRead ? count : count + 1), 0);

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  isLoading: false,
  error: null,
  unreadCount: 0,

  fetchNotifications: async (page = 1, pageSize = 10) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.get<ApiResponse<PagedList<NotificationDto>>>(
        '/api/Profile/notifications',
        {
          params: {
            Page: page,
            PageSize: pageSize,
          },
        },
      );

      const payload = response.data?.data;
      const items = Array.isArray(payload?.items) ? payload.items : [];
      const mappedItems = items.map(mapNotificationDto);

      set({
        notifications: mappedItems,
        page: payload?.pageNumber ?? page,
        pageSize: payload?.pageSize ?? pageSize,
        totalCount: payload?.totalCount ?? mappedItems.length,
        totalPages: payload?.totalPages ?? 1,
        unreadCount: getUnreadCountFromItems(mappedItems),
        isLoading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load notifications';
      set({ isLoading: false, error: message });
    }
  },

  markAsRead: async (id) => {
    const previous = get().notifications;

    set((state) => {
      const next = state.notifications.map((item) =>
        item.id === id ? { ...item, isRead: true, readAt: item.readAt ?? new Date().toISOString() } : item,
      );

      return {
        notifications: next,
        unreadCount: getUnreadCountFromItems(next),
      };
    });

    try {
      await axiosInstance.put(`/api/Profile/notifications/${id}/read`);
    } catch (error) {
      set({
        notifications: previous,
        unreadCount: getUnreadCountFromItems(previous),
        error: error instanceof Error ? error.message : 'Failed to mark notification as read',
      });
    }
  },

  // No backend endpoint for mark-all currently. Keep local-only behavior.
  markAllAsRead: () => {
    set((state) => {
      const next = state.notifications.map((item) => ({
        ...item,
        isRead: true,
        readAt: item.readAt ?? new Date().toISOString(),
      }));

      return {
        notifications: next,
        unreadCount: 0,
      };
    });
  },

  removeNotification: (id) => {
    set((state) => {
      const next = state.notifications.filter((item) => item.id !== id);
      return {
        notifications: next,
        unreadCount: getUnreadCountFromItems(next),
      };
    });
  },

  clearReadNotifications: () => {
    set((state) => {
      const next = state.notifications.filter((item) => !item.isRead);
      return {
        notifications: next,
        unreadCount: getUnreadCountFromItems(next),
      };
    });
  },
}));
