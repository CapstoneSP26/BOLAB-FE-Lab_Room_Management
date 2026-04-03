import React from 'react';
import { formatDate } from '../../../utils/formatDate';

interface CalendarDayHeaderProps {
  weekDays: Date[];
}

export const CalendarDayHeader: React.FC<CalendarDayHeaderProps> = ({ weekDays }) => {
  const todayStr = new Date().toDateString();

  return (
    <div className='flex-1 grid grid-cols-[80px_repeat(7,1fr)] min-w-[1000px]'>
      {/* Time column header */}
      <div className="sticky top-0 bg-white border-b-2 border-r border-gray-200 z-20 shadow-sm"></div>
      {weekDays.map((date, dayIndex) => {
        const isToday = date.toDateString() === todayStr;
        const dayName = formatDate(date, 'ddd');
        const dayNumber = date.getDate();
        const monthName = formatDate(date, 'MMM');

        return (
          <div
            key={dayIndex}
            data-day-header
            className={`sticky top-0 z-50 border-b-2 border-r border-gray-200 transition-all text-center ${isToday
              ? 'bg-gradient-to-b from-blue-50 to-blue-100 shadow-sm'
              : 'bg-white hover:bg-gray-50 shadow-sm'
              }`}
          >
            <div className="px-4 py-3">
              {/* Day name */}
              <div
                className={`text-xs font-bold uppercase tracking-widest mb-2 ${isToday ? 'text-blue-600' : 'text-gray-500'
                  }`}
              >
                {dayName}
              </div>

              {/* Date display */}
              <div className="flex items-baseline justify-center gap-1.5">
                <div
                  className={`text-3xl font-extrabold leading-none ${isToday ? 'text-blue-700' : 'text-gray-900'
                    }`}
                >
                  {dayNumber}
                </div>
                <div
                  className={`text-sm font-semibold ${isToday ? 'text-blue-500' : 'text-gray-500'
                    }`}
                >
                  {monthName}
                </div>
              </div>

              {/* Today indicator badge - fixed height container to prevent layout shift */}
              <div className="mt-2 h-6 flex items-center justify-center">
                {isToday && (
                  <span className="inline-block px-3 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-sm">
                    Today
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};