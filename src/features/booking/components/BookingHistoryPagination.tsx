interface BookingHistoryPaginationProps {
  filteredCount: number;
  startIndex: number;
  endIndex: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function BookingHistoryPagination({
  filteredCount,
  startIndex,
  endIndex,
  currentPage,
  totalPages,
  onPageChange,
}: BookingHistoryPaginationProps) {
  if (filteredCount <= 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border-2 border-gray-200 px-6 py-4 shadow-sm">
      <p className="text-sm text-gray-700">
        Showing <span className="font-bold text-gray-900">{startIndex + 1}</span> to{' '}
        <span className="font-bold text-gray-900">{Math.min(endIndex, filteredCount)}</span> of{' '}
        <span className="font-bold text-orange-600">{filteredCount}</span> bookings
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          ← Previous
        </button>

        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${currentPage === page
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-300 hover:bg-orange-50'}`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
