import axiosInstance from "../../../api/axios";
import type {
  GetNotificationsRequest,
  GetNotificationsResponse,
  NotificationItem,
  NotificationType,
} from "../types/notification.type";
import { getRelativeTime } from "../../../utils/formatDate";

const NOTIFICATION_API = {
  LIST: "/notifications",
  BOOKING_NOTIFICATION: "/booking-notifications",
} as const;

type MaybeRecord = Record<string, unknown>;

const asRecord = (value: unknown): MaybeRecord =>
  value && typeof value === "object" ? (value as MaybeRecord) : {};

const getString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }

  return "";
};

const getBoolean = (value: unknown, fallback = false) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["true", "1", "read", "opened", "done"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "unread", "new", "pending"].includes(normalized)) {
      return false;
    }
  }

  return fallback;
};

const getNumber = (value: unknown, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const normalizeNotificationType = (value: unknown): NotificationType => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (["warning", "warn", "alert", "pending"].includes(normalized)) {
    return "warning";
  }

  if (["success", "approved", "completed", "done"].includes(normalized)) {
    return "success";
  }

  if (["error", "failed", "reject", "rejected", "danger"].includes(normalized)) {
    return "error";
  }

  return "info";
};

const normalizePath = (value: string) => {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return value.startsWith("/") ? value : `/${value}`;
};

const getReferencePath = (record: MaybeRecord): string | null => {
  const directPath = getString(
    record.referencePath,
    record.relatedPath,
    record.path,
    record.url,
    record.href,
    record.redirectUrl,
    record.targetUrl,
  );

  if (directPath) {
    return normalizePath(directPath);
  }

  const reference = record.reference;
  if (typeof reference === "string" && reference.trim() !== "") {
    return normalizePath(reference.trim());
  }

  const referenceRecord = asRecord(reference);
  const nestedPath = getString(
    referenceRecord.path,
    referenceRecord.url,
    referenceRecord.href,
    referenceRecord.referencePath,
    referenceRecord.relatedPath,
  );

  if (nestedPath) {
    return normalizePath(nestedPath);
  }

  const referenceType = getString(
    record.referenceType,
    record.targetType,
    record.entityType,
    referenceRecord.type,
  ).toUpperCase();
  const referenceId = getString(
    record.referenceId,
    record.targetId,
    record.entityId,
    record.resourceId,
    referenceRecord.id,
  );

  switch (referenceType) {
    case "REPORT":
    case "INCIDENT_REPORT":
      return referenceId
        ? `/labmanager/reports/${referenceId}`
        : "/labmanager/reports";
    case "BOOKING":
    case "BOOKING_REQUEST":
      return "/labmanager/booking-requests/pending";
    case "BOOKING_HISTORY":
      return "/labmanager/booking-requests/history";
    case "SCHEDULE":
    case "CALENDAR":
      return "/labmanager/lab-scheduler";
    case "USER":
      return "/labmanager/users";
    case "DASHBOARD":
      return "/labmanager/dashboard";
    default:
      return null;
  }
};

const getTimeLabel = (record: MaybeRecord) => {
  const rawTime = getString(
    record.timeLabel,
    record.time,
    record.createdAt,
    record.createdDate,
    record.createdOn,
    record.sentAt,
    record.timestamp,
  );

  if (!rawTime) {
    return "Recently";
  }

  const parsedDate = new Date(rawTime);
  if (Number.isNaN(parsedDate.getTime())) {
    return rawTime;
  }

  return getRelativeTime(parsedDate);
};

