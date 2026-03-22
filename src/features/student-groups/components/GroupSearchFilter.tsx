import React, { useCallback, useState } from 'react';
import { Search, X, Filter, Upload, Plus } from 'lucide-react';
import type { GroupFilterState } from '../types';

interface GroupSearchFilterProps {
  onFilterChange: (filters: GroupFilterState) => void;
  isLoading?: boolean;
  onImportGroup?: () => void;
  onAddGroup?: () => void;
}

export const GroupSearchFilter: React.FC<GroupSearchFilterProps> = ({
  onFilterChange,
  isLoading = false,
  onImportGroup,
  onAddGroup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'count'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleApplyFilters = useCallback(() => {
    onFilterChange({
      searchQuery,
      sortBy,
      sortOrder,
    });
  }, [searchQuery, sortBy, sortOrder, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSortBy('name');
    setSortOrder('asc');
    onFilterChange({
      searchQuery: '',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  }, [onFilterChange]);

  // Auto-apply when filters change (debouncing done at parent level)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleApplyFilters();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, sortBy, sortOrder, handleApplyFilters]);

  const hasActiveFilters = Boolean(searchQuery);

  return (
    <div className="rounded-3xl border border-gray-200/80 bg-gradient-to-br from-white via-gray-50 to-blue-50/50 p-6 shadow-theme-md space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
            <Filter size={18} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Group Search</h3>
            <p className="text-xs text-gray-500">Search by group name only</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap md:justify-end">
          <button
            type="button"
            onClick={onImportGroup}
            disabled={isLoading}
            className="inline-flex min-w-[132px] items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl shadow-theme-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-theme-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload size={16} />
            Import Group
          </button>

          <button
            type="button"
            onClick={onAddGroup}
            disabled={isLoading}
            className="inline-flex min-w-[132px] items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl shadow-theme-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-theme-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={16} />
            Add Group
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brand-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="e.g. SE1801"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 bg-white/90 rounded-2xl shadow-theme-xs focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Sort By</p>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'count')}
              disabled={isLoading}
              className="w-full md:w-52 appearance-none rounded-2xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm font-semibold text-gray-700 shadow-theme-xs transition-all duration-200 hover:border-brand-300 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            >
              <option value="name">Group Name</option>
              <option value="count">Student Count</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Order</p>
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              disabled={isLoading}
              className="w-full md:w-52 appearance-none rounded-2xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm font-semibold text-gray-700 shadow-theme-xs transition-all duration-200 hover:border-brand-300 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 md:ml-auto">
          <button
            onClick={handleApplyFilters}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl hover:shadow-theme-lg transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm"
          >
            {isLoading ? 'Loading...' : 'Apply'}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              disabled={isLoading}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed border border-gray-200"
              title="Clear filters"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupSearchFilter;
