import React from 'react';
import { Clock, Calendar, User } from 'lucide-react';
import type { BookingRequest } from '../types';

interface RecentRequestCardProps {
  request: BookingRequest;
  onClick?: () => void;
}

export const RecentRequestCard: React.FC<RecentRequestCardProps> = ({ 
  request, 
  onClick 
}) => {
  const getStatusColor = (status: BookingRequest['status']) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 60) {
      return `${diffInMins} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      return `${diffInDays} ngày trước`;
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white/15 backdrop-blur-xl rounded-lg p-4 border border-white/30 
                 hover:bg-white/20 hover:border-orange-400/70 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-orange-500/20"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm group-hover:text-orange-300 transition-colors drop-shadow-sm">
            {request.roomName}
          </h4>
          <p className="text-white/85 group-hover:text-white text-xs mt-1 transition-colors">
            {request.buildingName}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(request.status)}`}>
          {request.status}
        </span>
      </div>

      {/* Date & Time */}
      <div className="flex items-center gap-4 text-white/85 group-hover:text-white text-xs mb-2 transition-colors">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(request.date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
          })}
        </div>
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {request.startTime}-{request.endTime}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/25 group-hover:border-white/40 transition-colors">
        <div className="flex items-center text-white/75 group-hover:text-white text-xs transition-colors">
          <User className="h-3 w-3 mr-1" />
          {request.requestedBy}
        </div>
        <div className="text-white/75 group-hover:text-white text-xs transition-colors">
          {formatTimeAgo(request.requestedAt)}
        </div>
      </div>
    </div>
  );
};
