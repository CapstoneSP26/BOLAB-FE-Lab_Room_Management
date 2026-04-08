import { create } from 'zustand';
import { notificationApi } from '../features/notifications/notification.api';
import {
  getUnreadCountFromItems,
  mapNotificationDto,
  type AppNotification,
} from '../features/notifications/notification.mapper';

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
      const payload = await notificationApi.getMyNotifications(page, pageSize);
      const mappedItems = payload.items.map(mapNotificationDto);

      set({
        notifications: mappedItems,
        page: payload.pageNumber,
        pageSize: payload.pageSize,
        totalCount: payload.totalCount,
        totalPages: payload.totalPages,
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
        item.id === id
          ? { ...item, isRead: true, readAt: item.readAt ?? new Date().toISOString() }
          : item,
      );

      return {
        notifications: next,
        unreadCount: getUnreadCountFromItems(next),
      };
    });

    try {
      await notificationApi.markAsRead(id);
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
