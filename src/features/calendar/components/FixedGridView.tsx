import React from 'react';
import type { SlotType } from '../../slot/types/slot.types';
import type { CalendarEvent } from '../types/calendar.type';
import { getPositionStyle } from '../utils/calendar-math.util';

interface FixedGridViewProps {
  timeSlots: string[];
  weekDays: Date[];
  activeSlotType: SlotType;
  events: CalendarEvent[];
  onSlotClick: (date: string, frame: any) => void;
  maxConcurrent: number; // Lấy từ chính LabRoomPolicy "MaxConcurrentBookings"
}

export const FixedGridView: React.FC<FixedGridViewProps> = ({
  timeSlots,
  weekDays,
  activeSlotType,
  events,
  onSlotClick,
  maxConcurrent
}) => {

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
          const dateStr = date.toISOString().split('T')[0];

          return (
            <div key={dayIndex} className="relative border-r border-gray-200 h-full">
              {/* Vạch kẻ giờ nền */}
              {timeSlots.map((_, i) => (
                <div key={i} className="h-20 border-b border-gray-50 pointer-events-none" />
              ))}

              {/* HIỂN THỊ CÁC KHUNG CA (SLOT FRAMES) */}
              {activeSlotType.slotFrames.map((frame) => {
                const style = getPositionStyle(frame.startTime, frame.endTime);

                // Lọc events thuộc Ca này (Khớp ngày và khớp giờ bắt đầu)
                const concurrentBookings = events.filter(e =>
                  e.start.startsWith(dateStr) && e.start.includes(frame.startTime)
                );

                const isFull = concurrentBookings.length >= maxConcurrent;

                return (
                  <div
                    key={frame.id}
                    style={style}
                    onClick={() => !isFull && onSlotClick(dateStr, frame)}
                    className={`absolute left-1 right-1 rounded-lg border-2 transition-all flex flex-col p-1 gap-1 group
                      ${isFull
                        ? 'border-gray-200 bg-gray-100/40 cursor-not-allowed shadow-none'
                        : 'border-blue-100 bg-blue-50/20 hover:bg-blue-100/40 hover:border-blue-400 cursor-pointer shadow-sm z-10'
                      }`}
                  >
                    {/* Header nhỏ của Slot (Hiện: Ca X | Slot: 1/3) */}
                    <div className="flex justify-between items-center px-1">
                      <span className={`text-[9px] font-bold ${isFull ? 'text-gray-400' : 'text-blue-600'}`}>
                        CA {frame.orderIndex}
                      </span>
                      <span className="text-[8px] text-gray-400 font-medium">
                        {concurrentBookings.length}/{maxConcurrent}
                      </span>
                    </div>

                    {/* Danh sách Event đã đặt */}
                    <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                      {concurrentBookings.map(event => (
                        <div
                          key={event.id}
                          className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded shadow-sm truncate font-medium"
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}

                      {/* Trạng thái trống (Chỉ hiện khi hover và chưa full) */}
                      {!isFull && concurrentBookings.length < maxConcurrent && (
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