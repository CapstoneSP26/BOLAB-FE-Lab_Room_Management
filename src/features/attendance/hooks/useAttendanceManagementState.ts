import { useEffect, useMemo } from 'react';
import type { BookingWithQR, QRSession } from '../types/attendance.type';
import type { GetSchedulesParams, ScheduleDto } from '../../schedules/types/schedule.type';
import {
  buildBackendScanUrl,
  mapScheduleDtoToAttendanceBooking,
  normalizePossibleScanUrl,
  normalizeRoomName,
} from '../utils/attendanceManagementHelpers';
import {
  isNowInsideFeatureBookingWindow,
  isNowInsideScheduleWindow,
} from '../../../utils/date.util';
import { MOCK_LECTURER_BOOKINGS, MOCK_QR_SESSION } from '../mocks/attendance.mock';
import { useQRSession } from './useQRSession';
import { useAttendanceList } from './useAttendance';


export interface UseAttendanceManagementStateParams {
  bookingScheduleItems: ScheduleDto[];
  bookingScheduleData: unknown;
  isAttendanceMockMode: boolean;
  activeSession: QRSession | null;
  setActiveSession: (session: QRSession | null) => void;
}

export const DEFAULT_ATTENDANCE_SCHEDULE_PARAMS: GetSchedulesParams = {
  pageNumber: 1,
  pageSize: 100,
  sortBy: 'startTime',
  isDescending: false,
};

export const useAttendanceManagementState = ({
  bookingScheduleItems,
  bookingScheduleData,
  isAttendanceMockMode,
  activeSession,
  setActiveSession,
}: UseAttendanceManagementStateParams) => {
  const bookings = useMemo<BookingWithQR[]>(() => {
    if (bookingScheduleItems.length > 0) {
      return bookingScheduleItems.map(mapScheduleDtoToAttendanceBooking);
    }

    if (bookingScheduleData) {
      return [];
    }

    return isAttendanceMockMode ? MOCK_LECTURER_BOOKINGS : [];
  }, [bookingScheduleData, bookingScheduleItems, isAttendanceMockMode]);

  // MOCK MODE: Simplify - luôn dùng mock session & booking đầu tiên
  if (isAttendanceMockMode) {
    const mockBooking = bookings[0];

    useEffect(() => {
      setActiveSession(MOCK_QR_SESSION);
    }, [setActiveSession]);

    const session = MOCK_QR_SESSION;
    const actionBooking = mockBooking || null;
    const attendanceStats = session;
    const totalStudents = attendanceStats?.totalStudents ?? 0;
    const presentStudents = attendanceStats?.presentCount ?? 0;
    const absentStudents = attendanceStats?.absentCount ?? Math.max(totalStudents - presentStudents, 0);
    const scanUrl = `${window.location.origin}/scan-attendance/${session.id}?token=${encodeURIComponent(session.qrToken)}&mockAttendance=1`;

    return {
      bookings,
      session,
      actionBooking,
      scanUrl,
      totalStudents,
      presentStudents,
      absentStudents,
    };
  }

  // PRODUCTION MODE: Original complex logic
  const activeRoomNamesFromSchedule = useMemo(() => {
    if (bookingScheduleItems.length === 0) {
      return new Set(
        bookings
          .filter(item => item.status === 'Active' && isNowInsideFeatureBookingWindow(item))
          .map(item => normalizeRoomName(item.roomName)),
      );
    }

    return new Set(
      bookingScheduleItems
        .filter(isNowInsideScheduleWindow)
        .map(item => normalizeRoomName(item.labRoomName || '')),
    );
  }, [bookingScheduleItems, bookings]);

  const activeBookingByTime = useMemo(() => {
    if (activeRoomNamesFromSchedule.size === 0) {
      return null;
    }

    return bookings.find(
      booking => activeRoomNamesFromSchedule.has(normalizeRoomName(booking.roomName)),
    ) || null;
  }, [bookings, activeRoomNamesFromSchedule]);

  const mockFallbackBooking = useMemo(() => {
    if (!isAttendanceMockMode) return null;
    return bookings.find(booking => booking.hasQRSession)
      || bookings.find(booking => booking.status === 'Active')
      || null;
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

  const scanUrl =
    normalizePossibleScanUrl(backendScanUrl)
    || buildBackendScanUrl(session)
    || (session
      ? `${window.location.origin}/scan-attendance/${session.id}?token=${encodeURIComponent(session.qrToken)}${isAttendanceMockMode ? '&mockAttendance=1' : ''}`
      : '');

  return {
    bookings,
    session,
    actionBooking,
    scanUrl,
    totalStudents,
    presentStudents,
    absentStudents,
  };
};

export const useAttendanceMockMode = () => {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('mockAttendance') === '1' || params.get('testAttendance') === '1';
  }, []);
};
