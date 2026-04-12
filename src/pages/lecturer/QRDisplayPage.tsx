/**
 * QR Display Page - BOLAB-30
 * Full-screen QR code display for TV/projector
 * URL: /qr-display/:sessionId
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, RefreshCw, CheckCircle2, AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { useAttendanceList, useGenerateQRCode } from '../../features/attendance';
import { useActiveSession } from '../../context/ActiveSessionContext';
import { useToast } from '../../hooks/useToast';

export default function QRDisplayPage() {
  const appAlert = useToast();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { activeSession } = useActiveSession();
  
  // Fetch attendance list for the schedule
  const { 
    data: attendanceData,
    isLoading: sessionLoading,
    isError: sessionError,
    error: sessionErrorData,
  } = useAttendanceList(sessionId || null);

  // Fetch QR code image from backend
  const generateQrMutation = useGenerateQRCode();
  const [qrImageBase64, setQrImageBase64] = useState('');
  const [isLoadingQR, setIsLoadingQR] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Use activeSession from context if available
  const session = activeSession && activeSession.id === sessionId ? activeSession : null;
    
  const students = attendanceData?.data || [];
  const presentCount = Array.isArray(students) ? students.filter((s: any) => s.status === 'present').length : 0;

  // Fetch QR image on mount
  useEffect(() => {
    if (!sessionId) return;

    const fetchQRImage = async () => {
      setIsLoadingQR(true);
      try {
        const response = await generateQrMutation.mutateAsync({
          scheduleId: sessionId,
          isCheckIn: true,
        });
        
        if (response?.data) {
          setQrImageBase64(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch QR image:', error);
      } finally {
        setIsLoadingQR(false);
      }
    };

    fetchQRImage();
  }, [sessionId, generateQrMutation]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
  if (sessionError) {
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

  if (!session) {
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
            The QR session is unavailable. Please return to attendance and generate a new QR.
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
            {/* Left: Schedule ID */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <Calendar className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-sm text-slate-500 font-medium">Schedule</p>
                  <p className="text-lg font-bold text-slate-900">{sessionId}</p>
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
                {isLoadingQR ? (
                  <div className="text-center py-24">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg font-medium text-slate-600">Loading QR Code...</p>
                  </div>
                ) : qrImageBase64 ? (
                  <img
                    src={`data:image/png;base64,${qrImageBase64}`}
                    alt="QR Code for Attendance"
                    style={{ width: '420px', height: '420px' }}
                    className="border border-slate-300 rounded"
                  />
                ) : (
                  <div className="text-center py-24">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-10 h-10 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mb-2">QR Code Unavailable</p>
                    <p className="text-slate-600">
                      Failed to load QR code. Please refresh the page or ask your lecturer to regenerate.
                    </p>
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <div className="text-center">
                <button
                  onClick={async () => {
                    setIsLoadingQR(true);
                    try {
                      const response = await generateQrMutation.mutateAsync({
                        scheduleId: sessionId!,
                        isCheckIn: true,
                      });
                      if (response?.data) {
                        setQrImageBase64(response.data);
                        appAlert.success('QR Refreshed', 'New QR code loaded.');
                      }
                    } catch {
                      appAlert.error('Refresh failed', 'Could not refresh QR code.');
                    } finally {
                      setIsLoadingQR(false);
                    }
                  }}
                  disabled={isLoadingQR}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh QR
                </button>
              </div>
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
