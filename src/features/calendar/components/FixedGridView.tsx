import React from 'react';
import type { SlotType } from '../../slot/types/slot.types';
import type { CalendarEvent } from '../types/calendar.type';
import { getPositionStyle } from '../utils/calendar-math.util';
import { addHours, format, isBefore, parseISO } from 'date-fns';

interface FixedGridViewProps {
  timeSlots: string[];
  weekDays: Date[];
  activeSlotType: SlotType;
  events: CalendarEvent[];
  onSlotClick: (date: string, frame: any) => void;
  minBookingLeadTime: number;
  maxConcurrent: number; // Lấy từ chính LabRoomPolicy "MaxConcurrentBookings"
}

export const FixedGridView: React.FC<FixedGridViewProps> = ({
  timeSlots,
  weekDays,
  activeSlotType,
  events,
  onSlotClick,
  minBookingLeadTime = 0,
  maxConcurrent = 1
}) => {
  const now = new Date();
  const minAllowedTime = addHours(now, minBookingLeadTime);

  return (
    <div className="flex-1 grid grid-cols-[80px_1fr] min-w-[1000px] relative bg-white">

      {/* --- CỘT TRỤC GIỜ BÊN TRÁI --- */}
      <div className="bg-gray-50 border-r border-gray-200 relative select-none">
        {/* Các vạch kẻ giờ 1h (Lớp nền) */}
        {timeSlots.map((time) => (
          <div key={time} className="h-20 border-b border-gray-100 pr-3 pt-2 text-right relative z-10">
            <span className="text-[10px] text-gray-400 font-bold">{time}</span>
          </div>
        ))}

        {/* Dải chỉ báo các Ca (Chỉ 1 màu xanh duy nhất) */}
        {activeSlotType.slotFrames.map((frame) => {
          const style = getPositionStyle(frame.startTime, frame.endTime);
          return (
            <div
              key={`indicator-${frame.id}`}
              className="absolute right-0 w-1 bg-blue-500 border-r-2 border-blue-600 z-20"
              style={style}
            >
            </div>
          );
        })}
      </div>

      {/* --- LƯỚI NGÀY BÊN PHẢI --- */}
      <div className="grid grid-cols-7 relative">
        {weekDays.map((date, dayIndex) => {
          const dateStr = format(date, 'yyyy-MM-dd');

          return (
            <div key={dayIndex} className="relative border-r border-gray-200 h-full">
              {/* ... Vạch kẻ giờ nền ... */}

              {activeSlotType.slotFrames.map((frame) => {
                const style = getPositionStyle(frame.startTime, frame.endTime);

                // --- LOGIC KIỂM TRA KHÓA ---
                const slotStartTime = parseISO(`${dateStr}T${frame.startTime}`);
                const isLocked = isBefore(slotStartTime, minAllowedTime);

                const concurrentBookings = events.filter(e =>
                  e.start.startsWith(dateStr) &&
                  e.start.includes(frame.startTime) &&
                  e.end.includes(frame.endTime) &&
                  e.slotName === activeSlotType.name
                );

                const isFull = concurrentBookings.length >= maxConcurrent;
                // Chỉ cho phép click nếu không full VÀ không bị khóa
                const canClick = !isFull && !isLocked;

                return (
                  <div
                    key={frame.id}
                    style={style}
                    onClick={() => canClick && onSlotClick(dateStr, frame)}
                    className={`absolute left-1 right-1 rounded-lg border-2 transition-all flex flex-col p-1 gap-1 group overflow-hidden
                      ${isLocked
                        ? 'border-gray-100 bg-gray-50/50 cursor-not-allowed opacity-60'
                        : isFull
                          ? 'border-gray-200 bg-gray-100/40 cursor-not-allowed shadow-none'
                          : 'border-blue-100 bg-blue-50/20 hover:bg-blue-100/40 hover:border-blue-400 cursor-pointer shadow-sm z-10'
                      }`}
                  >
                    {/* Lớp nền gạch chéo khi bị khóa (giống Flexible) */}
                    {isLocked && (
                      <div
                        className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none"
                        style={{
                          background: `repeating-linear-gradient(135deg, #000, #000 5px, transparent 5px, transparent 10px)`
                        }}
                      />
                    )}

                    <div className="flex justify-between items-center px-1 relative z-10">
                      <span className={`text-[9px] font-bold ${isLocked || isFull ? 'text-gray-400' : 'text-blue-600'}`}>
                        CA {frame.orderIndex} {isLocked && '(Hết hạn)'}
                      </span>
                      {!isLocked && (
                        <span className="text-[8px] text-gray-400 font-medium">
                          {concurrentBookings.length}/{maxConcurrent}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col gap-0.5 overflow-hidden relative z-10">
                      {concurrentBookings.map(event => (
                        <div key={event.id} className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded shadow-sm truncate font-medium">
                          {event.title}
                        </div>
                      ))}

                      {canClick && (
                        <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity text-center">
                          <span className="text-[9px] text-blue-500 font-bold">+ Đặt chỗ</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};