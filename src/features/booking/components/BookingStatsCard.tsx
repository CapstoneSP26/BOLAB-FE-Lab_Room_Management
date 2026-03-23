import React from 'react';
import { TrendingUp, Clock, CheckCircle } from 'lucide-react';
import type { BookingStats } from '../types/booking.type';

interface BookingStatsCardProps {
  stats: BookingStats;
}

export const BookingStatsCard: React.FC<BookingStatsCardProps> = ({ stats }) => {
  const statItems = [
    {
      label: 'Accepted',
      value: stats.totalAccepted,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      accent: 'bg-green-500',
    },
    {
      label: 'Pending',
      value: stats.totalPending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      accent: 'bg-yellow-500',
    },
    {
      label: 'Upcoming',
      value: stats.upcomingBookings,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      accent: 'bg-blue-500',
    },
  ];

  return (
    <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 shadow-sm">
      <h3 className="text-slate-900 font-bold text-lg mb-4 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2 text-amber-600" />
        Booking Statistics
      </h3>

      <div className="grid grid-cols-3 gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={`${item.bgColor} ${item.borderColor} border rounded-lg p-4 transition-all duration-300 hover:shadow-md cursor-default`}
            >
              <div className={`mb-3 h-1.5 w-14 rounded-full ${item.accent}`} />
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${item.color}`} />
                <span className="text-2xl font-bold text-slate-900">
                  {item.value}
                </span>
              </div>
              <p className="text-slate-700 text-sm font-semibold">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
