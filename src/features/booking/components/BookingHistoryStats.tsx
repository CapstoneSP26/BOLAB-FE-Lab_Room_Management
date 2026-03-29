import { AlertCircle, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';
import { SkeletonStatsCard } from '../../../components/ui/Skeleton';
import type { BookingStats } from '../types/booking.type';

interface BookingHistoryStatsProps {
  isLoading: boolean;
  hasStatsData: boolean;
  stats: BookingStats;
}

export function BookingHistoryStats({ isLoading, hasStatsData, stats }: BookingHistoryStatsProps) {
  if (isLoading && !hasStatsData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SkeletonStatsCard />
        <SkeletonStatsCard />
        <SkeletonStatsCard />
        <SkeletonStatsCard />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700 font-medium">Approved</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              <AnimatedCounter value={stats.totalAccepted || 0} />
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-100 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-700 font-medium">Pending</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">
              <AnimatedCounter value={stats.totalPending || 0} />
            </p>
          </div>
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-700 font-medium">Rejected</p>
            <p className="text-3xl font-bold text-red-600 mt-1">
              <AnimatedCounter value={stats.totalRejected || 0} />
            </p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">Upcoming</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              <AnimatedCounter value={stats.upcomingBookings} />
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
