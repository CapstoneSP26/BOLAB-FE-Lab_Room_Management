import { AlertCircle, CheckCircle, Search, XCircle } from 'lucide-react';
import type { BookingStatusFilter } from '../types/booking.type';

interface BookingHistoryFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  statusFilter: BookingStatusFilter;
  onStatusFilterChange: (status: BookingStatusFilter) => void;
}

export function BookingHistoryFilters({
  searchQuery,
  onSearchQueryChange,
  statusFilter,
  onStatusFilterChange,
}: BookingHistoryFiltersProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by room or building name..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Filter by Status
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onStatusFilterChange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'all' ? 'bg-orange-100 text-orange-700 border-2 border-orange-300 shadow-sm' : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:border-gray-200 hover:bg-gray-100'}`}
            >
              View All
            </button>
            <button
              onClick={() => onStatusFilterChange('PendingApproval')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${statusFilter === 'PendingApproval' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300 shadow-sm' : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:border-gray-200 hover:bg-gray-100'}`}
            >
              <AlertCircle className="w-4 h-4" />
              Pending
            </button>
            <button
              onClick={() => onStatusFilterChange('Approved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${statusFilter === 'Approved' ? 'bg-green-100 text-green-700 border-2 border-green-300 shadow-sm' : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:border-gray-200 hover:bg-gray-100'}`}
            >
              <CheckCircle className="w-4 h-4" />
              Approved
            </button>
            <button
              onClick={() => onStatusFilterChange('Rejected')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${statusFilter === 'Rejected' ? 'bg-red-100 text-red-700 border-2 border-red-300 shadow-sm' : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:border-gray-200 hover:bg-gray-100'}`}
            >
              <XCircle className="w-4 h-4" />
              Rejected
            </button>
            <button
              onClick={() => onStatusFilterChange('Cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${statusFilter === 'Cancelled' ? 'bg-gray-100 text-gray-700 border-2 border-gray-300 shadow-sm' : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:border-gray-200 hover:bg-gray-100'}`}
            >
              <XCircle className="w-4 h-4" />
              Cancelled
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
