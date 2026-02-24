import React from 'react';
import { Calendar, FileText, Loader2 } from 'lucide-react';
import { BookingStatsCard } from './BookingStatsCard';
import { RecentRequestCard } from './RecentRequestCard';
import { BookingCalendar } from './BookingCalendar';
import { useUpcomingBookings } from '../hooks/useUpcomingBookings';
import { useBookingStats } from '../hooks/useBookingStats';
import { useRecentRequests } from '../hooks/useRecentRequests';

export const BookingDashboard: React.FC = () => {
  // Fetch data using hooks
  const { data: upcomingData, isLoading: upcomingLoading } = useUpcomingBookings({ limit: 4 });
  const { data: statsData, isLoading: statsLoading } = useBookingStats();
  const { data: requestsData, isLoading: requestsLoading } = useRecentRequests({ limit: 5 });

  // Mock data for when API is not available
  const mockStats = {
    totalAccepted: 24,
    totalPending: 8,
    totalRejected: 3,
    upcomingBookings: 12,
  };

  const mockUpcomingBookings = [
    {
      id: 1,
      roomId: 'R101',
      roomName: 'Lab A-101',
      buildingName: 'Building Alpha',
      startTime: '08:00',
      endTime: '10:00',
      date: new Date(Date.now() + 86400000).toISOString(),
      status: 'Approved' as const,
      purpose: 'Web Development Workshop',
    },
    {
      id: 2,
      roomId: 'R203',
      roomName: 'Lab G-203',
      buildingName: 'Building Gamma',
      startTime: '14:00',
      endTime: '16:00',
      date: new Date(Date.now() + 172800000).toISOString(),
      status: 'PendingApproval' as const,
      purpose: 'AI Research Project',
    },
    {
      id: 3,
      roomId: 'R305',
      roomName: 'Lab D-305',
      buildingName: 'Building Delta',
      startTime: '10:00',
      endTime: '12:00',
      date: new Date(Date.now() + 259200000).toISOString(),
      status: 'Approved' as const,
      purpose: 'Database Design Class',
    },
  ];

  const mockRecentRequests = [
    {
      id: 1,
      roomId: 'R101',
      roomName: 'Lab A-101',
      buildingName: 'Building Alpha',
      requestedBy: 'Nguyen Van A',
      requestedAt: new Date(Date.now() - 1800000).toISOString(),
      startTime: '08:00',
      endTime: '10:00',
      date: new Date(Date.now() + 86400000).toISOString(),
      status: 'PendingApproval' as const,
    },
    {
      id: 2,
      roomId: 'R203',
      roomName: 'Lab G-203',
      buildingName: 'Building Gamma',
      requestedBy: 'Tran Thi B',
      requestedAt: new Date(Date.now() - 3600000).toISOString(),
      startTime: '14:00',
      endTime: '16:00',
      date: new Date(Date.now() + 172800000).toISOString(),
      status: 'accepted' as const,
    },
    {
      id: 3,
      roomId: 'R305',
      roomName: 'Lab D-305',
      buildingName: 'Building Delta',
      requestedBy: 'Le Van C',
      requestedAt: new Date(Date.now() - 7200000).toISOString(),
      startTime: '10:00',
      endTime: '12:00',
      date: new Date(Date.now() + 259200000).toISOString(),
      status: 'accepted' as const,
    },
    {
      id: 4,
      roomId: 'R401',
      roomName: 'Lab A-401',
      buildingName: 'Building Alpha',
      requestedBy: 'Pham Thi D',
      requestedAt: new Date(Date.now() - 10800000).toISOString(),
      startTime: '15:00',
      endTime: '17:00',
      date: new Date(Date.now() + 345600000).toISOString(),
      status: 'rejected' as const,
    },
  ];

  const stats = statsData?.data || mockStats;
  const upcomingBookings = upcomingData?.data || mockUpcomingBookings;
  const recentRequests = requestsData?.data || mockRecentRequests;

  return (
    <div className="w-full h-full flex gap-6 px-6 py-8 overflow-y-auto custom-scrollbar">
      {/* Main Content Area - Left & Center */}
      <div className="flex-1 space-y-6 min-h-0">
        {/* Booking Statistics */}
        <div className="animate-fade-in">
          {statsLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          ) : (
            <BookingStatsCard stats={stats} />
          )}
        </div>

        {/* Upcoming Bookings Calendar */}
        <div className="space-y-4 animate-fade-in flex-1 min-h-0" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-2xl flex items-center drop-shadow-md">
              <Calendar className="h-7 w-7 mr-3 text-orange-400 drop-shadow-md" />
              Upcoming Bookings
            </h3>
            <span className="text-white/90 text-sm font-medium">
              {upcomingBookings.length} bookings
            </span>
          </div>
          
          {upcomingLoading ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          ) : upcomingBookings.length > 0 ? (
            <BookingCalendar bookings={upcomingBookings} />
          ) : (
            <div className="text-center py-24 text-white/60 bg-white/5 rounded-xl border border-white/10">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No upcoming bookings</p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar - Recent Requests */}
      <div className="w-96 space-y-4 animate-fade-in flex-shrink-0" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-xl flex items-center drop-shadow-md">
              <FileText className="h-6 w-6 mr-2 text-orange-400 drop-shadow-md" />
            Recent Requests
          </h3>
          <span className="text-white/80 text-sm">
            {recentRequests.length}
          </span>
        </div>
        
        <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 custom-scrollbar">
          {requestsLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          ) : recentRequests.length > 0 ? (
            recentRequests.map((request) => (
              <RecentRequestCard key={request.id} request={request} />
            ))
          ) : (
            <div className="text-center py-12 text-white/60">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent requests</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
