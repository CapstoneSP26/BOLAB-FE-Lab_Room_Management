import { create } from 'zustand';

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: NotificationType;
  relatedPath?: string;
}

interface NotificationStore {
  notifications: AppNotification[];
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  removeNotification: (id: number) => void;
  clearReadNotifications: () => void;
}

const mockNotifications: AppNotification[] = [
  {
    id: 1,
    title: 'New Booking Request',
    message: 'Lab A-101 has a new booking request for tomorrow.',
    time: '5 minutes ago',
    isRead: false,
    type: 'info',
    relatedPath: '/my-bookings',
  },
  {
    id: 2,
    title: 'Equipment Maintenance',
    message: 'Scheduled maintenance for equipment in Lab B-202.',
    time: '1 hour ago',
    isRead: false,
    type: 'warning',
    relatedPath: '/book-room',
  },
  {
    id: 3,
    title: 'Booking Approved',
    message: 'Your booking for Lab C-303 has been approved.',
    time: '2 hours ago',
    isRead: false,
    type: 'success',
    relatedPath: '/my-bookings',
  },
  {
    id: 4,
    title: 'Attendance Reminder',
    message: 'Attendance session for SE1702 starts in 20 minutes.',
    time: 'Today, 8:10 AM',
    isRead: true,
    type: 'info',
    relatedPath: '/attendance',
  },
];

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: mockNotifications,
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.id === id ? { ...item, isRead: true } : item
      ),
    }));
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((item) => ({ ...item, isRead: true })),
    }));
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((item) => item.id !== id),
    }));
  },
  clearReadNotifications: () => {
    set((state) => ({
      notifications: state.notifications.filter((item) => !item.isRead),
    }));
  },
}));
