import { Calendar, Clock } from 'lucide-react';
import { BookingStatusBadge } from './BookingStatusBadge';
import type { Booking } from '../types/booking.type';

interface BookingHistoryListProps {
  viewMode: 'list' | 'grid';
  isLoading: boolean;
  hasData: boolean;
  filteredBookings: Booking[];
  paginatedBookings: Booking[];
  onViewDetails: (booking: Booking) => void;
}

export function BookingHistoryList({
  viewMode,
  isLoading,
  hasData,
  filteredBookings,
  paginatedBookings,
  onViewDetails,
}: BookingHistoryListProps) {
  if (isLoading && !hasData && filteredBookings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm col-span-full">
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm col-span-full">
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

  return (
    <>
      {viewMode === 'list'
        ? paginatedBookings.map((booking) => (
          <div
            key={booking.id}
            className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-all group ${booking.status === 'Approved' ? 'border-green-200 hover:border-green-300' : booking.status === 'PendingApproval' ? 'border-yellow-200 hover:border-yellow-300' : booking.status === 'All' ? 'border-amber-200 hover:border-amber-300' : booking.status === 'Cancelled' ? 'border-gray-200 hover:border-gray-300' : 'border-red-200 hover:border-red-300'}`}
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className={`w-1 h-16 rounded-full flex-shrink-0 ${booking.status === 'Approved' ? 'bg-gradient-to-b from-green-400 to-green-600' : booking.status === 'PendingApproval' ? 'bg-gradient-to-b from-yellow-400 to-yellow-600' : booking.status === 'All' ? 'bg-gradient-to-b from-amber-400 to-amber-600' : booking.status === 'Cancelled' ? 'bg-gradient-to-b from-gray-400 to-gray-600' : 'bg-gradient-to-b from-red-400 to-red-600'}`}></div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{booking.roomName}</h3>
                      <BookingStatusBadge status={booking.status} />
                    </div>

                    <p className="text-sm text-gray-600 font-medium mb-3 truncate">{booking.buildingName}</p>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${booking.status === 'Approved' ? 'bg-green-50' : booking.status === 'PendingApproval' ? 'bg-yellow-50' : booking.status === 'All' ? 'bg-amber-50' : booking.status === 'Cancelled' ? 'bg-gray-50' : 'bg-red-50'}`}>
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(booking.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${booking.status === 'Approved' ? 'bg-green-50' : booking.status === 'PendingApproval' ? 'bg-yellow-50' : booking.status === 'All' ? 'bg-amber-50' : booking.status === 'Cancelled' ? 'bg-gray-50' : 'bg-red-50'}`}>
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">{booking.startTime} - {booking.endTime}</span>
                      </div>
                    </div>

                    {booking.purpose && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700"><span className="font-semibold text-gray-900">Purpose: </span>{booking.purpose}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onViewDetails(booking)}
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
        ))
        : paginatedBookings.map((booking) => (
          <div
            key={booking.id}
            className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-all group flex flex-col h-full ${booking.status === 'Approved' ? 'border-green-200 hover:border-green-300' : booking.status === 'PendingApproval' ? 'border-yellow-200 hover:border-yellow-300' : booking.status === 'All' ? 'border-amber-200 hover:border-amber-300' : booking.status === 'Cancelled' ? 'border-gray-200 hover:border-gray-300' : 'border-red-200 hover:border-red-300'}`}
          >
            <div className={`h-2 rounded-t-xl ${booking.status === 'Approved' ? 'bg-gradient-to-r from-green-400 to-green-600' : booking.status === 'PendingApproval' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : booking.status === 'All' ? 'bg-gradient-to-r from-amber-400 to-amber-600' : booking.status === 'Cancelled' ? 'bg-gradient-to-r from-gray-400 to-gray-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}></div>

            <div className="p-4 flex-1 flex flex-col">
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{booking.roomName}</h3>
                <p className="text-sm text-gray-600 font-medium mb-2 truncate">{booking.buildingName}</p>
                <BookingStatusBadge status={booking.status} />
              </div>

              <div className="space-y-2 mb-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${booking.status === 'Approved' ? 'bg-green-50' : booking.status === 'PendingApproval' ? 'bg-yellow-50' : booking.status === 'All' ? 'bg-amber-50' : booking.status === 'Cancelled' ? 'bg-gray-50' : 'bg-red-50'}`}>
                  <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-900 truncate">
                    {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${booking.status === 'Approved' ? 'bg-green-50' : booking.status === 'PendingApproval' ? 'bg-yellow-50' : booking.status === 'All' ? 'bg-amber-50' : booking.status === 'Cancelled' ? 'bg-gray-50' : 'bg-red-50'}`}>
                  <Clock className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-900">{booking.startTime} - {booking.endTime}</span>
                </div>
              </div>

              {booking.purpose && (
                <div className="mb-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200 flex-1">
                  <p className="text-xs text-gray-700 line-clamp-2"><span className="font-semibold text-gray-900">Purpose: </span>{booking.purpose}</p>
                </div>
              )}

              <div className="flex flex-col gap-2 mt-auto">
                <button
                  onClick={() => onViewDetails(booking)}
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
  );
}
