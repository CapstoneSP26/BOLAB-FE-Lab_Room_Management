/**
 * RecentActivity Component
 * Timeline of recent user activities
 */

import React from 'react';
import { Calendar, QrCode, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

export type ActivityType = 'booking' | 'qr_generated' | 'report_sent' | 'booking_approved' | 'booking_rejected';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface RecentActivityProps {
  activities: Activity[];
  maxItems?: number;
  className?: string;
}

const activityIcons: Record<ActivityType, React.ElementType> = {
  booking: Calendar,
  qr_generated: QrCode,
  report_sent: FileText,
  booking_approved: CheckCircle,
  booking_rejected: XCircle,
};

const activityColors: Record<ActivityType, string> = {
  booking: 'text-blue-600 bg-blue-50 border-blue-200',
  qr_generated: 'text-green-600 bg-green-50 border-green-200',
  report_sent: 'text-purple-600 bg-purple-50 border-purple-200',
  booking_approved: 'text-green-600 bg-green-50 border-green-200',
  booking_rejected: 'text-red-600 bg-red-50 border-red-200',
};

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  maxItems = 5,
  className = '',
}) => {
  const displayedActivities = activities.slice(0, maxItems);

  const getTimeAgo = (timestamp: string): string => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  if (displayedActivities.length === 0) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Chưa có hoạt động nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          Hoạt động gần đây
        </h3>
      </div>
      
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {displayedActivities.map((activity, index) => {
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 mb-0.5">
                  {activity.title}
                </h4>
                <p className="text-xs text-gray-600 mb-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400">
                  {getTimeAgo(activity.timestamp)}
                </p>
              </div>

              {/* Timeline line - removed for cleaner UI */}
            </div>
          );
        })}
      </div>
    </div>
  );
};
