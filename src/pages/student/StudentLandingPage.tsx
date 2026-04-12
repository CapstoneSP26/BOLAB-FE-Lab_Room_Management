/**
 * StudentLandingPage - Student Dashboard
 * Main landing page for students with access to profile and attendance scanning
 */

import { useNavigate } from 'react-router';
import {
  QrCode, User, Clock, CheckCircle, AlertCircle,
  ArrowRight, Calendar, MapPin, Users, TrendingUp,
  Bell, Settings, Loader2
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { useStudentStatistics } from '../../features/profile';
import { scheduleApi } from '../../features/schedules/api/scheduleApi';
import { useQuery } from '@tanstack/react-query';

export default function StudentLandingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Debug JWT
  console.log('🔐 StudentLandingPage - Current User:', user);

  // Fetch student statistics from /api/profile/statistics
  const { data: stats, isLoading: statsLoading, error: statsError } = useStudentStatistics();

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
    switch (status) {
      case 'upcoming':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'ongoing':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'completed':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="w-4 h-4" />;
      case 'ongoing':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 text-sm mt-1">Welcome back, Student</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-6 h-6 text-slate-600" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Settings className="w-6 h-6 text-slate-600" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                S
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-6">
          {/* Scan QR Code Card */}
          <button
            onClick={() => {
              // If there's an ongoing class, use that schedule ID
              const ongoingClass = upcomingClasses.find(cls => cls.status === 'ongoing');
              if (ongoingClass) {
                navigate(`/student/scan-attendance/${ongoingClass.id}`);
              } else {
                // Otherwise show a default scan page
                navigate(`/student/scan-attendance/general`);
              }
            }}
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 group-hover:from-blue-700 group-hover:to-blue-800 transition-all"></div>
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all"></div>
            <div className="relative p-10 text-white text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Scan QR Code</h3>
              <p className="text-blue-100 text-sm">Mark your attendance for today's class</p>
            </div>
          </button>

          {/* View Profile Card */}
          <button
            onClick={() => navigate('/student/profile')}
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-700 group-hover:from-purple-700 group-hover:to-purple-800 transition-all"></div>
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all"></div>
            <div className="relative p-10 text-white text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <User className="w-8 h-8 text-white" />
                </div>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold mb-2">My Profile</h3>
              <p className="text-purple-100 text-sm">View and edit your personal information</p>
            </div>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          {statsLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6 border border-slate-100 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded mb-4 w-1/2"></div>
                  <div className="h-10 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                </div>
              ))}
            </>
          ) : statsError ? (
            <div className="col-span-4 text-center text-red-600 p-4">
              Failed to load statistics
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-slate-600 font-medium text-sm">This Week</h4>
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  <AnimatedCounter value={(stats as any)?.weekAttendanceRate || 0} duration={1000} suffix="%" />
                </div>
                <p className="text-xs text-slate-500">Attendance rate</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-slate-600 font-medium text-sm">Total Classes</h4>
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  <AnimatedCounter value={(stats as any)?.totalClassesAttended || 0} duration={1000} />
                </div>
                <p className="text-xs text-slate-500">Attended this semester</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-slate-600 font-medium text-sm">Current Streak</h4>
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  <AnimatedCounter value={(stats as any)?.currentStreak || 0} duration={1000} />
                </div>
                <p className="text-xs text-slate-500">Consecutive days</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-md p-6 border border-emerald-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-emerald-700 font-medium text-sm">Today</h4>
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-4xl font-bold text-emerald-700 mb-2">
                  {(stats as any)?.todayAttendance ? '✓' : '○'}
                </div>
                <p className="text-xs text-emerald-600">
                  {(stats as any)?.todayAttendance ? 'Already marked' : 'Not yet marked'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Today's Classes</h2>
                <p className="text-sm text-slate-500 mt-1">Your schedule for today</p>
              </div>
              <Calendar className="w-6 h-6 text-slate-400" />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {classesLoading ? (
              <div className="px-8 py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500">Loading your schedule...</p>
              </div>
            ) : classesError ? (
              <div className="px-8 py-12 text-center text-red-600">
                <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                <p>Failed to load schedule</p>
              </div>
            ) : upcomingClasses.length > 0 ? (
              upcomingClasses.map((cls) => (
                <div
                  key={cls.id}
                  className={`px-8 py-6 hover:bg-slate-50 transition-colors border-l-4 ${cls.status === 'upcoming'
                      ? 'border-blue-500'
                      : cls.status === 'ongoing'
                        ? 'border-amber-500'
                        : 'border-emerald-500'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{cls.subjectCode}</h3>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            cls.status
                          )}`}
                        >
                          {getStatusBadge(cls.status)}
                          {cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-6 mt-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{cls.slotName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{cls.labRoomName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span>{cls.lecturerName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {cls.status === 'ongoing' && (
                    <button
                      onClick={() => handleScanQRFromClass(cls.id)}
                      className="ml-4 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      <QrCode className="w-4 h-4" />
                      Scan Now
                    </button>
                  )}

                  {cls.status === 'upcoming' && (
                    <div className="ml-4 text-sm text-slate-500 whitespace-nowrap">
                      Coming soon
                    </div>
                  )}

                  {cls.status === 'completed' && (
                    <div className="ml-4 flex items-center gap-2 text-emerald-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-8 py-12 text-center text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No classes scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl shadow-md border border-blue-200 p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Quick Tips for Attendance</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• ✓ Scan the QR code displayed by your lecturer each class</li>
                <li>• ✓ Make sure your camera is working before class starts</li>
                <li>• ✓ Check your attendance record regularly on your profile</li>
                <li>• ✓ Contact your lecturer if you have any attendance issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
