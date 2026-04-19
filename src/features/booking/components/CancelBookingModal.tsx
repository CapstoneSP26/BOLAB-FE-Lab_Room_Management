import { AlertCircle, X } from 'lucide-react';
import type { Booking } from '../types/booking.type';

interface CancelBookingModalProps {
  isOpen: boolean;
  booking: Booking | null;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CancelBookingModal({
  isOpen,
  booking,
  isLoading,
  onConfirm,
  onCancel,
}: CancelBookingModalProps) {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900/40 via-indigo-900/40 to-purple-900/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-sm w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Cancel Booking?</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <p className="text-gray-600">
            Are you sure you want to cancel this booking?
          </p>
          
          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Room:</span>
              <span className="text-sm font-semibold text-gray-900">{booking.roomName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Building:</span>
              <span className="text-sm font-semibold text-gray-900">{booking.buildingName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Date:</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(booking.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Time:</span>
              <span className="text-sm font-semibold text-gray-900">
                {booking.startTime} - {booking.endTime}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            ⚠️ This action cannot be undone. The lab manager will be notified of the cancellation.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Canceling...
              </>
            ) : (
              'Cancel Booking'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
