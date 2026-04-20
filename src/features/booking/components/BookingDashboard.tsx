import React, { useMemo } from 'react';
import { Calendar, FileText, Loader2 } from 'lucide-react';
import { BookingStatsCard } from './BookingStatsCard';
import { RecentRequestCard } from './RecentRequestCard';
import { BookingCalendar } from './BookingCalendar';
import { useUpcomingBookings } from '../hooks/useUpcomingBookings';
import { useBookingHistoryPageState } from '../hooks/useBookingHistoryPageState';
import { useAuthStore } from '../../../store/useAuthStore';
import { RecentActivity, type Activity } from '../../../components/common/RecentActivity';
import type { Booking, BookingRequest, BookingStats } from '../types/booking.type';
import { useSchedules } from '../../schedules/hooks/useSchedules';
import type { ScheduleDto } from '../../schedules/types/schedule.type';
import { useNotifications } from '../../notifications/hooks/useNotifications';

export const BookingDashboard: React.FC = () => {
  const now = new Date();
  const { user } = useAuthStore();
  const lecturerName = user?.fullName?.trim().toLowerCase();
  const today = now.toISOString().slice(0, 10);
  const inThreeMonths = new Date(now);
  inThreeMonths.setMonth(inThreeMonths.getMonth() + 3);

  const schedulesParams = {
    fromDate: today,
    toDate: inThreeMonths.toISOString().slice(0, 10),
    pageSize: 100,
  };

  const bookingHistoryParams = {
    limit: 100,
    startDate: today,
    endDate: inThreeMonths.toISOString().slice(0, 10),
    status: 'Approved' as const,
  };

  const { data: schedulesData, isLoading: schedulesLoading } = useSchedules(
    schedulesParams,
    true,
  );
  const { data: upcomingBookingsData, isLoading: upcomingBookingsLoading } = useUpcomingBookings({
    page: 1,
    limit: 100,
    startDate: today,
    endDate: inThreeMonths.toISOString().slice(0, 10),
  });
  const { data: bookingHistoryData, isLoading: bookingHistoryLoading } = useBookingHistoryPageState(
    bookingHistoryParams,
    true,
  );
  const { data: notificationsData } = useNotifications({
    pageNumber: 1,
    pageSize: 5,
  });

  const mapScheduleToBooking = (schedule: ScheduleDto): Booking => ({
    id: schedule.id,
    roomId: schedule.labRoomId ?? schedule.labRoomName,
    roomName: schedule.labRoomName,
    buildingName: 'N/A',
    startTime: new Date(schedule.startTime).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    endTime: new Date(schedule.endTime).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    date: schedule.startTime,
    status: schedule.status === 'Cancelled' ? 'Cancelled' : 'Approved',
    purpose: schedule.subjectCode,
    lecturerName: schedule.lecturerName,
    scheduleType: schedule.type,
    studentCount: schedule.studentCount,
    bookingSource: 'LECTURER_BOOK',
  });

  const scheduleBookings = useMemo(
    () => (schedulesData?.items ?? []).map(mapScheduleToBooking),
    [schedulesData],
  );

  const bookingHistoryBookings = useMemo(
    () =>
      (bookingHistoryData?.data ?? [])
        .filter((booking) => {
          if (!lecturerName) return true;
          return (
            booking.userName?.trim().toLowerCase() === lecturerName ||
            booking.purpose?.trim().toLowerCase().includes(lecturerName)
          );
        })
        .map((booking) => ({
          id: booking.id,
          roomId: booking.roomId,
          roomName: booking.roomName,
          buildingName: booking.buildingName,
          startTime: booking.startTime,
          endTime: booking.endTime,
          date: booking.date,
          status: booking.status,
          purpose: booking.purpose,
          userName: booking.userName,
          lecturerName: booking.userName,
          bookingSource: 'LECTURER_BOOK' as const,
        })),
    [bookingHistoryData, lecturerName],
  );

  const apiUpcomingBookings = useMemo(
    () => (upcomingBookingsData?.data ?? []).filter((booking) => {
      if (!lecturerName) return true;
      return (
        booking.userName?.trim().toLowerCase() === lecturerName ||
        booking.lecturerName?.trim().toLowerCase() === lecturerName
      );
    }),
    [upcomingBookingsData, lecturerName],
  );

  const approvedQueue = useMemo<BookingRequest[]>(
    () => bookingHistoryBookings
      .filter((booking) => booking.status === 'Approved')
      .map((booking) => ({
        id: booking.id,
        roomId: booking.roomId,
        roomName: booking.roomName,
        buildingName: booking.buildingName,
        requestedBy: booking.userName || booking.lecturerName || 'N/A',
        requestedAt: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        date: booking.date,
        status: 'accepted',
        purpose: booking.purpose,
      })),
    [bookingHistoryBookings],
  );

  const recentNotifications = useMemo(
    () => (notificationsData?.items ?? []).slice(0, 5),
    [notificationsData],
  );

  const derivedStats: BookingStats = {
    totalAccepted: bookingHistoryBookings.filter((booking) => booking.status === 'Approved').length,
    totalPending: bookingHistoryBookings.filter((booking) => booking.status === 'PendingApproval').length,
    totalRejected: bookingHistoryBookings.filter((booking) => booking.status === 'Rejected').length,
    upcomingBookings: scheduleBookings.length || apiUpcomingBookings.length || bookingHistoryBookings.length,
  };

  const upcomingBookings = scheduleBookings.length > 0
    ? scheduleBookings
    : (bookingHistoryBookings.length > 0 ? bookingHistoryBookings : apiUpcomingBookings);
  const isUpcomingDataLoading = schedulesLoading || bookingHistoryLoading || upcomingBookingsLoading;

  const recentActivities: Activity[] = recentNotifications.map((notification) => ({
    id: notification.id,
    type: notification.type === 'success'
      ? 'booking_approved'
      : notification.type === 'warning'
        ? 'booking'
        : notification.type === 'error'
          ? 'report_sent'
          : 'qr_generated',
    title: notification.title,
    description: notification.message,
    timestamp: notification.createdAt ?? new Date().toISOString(),
  }));

  return (
    <div className="w-full h-full flex gap-6 px-6 py-8 overflow-y-auto custom-scrollbar">
      {/* Main Content Area - Left & Center */}
      <div className="flex-1 space-y-6 min-h-0">
        {/* Booking Statistics */}
        <div className="animate-fade-in rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
          <p className="mb-3 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
            Performance Snapshot
          </p>
          {bookingHistoryLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
          ) : (
            <BookingStatsCard stats={derivedStats} />
          )}
        </div>

        {/* Upcoming Bookings Calendar */}
        <div className="space-y-4 animate-fade-in flex-1 min-h-0 rounded-2xl border border-blue-200 bg-blue-50/70 p-4" style={{ animationDelay: '0.1s' }}>
          <p className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            Calendar Focus
          </p>
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900 font-bold text-2xl flex items-center">
              <Calendar className="h-7 w-7 mr-3 text-blue-500" />
              Upcoming Bookings
            </h3>
            <span className="text-slate-600 text-sm font-medium">
              {upcomingBookings.length} bookings
            </span>
          </div>

          {isUpcomingDataLoading ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
          ) : upcomingBookings.length > 0 ? (
            <BookingCalendar bookings={upcomingBookings} />
          ) : (
            <div className="text-center py-24 text-slate-500 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No upcoming lecturer schedules</p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar - Recent Requests & Activities */}
      <div className="w-96 space-y-4 animate-fade-in flex-shrink-0" style={{ animationDelay: '0.2s' }}>
        {/* Recent Requests */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
          <p className="mb-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Approval Queue
          </p>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 font-bold text-xl flex items-center">
              <FileText className="h-6 w-6 mr-2 text-emerald-500" />
              Recent Requests
            </h3>
            <span className="text-slate-600 text-sm">
              {approvedQueue.length}
            </span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {bookingHistoryLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
              </div>
            ) : approvedQueue.length > 0 ? (
              approvedQueue.map((request) => (
                <RecentRequestCard key={request.id} request={request} />
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No accepted bookings</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-3">
          <RecentActivity activities={recentActivities} maxItems={5} />
        </div>
      </div>
    </div>
  );
};
