export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export type NotificationKind =
  | 'BookingCreated'
  | 'BookingApproved'
  | 'BookingRejected'
  | 'Unknown';

export interface NotificationDto {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: NotificationType;
  kind: NotificationKind;
  createdAt: string;
  readAt?: string | null;
  metadata?: Record<string, unknown> | null;
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

export const mapNotificationKind = (rawType?: string): NotificationKind => {
  const type = (rawType || '').trim();

  if (type === 'BookingCreated') return 'BookingCreated';
  if (type === 'BookingApproved') return 'BookingApproved';
  if (type === 'BookingRejected') return 'BookingRejected';

  return 'Unknown';
};

export const mapNotificationType = (rawType?: string): NotificationType => {
  const kind = mapNotificationKind(rawType);

  switch (kind) {
    case 'BookingApproved':
      return 'success';
    case 'BookingRejected':
      return 'error';
    case 'BookingCreated':
      return 'info';
    default:
      return 'warning';
  }
};

export const mapNotificationDto = (dto: NotificationDto): AppNotification => {
  const metadataBookingId = dto.metadata?.bookingId;
  const bookingId =
    typeof metadataBookingId === 'string' || typeof metadataBookingId === 'number'
      ? String(metadataBookingId)
      : undefined;

  return {
    id: dto.id,
    title: dto.title,
    message: dto.message,
    time: toRelativeTime(dto.createdAt),
    isRead: dto.isRead,
    type: mapNotificationType(dto.type),
    kind: mapNotificationKind(dto.type),
    createdAt: dto.createdAt,
    readAt: dto.readAt ?? null,
    metadata: dto.metadata ?? null,
    relatedPath: bookingId ? `/my-bookings?bookingId=${bookingId}` : '/notifications',
  };
};

export const getUnreadCountFromItems = (items: AppNotification[]) =>
  items.reduce((count, item) => (item.isRead ? count : count + 1), 0);
