/**
 * Attendance Management Page - BOLAB-30
 * Lecturer's page to manage attendance and active QR sessions
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  Calendar,
  Clock,
  MapPin,
  Users,
  RefreshCw,
  ExternalLink,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Search,
  UserCheck,
  Lock,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  useLecturerBookings,
  useQRSession,
  useRefreshQRToken,
  useEndQRSession,
  useAttendanceList,
  useExportAttendance,
  type BookingWithQR,
} from '../../features/attendance';
import { MOCK_LECTURER_BOOKINGS, MOCK_QR_SESSION } from '../../features/attendance/mocks/attendance.mock';
import { useActiveSession } from '../../context/ActiveSessionContext';
import { useToast } from '../../hooks/useToast';

export default function AttendanceManagementPage() {
  const appAlert = useToast();
  // Global context for active session (shared with Header)
  const { activeSession, setActiveSession } = useActiveSession();
  
  // Queries & Mutations
  const { data: bookingsData, isLoading: bookingsLoading } = useLecturerBookings();
  const navigate = useNavigate();
  const refreshTokenMutation = useRefreshQRToken();
  const endSessionMutation = useEndQRSession({
    onSuccess: () => {
      console.log('✅ QR Session ended successfully');
      setActiveSession(null); // Clear global context
    },
    onError: (error) => {
      console.error('Failed to end QR session:', error);
    },
  });
  const exportMutation = useExportAttendance();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [showQRModal, setShowQRModal] = useState(false);

  // Get active session details (polling enabled)
  const { data: sessionData } = useQRSession(activeSession?.id || null, !!activeSession?.id);
  // Poll attendance for background updates (results cached in React Query)
  useAttendanceList(activeSession?.id || null, !!activeSession?.id);
  
  // Initialize active session from mock data on mount (for demo purposes)
  useEffect(() => {
    if (!activeSession) {
      setActiveSession(MOCK_QR_SESSION);
    }
  }, []);

  const session = sessionData?.data || activeSession; // Use API data or context data
  const bookings = bookingsData?.data || MOCK_LECTURER_BOOKINGS; // Mock data - remove when API ready

  // Generate scan URL for QR code
  const scanUrl = session ? `${window.location.origin}/scan-attendance/${session.id}?token=${encodeURIComponent(session.qrToken)}` : '';

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    // Status filter
    if (statusFilter === 'upcoming' && !booking.isUpcoming) return false;
    if (statusFilter === 'past' && !booking.isPast) return false;

    // Search filter
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

  // Handle refresh QR token
  const handleRefreshQR = async () => {
    if (!activeSession) return;

    try {
      // Mock mode: Update global context with new token and expiry
      if (!sessionData?.data) {
        // Using mock data - simulate refresh
        const newToken = 'QR_SESSION_TOKEN_REFRESHED_' + Date.now();
        const newExpiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        
        setActiveSession({
          ...activeSession,
          qrToken: newToken,
          qrExpiry: newExpiry,
        });
        
        console.log('✅ QR Code refreshed! (Mock mode)');
        return;
      }
      
      // Real API mode
      await refreshTokenMutation.mutateAsync({
        sessionId: activeSession.id,
        expiryMinutes: 5,
      });
    } catch (error) {
      console.error('Failed to refresh QR token:', error);
    }
  };

  // Handle end QR session
  const handleEndSession = async () => {
    if (!activeSession) return;

    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn kết thúc phiên điểm danh này?\n\nSau khi kết thúc, sinh viên sẽ không thể quét QR code nữa.'
    );

    if (!confirmed) return;

    try {
      // Mock mode: Clear global context
      if (!sessionData?.data) {
        setActiveSession(null);
        console.log('✅ QR Session ended! (Mock mode)');
        return;
      }

      // Real API mode
      await endSessionMutation.mutateAsync({
        sessionId: activeSession.id,
      });
    } catch (error) {
      console.error('Failed to end QR session:', error);
    }
  };

  // Handle open TV display
  const handleOpenTVDisplay = () => {
    if (!activeSession) return;
    window.open(`/qr-display/${activeSession.id}`, '_blank');
  };

  // Handle manual attendance
  const handleManualAttendance = () => {
    if (!activeSession) return;
    navigate(`/attendance/manual/${activeSession.id}`);
  };

  // Handle export attendance
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!activeSession) return;

    try {
      await exportMutation.mutateAsync({
        sessionId: activeSession.id,
        format,
      });
    } catch (error) {
      console.error('Failed to export attendance:', error);
    }
  };

  // Calculate time remaining
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.qrExpiry) {
      setTimeRemaining(null);
      return;
    }

    const calculateRemaining = () => {
      const expiry = new Date(session.qrExpiry);
      const now = new Date();
      const diff = Math.floor((expiry.getTime() - now.getTime()) / 1000);
      setTimeRemaining(diff > 0 ? diff : 0);
      
      // Auto-clear session from context when expired
      if (diff <= 0 && activeSession) {
        setActiveSession(null);
      }
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [session?.qrExpiry, activeSession, setActiveSession]);

  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if session is editable (only today's sessions)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Attendance Management</h1>
              <p className="text-slate-600 mt-1">
                Track student attendance and manage active QR sessions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Total Sessions</p>
                <p className="text-2xl font-bold text-slate-900">{bookings.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Active Session Card */}
        {session && (
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
                    {!isSessionEditable(session.date) && (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-300 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Read-Only
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 font-medium">
                    {session.roomName} • {session.buildingName}
                  </p>
                </div>
              </div>

              {/* Timer Badge */}
              {!isExpired ? (
                <div className="bg-emerald-100 border-2 border-emerald-300 rounded-xl px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <span className="text-2xl font-bold text-emerald-700 tabular-nums">
                      {timeRemaining !== null ? formatTimeRemaining(timeRemaining) : '--:--'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-red-100 border-2 border-red-300 rounded-xl px-5 py-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-lg font-bold text-red-700">Expired</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {/* Present */}
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 hover:border-emerald-400 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-600">Present</span>
                </div>
                <p className="text-3xl font-bold text-emerald-600 tabular-nums">{session.presentCount}</p>
              </div>

              {/* Late */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 hover:border-amber-400 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-600">Late</span>
                </div>
                <p className="text-3xl font-bold text-amber-600 tabular-nums">{session.lateCount}</p>
              </div>

              {/* Absent */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 hover:border-red-400 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-600">Absent</span>
                </div>
                <p className="text-3xl font-bold text-red-600 tabular-nums">{session.absentCount}</p>
              </div>

              {/* Total */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-600">Total</span>
                </div>
                <p className="text-3xl font-bold text-blue-600 tabular-nums">{session.totalStudents}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleOpenTVDisplay}
                  className="bg-blue-50 border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Open TV Display</span>
                </button>

                <button
                  onClick={handleManualAttendance}
                  className="bg-indigo-50 border-2 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-100 text-indigo-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-5 h-5" />
                  <span>Manual Attendance</span>
                </button>

                <button
                  onClick={handleRefreshQR}
                  disabled={refreshTokenMutation.isPending}
                  className="bg-emerald-50 border-2 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-100 disabled:border-slate-300 disabled:bg-slate-50 text-emerald-700 disabled:text-slate-400 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-5 h-5 ${refreshTokenMutation.isPending ? 'animate-spin' : ''}`} />
                  <span>Refresh QR</span>
                </button>

                <button
                  onClick={() => setShowQRModal(true)}
                  className="bg-slate-50 border-2 border-slate-300 hover:border-slate-500 hover:bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <QrCode className="w-5 h-5" />
                  <span>View QR</span>
                </button>
              </div>

              {/* End Session Button */}
              <button
                onClick={handleEndSession}
                disabled={endSessionMutation.isPending}
                className="w-full bg-red-50 border-2 border-red-300 hover:border-red-500 hover:bg-red-100 disabled:border-slate-300 disabled:bg-slate-50 text-red-700 disabled:text-slate-400 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                <XCircle className="w-5 h-5" />
                <span>{endSessionMutation.isPending ? 'Ending...' : 'End Session'}</span>
              </button>
            </div>

            {/* Export Dropdown */}
            <div className="relative group mt-3">
              <button className="w-full bg-slate-50 border-2 border-slate-300 hover:border-slate-500 hover:bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                <span>Export Attendance</span>
              </button>
                
              {/* Dropdown */}
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

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Search */}
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

            {/* Status Filter */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter('upcoming')}
                className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                  statusFilter === 'upcoming'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setStatusFilter('past')}
                className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                  statusFilter === 'past'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Past
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-3">
          {bookingsLoading ? (
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
            filteredBookings.map((booking) => (
              <BookingCard
                key={booking.bookingId}
                booking={booking}
              />
            ))
          )}
        </div>
      </div>

      {/* QR Modal */}
      {showQRModal && session && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">QR Code</h3>
              <p className="text-slate-600 text-sm">
                {session.roomName} • {new Date(session.date).toLocaleDateString('vi-VN')}
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6 bg-slate-50 border-2 border-slate-200 rounded-2xl p-8">
              {isExpired ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-lg font-bold text-slate-900 mb-1">QR Code Expired</p>
                  <p className="text-sm text-slate-600">Please refresh to generate a new code</p>
                </div>
              ) : (
                <QRCodeSVG 
                  value={scanUrl} 
                  size={280} 
                  level="H" 
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                />
              )}
            </div>

            {/* Timer */}
            {!isExpired && timeRemaining !== null && (
              <div className="text-center mb-6 space-y-3">
                <div className="inline-flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span className="text-xl font-bold text-slate-900 tabular-nums">
                    {formatTimeRemaining(timeRemaining)}
                  </span>
                  <span className="text-sm text-slate-600 font-medium">left</span>
                </div>
                
                {/* Test Button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(scanUrl);
                    appAlert.success('Link copied', 'Open in new tab or send to phone.');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                >
                  📋 Copy Link to Test
                </button>
              </div>
            )}

            {/* Close Button */}
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

/**
 * Booking Card Component
 */
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
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-slate-700" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 truncate">{booking.roomName}</h3>
                <span
                  className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    statusColors[booking.status]
                  }`}
                >
                  {booking.status}
                </span>
              </div>
              <p className="text-sm text-slate-600">{booking.roomCode}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">{booking.buildingName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{new Date(booking.date).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm tabular-nums">
                {booking.startTime} - {booking.endTime}
              </span>
            </div>
          </div>

          {/* Purpose */}
          <p className="text-sm text-slate-700 line-clamp-1">
            <span className="font-semibold">Purpose:</span> {booking.purpose}
          </p>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0">
          {booking.hasQRSession ? (
            <button
              onClick={() => navigate(`/qr-display/${booking.qrSessionId}`)}
              className="bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md flex items-center gap-2 whitespace-nowrap"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Session</span>
            </button>
          ) : booking.isUpcoming && booking.status === 'Approved' ? (
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
