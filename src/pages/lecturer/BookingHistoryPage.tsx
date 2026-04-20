import React, { useEffect, useMemo, useState } from 'react';
import { Calendar } from 'lucide-react';
import { useBookingStats } from '../../features/booking/hooks/useBookingStats';
import { BookingDetailsModal } from '../../features/booking';
import { useCancelBooking } from '../../features/booking/hooks/useCancelBooking';
import { useToast } from '../../hooks/useToast';
import type { Booking, BookingStats, BookingStatus, BookingStatusFilter } from '../../features/booking/types/booking.type';
import { BookingHistoryStats } from '../../features/booking/components/BookingHistoryStats';
import { BookingHistoryFilters } from '../../features/booking/components/BookingHistoryFilters';
import { BookingHistoryTable } from '../../features/booking/components/BookingHistoryTable';
import { BookingHistoryPagination } from '../../features/booking/components/BookingHistoryPagination';
import { useBookingHistoryPageState } from '../../features/booking/hooks/useBookingHistoryPageState';

// Mock data - Remove when API is ready
// Testing different time periods: Week (±7 days), Month (±30 days), Semester (±120 days)
const MOCK_BOOKINGS: Booking[] = [
  // ===== WEEK DATA (within 7 days) =====
  {
    id: 'BK001',
    roomId: '1',
    roomName: 'Lab 501',
    buildingName: 'Alpha Building',
    date: '2026-02-24', // Today
    startTime: '08:00',
    endTime: '10:30',
    status: 'Approved' as BookingStatus,
    purpose: 'Software Engineering Practice Session',
    userName: 'Nguyen Van A',
  },
  {
    id: 'BK002',
    roomId: '2',
    roomName: 'Lab 502',
    buildingName: 'Alpha Building',
    date: '2026-02-25', // Tomorrow
    startTime: '13:00',
    endTime: '15:30',
    status: 'PendingApproval' as BookingStatus,
    purpose: 'Database Management Project Review',
    userName: 'Nguyen Van A',
  },
  {
    id: 'BK003',
    roomId: '3',
    roomName: 'Lab 301',
    buildingName: 'Beta Building',
    date: '2026-02-26',
    startTime: '09:00',
    endTime: '11:30',
    status: 'Approved' as BookingStatus,
    purpose: 'AI Machine Learning Workshop',
    userName: 'Nguyen Van A',
  },
  {
    id: 'BK004',
    roomId: '4',
    roomName: 'Lab 403',
    buildingName: 'Beta Building',
    date: '2026-02-23', // Yesterday
    startTime: '14:00',
    endTime: '16:30',
    status: 'PendingApproval' as BookingStatus,
    purpose: 'Web Development Team Meeting',
    userName: 'Nguyen Van A',
  },
  {
    id: 'BK005',
    roomId: '5',
    roomName: 'Lab 601',
    buildingName: 'Gamma Building',
    date: '2026-02-22',
    startTime: '10:00',
    endTime: '12:00',
    status: 'Cancelled' as BookingStatus,
    purpose: 'Mobile App Development Session',
    userName: 'Nguyen Van A',
  },
  {
    id: 'BK006',
    roomId: '1',
    roomName: 'Lab 501',
    buildingName: 'Alpha Building',
    date: '2026-02-27',
    startTime: '15:00',
    endTime: '17:30',
    status: 'Approved' as BookingStatus,
    purpose: 'Network Security Presentation',
    userName: 'Nguyen Van A',
  },

  // ===== MONTH DATA (within 30 days but outside week) =====
  {
    id: 'BK007',
    roomId: '6',
    roomName: 'Lab 205',
    buildingName: 'Beta Building',
    date: '2026-02-10', // 14 days ago
    startTime: '08:30',
    endTime: '11:00',
    status: 'Rejected' as BookingStatus,
    purpose: 'Data Structures and Algorithms Practice',
    userName: 'Nguyen Van A',
  },
  {
    id: 'BK008',
    roomId: '7',
    roomName: 'Lab 304',
    buildingName: 'Gamma Building',
    date: '2026-03-08', // 12 days from now
    startTime: '13:30',
    endTime: '16:00',
    status: 'PendingApproval' as BookingStatus,
    purpose: 'Cloud Computing Workshop',
    userName: 'Nguyen Van A',
  },
  {
    id: 'BK009',
    roomId: '2',
    roomName: 'Lab 502',
    buildingName: 'Alpha Building',
    date: '2026-02-05', // 19 days ago
    startTime: '09:00',
    endTime: '11:30',
    status: 'Approved' as BookingStatus,
    purpose: 'IoT Project Development',
    userName: 'Nguyen Van A',
  },
  {
    id: 'BK010',
    roomId: '8',
    roomName: 'Lab 701',
    buildingName: 'Gamma Building',
    date: '2026-03-15', // 19 days from now
    startTime: '14:00',
    endTime: '16:30',
    status: 'Approved' as BookingStatus,
    purpose: 'Blockchain Technology Seminar',
    userName: 'Nguyen Van A',
  },
  {
    id: 'BK011',
    roomId: '3',
    roomName: 'Lab 301',
    buildingName: 'Beta Building',
    date: '2026-01-30', // 25 days ago
    startTime: '10:30',
    endTime: '13:00',
    status: 'PendingApproval' as BookingStatus,
    purpose: 'Cybersecurity Lab Session',
    userName: 'Nguyen Van A',
  },
  {
    id: 'BK012',
    roomId: '9',
    roomName: 'Lab 402',
    buildingName: 'Beta Building',
    date: '2026-03-20', // 24 days from now
    startTime: '15:30',
    endTime: '18:00',
    status: 'Cancelled' as BookingStatus,
    purpose: 'Game Development Workshop',
    userName: 'Nguyen Van A',
  },

  // ===== SEMESTER DATA (within 120 days but outside month) =====
  {
    id: 'BK013',
    roomId: '10',
    roomName: 'Lab 801',
    buildingName: 'Delta Building',
    date: '2025-12-15', // ~70 days ago
    startTime: '09:00',
    endTime: '11:30',
    status: 'Approved' as BookingStatus,
    purpose: 'End of Year Project Presentation',
    userName: 'Nguyen Van A',
  },
  {
    id: 'BK014',
    roomId: '11',
    roomName: 'Lab 603',
    buildingName: 'Gamma Building',
    date: '2026-05-20', // ~85 days from now
    startTime: '14:00',
    endTime: '16:30',
    status: 'PendingApproval' as BookingStatus,
    purpose: 'Final Exam Preparation',
    userName: 'Nguyen Van A',
  },
  {
    id: 'BK015',
    roomId: '12',
    roomName: 'Lab 404',
    buildingName: 'Beta Building',
    date: '2025-11-20', // ~95 days ago
    startTime: '10:00',
    endTime: '12:00',
    status: 'Approved' as BookingStatus,
    purpose: 'Semester Opening Workshop',
    userName: 'Nguyen Van A',
  },
  {
    id: 'BK016',
    roomId: '13',
    roomName: 'Lab 702',
    buildingName: 'Gamma Building',
    date: '2026-06-10', // ~106 days from now
    status: 'PendingApproval' as BookingStatus,
    startTime: '08:00',
    endTime: '10:30',
    purpose: 'Summer Course Registration',
    userName: 'Nguyen Van A',
  },

  // ===== ALL (outside semester) =====
  {
    id: 'BK017',
    roomId: '14',
    roomName: 'Lab 901',
    buildingName: 'Delta Building',
    date: '2025-09-01', // ~175 days ago
    startTime: '13:00',
    endTime: '15:30',
    status: 'Approved' as BookingStatus,
    purpose: 'Academic Year Kick-off',
    userName: 'Nguyen Van A',
  },
  {
    id: 'BK018',
    roomId: '15',
    roomName: 'Lab 505',
    buildingName: 'Alpha Building',
    date: '2026-08-15', // ~172 days from now
    startTime: '09:00',
    endTime: '11:30',
    status: 'Cancelled' as BookingStatus,
    purpose: 'Next Year Preparation',
    userName: 'Nguyen Van A',
  },
];

