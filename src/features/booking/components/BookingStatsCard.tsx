import React from 'react';
import { TrendingUp, Clock, CheckCircle } from 'lucide-react';
import type { BookingStats } from '../types';

interface BookingStatsCardProps {
  stats: BookingStats;
}

export const BookingStatsCard: React.FC<BookingStatsCardProps> = ({ stats }) => {
  const statItems = [
    {
      label: 'Accepted',
      value: stats.totalAccepted,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    {
      label: 'Pending',
      value: stats.totalPending,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    },
    {
      label: 'Upcoming',
      value: stats.upcomingBookings,
      icon: TrendingUp,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
  ];

  return (
    <div className="bg-white/15 backdrop-blur-xl rounded-xl p-6 border border-white/30 shadow-2xl">
      <h3 className="text-white font-bold text-lg mb-4 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2 text-orange-400" />
        Booking Statistics
      </h3>
      
      <div className="grid grid-cols-3 gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={`${item.bgColor} ${item.borderColor} border rounded-lg p-4 transition-all duration-300 
                         hover:scale-105 hover:shadow-lg cursor-default`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${item.color}`} />
                <span className="text-2xl font-bold text-white drop-shadow-md">
                  {item.value}
                </span>
              </div>
              <p className="text-white text-sm font-semibold">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
