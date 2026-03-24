import React from 'react';
import { CheckCircle2, Calendar, Clock, Repeat, Users, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../utils/formatDate';
import type { BookingSummary } from '../types/booking.type';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingSummary: BookingSummary | null;
  onViewMyBookings: () => void;
  onCreateAnother: () => void;
}

/**
 * ✅ Component 4: Confirmation Modal - "Request Submitted"
 * Displayed after a booking request is successfully submitted
 */
export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  bookingSummary,
  onViewMyBookings,
  onCreateAnother,
}) => {
  if (!isOpen || !bookingSummary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent transition-opacity backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-4 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Request Submitted!</h2>
          <p className="text-green-50 text-xs">
            Your booking request has been sent for approval
          </p>
        </div>

        {/* Booking Summary */}
        <div className="px-4 py-4 space-y-2.5">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2.5 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2">
                <p className="text-xs text-yellow-800">
                  <strong>Pending Approval:</strong> Your request will be reviewed by the lab manager.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-gray-200 pt-2.5">
            <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wide">
              Booking Details
            </h3>

            {/* Room & Building */}
            <div className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900">{bookingSummary.roomName}</p>
                <p className="text-xs text-gray-600">{bookingSummary.building}</p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900">
                  {formatDate(bookingSummary.date, 'dddd, MMMM DD, YYYY')}
                </p>
                <p className="text-xs text-gray-600">
                  {bookingSummary.startTime} - {bookingSummary.endTime}
                </p>
              </div>
            </div>

            {/* Repeat Weekly */}
            {bookingSummary.repeatWeekly && (
              <div className="flex items-start gap-2.5 p-2.5 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Repeat className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-purple-900">Repeats Weekly</p>
                  <p className="text-xs text-purple-700">
                    Until {bookingSummary.weeklyUntil ? formatDate(bookingSummary.weeklyUntil, 'MMM DD, YYYY') : 'end of semester'}
                  </p>
                </div>
              </div>
            )}

            {/* Student Group */}
            {bookingSummary.groupName && (
              <div className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900">Student Group</p>
                  <p className="text-xs text-gray-600">{bookingSummary.groupName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Booking ID */}
          <div className="border-t border-gray-200 pt-2.5">
            <p className="text-xs text-gray-500">
              Booking ID: <span className="font-mono font-medium text-gray-700">{bookingSummary.id}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-4 py-3 flex gap-2">
          <Button
            variant="outline"
            onClick={onViewMyBookings}
            icon={<ArrowRight className="w-4 h-4" />}
            fullWidth
            size="sm"
          >
            View My Bookings
          </Button>
          <button
            onClick={onCreateAnother}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Another Booking
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};