/**
 * 📚 Booking History Page - User's booking records
 * Shows all bookings with filtering, search, and status management
 */
const BookingHistoryPage: React.FC = () => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedBooking(null);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Toast notification
  const toast = useToast();

  // Cancel booking mutation
  const { mutate: cancelBooking } = useCancelBooking();

  const handleCancelBooking = async (bookingId: string) => {
    return new Promise<void>((resolve, reject) => {
      cancelBooking(bookingId, {
        onSuccess: () => {
          toast.success('Booking cancelled successfully');
          // Optionally refetch bookings or update local state
          resolve();
        },
        onError: (error) => {
          toast.error('Failed to cancel booking');
          reject(error);
        },
      });
    });
  };

  // Fetch ALL bookings for client-side filtering and pagination
  const { data: bookingsData, isLoading } = useBookingHistoryPageState(
    {
      limit: 1000, // Fetch all bookings
    },
    true,
  );

  const { data: statsData } = useBookingStats();

  // Use API data or fallback to mock - Remove mock when API is ready
  const bookings = bookingsData?.data ?? MOCK_BOOKINGS;
  const allBookings = bookings;

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking: Booking) => {
      const matchesSearch =
        booking.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.buildingName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const dynamicStats: BookingStats = useMemo(() => ({
    totalAccepted: allBookings.filter((b: Booking) => b.status === 'Approved').length,
    totalPending: allBookings.filter((b: Booking) => b.status === 'PendingApproval').length,
    totalRejected: allBookings.filter((b: Booking) => b.status === 'Rejected').length,
    upcomingBookings: allBookings.filter((b: Booking) => b.status === 'Approved' && new Date(b.date) > new Date()).length,
  }), [allBookings]);

  const displayStats = dynamicStats;

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-7 h-7 text-orange-600" />
            Booking History
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View and manage all your lab booking records
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <BookingHistoryStats
          isLoading={isLoading}
          hasStatsData={!!statsData}
          stats={displayStats}
        />

        <BookingHistoryFilters
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Bookings Table */}
        <BookingHistoryTable
          isLoading={isLoading}
          hasData={!!bookingsData}
          filteredBookings={filteredBookings}
          paginatedBookings={paginatedBookings}
          onViewDetails={handleViewDetails}
          onCancelBooking={handleCancelBooking}
        />

        <BookingHistoryPagination
          filteredCount={filteredBookings.length}
          startIndex={startIndex}
          endIndex={endIndex}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        booking={selectedBooking}
      />
    </div>
  );
};

export default BookingHistoryPage;
