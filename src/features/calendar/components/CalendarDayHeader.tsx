import React from 'react';
import { formatDate } from '../../../utils/formatDate';

interface CalendarDayHeaderProps {
  weekDays: Date[];
}

export const CalendarDayHeader: React.FC<CalendarDayHeaderProps> = ({ weekDays }) => {
  const todayStr = new Date().toDateString();

  return (
    <div className='flex-1 grid grid-cols-[80px_repeat(7,1fr)] min-w-[1000px] border-b border-gray-200'>
      {/* 1. Cột trống góc trên trái */}
      <div className="sticky top-0 bg-white border-r border-gray-200 z-20 shadow-sm"></div>

      {/* 2. Danh sách các ngày */}
      {weekDays.map((date, dayIndex) => {
        const isToday = date.toDateString() === todayStr;
        const dayName = formatDate(date, 'ddd'); // Mon, Tue...
        const dayNumber = date.getDate();
        const isWeekend = date.getDay() === 0 || date.getDay() === 6; // 0 = Sunday, 6 = Saturday

        return (
          <div
            key={dayIndex}
            className={`sticky top-0 z-50 border-r border-gray-200 transition-all text-center py-2 bg-white`}
          >
            <div className="flex flex-col items-center justify-center gap-1">
              {/* Tên thứ - Nhỏ và thanh thoát */}
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                isToday 
                  ? 'text-blue-600' 
                  : isWeekend 
                    ? 'text-red-600'
                    : 'text-gray-400'
              }`}>
                {dayName}
              </span>

              {/* Số ngày - Nằm trong vòng tròn nếu là Today */}
              <div className={`
                flex items-center justify-center
                w-9 h-9 text-lg font-bold rounded-full transition-colors
                ${isToday
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : isWeekend
                    ? 'bg-red-500 text-white shadow-md shadow-red-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}>
                {dayNumber}
              </div>
            </div>

            {/* Indicator mỏng dưới cùng cho Today - Tùy chọn để tinh tế hơn */}
            {isToday && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 mx-4 rounded-t-full" />
            )}
          </div>
        );
      })}
    </div>
  );
};