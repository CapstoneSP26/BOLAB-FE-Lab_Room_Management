import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarNavigationProps {
  weekStart: Date;
  weekEnd: Date;
  weekOffset: number;
  onWeekChange: (newOffset: number) => void;
}

export const CalendarNavigation: React.FC<CalendarNavigationProps> = ({
  weekStart,
  weekEnd,
  weekOffset,
  onWeekChange,
}) => {
  return (
    <div className="flex items-center gap-4">
      {/* Today Button */}
      <button
        onClick={() => onWeekChange(0)}
        className="px-5 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all border border-blue-200 hover:border-blue-300 shadow-sm active:scale-95"
      >
        Today
      </button>

      {/* Prev/Next Buttons */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onWeekChange(weekOffset - 1)}
          className="p-2 hover:bg-white rounded-md transition-all group"
          title="Tuần trước"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
        </button>
        <button
          onClick={() => onWeekChange(weekOffset + 1)}
          className="p-2 hover:bg-white rounded-md transition-all group"
          title="Tuần sau"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
        </button>
      </div>

      {/* Date Display */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full"></div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          {format(weekStart, 'MMM dd')} – {format(weekEnd, 'MMM dd, yyyy')}
        </h2>
      </div>
    </div>
  );
};