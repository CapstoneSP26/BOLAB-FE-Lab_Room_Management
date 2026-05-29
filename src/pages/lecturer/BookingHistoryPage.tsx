import React, { useEffect, useMemo, useState } from 'react';
import { Calendar } from 'lucide-react';
import { useBookingStats } from '../../features/booking/hooks/useBookingStats';
import { BookingDetailsModal } from '../../features/booking';
import { useCancelBooking } from '../../features/booking/hooks/useCancelBooking';
import { useToast } from '../../hooks/useToast';
import type { Booking, BookingStats, BookingStatusFilter } from '../../features/booking/types/booking.type';
import { BookingHistoryStats } from '../../features/booking/components/BookingHistoryStats';
import { BookingHistoryFilters } from '../../features/booking/components/BookingHistoryFilters';
import { BookingHistoryTable } from '../../features/booking/components/BookingHistoryTable';
import { BookingHistoryPagination } from '../../features/booking/components/BookingHistoryPagination';
import { useBookingHistoryPageState } from '../../features/booking/hooks/useBookingHistoryPageState';

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

  // Gọi Hook Cancel Booking đã được vá lỗi tham số cấu trúc
  const { mutate: cancelBooking } = useCancelBooking();

  // ==================== 🔥 ĐỒNG BỘ LUỒNG GỌI API AN TOÀN TẠI ĐÂY ====================
  const handleCancelBooking = async (payload: { bookingId: string; cancelReason: string | null }) => {
    return new Promise<void>((resolve, reject) => {
      // Đút trọn vẹn object { bookingId, cancelReason } chuẩn phôi dữ liệu mới
      cancelBooking(
        { bookingId: payload.bookingId, cancelReason: payload.cancelReason },
        {
          onSuccess: (response: any) => {
            // Lấy thông điệp trả về trực tiếp từ Ok(new { message = ... }) của Backend Controller
            const successMsg = response?.message || (payload.cancelReason
              ? 'Đã hủy lịch trình chính thức và giải phóng phòng máy thành công'
              : 'Đã rút yêu cầu đặt phòng máy chờ duyệt thành công');

            toast.success(successMsg);
            resolve();
          },
          onError: (error: any) => {
            // Đọc thông tin lỗi nghiệp vụ từ Conflict(new { message = ... }) bắn ngược từ Backend lên Client
            const backendError = error?.response?.data?.message || 'Gặp sự cố lỗi hệ thống khi thực hiện hủy lịch';
            toast.error(backendError);
            reject(error);
          },
        }
      );
    });
  };
  // ====================================================================================

  const bookingHistoryParams = useMemo(() => ({ limit: 1000 }), []);

  // Fetch ALL bookings for client-side filtering and pagination
  const { data: bookingsData, isLoading } = useBookingHistoryPageState(bookingHistoryParams, true);
  const { data: statsData } = useBookingStats();

  const bookings = bookingsData?.data ?? [];
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
            Lịch sử đặt phòng Máy Lab
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Xem, theo dõi tiến độ phê duyệt và quản lý danh sách lịch sử sử dụng phòng Lab của bạn
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <BookingHistoryStats isLoading={isLoading} hasStatsData={!!statsData} stats={displayStats} />

        <BookingHistoryFilters searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} />

        {/* Bookings Table */}
        <BookingHistoryTable
          isLoading={isLoading}
          hasData={!!bookingsData}
          filteredBookings={filteredBookings}
          paginatedBookings={paginatedBookings}
          onViewDetails={handleViewDetails}
          onCancelBooking={handleCancelBooking} // Gắn hàm xử lý Object đa năng mới tinh
        />

        <BookingHistoryPagination filteredCount={filteredBookings.length} startIndex={startIndex} endIndex={endIndex} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal isOpen={isDetailsModalOpen} onClose={handleCloseDetailsModal} booking={selectedBooking} />
    </div>
  );
};

export default BookingHistoryPage;