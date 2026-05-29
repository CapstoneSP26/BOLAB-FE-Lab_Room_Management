import React, { useMemo } from 'react';
import { CALENDAR_CONFIG } from '../constants/calendar.constants';
import type { CalendarEvent } from '../types/calendar.type';
import { getPositionStyle, timeToPosition } from '../utils/calendar-math.util';
import { addDays, addHours, endOfDay, format, isAfter, isBefore, startOfHour, parseISO } from 'date-fns';
import { getEventAppearance } from '../utils/event-color.mapper';
import { getCurrentSemesterEndDate } from '../../../utils/semester.util';
import { Users, Clock, Bookmark } from 'lucide-react'; // <-- THÊM ICON ĐỂ LÀM ĐẸP UI

interface FlexibleGridViewProps {
  timeSlots: string[];
  weekDays: Date[];
  dragState?: any;
  events: CalendarEvent[];
  minBookingLeadTime: number;
  maxBookingAdvance?: number;
  handleMouseDown?: (e: React.MouseEvent, dayIndex: number) => void;
  highlightRange?: {
    date: string;
    startTime: string;
    endTime: string;
  };
}

export const FlexibleGridView: React.FC<FlexibleGridViewProps> = ({
  timeSlots,
  weekDays,
  dragState,
  events,
  minBookingLeadTime = 0,
  maxBookingAdvance = 365,
  handleMouseDown,
  highlightRange,
}) => {
  const { START_HOUR, END_HOUR, CELL_HEIGHT } = CALENDAR_CONFIG;
  const maxHeight = useMemo(() => (END_HOUR - START_HOUR + 1) * CELL_HEIGHT, []);
  const now = new Date();
  const minAllowedTime = addHours(now, minBookingLeadTime);

  const maxAllowedDate = useMemo(() => {
    const maxDays = maxBookingAdvance === 0 ? 365 : maxBookingAdvance;
    const maxAdvanceDate = addDays(now, maxDays);
    const semesterEndDate = getCurrentSemesterEndDate(now);
    return isBefore(maxAdvanceDate, semesterEndDate) ? endOfDay(maxAdvanceDate) : endOfDay(semesterEndDate);
  }, [maxBookingAdvance]);

  const highlightStart = highlightRange ? parseISO(`${highlightRange.date}T${highlightRange.startTime}:00`) : null;
  const highlightEnd = highlightRange ? parseISO(`${highlightRange.date}T${highlightRange.endTime}:00`) : null;

  // Thuật toán chia cột phân rã chồng lấn (Overlap) - Giữ nguyên logic tối ưu của bạn
  const getPositionedEvents = (dayEvents: CalendarEvent[]) => {
    if (dayEvents.length === 0) return [];
    const sorted = [...dayEvents].sort((a, b) => a.start.localeCompare(b.start));
    const groups: any[][] = [];
    let currentGroup: any[] = [];
    let groupEndTime = "";

    sorted.forEach(event => {
      if (currentGroup.length > 0 && event.start >= groupEndTime) {
        groups.push(currentGroup);
        currentGroup = [];
      }
      currentGroup.push(event);
      if (event.end > groupEndTime) groupEndTime = event.end;
    });
    if (currentGroup.length > 0) groups.push(currentGroup);

    const positioned: any[] = [];
    groups.forEach(group => {
      const columns: any[][] = [];
      group.forEach(event => {
        let placed = false;
        for (let i = 0; i < columns.length; i++) {
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

  // ==================== HÀM RENDER Ô SỰ KIỆN ĐÃ ĐƯỢC LỘT XÁC GIAO DIỆN ====================
  const renderColumnEvents = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEvents = events.filter((event) => event.start.startsWith(dateStr));
    const positionedEvents = getPositionedEvents(dayEvents);

    return positionedEvents.map((event) => {
      const startTime = event.start.split('T')[1].substring(0, 5);
      const endTime = event.end.split('T')[1].substring(0, 5);
      const baseStyle = getPositionStyle(startTime, endTime);

      const isBooking = event.type === 'BOOKING';
      const appearance = getEventAppearance(event.rawOrigin.type, event.status, isBooking, event.priorityLevel);
      const isInProcess = event.status === 2;

      return (
        <div
          key={event.id}
          className={`absolute rounded-xl border-l-[5px] p-2 text-[11px] flex flex-col justify-between shadow-sm z-10 select-none overflow-hidden transition-all duration-200 hover:z-30 hover:shadow-xl hover:scale-[1.02] cursor-pointer group backdrop-blur-[1px] ${appearance.container}`}
          style={{
            ...baseStyle,
            left: `calc(${event.left} + 3px)`,
            width: `calc(${event.width} - 6px)`,
          }}
          title={`${event.title} (${startTime} - ${endTime})`}
        >
          {/* Khối Trên: Tiêu đề lớp/Người đặt + Pulse tín hiệu Realtime */}
          <div>
            <div className="flex justify-between items-start gap-1.5 mb-1">
              <div className="font-extrabold text-[12px] line-clamp-2 tracking-tight uppercase leading-tight group-hover:text-orange-600 transition-colors">
                {event.title}
              </div>
              {isInProcess && (
                <span className="flex h-2 w-2 relative shrink-0 mt-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </div>

            {/* Khối Giữa: Tên nhóm/Lớp học phần (Nếu có) */}
            {event.groupName && (
              <div className="flex items-center gap-1 text-[10px] opacity-75 font-medium tracking-tight mb-1">
                <Bookmark className="w-3 h-3 shrink-0 text-slate-400" />
                <span className="truncate">{event.groupName}</span>
              </div>
            )}
          </div>

          {/* Khối Dưới: Thanh Metadata gồm Thời gian, Ca học, Sĩ số sinh viên và Badge Priority */}
          <div className="mt-2 space-y-1.5 border-t border-black/[0.04] pt-1.5">
            <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-500 font-medium">
              <div className="flex items-center gap-1 whitespace-nowrap">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{startTime} - {endTime}</span>
                {event.slotName && <span className="text-[9px] bg-slate-200/60 px-1 rounded text-slate-600 font-bold ml-0.5">{event.slotName}</span>}
              </div>

              {event.studentCount > 0 && (
                <div className="flex items-center gap-0.5 text-slate-600 font-bold shrink-0">
                  <Users className="w-3 h-3 text-slate-400" />
                  <span>{event.studentCount} SV</span>
                </div>
              )}
            </div>

            {/* Badge phân tầng Mức độ ưu tiên */}
            <div className="flex justify-end">
              <span className={`text-[8px] px-1.5 py-0.5 rounded-md uppercase font-black tracking-wider shadow-2xs scale-90 origin-right ${appearance.badge}`}>
                {appearance.label}
              </span>
            </div>
          </div>

          {/* Nếu là lịch thi (Priority = 3), trang trí thêm họa tiết sọc chéo chìm để tạo sự trang nghiêm, chú ý cao */}
          {event.priorityLevel === 3 && (
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #ef4444 0, #ef4444 1px, transparent 0, transparent 8px)',
                backgroundSize: '12px 12px'
              }}
            />
          )}
        </div>
      );
    });
  };

  const onHandleMouseDown = (e: React.MouseEvent, dayIndex: number) => {
    if (handleMouseDown) handleMouseDown(e, dayIndex);
  };

  return (
    <div className="flex-1 grid grid-cols-[85px_1fr] min-w-[1000px] bg-gray-50/40">
      {/* Trục giờ bên trái */}
      <div className="bg-white border-r border-gray-200 sticky left-0 z-30 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
        {timeSlots.map((time) => (
          <div key={time} className="border-b border-gray-100 pr-4 pt-2 text-right" style={{ height: `${CELL_HEIGHT}px` }}>
            <span className="text-[11px] text-slate-400 font-black tracking-tight font-mono">{time}</span>
          </div>
        ))}
      </div>

      {/* Lưới cột Calendar chính */}
      <div className="grid grid-cols-7 relative bg-white shadow-inner">
        {weekDays.map((date, dayIndex) => {
          const isDraggingThisColumn = dragState && dragState.isActive && dragState.dayIndex === dayIndex;
          const dateStr = format(date, 'yyyy-MM-dd');
          const isMinAllowedDay = dateStr === format(minAllowedTime, 'yyyy-MM-dd');
          const isPastDay = isBefore(date, startOfHour(minAllowedTime)) && !isMinAllowedDay;

          const isMaxAllowedDay = dateStr === format(maxAllowedDate, 'yyyy-MM-dd');
          const isFutureLockedDay = isAfter(date, maxAllowedDate) && !isMaxAllowedDay;
          const isHighlightedDay = highlightRange?.date === dateStr;
          const shouldHighlightSlot = !!highlightRange && isHighlightedDay && !!highlightStart && !!highlightEnd;

          let lockedOverlayStyle = null;
          if (isPastDay) {
            lockedOverlayStyle = { top: 0, height: "100%" };
          } else if (isMinAllowedDay) {
            const heightPos = Math.min(timeToPosition(format(minAllowedTime, 'HH:mm')), maxHeight);
            lockedOverlayStyle = { top: 0, height: `${heightPos}px` };
          } else if (isFutureLockedDay) {
            lockedOverlayStyle = { top: 0, height: "100%" };
          } else if (isMaxAllowedDay) {
            const heightPos = Math.min(timeToPosition(format(maxAllowedDate, 'HH:mm')), maxHeight);
            lockedOverlayStyle = { top: heightPos, height: `${maxHeight - heightPos}px` };
          }

          return (
            <div
              key={dayIndex}
              className={`relative border-r border-gray-100 h-full transition-colors duration-150 hover:bg-slate-50/60 ${isHighlightedDay ? 'bg-orange-50/30' : ''}`}
              style={{ height: `${(END_HOUR - START_HOUR + 1) * CELL_HEIGHT}px` }}
              onMouseDown={(e) => onHandleMouseDown(e, dayIndex)}
            >
              {timeSlots.map((_, i) => (
                <div key={i} className="border-b border-slate-100/60 pointer-events-none" style={{ height: `${CELL_HEIGHT}px` }} />
              ))}

              {/* Lớp phủ vạch chéo chìm cho các vùng thời gian bị khóa chính sách */}
              {lockedOverlayStyle && (
                <div
                  className="absolute left-0 right-0 z-0 pointer-events-none opacity-[0.04] bg-slate-900"
                  style={{
                    ...lockedOverlayStyle,
                    background: `repeating-linear-gradient(135deg, #000, #000 8px, transparent 8px, transparent 16px)`
                  }}
                />
              )}

              {renderColumnEvents(date)}

              {/* Ô nhấp nháy định vị tìm kiếm */}
              {shouldHighlightSlot && highlightStart && highlightEnd && (
                <div
                  className="absolute left-1 right-1 rounded-xl z-30 border-2 border-orange-500 bg-orange-400/20 ring-4 ring-orange-500/10 shadow-lg pointer-events-none animate-pulse"
                  style={{
                    top: `${timeToPosition(highlightRange.startTime)}px`,
                    height: `${Math.max(28, timeToPosition(highlightRange.endTime) - timeToPosition(highlightRange.startTime))}px`,
                  }}
                />
              )}

              {/* Drag Preview Khi Đang Kéo chuột tạo lịch */}
              {isDraggingThisColumn && (
                <div
                  className="absolute left-1 right-1 rounded-xl z-40 border-l-4 shadow-xl bg-orange-600/10 border-orange-500 text-orange-950 overflow-hidden ring-1 ring-orange-500/20 animate-in fade-in duration-100"
                  style={{
                    top: `${Math.min(dragState.startY, dragState.currentY)}px`,
                    height: `${Math.abs(dragState.currentY - dragState.startY)}px`,
                  }}
                >
                  <div className="p-2.5 bg-white/70 backdrop-blur-xs h-full flex flex-col justify-center">
                    <div className="font-black uppercase text-[8px] tracking-[0.15em] text-orange-600 opacity-75">
                      Thả để đặt lịch
                    </div>
                    <div className="text-[11px] font-black font-mono mt-0.5 text-slate-800">
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