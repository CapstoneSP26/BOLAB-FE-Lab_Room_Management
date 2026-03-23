import React from 'react';
import { CheckCircle, Calendar, Clock } from 'lucide-react';

interface GroupStatsProps {
  completed: number;
  upcoming: number;
  pending: number;
}

export const GroupStats: React.FC<GroupStatsProps> = ({
  completed,
  upcoming,
  pending,
}) => {
  const stats = [
    {
      title: 'Completed',
      value: String(completed).padStart(2, '0'),
      subtitle: 'Total completed bookings',
      icon: CheckCircle,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-500',
    },
    {
      title: 'Upcoming',
      value: String(upcoming).padStart(2, '0'),
      subtitle: 'Upcoming sessions',
      icon: Calendar,
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-500',
    },
    {
      title: 'Pending',
      value: String(pending).padStart(2, '0'),
      subtitle: 'Awaiting approval',
      icon: Clock,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className={`bg-gradient-to-r ${stat.color} rounded-xl p-6 text-white`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white text-opacity-80 text-sm font-medium">
                  {stat.title}
                </p>
                <p className="text-4xl font-bold mt-1">{stat.value}</p>
              </div>
              <Icon size={32} className="text-white text-opacity-80" />
            </div>
            <p className="text-white text-opacity-80 text-xs">{stat.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
};

export default GroupStats;
