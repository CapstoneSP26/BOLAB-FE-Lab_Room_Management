import React, { useMemo } from 'react';
import { CALENDAR_CONFIG } from '../constants/calendar.constants';
import type { CalendarEvent } from '../types/calendar.type';
import { getPositionStyle, timeToPosition } from '../utils/calendar-math.util';
import { addDays, addHours, endOfDay, format, isAfter, isBefore, startOfHour } from 'date-fns';
import { getEventAppearance } from '../utils/event-color.mapper';
import { getCurrentSemesterEndDate } from '../../../utils/semester.util';

interface FlexibleGridViewProps {
  timeSlots: string[];
  weekDays: Date[];
  dragState?: any;
  events: CalendarEvent[];
  minBookingLeadTime: number;
  maxBookingAdvance?: number;
  handleMouseDown?: (e: React.MouseEvent, dayIndex: number) => void;
}

export const FlexibleGridView: React.FC<FlexibleGridViewProps> = ({
  timeSlots,
  weekDays,
  dragState,
  events,
  minBookingLeadTime = 0,
  maxBookingAdvance = 365,
  handleMouseDown,
}) => {
  const { START_HOUR, END_HOUR, CELL_HEIGHT } = CALENDAR_CONFIG;
  const maxHeight = useMemo(
    () => (END_HOUR - START_HOUR + 1) * CELL_HEIGHT,
    [],
  );
  const now = new Date();
  const minAllowedTime = addHours(now, minBookingLeadTime);

  // --- TÍNH TOÁN NGÀY GIỚI HẠN TRONG TƯƠNG LAI ---
  const maxAllowedDate = useMemo(() => {
    const maxAdvanceDate = addDays(now, maxBookingAdvance == 0 ? 365 : maxBookingAdvance); // Nếu BE không cấu hình thì mặc định cho phép đặt trước 14 ngày
    const semesterEndDate = getCurrentSemesterEndDate(now);

    // Lấy ngày nhỏ hơn (sớm hơn) và đặt mốc cuối ngày để chặn chính xác
    return isBefore(maxAdvanceDate, semesterEndDate)
      ? endOfDay(maxAdvanceDate)
      : endOfDay(semesterEndDate);
  }, [maxBookingAdvance]);

  // --- LOGIC XỬ LÝ CHỒNG LẤN (OVERLAP) ---
  const getPositionedEvents = (dayEvents: CalendarEvent[]) => {
    if (dayEvents.length === 0) return [];

    // Sắp xếp theo thời gian bắt đầu
    const sorted = [...dayEvents].sort((a, b) => a.start.localeCompare(b.start));

    const groups: any[][] = [];
    let currentGroup: any[] = [];
    let groupEndTime = "";

    // Nhóm các sự kiện có khả năng va chạm vào từng Group
    sorted.forEach(event => {
      if (currentGroup.length > 0 && event.start >= groupEndTime) {
        groups.push(currentGroup);
        currentGroup = [];
      }
      currentGroup.push(event);
      if (event.end > groupEndTime) groupEndTime = event.end;
    });
    if (currentGroup.length > 0) groups.push(currentGroup);

    // Tính toán width và left cho từng event trong group
    const positioned: any[] = [];
    groups.forEach(group => {
      const columns: any[][] = [];

      group.forEach(event => {
        let placed = false;
        for (let i = 0; i < columns.length; i++) {
          // Nếu event không trùng với event cuối cùng trong cột i
          if (event.start >= columns[i][columns[i].length - 1].end) {
            columns[i].push(event);
            placed = true;
            break;
          }
        }
        if (!placed) columns.push([event]);
      });

      const columnCount = columns.length;
      columns.forEach((column, columnIndex) => {
        column.forEach(event => {
          positioned.push({
            ...event,
            width: `${100 / columnCount}%`,
            left: `${(columnIndex * 100) / columnCount}%`,
          });
        });
      });
    });

    return positioned;
  };

  // Render các Event đã có trên một cột ngày
  const renderColumnEvents = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEvents = events.filter((event) => event.start.startsWith(dateStr));
    const positionedEvents = getPositionedEvents(dayEvents);

    return positionedEvents.map((event) => {
      const startTime = event.start.split('T')[1].substring(0, 5);
      const endTime = event.end.split('T')[1].substring(0, 5);
      const baseStyle = getPositionStyle(startTime, endTime);

      const isBooking = event.type === 'BOOKING';
      const appearance = getEventAppearance(event.rawOrigin.type, event.status, isBooking);
      const isInProcess = event.status === 2;

      return (
        <div
          key={event.id}
          className={`absolute rounded-lg px-2 py-1.5 text-[11px] font-bold border-l-4 shadow-sm z-10 select-none overflow-hidden transition-all hover:z-20 hover:shadow-xl hover:scale-[1.01] ${appearance.container}`} style={{
            ...baseStyle,
            left: `calc(${event.left} + 2px)`, // Cộng 2px để có khoảng hở giữa các cột
            width: `calc(${event.width} - 4px)`, // Trừ 4px để không dính sát nhau
          }}
          title={`${event.title} (${startTime} - ${endTime})`}
        >
          {/* Header: Title + Status Icon */}
          <div className="flex justify-between items-start gap-1 mb-0.5">
            <div className="truncate drop-shadow-sm uppercase tracking-tighter leading-tight">
              {event.title}
            </div>
            {isInProcess && (
              <span className="flex h-2 w-2 mt-1">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>

          {event.groupName && (
            <div className="flex justify-between items-start gap-1 mb-0.5">
              <div className="truncate drop-shadow-sm uppercase tracking-tighter leading-tight">
                {event.groupName}
              </div>
            </div>)}


          {/* Info Row: Time & Badge */}
          <div className="flex flex-wrap items-center gap-1 mt-auto">
            <div className="text-[9px] opacity-70 font-medium whitespace-nowrap">
              {startTime} - {endTime}
            </div>
            <span className={`text-[7px] px-1 rounded-[4px] uppercase font-black tracking-widest ${appearance.badge}`}>
              {appearance.label}
            </span>
          </div>

          {/* Nếu là lịch thi, thêm hiệu ứng sọc mờ cho chuyên nghiệp */}
          {event.rawOrigin?.type === 4 && (
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[red]"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '8px 8px' }}>
            </div>
          )}
        </div>
      );
    });
  };

  const onHandleMouseDown = (e: React.MouseEvent, dayIndex: number) => {
    if (handleMouseDown) handleMouseDown(e, dayIndex);
  };

  return (
    <div className="flex-1 grid grid-cols-[80px_1fr] min-w-[1000px] bg-gray-50/30">
      {/* 1. Trục thời gian */}
      <div className="bg-white border-r border-gray-200 sticky left-0 z-30 shadow-sm">
        {timeSlots.map((time) => (
          <div
            key={time}
            className="border-b border-gray-100 pr-3 pt-2 text-right"
            style={{ height: `${CELL_HEIGHT}px` }}
          >
            <span className="text-[11px] text-gray-400 font-black tracking-tight uppercase">{time}</span>
          </div>
        ))}
      </div>

      {/* 2. Lưới cột */}
      <div className="grid grid-cols-7 relative bg-white shadow-inner">
        {weekDays.map((date, dayIndex) => {
          const isDraggingThisColumn = dragState && dragState.isActive && dragState.dayIndex === dayIndex;
          const dateStr = format(date, 'yyyy-MM-dd');
          const isMinAllowedDay = dateStr === format(minAllowedTime, 'yyyy-MM-dd');
          const isPastDay = isBefore(date, startOfHour(minAllowedTime)) && !isMinAllowedDay;

          // LOGIC KHÓA TƯƠNG LAI
          const isMaxAllowedDay = dateStr === format(maxAllowedDate, 'yyyy-MM-dd');
          const isFutureLockedDay = isAfter(date, maxAllowedDate) && !isMaxAllowedDay;

          let lockedOverlayStyle = null;
          if (isPastDay) {
            lockedOverlayStyle = { top: 0, height: "100%" };
          } else if (isMinAllowedDay) {
            const heightPos = Math.min(timeToPosition(format(minAllowedTime, 'HH:mm')), maxHeight);
            lockedOverlayStyle = { top: 0, height: `${heightPos}px` };
          }
          // Nếu ngày này hoàn toàn vượt quá maxAllowedDate trong tương lai -> Xám toàn bộ cột
          else if (isFutureLockedDay) {
            lockedOverlayStyle = { top: 0, height: "100%" };
          }
          // Nếu là chính ngày giới hạn tương lai -> Xám phần thời gian còn lại của ngày hôm đó
          else if (isMaxAllowedDay) {
            const heightPos = Math.min(timeToPosition(format(maxAllowedDate, 'HH:mm')), maxHeight);
            lockedOverlayStyle = { top: heightPos, height: `${maxHeight - heightPos}px` };
          }
          return (
            <div
              key={dayIndex}
              className="relative border-r border-gray-100 h-full transition-colors hover:bg-slate-50/50"
              style={{ height: `${(END_HOUR - START_HOUR + 1) * CELL_HEIGHT}px` }}
              onMouseDown={(e) => onHandleMouseDown(e, dayIndex)}
            >
              {/* Kẻ ngang */}
              {timeSlots.map((_, i) => (
                <div
                  key={i}
                  className="border-b border-gray-50 pointer-events-none"
                  style={{ height: `${CELL_HEIGHT}px` }}
                />
              ))}

              {/* Vùng khóa Lead Time */}
              {lockedOverlayStyle && (
                <div
                  className="absolute left-0 right-0 z-0 pointer-events-none opacity-[0.05]"
                  style={{
                    ...lockedOverlayStyle,
                    background: `repeating-linear-gradient(135deg, #000, #000 10px, transparent 10px, transparent 20px)`
                  }}
                />
              )}

              {/* Sự kiện */}
              {renderColumnEvents(date)}

              {/* Drag Preview */}
              {isDraggingThisColumn && (
                <div
                  className="absolute left-1 right-1 rounded-xl z-40 border-l-4 shadow-2xl bg-blue-600/10 border-blue-600 text-blue-900 overflow-hidden ring-1 ring-blue-600/20"
                  style={{
                    top: `${Math.min(dragState.startY, dragState.currentY)}px`,
                    height: `${Math.abs(dragState.currentY - dragState.startY)}px`,
                  }}
                >
                  <div className="p-3 bg-white/60 backdrop-blur-md h-full">
                    <div className="font-black uppercase text-[8px] tracking-[0.2em] text-blue-600 opacity-60">
                      Đang tạo lịch
                    </div>
                    <div className="text-xs font-black mt-1">
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
