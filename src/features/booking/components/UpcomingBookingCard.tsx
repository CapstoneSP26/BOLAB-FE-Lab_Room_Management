import React from 'react';
import { Calendar, Clock, Building2 } from 'lucide-react';
import type { Booking } from '../types';

interface UpcomingBookingCardProps {
  booking: Booking;
  onClick?: () => void;
}

export const UpcomingBookingCard: React.FC<UpcomingBookingCardProps> = ({ 
  booking, 
  onClick 
}) => {
  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'PendingApproval':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'Cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'Rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'All':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 
                 hover:bg-white/15 hover:border-orange-400/60 transition-all duration-300 cursor-pointer
                 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02]"
    >
      {/* Status Badge */}
      <div className="flex items-start justify-between mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
        <div className="text-xs text-white/60">
          #{booking.id}
        </div>
      </div>

      {/* Room Info */}
      <div className="space-y-2 mb-3">
        <h3 className="text-white font-semibold text-base group-hover:text-orange-300 transition-colors">
          {booking.roomName}
        </h3>
        <div className="flex items-center text-white/80 group-hover:text-white text-sm transition-colors">
          <Building2 className="h-4 w-4 mr-2" />
          {booking.buildingName}
        </div>
      </div>

      {/* Date & Time */}
      <div className="space-y-2">
        <div className="flex items-center text-white/70 group-hover:text-white text-sm transition-colors">
          <Calendar className="h-4 w-4 mr-2" />
          {new Date(booking.date).toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </div>
        <div className="flex items-center text-white/70 group-hover:text-white text-sm transition-colors">
          <Clock className="h-4 w-4 mr-2" />
          {booking.startTime} - {booking.endTime}
        </div>
      </div>

      {/* Purpose */}
      {booking.purpose && (
        <div className="mt-3 pt-3 border-t border-white/20 group-hover:border-white/30 transition-colors">
          <p className="text-white/60 group-hover:text-white text-xs line-clamp-2 transition-colors">
            {booking.purpose}
          </p>
        </div>
      )}
    </div>
  );
};
