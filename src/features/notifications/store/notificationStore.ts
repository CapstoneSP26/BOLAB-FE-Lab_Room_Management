import { create } from 'zustand';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import {
  notificationApi,
  type NotificationRealtimePayload,
} from '../notification.api';
import {
  getUnreadCountFromItems,
  mapNotificationDto,
  type AppNotification,
  type NotificationDto,
} from '../notification.mapper';

interface NotificationStore {
  notifications: AppNotification[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  isRealtimeConnected: boolean;
  fetchNotifications: (page?: number, pageSize?: number) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => void;
  removeNotification: (id: number) => void;
  clearReadNotifications: () => void;
  startRealtime: () => Promise<void>;
  stopRealtime: () => Promise<void>;
  pushRealtimeNotification: (payload: NotificationRealtimePayload) => void;
  fetchLatestByBookingId: (bookingId: string) => Promise<void>;
}

let notificationHubConnection: HubConnection | null = null;

const toBaseUrl = () => {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '';
  return raw.replace(/\/api\/?$/i, '');
};

const mapRealtimePayloadToDto = (
  payload: NotificationRealtimePayload,
): NotificationDto => ({
  id: payload.id,
  userId: '',
  title: payload.title,
  message: payload.message,
  type: payload.type,
  isRead: payload.isRead,
  createdAt: payload.createdAt,
  readAt: null,
  metadata: payload.metadata ?? null,
});

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  isLoading: false,
  error: null,
  unreadCount: 0,
  isRealtimeConnected: false,

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
        error:
          error instanceof Error
            ? error.message
            : 'Failed to mark notification as read',
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

  pushRealtimeNotification: (payload) => {
    const mapped = mapNotificationDto(mapRealtimePayloadToDto(payload));

    set((state) => {
      const deduped = state.notifications.filter((item) => item.id !== mapped.id);
      const next = [mapped, ...deduped].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return {
        notifications: next,
        totalCount: Math.max(state.totalCount, next.length),
        unreadCount: getUnreadCountFromItems(next),
      };
    });
  },

  fetchLatestByBookingId: async (bookingId) => {
    try {
      const dto = await notificationApi.getLatestByBookingId(bookingId);
      if (!dto) return;

      const mapped = mapNotificationDto(dto);

      set((state) => {
        const deduped = state.notifications.filter((item) => item.id !== mapped.id);
        const next = [mapped, ...deduped].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        return {
          notifications: next,
          totalCount: Math.max(state.totalCount, next.length),
          unreadCount: getUnreadCountFromItems(next),
        };
      });
    } catch {
      // Silently ignore here because this is an enhancement call after booking success.
    }
  },

  startRealtime: async () => {
    try {
      if (
        notificationHubConnection &&
        notificationHubConnection.state !== HubConnectionState.Disconnected
      ) {
        return;
      }

      const hubUrl = `${toBaseUrl()}/hubs/notifications`;
      const token = localStorage.getItem('access_token') || '';

      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token,
          withCredentials: true,
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Warning)
        .build();

      connection.on('notification.created', (payload: NotificationRealtimePayload) => {
        get().pushRealtimeNotification(payload);
      });

      connection.onreconnected(() => {
        set({ isRealtimeConnected: true, error: null });
      });

      connection.onreconnecting(() => {
        set({ isRealtimeConnected: false });
      });

      connection.onclose(() => {
        set({ isRealtimeConnected: false });
      });

      await connection.start();
      notificationHubConnection = connection;

      set({ isRealtimeConnected: true, error: null });
    } catch (error) {
      set({
        isRealtimeConnected: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to connect realtime notifications',
      });
    }
  },

  stopRealtime: async () => {
    if (!notificationHubConnection) {
      set({ isRealtimeConnected: false });
      return;
    }

    try {
      await notificationHubConnection.stop();
    } finally {
      notificationHubConnection = null;
      set({ isRealtimeConnected: false });
    }
  },
}));
