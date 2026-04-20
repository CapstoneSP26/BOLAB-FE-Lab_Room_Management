/**
 * RecentActivity Component
 * Timeline of recent user activities
 */

import React from 'react';
import { Calendar, QrCode, FileText, CheckCircle, XCircle, Clock, Send, CircleDashed } from 'lucide-react';

export type ActivityType = 'booking' | 'qr_generated' | 'report_sent' | 'booking_approved' | 'booking_rejected' | 'booking_submitted';

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
  booking_submitted: Send,
};

const activityColors: Record<ActivityType, string> = {
  booking: 'text-blue-600 bg-blue-50 border-blue-200',
  qr_generated: 'text-green-600 bg-green-50 border-green-200',
  report_sent: 'text-purple-600 bg-purple-50 border-purple-200',
  booking_approved: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  booking_rejected: 'text-rose-600 bg-rose-50 border-rose-200',
  booking_submitted: 'text-amber-600 bg-amber-50 border-amber-200',
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
        {displayedActivities.map((activity) => {
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border shadow-sm ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-900 leading-5">
                    {activity.title}
                  </h4>
                  {activity.type === 'booking_approved' && (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Approved
                    </span>
                  )}
                  {activity.type === 'booking_submitted' && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                      Submitted
                    </span>
                  )}
                  {activity.type === 'booking_rejected' && (
                    <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                      Rejected
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-1 leading-5">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400">
                  {getTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
