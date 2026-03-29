import { Search } from 'lucide-react';

interface AttendanceToolbarProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  statusFilter: 'upcoming' | 'past' | 'all';
  onStatusFilterChange: (value: 'upcoming' | 'past' | 'all') => void;
}

export function AttendanceToolbar({
  searchQuery,
  onSearchQueryChange,
  statusFilter,
  onStatusFilterChange,
}: AttendanceToolbarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search by room, building, or purpose..."
            className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => onStatusFilterChange('upcoming')}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${statusFilter === 'upcoming' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => onStatusFilterChange('past')}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${statusFilter === 'past' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Past
          </button>
          <button
            onClick={() => onStatusFilterChange('all')}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All
          </button>
        </div>
      </div>
    </div>
  );
}
