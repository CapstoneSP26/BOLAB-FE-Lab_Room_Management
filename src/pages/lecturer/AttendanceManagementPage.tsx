/**
 * Attendance Management Page - BOLAB-30
 * Lecturer's page to manage attendance and active QR sessions
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Calendar, QrCode, RefreshCw, XCircle } from 'lucide-react';
import {
  useGenerateQRCode,
  useRemoveQRCode,
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
} from '../../features/attendance/hooks/useAttendanceManagementState';

export default function AttendanceManagementPage() {
  const appAlert = useToast();
  const navigate = useNavigate();
  const { activeSession: _ } = useActiveSession();

  const bookingScheduleParams = useMemo(() => DEFAULT_ATTENDANCE_SCHEDULE_PARAMS, []);

  const {
    data: bookingScheduleData,
    isLoading: bookingScheduleLoading,
    isFetching: bookingScheduleFetching,
  } = useSchedulesAttendance(bookingScheduleParams, true);

  const generateQrCodeMutation = useGenerateQRCode();
  const removeQrCodeMutation = useRemoveQRCode();

  const legacyScheduleEnvelope = bookingScheduleData as
    | {
      data?: {
        items?: ScheduleDto[];
        result?: { items?: ScheduleDto[] };
      };
      result?: {
        items?: ScheduleDto[];
      }
    }
    | undefined;

  const bookingScheduleItems: ScheduleDto[] =
    bookingScheduleData?.items
    || legacyScheduleEnvelope?.result?.items
    || legacyScheduleEnvelope?.data?.result?.items
    || legacyScheduleEnvelope?.data?.items
    || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'upcoming' | 'past' | 'all'>('all');
  const [showQRModal, setShowQRModal] = useState(false);
  const [othersCheckinMode, setOthersCheckinMode] = useState<'qr' | 'face' | null>(null);
  const [isCreatingQr, setIsCreatingQr] = useState(false);
  const [isRefreshingQr, setIsRefreshingQr] = useState(false);
  const [stoppedQrBySessionId, setStoppedQrBySessionId] = useState<Record<string, boolean>>({});
  const [latestQRImageBase64, setLatestQRImageBase64] = useState('');

  const state = useAttendanceManagementState({
    bookingScheduleItems,
    bookingScheduleData,
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

    if (!state.activeBooking) {
      return items;
    }

    return [...items].sort((a, b) => {
      const aIsActive = a.bookingId === state.activeBooking?.bookingId;
      const bIsActive = b.bookingId === state.activeBooking?.bookingId;

      if (aIsActive && !bIsActive) return -1;
      if (!aIsActive && bIsActive) return 1;
      return 0;
    });
  }, [searchQuery, state.activeBooking, state.bookings, statusFilter]);

  // Simplified model: no expiry tracking
  const isExpired = false;
  const isQrStopped = state.activeBooking ? stoppedQrBySessionId[state.activeBooking.bookingId] : false;
  const shouldHideQrImage = isExpired || isQrStopped;

  const handleRefreshQR = async () => {
    const bookingIdForRefresh = state.activeBooking?.bookingId;
    if (!bookingIdForRefresh) {
      return;
    }

    setIsRefreshingQr(true);
    try {
      const response = await generateQrCodeMutation.mutateAsync({
        scheduleId: bookingIdForRefresh,
        isCheckIn: true,
      });

      const qrImageBase64 = response?.data || '';
      if (qrImageBase64) {
        setLatestQRImageBase64(qrImageBase64);
      }

      setStoppedQrBySessionId(prev => ({
        ...prev,
        [bookingIdForRefresh]: false,
      }));
    } catch {
      appAlert.error('Refresh failed', 'Could not create a new QR from backend.');
    } finally {
      setIsRefreshingQr(false);
    }
  };

  const handleEndSession = async () => {
    if (!state.activeBooking) return;

    const scheduleIdForEnd = state.activeBooking.bookingId;

    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn tắt QR hiện tại?\n\nSau khi tắt, ảnh QR sẽ ẩn và sinh viên không thể quét mã này nữa.',
    );

    if (!confirmed) return;

    try {
      await removeQrCodeMutation.mutateAsync({ scheduleId: scheduleIdForEnd, isCheckIn: true });
      setStoppedQrBySessionId(prev => ({ ...prev, [scheduleIdForEnd]: true }));

      appAlert.success('QR stopped', 'QR image has been turned off for this session.');
    } catch {
      appAlert.error('End session failed', 'Could not end this session. Please try again.');
    }
  };

  const handleViewQR = async () => {
    if (!state.activeBooking) {
      appAlert.warning('No active class', 'There is no in-progress class to create QR for.');
      return;
    }

    setOthersCheckinMode('qr');
    setIsCreatingQr(true);
    try {
      const bookingId = state.activeBooking.bookingId;
      const response = await generateQrCodeMutation.mutateAsync({
        scheduleId: bookingId,
        isCheckIn: true,
      });

      const qrImageBase64 = response?.data || '';
      if (qrImageBase64) {
        setLatestQRImageBase64(qrImageBase64);

        if (bookingId) {
          setStoppedQrBySessionId(prev => ({ ...prev, [bookingId]: false }));
          setShowQRModal(true);
        }
      } else {
        appAlert.error('No QR image', 'Backend did not return QR image data.');
      }
    } catch {
      appAlert.error('Create QR failed', 'Cannot create QR from backend for this session.');
    } finally {
      setIsCreatingQr(false);
    }
  };

  const handleOpenOthersCheckin = () => {
    if (!state.activeBooking) {
      appAlert.warning('No active class', 'There is no in-progress class to manage.');
      return;
    }

    setOthersCheckinMode(prev => (prev ? null : 'qr'));
  };

  const handleOpenFaceScan = () => {
    if (!state.activeBooking) {
      appAlert.warning('No active class', 'There is no in-progress class to manage.');
      return;
    }

    setOthersCheckinMode('face');
    navigate(`/attendance/camera/${state.activeBooking.roomCode}`);
  };

  useEffect(() => {
    if (!showQRModal || !state.activeBooking) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void handleRefreshQR();
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [showQRModal, state.activeBooking?.bookingId]);

  const handleManualAttendance = () => {
    if (!state.activeBooking) return;
    navigate(`/attendance/manual/${state.activeBooking.bookingId}`);
  };

  const handleExport = async (_format: 'csv' | 'excel' | 'pdf') => {
    if (!state.activeBooking) return;

    try {
      // Export functionality not available in current backend API
      appAlert.warning('Export', 'Export functionality will be available in future updates');
    } catch {
      appAlert.error('Export failed', 'Could not export attendance file.');
    }
  };

  const activeDisplayRoom = state.activeBooking?.roomName || 'Unknown Room';
  const activeDisplayBuilding = state.activeBooking?.buildingName || 'Unknown Building';

  const shouldShowBookingsLoading =
    (bookingScheduleLoading || bookingScheduleFetching)
    && filteredBookings.length === 0
    && filteredBookings.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Attendance Management</h1>
              <p className="text-slate-600 mt-1">Track student attendance and manage active QR sessions</p>
            </div>
            {state.activeBooking && (
              <AttendanceStats
                totalStudents={0}
                presentStudents={0}
                absentStudents={0}
              />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <AttendanceActiveSessionPanel
          session={null}
          actionBooking={state.activeBooking}
          activeDisplayRoom={activeDisplayRoom}
          activeDisplayBuilding={activeDisplayBuilding}
          isExpired={isExpired}
          isCreatingQr={isCreatingQr}
          othersCheckinMode={othersCheckinMode}
          onManualAttendance={handleManualAttendance}
          onOpenOthersCheckin={handleOpenOthersCheckin}
          onOpenFaceScan={handleOpenFaceScan}
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

      {showQRModal && state.activeBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">QR Code</h3>
              <p className="text-slate-600 text-sm">
                {state.activeBooking.roomName} • {formatUtcDateLabel(state.activeBooking.date)}
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
              ) : latestQRImageBase64 ? (
                <img
                  src={`data:image/png;base64,${latestQRImageBase64}`}
                  alt="QR Code for Attendance"
                  style={{ width: '280px', height: '280px' }}
                  className="border border-slate-300 rounded"
                />
              ) : (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
                  <p className="text-sm text-slate-600">Loading QR...</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={handleRefreshQR}
                disabled={isRefreshingQr || removeQrCodeMutation.isPending || isCreatingQr}
                className="bg-emerald-50 border-2 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-100 disabled:border-slate-300 disabled:bg-slate-50 text-emerald-700 disabled:text-slate-400 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshingQr ? 'animate-spin' : ''}`} />
                <span>Refresh QR</span>
              </button>

              <button
                onClick={handleEndSession}
                disabled={removeQrCodeMutation.isPending || isRefreshingQr || isCreatingQr}
                className="bg-red-50 border-2 border-red-300 hover:border-red-500 hover:bg-red-100 disabled:border-slate-300 disabled:bg-slate-50 text-red-700 disabled:text-slate-400 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                <XCircle className="w-5 h-5" />
                <span>{removeQrCodeMutation.isPending ? 'Stopping...' : 'Stop QR'}</span>
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
