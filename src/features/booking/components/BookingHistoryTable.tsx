import { Calendar, Clock } from 'lucide-react';
import { useState } from 'react';
import { BookingStatusBadge } from './BookingStatusBadge';
import { CancelBookingModal } from './CancelBookingModal';
import type { Booking } from '../types/booking.type';
import { convertHoursUtcToVN } from '../../../utils/date.util';

interface BookingHistoryTableProps {
  isLoading: boolean;
  hasData: boolean;
  filteredBookings: Booking[];
  paginatedBookings: Booking[];
  onViewDetails: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => Promise<void>;
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

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;

    try {
      setIsCancelLoading(true);
      await onCancelBooking(cancellingBooking.id.toString());
      setCancellingBooking(null);
    } catch (error) {
      console.error('Failed to cancel booking:', error);
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
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-50 border-green-200';
      case 'PendingApproval':
        return 'bg-yellow-50 border-yellow-200';
      case 'Rejected':
        return 'bg-red-50 border-red-200';
      case 'Cancelled':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Room
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Building
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Purpose
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200">
            {paginatedBookings.map((booking) => (
              <tr
                key={booking.id}
                className={`hover:bg-gray-50 transition-colors ${getStatusColor(booking.status)} border-l-4 ${booking.status === 'Approved'
                    ? 'border-l-green-500'
                    : booking.status === 'PendingApproval'
                      ? 'border-l-yellow-500'
                      : booking.status === 'Rejected'
                        ? 'border-l-red-500'
                        : booking.status === 'Cancelled'
                          ? 'border-l-gray-500'
                          : 'border-l-blue-500'
                  }`}
              >
                {/* Room Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-semibold text-gray-900">{booking.roomName}</span>
                </td>

                {/* Building Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-700">{booking.buildingName}</span>
                </td>

                {/* Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">
                      {new Date(booking.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </td>

                {/* Time */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">
                      {convertHoursUtcToVN(booking.startTime)} - {convertHoursUtcToVN(booking.endTime)}
                    </span>
                  </div>
                </td>

                {/* Purpose */}
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700 line-clamp-2">
                    {booking.purpose || '-'}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <BookingStatusBadge status={booking.status} />
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetails(booking)}
                      className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 hover:border-blue-400 transition-all"
                    >
                      View
                    </button>
                    {(booking.status === 'PendingApproval' || booking.status === 'Approved') && (
                      <button
                        onClick={() => handleCancelClick(booking)}
                        disabled={isCancelLoading}
                        className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 hover:border-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
