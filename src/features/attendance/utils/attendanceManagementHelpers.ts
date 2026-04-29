import type { BookingWithQR, BookingStatus } from '../types/attendance.type';
import type { ScheduleDto } from '../../schedules/types/schedule.type';
import { parseTimeValue } from '../../../utils/date.util';

export const normalizeRoomName = (value: string) => value.trim().toLowerCase();

export const getRoomCodeFromName = (roomName: string): string => {
  const numberMatch = roomName.match(/(\d+)/);
  return numberMatch ? `L${numberMatch[1]}` : roomName;
};

export const normalizeBookingStatus = (status: string): BookingStatus => {
  const normalizedStatus = status.toString().trim().toLowerCase();

  if (normalizedStatus === 'active') {
    return 'Active';
  }

  if (normalizedStatus === 'inprocess' || normalizedStatus === 'in_process' || normalizedStatus === 'in process') {
    return 'InProcess';
  }

  if (normalizedStatus === 'completed' || normalizedStatus === 'complete') {
    return 'Completed';
  }

  if (normalizedStatus === 'cancelled' || normalizedStatus === 'cancel') {
    return 'Cancelled';
  }
  // Default to Active for unknown statuses
  return 'Active';
};

export const mapScheduleDtoToAttendanceBooking = (schedule: ScheduleDto): BookingWithQR => {
  const dateSource = schedule.startTime || schedule.endTime;
  const start = parseTimeValue(dateSource, schedule.startTime);
  const end = parseTimeValue(dateSource, schedule.endTime);
  const now = new Date();
  const isPast = !Number.isNaN(end.getTime()) ? end < now : false;
  const hasValidStart = !Number.isNaN(start.getTime());

  return {
    bookingId: schedule.id,
    roomName: schedule.labRoomName || 'Unknown Room',
    roomCode: getRoomCodeFromName(schedule.labRoomName || 'Room'),
    buildingName: schedule.buildingName,
    date: hasValidStart ? start.toISOString() : dateSource,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    status: normalizeBookingStatus(schedule.status),
    purpose: schedule.subjectCode || 'Schedule session',
    hasQRSession: false,
    qrSessionId: undefined,
    isUpcoming: !isPast,
    isPast,
  };
};

export const normalizeQrSessionPayload = () => {
  // Removed - QRSession no longer exists in new API
  return null;
};

export const unwrapSessionPayload = (response: unknown): Record<string, unknown> => {
  let current: unknown = response;

  for (let i = 0; i < 3; i++) {
    if (
      current
      && typeof current === 'object'
      && 'data' in (current as Record<string, unknown>)
      && (current as Record<string, unknown>).data
      && typeof (current as Record<string, unknown>).data === 'object'
    ) {
      current = (current as Record<string, unknown>).data;
      continue;
    }

    break;
  }

  if (typeof current === 'string') {
    const trimmed = current.trim();
    const isUrlLike = /^https?:\/\//i.test(trimmed)
      || trimmed.startsWith('/api/')
      || trimmed.startsWith('/attendances/')
      || trimmed.startsWith('api/')
      || trimmed.startsWith('attendances/');

    return {
      ...(isUrlLike
        ? {
          scanUrl: trimmed,
          qrValue: trimmed,
          qrContent: trimmed,
        }
        : {
          qrImageBase64: trimmed,
          qrCodeBase64: trimmed,
          base64Image: trimmed,
        }),
    };
  }

  return current && typeof current === 'object'
    ? (current as Record<string, unknown>)
    : {};
};

export const getApiBaseOrigin = (): string => {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (!baseUrl) {
    return window.location.origin;
  }

  try {
    return new URL(baseUrl).origin;
  } catch {
    return window.location.origin;
  }
};

export const normalizePossibleScanUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const absoluteMatch = trimmed.match(/https?:\/\/[^\s"']+/i);
  if (absoluteMatch?.[0]) {
    return absoluteMatch[0];
  }

  if (trimmed.startsWith('/api/') || trimmed.startsWith('/attendances/')) {
    return `${getApiBaseOrigin()}${trimmed}`;
  }

  if (trimmed.startsWith('api/') || trimmed.startsWith('attendances/')) {
    return `${getApiBaseOrigin()}/${trimmed}`;
  }

  return '';
};

export const buildBackendScanUrl = (): string => {
  // Removed - QRSession no longer exists in new API
  return '';
};

export const extractBackendScanUrl = (input: unknown, scheduleId?: string): string => {
  // Try to find scanUrl in response first (if backend provides it)
  if (input != null && typeof input === 'object') {
    const record = input as Record<string, unknown>;

    const priorityKeys = [
      'scanUrl',
      'qrScanUrl',
      'url',
      'qrUrl',
      'qrContent',
      'qrValue',
      'data',
    ];

    for (const key of priorityKeys) {
      if (typeof record[key] === 'string' && record[key]) {
        const urlStr = normalizePossibleScanUrl(record[key] as string);
        if (urlStr) return urlStr;
      }
    }
  }

  // Fallback: If scheduleId provided, generate client-side scanUrl
  if (scheduleId) {
    return `${window.location.origin}/scan-attendance/${scheduleId}`;
  }

  return '';
};
