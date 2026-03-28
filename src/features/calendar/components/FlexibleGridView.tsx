import React, { useMemo } from 'react';
import { CALENDAR_CONFIG } from '../constants/calendar.constants';
import type { CalendarEvent } from '../types/calendar.type';
import { getPositionStyle, timeToPosition } from '../utils/calendar-math.util';
import { addHours, format, isBefore, startOfHour } from 'date-fns';

interface FlexibleGridViewProps {
  timeSlots: string[];
  weekDays: Date[];
  dragState: any;
  events: CalendarEvent[];
  minBookingLeadTime: number;
  handleMouseDown: (e: React.MouseEvent, dayIndex: number) => void;
}

export const FlexibleGridView: React.FC<FlexibleGridViewProps> = ({
  timeSlots,
  weekDays,
  dragState,
  events,
  minBookingLeadTime,
  handleMouseDown,
}) => {
  const { START_HOUR, END_HOUR, CELL_HEIGHT } = CALENDAR_CONFIG;
  const maxHeight = useMemo(() => (END_HOUR - START_HOUR + 1) * CELL_HEIGHT, []);
  const now = new Date();
  const minAllowedTime = addHours(now, minBookingLeadTime);
  // Render các Event đã có trên một cột ngày
  const renderColumnEvents = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];

    return events
      .filter((event) => event.start.startsWith(dateStr))
      .map((event) => {
        const startTime = event.start.split('T')[1].substring(0, 5);
        const endTime = event.end.split('T')[1].substring(0, 5);

        const eventStyle = getPositionStyle(startTime, endTime);

        return (
          <div
            key={event.id}
            className={`absolute left-1 right-1 rounded-lg px-2 py-1 text-[11px] font-bold border-l-4 shadow-sm z-10 select-none overflow-hidden ${event.status === 'Booked' || event.status === 'Approved'
              ? 'bg-indigo-100 text-indigo-700 border-indigo-500'
              : 'bg-amber-100 text-amber-700 border-amber-500 border-dashed'
              }`}
            style={eventStyle}
            title={`${event.title} (${startTime} - ${endTime})`}
          >
            <div className="truncate">{event.title}</div>
            <div className="text-[9px] opacity-70 font-medium">{startTime} - {endTime}</div>
          </div>
        );
      });
  };

  return (
    <div className="flex-1 grid grid-cols-[80px_1fr] min-w-[1000px]">
      {/* 1. Cột trục thời gian bên trái (Sticky) */}
      <div className="bg-gray-50/80 border-r border-gray-200 sticky left-0 z-30 backdrop-blur-sm">
        {timeSlots.map((time) => (
          <div key={time} className="h-20 border-b border-gray-200 pr-3 pt-2 text-right">
            <span className="text-xs text-gray-500 font-bold tracking-tighter">{time}</span>
          </div>
        ))}
      </div>

      {/* 2. Lưới 7 cột ngày */}
      <div className="grid grid-cols-7 relative bg-white">
        {weekDays.map((date, dayIndex) => {
          const isDraggingThisColumn = dragState.isActive && dragState.dayIndex === dayIndex;
          const dateStr = format(date, 'yyyy-MM-dd');
          const isToday = dateStr === format(now, 'yyyy-MM-dd');
          const isPastDay = isBefore(date, startOfHour(now)) && !isToday;

          // Tính toán vị trí vùng bị khóa trong ngày hôm nay
          let lockedOverlayStyle = null;
          if (isPastDay) {
            lockedOverlayStyle = { top: 0, height: '100%' };
          } else if (isToday) {
            const topPos = 0;
            const heightPos = Math.min(timeToPosition(format(minAllowedTime, 'HH:mm')), maxHeight);
            lockedOverlayStyle = { top: topPos, height: `${heightPos}px` };
          }

          return (
            <div
              key={dayIndex}
              className="relative border-r border-gray-200 h-full group"
              style={{ height: `${(END_HOUR - START_HOUR + 1) * CELL_HEIGHT}px` }}
              onMouseDown={(e) => handleMouseDown(e, dayIndex)}
            >
              {/* Lớp nền: Vạch kẻ ngang mờ */}
              {timeSlots.map((_, i) => (
                <div key={i} className="h-20 border-b border-gray-100 pointer-events-none" />
              ))}

              {/* DESIGN ĐẸP: Vùng bị khóa (Locked Area) */}
              {lockedOverlayStyle && (
                <div
                  className="absolute left-0 right-0 z-0 pointer-events-none opacity-[0.07]"
                  style={{
                    ...lockedOverlayStyle,
                    background: `repeating-linear-gradient(
                      45deg,
                      #000,
                      #000 10px,
                      transparent 10px,
                      transparent 20px
                    )`
                  }}
                />
              )}

              {/* Lớp dữ liệu: Hiển thị Events */}
              {renderColumnEvents(date)}

              {/* Lớp tương tác: Drag Preview */}
              {isDraggingThisColumn && (
                <div
                  className={`absolute left-1 right-1 rounded-xl z-40 border-l-4 shadow-lg pointer-events-none transition-colors bg-blue-600/20 border-blue-600 text-blue-900 overflow-hidden`}
                  style={{
                    top: `${Math.min(dragState.startY, dragState.currentY)}px`,
                    height: `${Math.abs(dragState.currentY - dragState.startY)}px`,
                  }}
                >
                  <div className="p-3 bg-white/40 backdrop-blur-[2px] h-full">
                    <div className="font-black uppercase text-[9px] tracking-widest opacity-80">
                      {'Đang chọn'}
                    </div>
                    <div className="text-xs font-bold mt-1">
                      {dragState.startTime} - {dragState.endTime}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};