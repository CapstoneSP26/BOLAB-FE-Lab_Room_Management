/**
 * Attendance Management Page - BOLAB-30
 * Lecturer's page to manage attendance and active QR sessions
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Calendar, Clock, QrCode, RefreshCw, XCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  useCreateQRSession,
  useEndQRSession,
  useExportAttendance,
} from '../../features/attendance';
import { useSchedulesAttendance } from '../../features/schedules/hooks/useSchedulesAttendance';
import type { ScheduleDto } from '../../features/schedules/types/schedule.type';
import { useActiveSession } from '../../context/ActiveSessionContext';
import { useToast } from '../../hooks/useToast';
import {
  formatUtcDateLabel,
  isBookingPast,
  isBookingUpcoming,
} from '../../utils/date.util';
import { AttendanceBookingCard } from '../../features/booking/components/AttendanceBookingCard';
import { AttendanceStats } from '../../features/attendance/components/AttendanceStats';
import { AttendanceToolbar } from '../../features/attendance/components/AttendanceToolbar';
import { AttendanceActiveSessionPanel } from '../../features/attendance/components/AttendanceActiveSessionPanel';
import {
  DEFAULT_ATTENDANCE_SCHEDULE_PARAMS,
  useAttendanceManagementState,
  useAttendanceMockMode,
} from '../../features/attendance/hooks/useAttendanceManagementState';
import {
  buildBackendScanUrl,
  extractBackendScanUrl,
  normalizePossibleScanUrl,
  normalizeQrSessionPayload,
  unwrapSessionPayload,
} from '../../features/attendance/utils/attendanceManagementHelpers';

export default function AttendanceManagementPage() {
  const appAlert = useToast();
  const navigate = useNavigate();
  const { activeSession, setActiveSession } = useActiveSession();
  const isAttendanceMockMode = useAttendanceMockMode();

  const bookingScheduleParams = useMemo(() => DEFAULT_ATTENDANCE_SCHEDULE_PARAMS, []);

  const {
    data: bookingScheduleData,
    isLoading: bookingScheduleLoading,
    isFetching: bookingScheduleFetching,
  } = useSchedulesAttendance(bookingScheduleParams, true);

  const createQrSessionMutation = useCreateQRSession();
  const endSessionMutation = useEndQRSession();
  const exportMutation = useExportAttendance();

  const bookingScheduleItems: ScheduleDto[] =
    ((bookingScheduleData?.data as { result?: { items?: ScheduleDto[] } })?.result?.items)
    || bookingScheduleData?.data?.items
    || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'upcoming' | 'past' | 'all'>('all');
  const [showQRModal, setShowQRModal] = useState(false);
  const [isCreatingQr, setIsCreatingQr] = useState(false);
  const [isRefreshingQr, setIsRefreshingQr] = useState(false);
  const [stoppedQrBySessionId, setStoppedQrBySessionId] = useState<Record<string, boolean>>({});
  const [latestBackendScanUrl, setLatestBackendScanUrl] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const state = useAttendanceManagementState({
    bookingScheduleItems,
    bookingScheduleData,
    isAttendanceMockMode,
    activeSession,
    setActiveSession,
  });

  const filteredBookings = useMemo(() => {
    const items = state.bookings.filter((booking) => {
      const upcoming = isBookingUpcoming(booking);
      const past = isBookingPast(booking);

      if (statusFilter === 'upcoming' && !upcoming) return false;
      if (statusFilter === 'past' && !past) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          booking.roomName.toLowerCase().includes(query)
          || booking.roomCode.toLowerCase().includes(query)
          || booking.buildingName.toLowerCase().includes(query)
          || booking.purpose.toLowerCase().includes(query)
        );
      }

      return true;
    });

    if (!state.actionBooking) {
      return items;
    }

    return [...items].sort((a, b) => {
      const aIsActive = a.bookingId === state.actionBooking?.bookingId;
      const bIsActive = b.bookingId === state.actionBooking?.bookingId;

      if (aIsActive && !bIsActive) return -1;
      if (!aIsActive && bIsActive) return 1;
      return 0;
    });
  }, [searchQuery, state.actionBooking, state.bookings, statusFilter]);

  const scanUrl =
    normalizePossibleScanUrl(latestBackendScanUrl)
    || state.scanUrl;

  useEffect(() => {
    const sessionId = state.session?.id;
    if (!sessionId) {
      setTimeRemaining(null);
      return;
    }

    if (stoppedQrBySessionId[sessionId]) {
      setTimeRemaining(0);
      return;
    }

    if (!state.session?.qrExpiry) {
      setTimeRemaining(null);
      return;
    }

    const calculateRemaining = () => {
      const expiry = new Date(state.session!.qrExpiry);
      const now = new Date();
      const diff = Math.floor((expiry.getTime() - now.getTime()) / 1000);
      setTimeRemaining(diff > 0 ? diff : 0);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, [state.session?.id, state.session?.qrExpiry, stoppedQrBySessionId]);

  const isExpired = timeRemaining !== null && timeRemaining <= 0;
  const isQrStopped = !!(state.session && stoppedQrBySessionId[state.session.id]);
  const shouldHideQrImage = isExpired || isQrStopped;

  const handleRefreshQR = async () => {
    setIsRefreshingQr(true);
    try {
      const bookingIdForRefresh = state.actionBooking?.bookingId || state.session?.bookingId;
      if (!bookingIdForRefresh) {
        appAlert.warning('No active class', 'No booking is available to generate a new QR.');
        return;
      }

      const created = await createQrSessionMutation.mutateAsync({
        scheduleId: bookingIdForRefresh,
        isCheckIn: true,
      });

      const nextSession = normalizeQrSessionPayload(unwrapSessionPayload(created), state.session || null);
      const extractedScanUrl = extractBackendScanUrl(created);
      setLatestBackendScanUrl(extractedScanUrl || buildBackendScanUrl(nextSession));

      const refreshedExpiry = new Date(nextSession.qrExpiry);
      const refreshedDiff = Math.floor((refreshedExpiry.getTime() - Date.now()) / 1000);
      setTimeRemaining(refreshedDiff > 0 ? refreshedDiff : 0);

      setActiveSession(nextSession);
      setStoppedQrBySessionId(prev => ({
        ...prev,
        ...(state.session?.id ? { [state.session.id]: false } : {}),
        [nextSession.id]: false,
      }));

      appAlert.success('QR refreshed', 'New QR code is ready.');
    } catch {
      appAlert.error('Refresh failed', 'Could not create a new QR from backend.');
    } finally {
      setIsRefreshingQr(false);
    }
  };

  const handleEndSession = async () => {
    if (!state.session) return;

    const scheduleIdForEnd = state.actionBooking?.bookingId || state.session.bookingId;
    if (!scheduleIdForEnd) {
      appAlert.warning('No active class', 'No schedule is available to end QR session.');
      return;
    }

    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn tắt QR hiện tại?\n\nSau khi tắt, ảnh QR sẽ ẩn và sinh viên không thể quét mã này nữa.',
    );

    if (!confirmed) return;

    try {
      await endSessionMutation.mutateAsync({ scheduleId: scheduleIdForEnd, isCheckIn: true });
      setTimeRemaining(0);
      setStoppedQrBySessionId(prev => ({ ...prev, [state.session!.id]: true }));
      appAlert.success('QR stopped', 'QR image has been turned off for this session.');
    } catch {
      appAlert.error('End session failed', 'Could not end this session. Please try again.');
    }
  };

  const handleViewQR = async () => {
    if (state.session?.isActive) {
      setShowQRModal(true);
      return;
    }

    if (!state.actionBooking) {
      appAlert.warning('No active class', 'There is no in-progress class to create QR for.');
      return;
    }

    setIsCreatingQr(true);
    try {
      const response = await createQrSessionMutation.mutateAsync({
        scheduleId: state.actionBooking.bookingId,
        isCheckIn: true,
      });

      const nextSession = normalizeQrSessionPayload(unwrapSessionPayload(response), state.session || null);
      const extractedScanUrl = extractBackendScanUrl(response);
      setLatestBackendScanUrl(extractedScanUrl || buildBackendScanUrl(nextSession));

      if (nextSession?.id) {
        setActiveSession(nextSession);
        setStoppedQrBySessionId(prev => ({ ...prev, [nextSession.id]: false }));
        setShowQRModal(true);
      }
    } catch {
      appAlert.error('Create QR failed', 'Cannot create QR from backend for this session.');
    } finally {
      setIsCreatingQr(false);
    }
  };

  const handleOpenTVDisplay = () => {
    if (!state.session) return;
    window.open(`/qr-display/${state.session.id}`, '_blank');
  };

  const handleManualAttendance = () => {
    if (!state.session) return;
    navigate(`/attendance/manual/${state.session.id}${isAttendanceMockMode ? '?mockAttendance=1' : ''}`);
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!state.session) return;

    try {
      await exportMutation.mutateAsync({
        sessionId: state.session.id,
        format,
      });
    } catch {
      appAlert.error('Export failed', 'Could not export attendance file.');
    }
  };

  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeDisplayRoom = state.session?.roomName || state.actionBooking?.roomName || 'Unknown Room';
  const activeDisplayBuilding = state.session?.buildingName || state.actionBooking?.buildingName || 'Unknown Building';

  const shouldShowBookingsLoading =
    (bookingScheduleLoading || bookingScheduleFetching)
    && filteredBookings.length === 0
    && !(isAttendanceMockMode && filteredBookings.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Attendance Management</h1>
              <p className="text-slate-600 mt-1">Track student attendance and manage active QR sessions</p>
            </div>
            <AttendanceStats
              totalStudents={state.totalStudents}
              presentStudents={state.presentStudents}
              absentStudents={state.absentStudents}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <AttendanceActiveSessionPanel
          session={state.session}
          actionBooking={state.actionBooking}
          activeDisplayRoom={activeDisplayRoom}
          activeDisplayBuilding={activeDisplayBuilding}
          isExpired={isExpired}
          isCreatingQr={isCreatingQr}
          onOpenTVDisplay={handleOpenTVDisplay}
          onManualAttendance={handleManualAttendance}
          onViewQR={handleViewQR}
          onExport={handleExport}
        />

        <AttendanceToolbar
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

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
            filteredBookings.map((booking) => <AttendanceBookingCard key={booking.bookingId} booking={booking} />)
          )}
        </div>
      </div>

      {showQRModal && state.session && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">QR Code</h3>
              <p className="text-slate-600 text-sm">
                {state.session.roomName} • {formatUtcDateLabel(state.session.date)}
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
              ) : state.session.qrImageBase64 ? (
                <img
                  src={`data:image/png;base64,${state.session.qrImageBase64}`}
                  alt="Session QR"
                  className="w-[280px] h-[280px] object-contain"
                />
              ) : (
                <QRCodeSVG value={scanUrl} size={280} level="H" bgColor="#ffffff" fgColor="#0f172a" />
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
