import type { BookingWithQR, QRSession } from '../types/attendance.type';
import type { ScheduleDto } from '../../schedules/types/schedule.type';
import { parseTimeValue } from '../../../utils/date.util';

export const normalizeRoomName = (value: string) => value.trim().toLowerCase();

export const getRoomCodeFromName = (roomName: string): string => {
  const numberMatch = roomName.match(/(\d+)/);
  return numberMatch ? `L${numberMatch[1]}` : roomName;
};

export const normalizeBookingStatus = (status: string): BookingWithQR['status'] => {
  const normalizedStatus = status.trim().toLowerCase();

  if (normalizedStatus === 'active') {
    return 'Active';
  }

  if (normalizedStatus === 'done') {
    return 'Done';
  }

  if (normalizedStatus === 'notyet' || normalizedStatus === 'not_yet' || normalizedStatus === 'not yet') {
    return 'NotYet';
  }

  return 'NotYet';
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
    buildingName: 'Unknown Building',
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

export const normalizeQrSessionPayload = (
  payload: Record<string, unknown>,
  fallback: QRSession | null,
): QRSession => {
  const base = fallback || ({} as QRSession);

  const scanUrl =
    (typeof payload.scanUrl === 'string' ? payload.scanUrl : undefined)
    || (typeof payload.qrScanUrl === 'string' ? payload.qrScanUrl : undefined)
    || (typeof payload.url === 'string' ? payload.url : undefined)
    || (typeof payload.qrUrl === 'string' ? payload.qrUrl : undefined)
    || (typeof payload.qrContent === 'string' ? payload.qrContent : undefined)
    || (typeof payload.qrValue === 'string' ? payload.qrValue : undefined)
    || '';

  const qrImageBase64 =
    (typeof payload.qrImageBase64 === 'string' ? payload.qrImageBase64 : undefined)
    || (typeof payload.qrCodeBase64 === 'string' ? payload.qrCodeBase64 : undefined)
    || (typeof payload.qrCodeImageBase64 === 'string' ? payload.qrCodeImageBase64 : undefined)
    || (typeof payload.base64Image === 'string' ? payload.base64Image : undefined)
    || (typeof payload.imageBase64 === 'string' ? payload.imageBase64 : undefined)
    || base.qrImageBase64;

  const qrImageUrl =
    (typeof payload.qrImageUrl === 'string' ? payload.qrImageUrl : undefined)
    || (typeof payload.qrCodeUrl === 'string' ? payload.qrCodeUrl : undefined)
    || (typeof payload.imageUrl === 'string' ? payload.imageUrl : undefined)
    || base.qrImageUrl;

  const qrToken =
    (typeof payload.qrToken === 'string' ? payload.qrToken : undefined)
    || (typeof payload.token === 'string' ? payload.token : undefined)
    || (typeof payload.qrCodeToken === 'string' ? payload.qrCodeToken : undefined)
    || base.qrToken;

  const qrExpiry =
    (typeof payload.qrExpiry === 'string' ? payload.qrExpiry : undefined)
    || (typeof payload.expiryTime === 'string' ? payload.expiryTime : undefined)
    || (typeof payload.expiredAt === 'string' ? payload.expiredAt : undefined)
    || base.qrExpiry;

  const normalized: QRSession = {
    ...base,
    ...payload,
    id: (payload.id as string) || (payload.qrId as string) || base.id,
    bookingId: (payload.bookingId as string) || (payload.scheduleId as string) || base.bookingId,
    roomName: (payload.roomName as string) || (payload.labRoomName as string) || base.roomName,
    roomCode: (payload.roomCode as string) || base.roomCode,
    buildingName: (payload.buildingName as string) || base.buildingName,
    date: (payload.date as string) || base.date,
    startTime: (payload.startTime as string) || base.startTime,
    endTime: (payload.endTime as string) || base.endTime,
    lecturerName: (payload.lecturerName as string) || base.lecturerName,
    lecturerId: (payload.lecturerId as string) || base.lecturerId,
    qrToken,
    qrExpiry,
    qrImageBase64,
    qrImageUrl,
    createdAt: (payload.createdAt as string) || base.createdAt,
    isActive: typeof payload.isActive === 'boolean' ? payload.isActive : (base.isActive ?? true),
    totalStudents: (payload.totalStudents as number) ?? base.totalStudents ?? 0,
    presentCount: (payload.presentCount as number) ?? base.presentCount ?? 0,
    absentCount: (payload.absentCount as number) ?? base.absentCount ?? 0,
  };

  if (scanUrl) {
    (normalized as unknown as Record<string, unknown>).scanUrl = scanUrl;
  }

  return normalized;
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

export const buildBackendScanUrl = (session: QRSession | null): string => {
  if (!session?.id || !session?.bookingId) {
    return '';
  }

  const params = new URLSearchParams({
    qrId: session.id,
    scheduleId: session.bookingId,
    isCheckIn: 'true',
    studentId: '',
  });

  return `${getApiBaseOrigin()}/api/attendances/scan-qrcode?${params.toString()}`;
};

export const extractBackendScanUrl = (input: unknown, depth = 0): string => {
  if (depth > 4 || input == null) {
    return '';
  }

  if (typeof input === 'string') {
    return normalizePossibleScanUrl(input);
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      const found = extractBackendScanUrl(item, depth + 1);
      if (found) return found;
    }
    return '';
  }

  if (typeof input === 'object') {
    const record = input as Record<string, unknown>;

    const priorityKeys = [
      'scanUrl',
      'qrScanUrl',
      'url',
      'qrUrl',
      'qrContent',
      'qrValue',
      'qrCode',
      'qrCodeUrl',
      'qrCodeContent',
      'qrCodeValue',
      'content',
      'value',
    ];

    for (const key of priorityKeys) {
      const found = extractBackendScanUrl(record[key], depth + 1);
      if (found) return found;
    }

    for (const value of Object.values(record)) {
      const found = extractBackendScanUrl(value, depth + 1);
      if (found) return found;
    }
  }

  return '';
};
