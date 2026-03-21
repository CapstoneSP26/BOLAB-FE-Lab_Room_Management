import React, { useState } from 'react';
import { Calendar, Clock, Search, CheckCircle, XCircle, AlertCircle, LayoutGrid, List } from 'lucide-react';
import { useBookingHistory } from '../../features/booking/hooks/useBookingHistory';
import { useBookingStats } from '../../features/booking/hooks/useBookingStats';
import { BookingDetailsModal } from '../../features/booking';
import type { BookingStatus, Booking } from '../../features/booking/types';
import { SkeletonStatsCard } from '../../components/ui/Skeleton';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';

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
    status: 'All' as BookingStatus,
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
    status: 'All' as BookingStatus,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'semester' | 'all'>('month');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedBooking(null);
  };

  // Fetch data
  const { data: bookingsData, isLoading } = useBookingHistory({ 
    page: currentPage, 
    limit: 10,
    status: statusFilter,
  });
  const { data: statsData } = useBookingStats();

  // Use API data or fallback to mock - Remove mock when API is ready
  const bookings = bookingsData?.data ?? MOCK_BOOKINGS;
  const stats = statsData?.data;

  // Pagination settings
  const ITEMS_PER_PAGE = 9;

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.buildingName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    // Date range filter
    const bookingDate = new Date(booking.date);
    const today = new Date();
    let matchesDateRange = true;

    if (dateRange === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(today.getDate() + 7);
      matchesDateRange = bookingDate >= weekAgo && bookingDate <= weekFromNow;
    } else if (dateRange === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      const monthFromNow = new Date(today);
      monthFromNow.setMonth(today.getMonth() + 1);
      matchesDateRange = bookingDate >= monthAgo && bookingDate <= monthFromNow;
    } else if (dateRange === 'semester') {
      // Assuming semester is ~4 months (120 days)
      const semesterAgo = new Date(today);
      semesterAgo.setDate(today.getDate() - 120);
      const semesterFromNow = new Date(today);
      semesterFromNow.setDate(today.getDate() + 120);
      matchesDateRange = bookingDate >= semesterAgo && bookingDate <= semesterFromNow;
    }
    // dateRange === 'all' means no filter

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Calculate dynamic stats from filtered bookings
  const dynamicStats = {
    totalAccepted: filteredBookings.filter(b => b.status === 'Approved').length,
    totalPending: filteredBookings.filter(b => b.status === 'PendingApproval' || b.status === 'All').length,
    totalRejected: filteredBookings.filter(b => b.status === 'Rejected').length,
    upcomingBookings: filteredBookings.filter(b => 
      b.status === 'Approved' && new Date(b.date) > new Date()
    ).length,
  };

  const displayStats = stats ?? dynamicStats;

  // Calculate pagination
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateRange]);

  const getStatusBadge = (status: BookingStatus) => {
    const statusConfig = {
      All: { 
        icon: AlertCircle, 
        text: 'All', 
        className: 'bg-amber-100 text-amber-700 border-amber-300' 
      },
      PendingApproval: { 
        icon: AlertCircle, 
        text: 'Pending Approval', 
        className: 'bg-yellow-100 text-yellow-700 border-yellow-300' 
      },
      Approved: { 
        icon: CheckCircle, 
        text: 'Approved', 
        className: 'bg-green-100 text-green-700 border-green-300' 
      },
      Rejected: { 
        icon: XCircle, 
        text: 'Rejected', 
        className: 'bg-red-100 text-red-700 border-red-300' 
      },
      Cancelled: { 
        icon: XCircle, 
        text: 'Cancelled', 
        className: 'bg-gray-100 text-gray-700 border-gray-300' 
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.text}
      </span>
    );
  };

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
        {isLoading && !statsData ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  <AnimatedCounter value={displayStats.totalAccepted || 0} />
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 font-medium">Pending</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">
                  <AnimatedCounter value={displayStats.totalPending || 0} />
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  <AnimatedCounter value={displayStats.totalRejected || 0} />
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Upcoming</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  <AnimatedCounter value={displayStats.upcomingBookings} />
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
          {/* Search & View Toggle */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by room or building name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition-all"
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex gap-2 bg-gray-100 p-1.5 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Status Filter - Segmented Control */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Filter by Status
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === 'all'
                      ? 'bg-orange-100 text-orange-700 border-2 border-orange-300 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  All Status
                </button>
                <button
                  onClick={() => setStatusFilter('All')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    statusFilter === 'All'
                      ? 'bg-amber-100 text-amber-700 border-2 border-amber-300 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('PendingApproval')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    statusFilter === 'PendingApproval'
                      ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  Pending
                </button>
                <button
                  onClick={() => setStatusFilter('Approved')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    statusFilter === 'Approved'
                      ? 'bg-green-100 text-green-700 border-2 border-green-300 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approved
                </button>
                <button
                  onClick={() => setStatusFilter('Rejected')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    statusFilter === 'Rejected'
                      ? 'bg-red-100 text-red-700 border-2 border-red-300 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  Rejected
                </button>
                <button
                  onClick={() => setStatusFilter('Cancelled')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    statusFilter === 'Cancelled'
                      ? 'bg-gray-100 text-gray-700 border-2 border-gray-300 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  Cancelled
                </button>
              </div>
            </div>

            {/* Date Range Filter - Button Group */}
            <div className="lg:w-auto">
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Time Period
              </label>
              <div className="flex gap-2 bg-gray-100 p-1.5 rounded-lg">
                <button
                  onClick={() => setDateRange('week')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    dateRange === 'week'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setDateRange('month')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    dateRange === 'month'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setDateRange('semester')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    dateRange === 'semester'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Semester
                </button>
                <button
                  onClick={() => setDateRange('all')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    dateRange === 'all'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List/Grid */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {isLoading && !bookingsData && bookings.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm col-span-full">
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading bookings...</p>
                </div>
              </div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm col-span-full">
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search query</p>
                </div>
              </div>
            </div>
          ) : viewMode === 'list' ? (
            // LIST VIEW
            <>
              {paginatedBookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-all group ${
                    booking.status === 'Approved' ? 'border-green-200 hover:border-green-300' :
                    booking.status === 'PendingApproval' ? 'border-yellow-200 hover:border-yellow-300' :
                    booking.status === 'All' ? 'border-amber-200 hover:border-amber-300' :
                    booking.status === 'Cancelled' ? 'border-gray-200 hover:border-gray-300' :
                    'border-red-200 hover:border-red-300'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-3">
                        {/* Color-coded sidebar */}
                        <div className={`w-1 h-16 rounded-full flex-shrink-0 ${
                          booking.status === 'Approved' ? 'bg-gradient-to-b from-green-400 to-green-600' :
                          booking.status === 'PendingApproval' ? 'bg-gradient-to-b from-yellow-400 to-yellow-600' :
                          booking.status === 'All' ? 'bg-gradient-to-b from-amber-400 to-amber-600' :
                          booking.status === 'Cancelled' ? 'bg-gradient-to-b from-gray-400 to-gray-600' :
                          'bg-gradient-to-b from-red-400 to-red-600'
                        }`}></div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 truncate">
                              {booking.roomName}
                            </h3>
                            {getStatusBadge(booking.status)}
                          </div>
                          
                          <p className="text-sm text-gray-600 font-medium mb-3 truncate">
                            {booking.buildingName}
                          </p>

                          <div className="flex flex-wrap items-center gap-4">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                              booking.status === 'Approved' ? 'bg-green-50' :
                              booking.status === 'PendingApproval' ? 'bg-yellow-50' :
                              booking.status === 'All' ? 'bg-amber-50' :
                              booking.status === 'Cancelled' ? 'bg-gray-50' :
                              'bg-red-50'
                            }`}>
                              <Calendar className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-900">
                                {new Date(booking.date).toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                              booking.status === 'Approved' ? 'bg-green-50' :
                              booking.status === 'PendingApproval' ? 'bg-yellow-50' :
                              booking.status === 'All' ? 'bg-amber-50' :
                              booking.status === 'Cancelled' ? 'bg-gray-50' :
                              'bg-red-50'
                            }`}>
                              <Clock className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-900">
                                {booking.startTime} - {booking.endTime}
                              </span>
                            </div>
                          </div>

                          {booking.purpose && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-sm text-gray-700">
                                <span className="font-semibold text-gray-900">Purpose: </span>
                                {booking.purpose}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => handleViewDetails(booking)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                        >
                          View Details
                        </button>
                        {(booking.status === 'PendingApproval' || booking.status === 'All') && (
                          <button className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border-2 border-red-300 rounded-lg hover:bg-red-100 hover:border-red-400 transition-all shadow-sm">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            // GRID VIEW
            <>
              {paginatedBookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-all group flex flex-col h-full ${
                    booking.status === 'Approved' ? 'border-green-200 hover:border-green-300' :
                    booking.status === 'PendingApproval' ? 'border-yellow-200 hover:border-yellow-300' :
                    booking.status === 'All' ? 'border-amber-200 hover:border-amber-300' :
                    booking.status === 'Cancelled' ? 'border-gray-200 hover:border-gray-300' :
                    'border-red-200 hover:border-red-300'
                  }`}
                >
                  {/* Color header */}
                  <div className={`h-2 rounded-t-xl ${
                    booking.status === 'Approved' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                    booking.status === 'PendingApproval' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                    booking.status === 'All' ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                    booking.status === 'Cancelled' ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                    'bg-gradient-to-r from-red-400 to-red-600'
                  }`}></div>

                  <div className="p-4 flex-1 flex flex-col">
                    {/* Title & Status */}
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                        {booking.roomName}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium mb-2 truncate">
                        {booking.buildingName}
                      </p>
                      {getStatusBadge(booking.status)}
                    </div>

                    {/* Date & Time - Compact */}
                    <div className="space-y-2 mb-3">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                        booking.status === 'Approved' ? 'bg-green-50' :
                        booking.status === 'PendingApproval' ? 'bg-yellow-50' :
                        booking.status === 'All' ? 'bg-amber-50' :
                        booking.status === 'Cancelled' ? 'bg-gray-50' :
                        'bg-red-50'
                      }`}>
                        <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-900 truncate">
                          {new Date(booking.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                        booking.status === 'Approved' ? 'bg-green-50' :
                        booking.status === 'PendingApproval' ? 'bg-yellow-50' :
                        booking.status === 'All' ? 'bg-amber-50' :
                        booking.status === 'Cancelled' ? 'bg-gray-50' :
                        'bg-red-50'
                      }`}>
                        <Clock className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-900">
                          {booking.startTime} - {booking.endTime}
                        </span>
                      </div>
                    </div>

                    {/* Purpose - Truncated */}
                    {booking.purpose && (
                      <div className="mb-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200 flex-1">
                        <p className="text-xs text-gray-700 line-clamp-2">
                          <span className="font-semibold text-gray-900">Purpose: </span>
                          {booking.purpose}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2 mt-auto">
                      <button 
                        onClick={() => handleViewDetails(booking)}
                        className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                      >
                        View Details
                      </button>
                      {(booking.status === 'PendingApproval' || booking.status === 'All') && (
                        <button className="w-full px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border-2 border-red-300 rounded-lg hover:bg-red-100 hover:border-red-400 transition-all shadow-sm">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Pagination */}
        {filteredBookings.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border-2 border-gray-200 px-6 py-4 shadow-sm">
            <p className="text-sm text-gray-700">
              Showing <span className="font-bold text-gray-900">{startIndex + 1}</span> to{' '}
              <span className="font-bold text-gray-900">{Math.min(endIndex, filteredBookings.length)}</span> of{' '}
              <span className="font-bold text-orange-600">{filteredBookings.length}</span> bookings
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                ← Previous
              </button>
              
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                      currentPage === page
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next →
              </button>
            </div>
          </div>
        )}
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