const mapNotificationDtoToItem = (dto: unknown): NotificationItem => {
  const record = asRecord(dto);
  const title = getString(
    record.title,
    record.subject,
    record.name,
    record.header,
  );
  const message = getString(
    record.message,
    record.content,
    record.body,
    record.description,
    record.text,
  );

  return {
    id: getString(record.id, record.notificationId, record.Id) || crypto.randomUUID(),
    title: title || "Notification",
    message: message || "You have a new notification.",
    type: normalizeNotificationType(
      record.type ?? record.notificationType ?? record.level ?? record.status,
    ),
    isRead: getBoolean(record.isRead ?? record.read ?? record.IsRead, false),
    createdAt:
      getString(
        record.createdAt,
        record.createdDate,
        record.createdOn,
        record.sentAt,
        record.timestamp,
      ) || null,
    timeLabel: getTimeLabel(record),
    referencePath: getReferencePath(record),
  };
};

const normalizeNotificationsResponse = (
  raw: unknown,
): GetNotificationsResponse => {
  if (Array.isArray(raw)) {
    const items = raw.map(mapNotificationDtoToItem);
    return {
      items,
      pageNumber: 1,
      totalPages: 1,
      totalCount: items.length,
      pageSize: items.length || 10,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  const root = asRecord(raw);
  const payload =
    Array.isArray(root.items) ||
    Array.isArray(root.results) ||
    Array.isArray(root.records)
      ? root
      : asRecord(root.data);

  const rawItems =
    payload.items ??
    payload.Items ??
    payload.results ??
    payload.Results ??
    payload.records ??
    payload.Records ??
    payload.data ??
    [];

  const items = Array.isArray(rawItems)
    ? rawItems.map(mapNotificationDtoToItem)
    : [];

  const totalCount = getNumber(
    payload.totalCount ?? payload.TotalCount ?? payload.count ?? payload.Count,
    items.length,
  );
  const pageSize = Math.max(
    1,
    getNumber(
      payload.pageSize ?? payload.PageSize ?? payload.limit ?? payload.Limit,
      items.length || 10,
    ),
  );
  const pageNumber = Math.max(
    1,
    getNumber(
      payload.pageNumber ?? payload.PageNumber ?? payload.page ?? payload.Page,
      1,
    ),
  );
  const totalPages = Math.max(
    1,
    getNumber(
      payload.totalPages ?? payload.TotalPages,
      Math.ceil(totalCount / pageSize) || 1,
    ),
  );

  return {
    items,
    pageNumber,
    totalPages,
    totalCount,
    pageSize,
    hasPreviousPage: pageNumber > 1,
    hasNextPage: pageNumber < totalPages,
  };
};

export const notificationApi = {
  async getNotifications(
    params: GetNotificationsRequest = {},
  ): Promise<GetNotificationsResponse> {
    const pageNumber = params.pageNumber ?? 1;
    const pageSize = params.pageSize ?? 8;

    const requestCandidates = [
      () =>
        axiosInstance.get('/Profile/notifications', {
          params: { pageNumber, pageSize },
        }),
      () =>
        axiosInstance.get('/Profile/notifications', {
          params: { page: pageNumber, pageSize },
        }),
      () =>
        axiosInstance.get(NOTIFICATION_API.LIST, {
          params: { pageNumber, pageSize },
        }),
      () =>
        axiosInstance.get(NOTIFICATION_API.LIST, {
          params: { page: pageNumber, pageSize },
        }),
    ];

    let lastError: unknown = null;

    for (const request of requestCandidates) {
      try {
        const response = await request();
        return normalizeNotificationsResponse(response.data);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error('Cannot load notifications from all known endpoints.');
  },

  async markAllRead(): Promise<void> {
    await axiosInstance.put(`${NOTIFICATION_API.LIST}/read-all`);
  },

  async markAsRead(id: string): Promise<void> {
    await axiosInstance.put(`${NOTIFICATION_API.LIST}/${id}/read`);
  },

  async getBookingNotification(bookingId: string): Promise<NotificationItem> {
    try {
      const response = await axiosInstance.get(
        `${NOTIFICATION_API.BOOKING_NOTIFICATION}/${bookingId}`,
      );
      return mapNotificationDtoToItem(response.data);
    } catch (error) {
      console.error(`Failed to fetch notification for booking ${bookingId}:`, error);
      throw error;
    }
  },
};
