export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface NotificationDto {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
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

export const toRelativeTime = (isoDate: string): string => {
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

export const mapNotificationType = (rawType?: string): NotificationType => {
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

export const mapNotificationDto = (dto: NotificationDto): AppNotification => ({
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

export const getUnreadCountFromItems = (items: AppNotification[]) =>
  items.reduce((count, item) => (item.isRead ? count : count + 1), 0);
