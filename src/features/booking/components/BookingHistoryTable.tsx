import { Calendar, Clock } from 'lucide-react';
import { useState } from 'react';
import { BookingStatusBadge, getStatusAccentClass } from './BookingStatusBadge';
import { CancelBookingModal } from './CancelBookingModal';
import type { Booking } from '../types/booking.type';
import { convertHoursUtcToVN } from '../../../utils/date.util';

interface BookingHistoryTableProps {
  isLoading: boolean;
  hasData: boolean;
  filteredBookings: Booking[];
  paginatedBookings: Booking[];
  onViewDetails: (booking: Booking) => void;
  // 🔥 SỬA SIGNATURE THÀNH OBJECT PAYLOAD ĐỒNG NHẤT ĐỂ HOOK KHÔNG BỊ TRÀN UNDEFINED LÝ DO
  onCancelBooking: (payload: { bookingId: string; cancelReason: string | null }) => Promise<void>;
}

export function BookingHistoryTable({
  isLoading,
  hasData,
  filteredBookings,
  paginatedBookings,
  onViewDetails,
  onCancelBooking,
}: BookingHistoryTableProps) {
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [isCancelLoading, setIsCancelLoading] = useState(false);

  const handleCancelClick = (booking: Booking) => {
    setCancellingBooking(booking);
  };

  // 🔥 NHẬN GIÁ TRỊ LÝ DO HỦY TỪ MÀN HÌNH MODAL TRUYỀN RA
  const handleConfirmCancel = async (reason: string | null) => {
    if (!cancellingBooking) return;

    try {
      setIsCancelLoading(true);

      // Đút bọc thành duy nhất 1 Object đồng bộ truyền ngược lên Page cha
      await onCancelBooking({
        bookingId: cancellingBooking.id.toString(),
        cancelReason: reason
      });

      setCancellingBooking(null);
    } catch (error) {
      // Bắt lỗi nghiệp vụ đã được xử lý tập trung tại Page cha
    } finally {
      setIsCancelLoading(false);
    }
  };

  if (isLoading && !hasData && filteredBookings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (filteredBookings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 text-gray-300 mx-auto mb-4 flex items-center justify-center bg-gray-50 rounded-full p-2">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Room</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Building</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Time</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Purpose</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {paginatedBookings.map((booking) => (
              <tr
                key={booking.id}
                className={`hover:bg-gray-50/50 transition-colors ${getStatusAccentClass(booking.status)} border-l-4 ${(booking.status === 'Approved' || String(booking.status) === '2')
                  ? 'border-l-green-500'
                  : (booking.status === 'PendingApproval' || String(booking.status) === '1')
                    ? 'border-l-yellow-500'
                    : (booking.status === 'Rejected' || String(booking.status) === '3')
                      ? 'border-l-red-500'
                      : (booking.status === 'Cancelled' || String(booking.status) === '4')
                        ? 'border-l-gray-500'
                        : 'border-l-blue-500'
                  }`}
              >
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900 line-clamp-3">{booking.roomName}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700">{booking.buildingName}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {new Date(booking.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {convertHoursUtcToVN(booking.startTime)} - {convertHoursUtcToVN(booking.endTime)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700 line-clamp-2">{booking.purpose || '-'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-700">
                    {booking.createdAt
                      ? new Date(booking.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                      : '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <BookingStatusBadge status={booking.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetails(booking)}
                      className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all"
                    >
                      View
                    </button>
                    {(booking.status === 'PendingApproval' || String(booking.status) === '1' || booking.status === 'Approved' || String(booking.status) === '2') && (
                      <button
                        onClick={() => handleCancelClick(booking)}
                        disabled={isCancelLoading}
                        className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Đấu nối dữ liệu phục hồi hàm confirm nhận lý do từ Modal */}
      <CancelBookingModal
        isOpen={cancellingBooking !== null}
        booking={cancellingBooking}
        isLoading={isCancelLoading}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancellingBooking(null)}
      />
    </div>
  );
}