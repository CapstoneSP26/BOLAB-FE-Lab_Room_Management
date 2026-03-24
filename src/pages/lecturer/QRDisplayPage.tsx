/**
 * QR Display Page - BOLAB-30
 * Full-screen QR code display for TV/projector
 * URL: /qr-display/:sessionId
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, MapPin, Calendar, RefreshCw, CheckCircle2, AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { useQRSession, useAttendanceList } from '../../features/attendance';
import { MOCK_QR_SESSION, MOCK_STUDENT_ATTENDANCE } from '../../features/attendance/mocks/attendance.mock';
import { useActiveSession } from '../../context/ActiveSessionContext';
import { useToast } from '../../hooks/useToast';

export default function QRDisplayPage() {
  const appAlert = useToast();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { activeSession } = useActiveSession();
  
  // Polling enabled for real-time updates - WITH ERROR HANDLING
  const { 
    data: sessionData, 
    isLoading: sessionLoading,
    isError: sessionError,
    error: sessionErrorData,
  } = useQRSession(sessionId || null, true);
  
  const { 
    data: attendanceData,
  } = useAttendanceList(sessionId || null, true);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Priority: activeSession from context > API data > mock data
  // This ensures real-time sync with Attendance page
  const session = (activeSession && activeSession.id === sessionId) 
    ? activeSession 
    : (sessionData?.data || MOCK_QR_SESSION);
    
  const students = attendanceData?.data?.students || MOCK_STUDENT_ATTENDANCE;
  const presentCount = students.filter(s => s.status === 'present').length;

  // Generate scan URL for QR code (safe with fallback)
  const scanUrl = session?.qrToken 
    ? `${window.location.origin}/scan-attendance/${sessionId}?token=${encodeURIComponent(session.qrToken)}`
    : '#';

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate time remaining until QR expiry
  useEffect(() => {
    if (!session?.qrExpiry) return;

    const calculateRemaining = () => {
      const expiry = new Date(session.qrExpiry);
      const now = new Date();
      const diff = Math.floor((expiry.getTime() - now.getTime()) / 1000);
      setTimeRemaining(diff > 0 ? diff : 0);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [session?.qrExpiry]);

  // Format time remaining as MM:SS
  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">Loading QR Code...</p>
        </div>
      </div>
    );
  }

  // Error state - Session not found or API error
  if (sessionError && !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Session Not Found
          </h1>
          
          <p className="text-gray-600 mb-6">
            {sessionErrorData instanceof Error 
              ? sessionErrorData.message 
              : 'The QR session you\'re looking for doesn\'t exist or has been deleted.'}
          </p>

          <button
            onClick={() => navigate('/attendance')}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Attendance Page
          </button>
        </div>
      </div>
    );
  }

  // Expired state
  const isExpired = timeRemaining !== null && timeRemaining <= 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header Bar */}
      <div className="max-w-[1400px] mx-auto mb-6">
        {/* Minimal Navigation Controls */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate('/attendance')}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Attendance
          </button>

          <button
            onClick={() => navigate('/')}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            {/* Left: Room Info */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <MapPin className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-sm text-slate-500 font-medium">Room</p>
                  <p className="text-lg font-bold text-slate-900">{session.roomName}</p>
                </div>
              </div>
              
              <div className="h-12 w-px bg-slate-200"></div>
              
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <Calendar className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-sm text-slate-500 font-medium">Date</p>
                  <p className="text-lg font-bold text-slate-900">{new Date(session.date).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              
              <div className="h-12 w-px bg-slate-200"></div>
              
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <Clock className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-sm text-slate-500 font-medium">Time</p>
                  <p className="text-lg font-bold text-slate-900">{session.startTime} - {session.endTime}</p>
                </div>
              </div>
            </div>

            {/* Right: Current Time */}
            <div className="text-right">
              <div className="text-4xl font-bold text-slate-900 tracking-tight tabular-nums">
                {currentTime.toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
              <div className="text-sm text-slate-500 mt-1 font-medium">
                {currentTime.toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-3 gap-6">
          {/* Left: QR Code - Takes 2 columns */}
          <div className="col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Scan to Check In
                </h2>
                <p className="text-slate-600">
                  Point your phone camera at the QR code
                </p>
              </div>

              {/* QR Code Container */}
              <div className="flex justify-center items-center bg-slate-50 border-2 border-slate-200 rounded-2xl p-12 mb-6">
                {isExpired ? (
                  <div className="text-center py-24">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <RefreshCw className="w-10 h-10 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mb-2">QR Code Expired</p>
                    <p className="text-slate-600">
                      Please ask your lecturer to refresh the code
                    </p>
                  </div>
                ) : (
                  <QRCodeSVG
                    value={scanUrl}
                    size={420}
                    level="H"
                    includeMargin
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                  />
                )}
              </div>

              {/* Expiry Timer */}
              {!isExpired && timeRemaining !== null && (
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-6 py-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <span className="text-2xl font-bold text-slate-900 tabular-nums">
                      {formatTimeRemaining(timeRemaining)}
                    </span>
                    <span className="text-sm text-slate-600 font-medium">remaining</span>
                  </div>
                  
                  {/* Test Button - for development */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(scanUrl);
                      appAlert.success('Link copied', 'Paste in browser or send to phone.');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                  >
                    📋 Copy Link to Test
                  </button>
                </div>
              )}

              {isExpired && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-6 py-3">
                    <RefreshCw className="w-5 h-5 text-red-600" />
                    <span className="text-lg font-bold text-red-900">Code Expired</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Attendance Stats */}
          <div className="col-span-1 space-y-6">
            {/* Main Counter */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Attendance</h3>
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              
              <div className="text-center py-6">
                <div className="text-6xl font-bold text-slate-900 mb-2 tabular-nums">
                  {presentCount}
                </div>
                <div className="text-lg text-slate-600 mb-6">
                  of {session.totalStudents} students
                </div>
                
                {/* Progress Bar */}
                <div className="bg-slate-100 rounded-full h-3 overflow-hidden mb-4">
                  <div
                    className="h-full bg-blue-600 transition-all duration-700 ease-out rounded-full"
                    style={{
                      width: `${session.totalStudents > 0 ? (presentCount / session.totalStudents) * 100 : 0}%`,
                    }}
                  />
                </div>
                
                <div className="text-2xl font-bold text-slate-900 tabular-nums">
                  {session.totalStudents > 0
                    ? Math.round((presentCount / session.totalStudents) * 100)
                    : 0}%
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Status Breakdown</h3>
              
              <div className="space-y-3">
                {/* Present */}
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-semibold text-slate-700">Present</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-700 tabular-nums">
                    {session.presentCount}
                  </span>
                </div>

                {/* Late */}
                <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm font-semibold text-slate-700">Late</span>
                  </div>
                  <span className="text-xl font-bold text-amber-700 tabular-nums">
                    {session.lateCount}
                  </span>
                </div>

                {/* Absent */}
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-semibold text-slate-700">Absent</span>
                  </div>
                  <span className="text-xl font-bold text-red-700 tabular-nums">
                    {session.absentCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Lecturer Info */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {session.lecturerName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Lecturer</p>
                  <p className="text-lg font-bold text-slate-900">
                    {session.lecturerName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Instructions */}
        <div className="mt-6 text-center">
          <div className="max-w-[1400px] mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-8 py-4">
              <p className="text-slate-600">
                <span className="font-semibold text-slate-900">📱 How to check in:</span> Open your camera app, point at the QR code, then tap the notification
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
