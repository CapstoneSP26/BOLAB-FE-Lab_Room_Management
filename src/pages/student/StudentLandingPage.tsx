/**
 * StudentLandingPage - Student Dashboard
 * Main landing page for students with access to profile and attendance scanning
 */

import { useNavigate } from 'react-router';
import {
  QrCode, Clock, CheckCircle, AlertCircle,
  Calendar, Loader2
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { scheduleApi } from '../../features/schedules/api/scheduleApi';
import { useQuery } from '@tanstack/react-query';

export default function StudentLandingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Debug JWT
  console.log('🔐 StudentLandingPage - Current User:', user);

  // Fetch today's schedules from /api/schedules
  // Filter by today's date and current user
  const { data: scheduleData, isLoading: classesLoading, error: classesError } = useQuery({
    queryKey: ['schedules-today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await scheduleApi.getSchedules({
        fromDate: today,
        toDate: today,
        status: 'Active',
      });
      return response?.items || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const upcomingClasses = scheduleData || [];

  const handleScanQRFromClass = (scheduleId: string) => {
    navigate(`/student/scan-attendance/${scheduleId}`);
  };

  const getStatusColor = (status: string) => {
    // Map actual API statuses to display categories
    if (status === 'NotYet') return 'bg-blue-50 border-blue-200 text-blue-700'; // upcoming
    if (status === 'Active' || status === 'InProcess') return 'bg-amber-50 border-amber-200 text-amber-700'; // ongoing
    if (status === 'Completed' || status === 'Done' || status === 'Finish') return 'bg-emerald-50 border-emerald-200 text-emerald-700'; // completed
    return 'bg-slate-50 border-slate-200 text-slate-700';
  };

  const getStatusBadge = (status: string) => {
    // Map actual API statuses to display categories
    if (status === 'NotYet') return <Clock className="w-4 h-4" />; // upcoming
    if (status === 'Active' || status === 'InProcess') return <AlertCircle className="w-4 h-4" />; // ongoing
    if (status === 'Completed' || status === 'Done' || status === 'Finish') return <CheckCircle className="w-4 h-4" />; // completed
    return null;
  };

  const getStatusLabel = (status: string) => {
    if (status === 'NotYet') return 'Upcoming';
    if (status === 'Active' || status === 'InProcess') return 'Ongoing';
    if (status === 'Completed' || status === 'Done' || status === 'Finish') return 'Completed';
    return status;
  };

  const isOngoing = (status: string) => status === 'Active' || status === 'InProcess';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="w-full px-4 md:max-w-7xl md:mx-auto py-4 md:py-8 space-y-4 md:space-y-8">
        {/* Today's Classes - Table Format */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="px-4 md:px-8 py-4 md:py-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-slate-900">Today's Classes</h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1">Your schedule for today</p>
              </div>
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />
            </div>
          </div>

          {classesLoading ? (
            <div className="px-4 md:px-8 py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Loading your schedule...</p>
            </div>
          ) : classesError ? (
            <div className="px-4 md:px-8 py-12 text-center text-red-600">
              <AlertCircle className="w-8 h-8 mx-auto mb-3" />
              <p className="text-sm">Failed to load schedule</p>
            </div>
          ) : upcomingClasses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 md:px-6 py-3 font-semibold text-slate-700 text-xs md:text-sm">Subject</th>
                    <th className="px-4 md:px-6 py-3 font-semibold text-slate-700 text-xs md:text-sm whitespace-nowrap">Time</th>
                    <th className="hidden sm:table-cell px-4 md:px-6 py-3 font-semibold text-slate-700 text-xs md:text-sm">Room</th>
                    <th className="hidden md:table-cell px-4 md:px-6 py-3 font-semibold text-slate-700 text-xs md:text-sm">Lecturer</th>
                    <th className="px-4 md:px-6 py-3 font-semibold text-slate-700 text-xs md:text-sm text-center">Status</th>
                    <th className="px-4 md:px-6 py-3 font-semibold text-slate-700 text-xs md:text-sm text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {upcomingClasses.map((cls) => (
                    <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 md:px-6 py-4">
                        <div className="font-semibold text-slate-900 text-xs md:text-sm">{cls.subjectCode}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-600 text-xs md:text-sm">
                          <Clock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                          <span>{cls.slotName}</span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 md:px-6 py-4">
                        <div className="text-slate-600 text-xs md:text-sm">{cls.labRoomName}</div>
                      </td>
                      <td className="hidden md:table-cell px-4 md:px-6 py-4">
                        <div className="text-slate-600 text-xs md:text-sm">{cls.lecturerName}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            cls.status
                          )}`}
                        >
                          {getStatusBadge(cls.status)}
                          <span className="hidden xs:inline">{getStatusLabel(cls.status)}</span>
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-center">
                        {isOngoing(cls.status) && (
                          <button
                            onClick={() => handleScanQRFromClass(cls.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm transition-colors flex items-center gap-1 mx-auto whitespace-nowrap"
                          >
                            <QrCode className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="hidden xs:inline">Scan</span>
                          </button>
                        )}
                        {cls.status === 'NotYet' && (
                          <div className="text-slate-500 text-xs">Soon</div>
                        )}
                        {(cls.status === 'Completed' || cls.status === 'Done' || cls.status === 'Finish') && (
                          <div className="text-emerald-600 text-xs flex items-center justify-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 md:px-8 py-12 text-center text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm md:text-base">No classes scheduled for today</p>
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl md:rounded-2xl shadow-md border border-blue-200 p-4 md:p-8">
          <div className="flex items-start gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2 md:mb-3">Quick Tips for Attendance</h3>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-slate-700">
                <li>• ✓ Scan the QR code displayed by your lecturer each class</li>
                <li>• ✓ Make sure your camera is working before class starts</li>
                <li>• ✓ Check your attendance record regularly on your profile</li>
                <li>• ✓ Contact your lecturer if you have any attendance issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button - Scan QR */}
      <button
        onClick={() => {
          const ongoingClass = upcomingClasses.find(cls => isOngoing(cls.status));
          if (ongoingClass) {
            navigate(`/student/scan-attendance/${ongoingClass.id}`);
          } else {
            navigate(`/student/scan-attendance/general`);
          }
        }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 group w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center text-white z-40"
        title="Scan QR Code"
      >
        <QrCode className="w-8 h-8 md:w-10 md:h-10 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}
