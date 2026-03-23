import React from 'react';
import { X, Calendar, Clock, FileText, MapPin, User, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import type { Booking, BookingStatus } from '../types/booking.type';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

/**
 * Modal to display detailed booking information from database
 */
export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  if (!isOpen || !booking) return null;

  const getStatusConfig = (status: BookingStatus) => {
    const configs = {
      All: {
        icon: AlertCircle,
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-300',
        label: 'All'
      },
      PendingApproval: {
        icon: AlertCircle,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-300',
        label: 'Pending Approval'
      },
      Approved: {
        icon: CheckCircle,
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-300',
        label: 'Approved'
      },
      Rejected: {
        icon: XCircle,
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-300',
        label: 'Rejected'
      },
      Cancelled: {
        icon: XCircle,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-300',
        label: 'Cancelled'
      }
    };
    return configs[status];
  };

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[100] transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-orange-500 to-orange-600">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-1">Booking Details</h2>
                <div className="flex items-center gap-2">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">{statusConfig.label}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="space-y-4">
              {/* Room & Location */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide mb-1">Location</p>
                    <h3 className="text-lg font-bold text-gray-900">{booking.roomName}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">{booking.buildingName}</p>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Date</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(booking.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Time</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {booking.startTime} - {booking.endTime}
                  </p>
                </div>
              </div>

              {/* Purpose */}
              {booking.purpose && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Purpose</p>
                  </div>
                  <p className="text-sm text-gray-900 leading-relaxed">{booking.purpose}</p>
                </div>
              )}

              {/* Booked By */}
              {booking.userName && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-green-600" />
                    <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Booked By</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{booking.userName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
};
