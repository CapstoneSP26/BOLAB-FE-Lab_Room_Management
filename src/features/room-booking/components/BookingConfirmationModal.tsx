import React from 'react';
import { CheckCircle2, Calendar, Clock, Repeat, Users, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/Button';
import type { BookingSummary } from '../types';
import { formatDate } from '../../../utils/formatDate';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/30 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-1.5">Request Submitted!</h2>
          <p className="text-green-50 text-sm">
            Your booking request has been sent for approval
          </p>
        </div>

        {/* Booking Summary */}
        <div className="px-5 py-5 space-y-3">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>Pending Approval:</strong> Your request will be reviewed by the lab manager.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 border-t border-gray-200 pt-3">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              Booking Details
            </h3>

            {/* Room & Building */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{bookingSummary.roomName}</p>
                <p className="text-xs text-gray-600">{bookingSummary.building}</p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(bookingSummary.date, 'dddd, MMMM DD, YYYY')}
                </p>
                <p className="text-xs text-gray-600">
                  {bookingSummary.startTime} - {bookingSummary.endTime}
                </p>
              </div>
            </div>

            {/* Repeat Weekly */}
            {bookingSummary.repeatWeekly && (
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Repeat className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-900">Repeats Weekly</p>
                  <p className="text-xs text-purple-700">
                    Until {bookingSummary.weeklyUntil ? formatDate(bookingSummary.weeklyUntil, 'MMM DD, YYYY') : 'end of semester'}
                  </p>
                </div>
              </div>
            )}

            {/* Student Group */}
            {bookingSummary.groupName && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Student Group</p>
                  <p className="text-xs text-gray-600">{bookingSummary.groupName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Booking ID */}
          <div className="border-t border-gray-200 pt-3">
            <p className="text-xs text-gray-500">
              Booking ID: <span className="font-mono font-medium text-gray-700">{bookingSummary.id}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-5 py-3.5 flex gap-2.5">
          <Button
            variant="outline"
            onClick={onViewMyBookings}
            icon={<ArrowRight className="w-4 h-4" />}
            fullWidth
          >
            View My Bookings
          </Button>
          <button
            onClick={onCreateAnother}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
