/**
 * Attendance Management Page - BOLAB-30
 * Lecturer's page to manage attendance and active QR sessions
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  ExternalLink,
  Download,
  XCircle,
  AlertCircle,
  Building2,
  Search,
  UserCheck,
  Lock,
  CheckCircle,
  Users,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  useCreateQRSession,
  useLecturerBookings,
  useQRSession,
  useEndQRSession,
  useAttendanceList,
  useExportAttendance,
  type QRSession,
  type BookingWithQR,
} from '../../features/attendance';
import { useBookingAttendance } from '../../features/booking';
import type { BookingDto, GetBookingsParams } from '../../features/booking/types/booking.type';
import { MOCK_LECTURER_BOOKINGS, MOCK_QR_SESSION } from '../../features/attendance/mocks/attendance.mock';
import { useActiveSession } from '../../context/ActiveSessionContext';
import { useToast } from '../../hooks/useToast';

const normalizeRoomName = (value: string) => value.trim().toLowerCase();

const getRoomCodeFromName = (roomName: string): string => {
  const numberMatch = roomName.match(/(\d+)/);
  return numberMatch ? `L${numberMatch[1]}` : roomName;
};

const normalizeBookingStatus = (status: string): BookingWithQR['status'] => {
  if (status === 'PendingApproval' || status === 'Approved' || status === 'Rejected' || status === 'Cancelled') {
    return status;
  }
  return 'Draft';
};

const parseTimeValue = (bookingDate: string, value: string): Date => {
  // Handle API values that already include full datetime.
  if (value.includes('T')) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // Fallback for HH:mm values by combining with booking date.
  const [hourText, minuteText] = value.split(':');
  const base = new Date(bookingDate);
  if (Number.isNaN(base.getTime())) {
    return new Date(0);
  }

  base.setHours(Number(hourText || 0), Number(minuteText || 0), 0, 0);
  return base;
};

const isNowInsideBookingWindow = (booking: BookingDto): boolean => {
  if (!booking.startTime || !booking.endTime) {
    return false;
  }

  const now = new Date();
  const start = parseTimeValue(booking.startTime, booking.startTime);
  const end = parseTimeValue(booking.startTime, booking.endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return false;
  }

  return now >= start && now <= end;
};

const isNowInsideFeatureBookingWindow = (booking: BookingWithQR): boolean => {
  const now = new Date();
  const start = parseTimeValue(booking.date, booking.startTime);
  const end = parseTimeValue(booking.date, booking.endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return false;
  }

  return now >= start && now <= end;
};

const isBookingPast = (booking: BookingWithQR): boolean => {
  const now = new Date();
  const end = parseTimeValue(booking.date, booking.endTime);
  if (Number.isNaN(end.getTime())) {
    return booking.isPast;
  }
  return end < now;
};

const isBookingUpcoming = (booking: BookingWithQR): boolean => !isBookingPast(booking);

const getIsoDateTimeParts = (value: string): { dateLabel: string; timeLabel: string } | null => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match;
  return {
    dateLabel: `${day}/${month}/${year}`,
    timeLabel: `${hour}:${minute}`,
  };
};

const formatUtcDateLabel = (value: string): string => {
  const isoParts = getIsoDateTimeParts(value);
  if (isoParts) {
    return isoParts.dateLabel;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const day = String(parsed.getUTCDate()).padStart(2, '0');
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const year = parsed.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

const formatBookingTimeLabel = (bookingDate: string, value: string): string => {
  const isoParts = getIsoDateTimeParts(value);
  if (isoParts) {
    return isoParts.timeLabel;
  }

  const parsed = parseTimeValue(bookingDate, value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const hour = String(parsed.getUTCHours()).padStart(2, '0');
  const minute = String(parsed.getUTCMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
};

const mapBookingDtoToAttendanceBooking = (booking: BookingDto): BookingWithQR => {
  const dateSource = booking.startTime || booking.createdAt;
  const start = parseTimeValue(dateSource, booking.startTime);
  const end = parseTimeValue(dateSource, booking.endTime);
  const now = new Date();
  const isPast = !Number.isNaN(end.getTime()) ? end < now : false;
  const hasValidStart = !Number.isNaN(start.getTime());

  return {
    bookingId: booking.id,
    roomName: booking.labRoomName || 'Unknown Room',
    roomCode: getRoomCodeFromName(booking.labRoomName || 'Room'),
    buildingName: 'Unknown Building',
    date: hasValidStart ? start.toISOString() : dateSource,
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: normalizeBookingStatus(booking.status),
    purpose: booking.reason || 'No purpose provided',
    hasQRSession: false,
    qrSessionId: undefined,
    isUpcoming: !isPast,
    isPast,
  };
};

const normalizeQrSessionPayload = (
  payload: Record<string, unknown>,
  fallback: QRSession | null
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

const unwrapSessionPayload = (response: unknown): Record<string, unknown> => {
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

const getApiBaseOrigin = (): string => {
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

const normalizePossibleScanUrl = (value: string): string => {
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

const buildBackendScanUrl = (session: QRSession | null): string => {
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

const extractBackendScanUrl = (input: unknown, depth = 0): string => {
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

export default function AttendanceManagementPage() {
  const appAlert = useToast();
  const navigate = useNavigate();
  const { activeSession, setActiveSession } = useActiveSession();
  const isAttendanceMockMode = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('mockAttendance') === '1' || params.get('testAttendance') === '1';
  }, []);

  const bookingScheduleParams: GetBookingsParams = useMemo(
    () => ({
      status: 'Approved',
      pageNumber: 1,
      pageSize: 100,
      sortBy: 'startTime',
      isDescending: false,
    }),
    []
  );

  const { data: bookingsData, isLoading: bookingsLoading } = useLecturerBookings();
  const {
    data: bookingScheduleData,
    isLoading: bookingScheduleLoading,
    isFetching: bookingScheduleFetching,
  } = useBookingAttendance(bookingScheduleParams, true);
  const createQrSessionMutation = useCreateQRSession();
  const [isRefreshingQr, setIsRefreshingQr] = useState(false);
  const endSessionMutation = useEndQRSession();
  const exportMutation = useExportAttendance();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'upcoming' | 'past' | 'all'>('all');
  const [showQRModal, setShowQRModal] = useState(false);
  const [isCreatingQr, setIsCreatingQr] = useState(false);
  const [stoppedQrBySessionId, setStoppedQrBySessionId] = useState<Record<string, boolean>>({});
  const [latestBackendScanUrl, setLatestBackendScanUrl] = useState('');

  const bookingScheduleItems: BookingDto[] =
    ((bookingScheduleData?.data as { result?: { items?: BookingDto[] } })?.result?.items)
    || bookingScheduleData?.data?.items
    || [];

  const bookings = useMemo<BookingWithQR[]>(() => {
    if (bookingScheduleItems.length > 0) {
      return bookingScheduleItems.map(mapBookingDtoToAttendanceBooking);
    }

    // If booking-attendance has responded, treat it as source of truth for this list.
    if (bookingScheduleData) {
      return [];
    }

    if (bookingsData?.data?.length) {
      return bookingsData.data;
    }

    return isAttendanceMockMode ? MOCK_LECTURER_BOOKINGS : [];
  }, [bookingScheduleItems, bookingsData?.data, isAttendanceMockMode]);

  const activeRoomNamesFromSchedule = useMemo(() => {
    if (bookingScheduleItems.length === 0) {
      return new Set(
        bookings
          .filter(item => item.status === 'Approved' && isNowInsideFeatureBookingWindow(item))
          .map(item => normalizeRoomName(item.roomName))
      );
    }

    return new Set(
      bookingScheduleItems
        .filter(isNowInsideBookingWindow)
        .map(item => normalizeRoomName(item.labRoomName))
    );
  }, [bookingScheduleItems, bookings]);

  const activeBookingByTime = useMemo(() => {
    if (activeRoomNamesFromSchedule.size === 0) {
      return null;
    }

    return (
      bookings.find(
        booking => activeRoomNamesFromSchedule.has(normalizeRoomName(booking.roomName))
      ) || null
    );
  }, [bookings, activeRoomNamesFromSchedule]);

  const mockFallbackBooking = useMemo(() => {
    if (!isAttendanceMockMode) return null;
    return bookings.find(booking => booking.hasQRSession) || bookings.find(booking => booking.status === 'Approved') || null;
  }, [bookings, isAttendanceMockMode]);

  const actionBooking = activeBookingByTime || mockFallbackBooking;

  const resolvedSessionId = actionBooking
    ? (activeSession?.isActive ? activeSession.id : (actionBooking.hasQRSession ? (actionBooking.qrSessionId ?? null) : null))
    : null;

  const isMockSession = isAttendanceMockMode && resolvedSessionId === MOCK_QR_SESSION.id;
  const apiSessionId = isMockSession ? null : resolvedSessionId;

  const { data: sessionData } = useQRSession(apiSessionId, !!apiSessionId);
  const { data: attendanceListData } = useAttendanceList(apiSessionId, !!apiSessionId);

  useEffect(() => {
    if (sessionData?.data?.isActive) {
      setActiveSession(sessionData.data);
      return;
    }

    if (isMockSession && !sessionData?.data) {
      if (!activeSession || activeSession.id !== MOCK_QR_SESSION.id) {
        setActiveSession(MOCK_QR_SESSION);
      }
      return;
    }

    if (!resolvedSessionId && activeSession) {
      setActiveSession(null);
    }
  }, [activeSession, isMockSession, resolvedSessionId, sessionData?.data, setActiveSession]);

  const session = (activeSession && (!sessionData?.data || activeSession.id === sessionData.data.id))
    ? activeSession
    : (sessionData?.data || (isMockSession ? MOCK_QR_SESSION : null));

  const activeDisplayRoom = session?.roomName || actionBooking?.roomName || 'Unknown Room';
  const activeDisplayBuilding = session?.buildingName || actionBooking?.buildingName || 'Unknown Building';
  const attendanceStats = attendanceListData?.data?.session || session;
  const totalStudents = attendanceStats?.totalStudents ?? 0;
  const presentStudents = attendanceStats?.presentCount ?? 0;
  const absentStudents = attendanceStats?.absentCount ?? Math.max(totalStudents - presentStudents, 0);

  const sessionRecord = (session || {}) as Record<string, unknown>;
  const backendScanUrl =
    (typeof sessionRecord.scanUrl === 'string' ? sessionRecord.scanUrl : '')
    || (typeof sessionRecord.qrScanUrl === 'string' ? sessionRecord.qrScanUrl : '')
    || (typeof sessionRecord.url === 'string' ? sessionRecord.url : '')
    || (typeof sessionRecord.qrUrl === 'string' ? sessionRecord.qrUrl : '')
    || (typeof sessionRecord.qrContent === 'string' ? sessionRecord.qrContent : '')
    || (typeof sessionRecord.qrValue === 'string' ? sessionRecord.qrValue : '');

  const derivedBackendScanUrl = buildBackendScanUrl(session);

  const scanUrl =
    normalizePossibleScanUrl(latestBackendScanUrl)
    || normalizePossibleScanUrl(backendScanUrl)
    || derivedBackendScanUrl
    || (session
    ? `${window.location.origin}/scan-attendance/${session.id}?token=${encodeURIComponent(session.qrToken)}${isAttendanceMockMode ? '&mockAttendance=1' : ''}`
    : '');

  const filteredBookings = useMemo(() => {
    const items = bookings.filter((booking) => {
      const upcoming = isBookingUpcoming(booking);
      const past = isBookingPast(booking);

      if (statusFilter === 'upcoming' && !upcoming) return false;
      if (statusFilter === 'past' && !past) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          booking.roomName.toLowerCase().includes(query) ||
          booking.roomCode.toLowerCase().includes(query) ||
          booking.buildingName.toLowerCase().includes(query) ||
          booking.purpose.toLowerCase().includes(query)
        );
      }

      return true;
    });

    if (!activeBookingByTime) {
      return items;
    }

    return [...items].sort((a, b) => {
      const aIsActive = a.bookingId === activeBookingByTime.bookingId;
      const bIsActive = b.bookingId === activeBookingByTime.bookingId;

      if (aIsActive && !bIsActive) return -1;
      if (!aIsActive && bIsActive) return 1;
      return 0;
    });
  }, [activeBookingByTime, bookings, searchQuery, statusFilter]);

  const shouldShowBookingsLoading =
    (bookingScheduleLoading || bookingScheduleFetching || bookingsLoading)
    && bookings.length === 0
    && !(isAttendanceMockMode && bookings.length > 0);

  const handleRefreshQR = async () => {
    setIsRefreshingQr(true);
    try {
      const bookingIdForRefresh = actionBooking?.bookingId || session?.bookingId;
      if (!bookingIdForRefresh) {
        appAlert.warning('No active class', 'No booking is available to generate a new QR.');
        return;
      }

      const created = await createQrSessionMutation.mutateAsync({
        scheduleId: bookingIdForRefresh,
        isCheckIn: true,
      });

      const nextSession = normalizeQrSessionPayload(
        unwrapSessionPayload(created),
        session || null
      );

      const extractedScanUrl = extractBackendScanUrl(created);
      if (extractedScanUrl) {
        setLatestBackendScanUrl(extractedScanUrl);
      } else {
        setLatestBackendScanUrl(buildBackendScanUrl(nextSession));
      }

      const refreshedExpiry = new Date(nextSession.qrExpiry);
      const refreshedDiff = Math.floor((refreshedExpiry.getTime() - Date.now()) / 1000);
      setTimeRemaining(refreshedDiff > 0 ? refreshedDiff : 0);

      setActiveSession(nextSession);

      setStoppedQrBySessionId(prev => {
        const next = { ...prev };
        if (session?.id) {
          next[session.id] = false;
        }
        next[nextSession.id] = false;
        return next;
      });

      appAlert.success('QR refreshed', 'New QR code is ready.');
    } catch {
      appAlert.error('Refresh failed', 'Could not create a new QR from backend.');
    } finally {
      setIsRefreshingQr(false);
    }
  };

  const handleEndSession = async () => {
    if (!session) return;

    const scheduleIdForEnd = actionBooking?.bookingId || session.bookingId;

    if (!scheduleIdForEnd) {
      appAlert.warning('No active class', 'No schedule is available to end QR session.');
      return;
    }

    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn tắt QR hiện tại?\n\nSau khi tắt, ảnh QR sẽ ẩn và sinh viên không thể quét mã này nữa.'
    );

    if (!confirmed) return;

    try {
      await endSessionMutation.mutateAsync({
        scheduleId: scheduleIdForEnd,
        isCheckIn: true,
      });
      setTimeRemaining(0);
      setStoppedQrBySessionId(prev => ({
        ...prev,
        [session.id]: true,
      }));
      appAlert.success('QR stopped', 'QR image has been turned off for this session.');
    } catch {
      appAlert.error('End session failed', 'Could not end this session. Please try again.');
    }
  };

  const handleOpenTVDisplay = () => {
    if (!session) return;
    window.open(`/qr-display/${session.id}`, '_blank');
  };

  const handleViewQR = async () => {
    if (session?.isActive) {
      setShowQRModal(true);
      return;
    }

    if (!actionBooking) {
      appAlert.warning('No active class', 'There is no in-progress class to create QR for.');
      return;
    }

    setIsCreatingQr(true);
    try {
      const response = await createQrSessionMutation.mutateAsync({
        scheduleId: actionBooking.bookingId,
        isCheckIn: true,
      });

      const nextSession = normalizeQrSessionPayload(
        unwrapSessionPayload(response),
        session || null
      );

      const extractedScanUrl = extractBackendScanUrl(response);
      if (extractedScanUrl) {
        setLatestBackendScanUrl(extractedScanUrl);
      } else {
        setLatestBackendScanUrl(buildBackendScanUrl(nextSession));
      }

      if (nextSession?.id) {
        setActiveSession(nextSession);
        setStoppedQrBySessionId(prev => ({
          ...prev,
          [nextSession.id]: false,
        }));
        setShowQRModal(true);
        return;
      }

      throw new Error('Invalid create QR response');
    } catch {
      appAlert.error('Create QR failed', 'Cannot create QR from backend for this session.');
    } finally {
      setIsCreatingQr(false);
    }
  };

  const handleManualAttendance = () => {
    if (!session) return;
    navigate(`/attendance/manual/${session.id}${isAttendanceMockMode ? '?mockAttendance=1' : ''}`);
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!session) return;

    try {
      await exportMutation.mutateAsync({
        sessionId: session.id,
        format,
      });
    } catch {
      appAlert.error('Export failed', 'Could not export attendance file.');
    }
  };

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (session && stoppedQrBySessionId[session.id]) {
      setTimeRemaining(0);
      return;
    }

    if (!session?.qrExpiry) {
      setTimeRemaining(null);
      return;
    }

    const calculateRemaining = () => {
      const expiry = new Date(session.qrExpiry);
      const now = new Date();
      const diff = Math.floor((expiry.getTime() - now.getTime()) / 1000);
      setTimeRemaining(diff > 0 ? diff : 0);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [session?.id, session?.qrExpiry, stoppedQrBySessionId]);

  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isSessionEditable = (sessionDate: string): boolean => {
    const date = new Date(sessionDate);
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isExpired = timeRemaining !== null && timeRemaining <= 0;
  const isQrStopped = !!(session && stoppedQrBySessionId[session.id]);
  const shouldHideQrImage = isExpired || isQrStopped;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Attendance Management</h1>
              <p className="text-slate-600 mt-1">Track student attendance and manage active QR sessions</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-5 py-2.5 bg-blue-50 rounded-xl border border-blue-200 min-w-[130px]">
                <p className="text-xs text-blue-700 font-semibold">Total</p>
                <p className="text-2xl font-bold text-blue-900 tabular-nums flex items-center gap-1.5">
                  <Users className="w-5 h-5" />
                  {totalStudents}
                </p>
              </div>
              <div className="px-5 py-2.5 bg-emerald-50 rounded-xl border border-emerald-200 min-w-[130px]">
                <p className="text-xs text-emerald-700 font-semibold">Present</p>
                <p className="text-2xl font-bold text-emerald-900 tabular-nums flex items-center gap-1.5">
                  <CheckCircle className="w-5 h-5" />
                  {presentStudents}
                </p>
              </div>
              <div className="px-5 py-2.5 bg-red-50 rounded-xl border border-red-200 min-w-[130px]">
                <p className="text-xs text-red-700 font-semibold">Absent</p>
                <p className="text-2xl font-bold text-red-900 tabular-nums flex items-center gap-1.5">
                  <XCircle className="w-5 h-5" />
                  {absentStudents}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {(session || actionBooking) && (
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-slate-200 rounded-2xl p-6 mb-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                  <QrCode className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-slate-900">Active QR Session</h2>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-300">
                      LIVE
                    </span>
                    {session && !isSessionEditable(session.date) && (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-300 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Read-Only
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 font-medium">
                    {activeDisplayRoom} • {activeDisplayBuilding}
                  </p>
                </div>
              </div>

              {session && isExpired && (
                <div className="bg-red-100 border-2 border-red-300 rounded-xl px-5 py-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-lg font-bold text-red-700">Expired</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleOpenTVDisplay}
                disabled={!session}
                className="bg-blue-50 border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Open TV Display</span>
              </button>

              <button
                onClick={handleManualAttendance}
                disabled={!session}
                className="bg-indigo-50 border-2 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-100 text-indigo-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <UserCheck className="w-5 h-5" />
                <span>Manual Attendance</span>
              </button>

              <button
                onClick={handleViewQR}
                disabled={isCreatingQr}
                className="bg-slate-50 border-2 border-slate-300 hover:border-slate-500 hover:bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isCreatingQr ? <RefreshCw className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
                <span>{isCreatingQr ? 'Creating QR...' : 'View QR'}</span>
              </button>
            </div>

            <div className="relative group mt-3">
              <button className="w-full bg-slate-50 border-2 border-slate-300 hover:border-slate-500 hover:bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                <span>Export Attendance</span>
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-t-xl text-slate-700 font-medium text-sm transition-colors"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
                >
                  Export as Excel
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-b-xl text-slate-700 font-medium text-sm transition-colors"
                >
                  Export as PDF
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by room, building, or purpose..."
                className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter('upcoming')}
                className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                  statusFilter === 'upcoming' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setStatusFilter('past')}
                className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                  statusFilter === 'past' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Past
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {shouldShowBookingsLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-900 mb-1">No bookings found</p>
              <p className="text-slate-600 text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredBookings.map((booking) => <BookingCard key={booking.bookingId} booking={booking} />)
          )}
        </div>
      </div>

      {showQRModal && session && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">QR Code</h3>
              <p className="text-slate-600 text-sm">
                {session.roomName} • {formatUtcDateLabel(session.date)}
              </p>
            </div>

            <div className="flex justify-center mb-6 bg-slate-50 border-2 border-slate-200 rounded-2xl p-8">
              {shouldHideQrImage ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-lg font-bold text-slate-900 mb-1">{isQrStopped ? 'QR Code Turned Off' : 'QR Code Expired'}</p>
                  <p className="text-sm text-slate-600">
                    {isQrStopped ? 'QR has been stopped. Refresh QR to generate a new one.' : 'Refresh QR to generate a new code'}
                  </p>
                </div>
              ) : session.data ? (
                <img
                  src={`data:image/png;base64,${session.data}`
                  }
                  alt="Session QR"
                  className="w-[280px] h-[280px] object-contain"
                />
              ) : (
                <QRCodeSVG value={scanUrl} size={280} level="H" includeMargin bgColor="#ffffff" fgColor="#0f172a" />
              )}
            </div>

            {!shouldHideQrImage && timeRemaining !== null && (
              <div className="text-center mb-6 space-y-3">
                <div className="inline-flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="text-xl font-bold text-slate-900 tabular-nums">{formatTimeRemaining(timeRemaining)}</span>
                  <span className="text-sm text-slate-600 font-medium">left</span>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(scanUrl);
                    appAlert.success('Link copied', 'Open in new tab or send to phone.');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                >
                  Copy Link to Test
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={handleRefreshQR}
                disabled={isRefreshingQr || endSessionMutation.isPending || isCreatingQr}
                className="bg-emerald-50 border-2 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-100 disabled:border-slate-300 disabled:bg-slate-50 text-emerald-700 disabled:text-slate-400 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshingQr ? 'animate-spin' : ''}`} />
                <span>Refresh QR</span>
              </button>

              <button
                onClick={handleEndSession}
                disabled={endSessionMutation.isPending || isRefreshingQr || isCreatingQr}
                className="bg-red-50 border-2 border-red-300 hover:border-red-500 hover:bg-red-100 disabled:border-slate-300 disabled:bg-slate-50 text-red-700 disabled:text-slate-400 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                <XCircle className="w-5 h-5" />
                <span>{endSessionMutation.isPending ? 'Stopping...' : 'Stop QR'}</span>
              </button>
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface BookingCardProps {
  booking: BookingWithQR;
}

function BookingCard({ booking }: BookingCardProps) {
  const navigate = useNavigate();

  const statusColors: Record<BookingWithQR['status'], string> = {
    Draft: 'bg-slate-100 text-slate-700 border-slate-200',
    PendingApproval: 'bg-amber-50 text-amber-700 border-amber-200',
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Rejected: 'bg-red-50 text-red-700 border-red-200',
    Cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-slate-700" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 truncate">{booking.roomName}</h3>
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${statusColors[booking.status]}`}>
                  {booking.status}
                </span>
              </div>
              <p className="text-sm text-slate-600">{booking.roomCode}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">{booking.buildingName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{formatUtcDateLabel(booking.startTime || booking.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm tabular-nums">
                {formatBookingTimeLabel(booking.date, booking.startTime)} - {formatBookingTimeLabel(booking.date, booking.endTime)}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-700 line-clamp-1">
            <span className="font-semibold">Purpose:</span> {booking.purpose}
          </p>
        </div>

        <div className="flex-shrink-0">
          {booking.hasQRSession ? (
            <button
              onClick={() => navigate(`/qr-display/${booking.qrSessionId}`)}
              className="bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md flex items-center gap-2 whitespace-nowrap"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Session</span>
            </button>
          ) : isBookingUpcoming(booking) && booking.status === 'Approved' ? (
            <button
              disabled
              className="bg-slate-100 text-slate-500 px-4 py-2.5 rounded-xl font-semibold text-sm cursor-not-allowed border border-slate-200 whitespace-nowrap flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>Available at class start</span>
            </button>
          ) : (
            <button
              disabled
              className="bg-slate-100 text-slate-400 px-4 py-2.5 rounded-xl font-semibold text-sm cursor-not-allowed border border-slate-200 whitespace-nowrap"
            >
              Not Available
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
