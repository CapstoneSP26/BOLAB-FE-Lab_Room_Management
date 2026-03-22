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
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getCardAccent = (status: BookingRequest['status']) => {
    switch (status) {
      case 'accepted':
        return 'border-l-green-500';
      case 'pending':
        return 'border-l-yellow-500';
      case 'rejected':
        return 'border-l-red-500';
      default:
        return 'border-l-slate-400';
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
            className={`group relative bg-emerald-50 rounded-lg p-4 border border-emerald-200 border-l-4 ${getCardAccent(request.status)}
              hover:border-orange-300 hover:bg-white transition-all duration-300 cursor-pointer hover:shadow-md`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-slate-900 font-semibold text-sm group-hover:text-orange-600 transition-colors">
            {request.roomName}
          </h4>
          <p className="text-slate-600 text-xs mt-1 transition-colors">
            {request.buildingName}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(request.status)}`}>
          {request.status}
        </span>
      </div>

      {/* Date & Time */}
      <div className="flex items-center gap-4 text-slate-600 text-xs mb-2 transition-colors">
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
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 transition-colors">
        <div className="flex items-center text-slate-500 text-xs transition-colors">
          <User className="h-3 w-3 mr-1" />
          {request.requestedBy}
        </div>
        <div className="text-slate-500 text-xs transition-colors">
          {formatTimeAgo(request.requestedAt)}
        </div>
      </div>
    </div>
  );
};
