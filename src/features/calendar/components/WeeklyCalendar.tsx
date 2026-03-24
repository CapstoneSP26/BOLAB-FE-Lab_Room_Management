import React, { useState, useRef, useMemo } from 'react';
import type { WeeklyCalendarProps } from '../types/calendar.type';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { getWeekDaysByOffset } from '../../../utils/date.util';
import { useLabPolicies } from '../../labroom/hooks/useLabPolicies';
import { SlotTypeSelector } from '../../slot/components/SlotTypeSelector';
import { FLEXIBLE_ID } from '../../slot/constants/slot.constant';
import { CalendarNavigation } from './CalendarNavigation';
import { CalendarDayHeader } from './CalendarDayHeader';
import { CALENDAR_CONFIG } from '../constants/calendar.constants';
import { positionToTime } from '../utils/calendar-math.util';
import { FlexibleGridView } from './FlexibleGridView';
import { useSlotTypes } from '../../slot/hooks/useSlotTypes';
import { useSlotStore } from '../../../store/slotStore';
import { FixedGridView } from './FixedGridView';

interface DragState {
  isActive: boolean;
  dayIndex: number | null;
  startY: number | null;
  currentY: number | null;
  startTime: string;
  endTime: string;
}

/**
 * 🗓️ Weekly Calendar Grid Component (Google Calendar Style)
 * Click-and-drag to create bookings, resize blocks, visual conflict detection
 */
export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  labRoomId,
  calendarMode,
  onCreateBooking,
  weekOffset = 0,
  onWeekChange,
}) => {
  const { CELL_HEIGHT } = CALENDAR_CONFIG;
  const [selectedSlotTypeId, setSelectedSlotTypeId] = useState(FLEXIBLE_ID);
  const [dragState, setDragState] = useState<DragState>({
    isActive: false,
    dayIndex: null,
    startY: null,
    currentY: null,
    startTime: '',
    endTime: '',
  });

  // 1. Fetch dữ liệu slot types khi campus thay đổi
  const { } = useSlotTypes(0);
  // Hook này bên trong sẽ tự động gọi useSlotStore.getState().setSlotTypes()

  // 2. Lấy thông tin type hiện tại để vẽ Grid
  const { slotTypes } = useSlotStore();
  const currentSlotType = useMemo(() =>
    slotTypes.find(t => t.id === selectedSlotTypeId),
    [slotTypes, selectedSlotTypeId]
  );

  const { weekDays, weekStart, weekEnd } = useMemo(() => {
    const days = getWeekDaysByOffset(weekOffset);
    return {
      weekDays: days,
      weekStart: days[0],
      weekEnd: days[6],
    };
  }, [weekOffset]);

  const { data: policies } = useLabPolicies(labRoomId);

  const { events } = useCalendarEvents({
    calendarMode: calendarMode,
    startDate: weekStart.toISOString().split('T')[0],
    endDate: weekEnd.toISOString().split('T')[0]
  });


  const gridRef = useRef<HTMLDivElement>(null);

  // Generate time slots (7:00 AM - 10:00 PM, hourly display only)
  const timeSlots: string[] = [];
  for (let hour = 7; hour <= 22; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  // Check if drag selection has conflict
  const hasConflict = (): boolean => {
    if (!dragState.isActive || dragState.dayIndex === null) return false;

    const dateStr = weekDays[dragState.dayIndex].toISOString().split('T')[0];
    const { startTime, endTime } = dragState;

    return events.some(event => {
      const eventDate = event.start.split('T')[0];
      if (eventDate !== dateStr) return false;

      const eventStart = event.start.split('T')[1].substring(0, 5);
      const eventEnd = event.end.split('T')[1].substring(0, 5);

      // Logic va chạm: StartA < EndB và EndA > StartB
      return startTime < eventEnd && endTime > eventStart;
    });
  };

  // Handle clicking on a fixed slot
  const handleSlotClick = (date: string, frame: any) => {
    // Thực thi callback onCreateBooking được truyền từ props
    onCreateBooking({
      date: date,           // Định dạng YYYY-MM-DD
      startTime: frame.startTime,
      endTime: frame.endTime,
    });
  };

  // Handle mouse down (start drag)
  const handleMouseDown = (e: React.MouseEvent, dayIndex: number) => {
    if (selectedSlotTypeId !== FLEXIBLE_ID) return; // Chỉ cho phép kéo ở chế độ Flexible

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top; // Lấy tọa độ Y tương đối trong cột

    const startTime = positionToTime(y);

    setDragState({
      isActive: true,
      dayIndex,
      startY: y,
      currentY: y,
      startTime,
      endTime: startTime,
    });
  };

  // Handle mouse move (update drag) - Global mouse move
  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!dragState.isActive || !gridRef.current || dragState.dayIndex === null || dragState.startY === null) return;

    const gridRect = gridRef.current.getBoundingClientRect();
    const scrollContainer = gridRef.current.parentElement;

    // Auto-scroll when dragging near edges
    if (scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const scrollThreshold = 80; // Distance from edge to trigger scroll
      const scrollSpeed = 15; // Pixels to scroll per frame

      // Check if mouse is near top edge
      if (e.clientY < containerRect.top + scrollThreshold) {
        scrollContainer.scrollTop -= scrollSpeed;
      }
      // Check if mouse is near bottom edge
      else if (e.clientY > containerRect.bottom - scrollThreshold) {
        scrollContainer.scrollTop += scrollSpeed;
      }
    }

    // Get actual header height by finding the day header element (not time column)
    const dayHeader = gridRef.current.querySelector('[data-day-header]');
    const headerHeight = dayHeader?.getBoundingClientRect().height || 0;

    // Calculate Y position relative to grid content (after headers)
    // gridRect.top already accounts for scroll (can be negative), so just subtract it and header
    const relativeY = e.clientY - gridRect.top - headerHeight;
    const currentY = Math.max(0, Math.min(relativeY, timeSlots.length * CELL_HEIGHT));

    const minY = Math.min(dragState.startY, currentY);
    const maxY = Math.max(dragState.startY, currentY);

    const startTime = positionToTime(minY);
    const endTime = positionToTime(maxY);

    setDragState((prev) => ({
      ...prev,
      currentY,
      startTime,
      endTime,
    }));
  };

  // Handle mouse up (complete drag)
  const handleMouseUp = () => {
    if (!dragState.isActive || dragState.dayIndex === null) {
      setDragState({
        isActive: false,
        dayIndex: null,
        startY: null,
        currentY: null,
        startTime: '',
        endTime: '',
      });
      return;
    }

    // Don't create booking if there's a conflict
    if (hasConflict()) {
      setDragState({
        isActive: false,
        dayIndex: null,
        startY: null,
        currentY: null,
        startTime: '',
        endTime: '',
      });
      return;
    }

    const dayIndex = dragState.dayIndex;
    const date = weekDays[dayIndex].toISOString().split('T')[0];

    onCreateBooking({
      date,
      startTime: dragState.startTime,
      endTime: dragState.endTime,
    });

    setDragState({
      isActive: false,
      dayIndex: null,
      startY: null,
      currentY: null,
      startTime: '',
      endTime: '',
    });
  };

  // Handle global mouse events
  React.useEffect(() => {
    if (dragState.isActive) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState]);

  const conflict = hasConflict();

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      {/* Week Navigation Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50">

        <CalendarNavigation
          weekStart={weekStart}
          weekEnd={weekEnd}
          weekOffset={weekOffset}
          onWeekChange={onWeekChange}
        />

        {/* Booking Mode Toggle */}
        <SlotTypeSelector
          selectedId={selectedSlotTypeId}
          onSelect={setSelectedSlotTypeId}
          isFlexibleAllowed={Boolean(policies?.IsFreeTimeAllowed ?? true)}
        />
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto bg-gradient-to-b from-white to-gray-50">
        <div
          ref={gridRef}
          className="border-l border-t border-gray-200 relative select-none"
          style={{ minWidth: '1000px' }}
        >
          {/* Day headers */}
          <CalendarDayHeader weekDays={weekDays} />

          {/* Time slots or Fixed slots - Conditional rendering based on booking mode */}
          {selectedSlotTypeId === FLEXIBLE_ID ? (
            // OutSlot Mode: Show hourly time slots with drag-to-book
            <FlexibleGridView
              timeSlots={timeSlots}
              weekDays={weekDays}
              dragState={dragState}
              events={events}
              handleMouseDown={handleMouseDown}
              conflict={conflict}
            />
          ) : (
            // OldSlot Mode: Show fixed slots (slot 1, slot 2, etc.)
            currentSlotType !== undefined ? (
              <FixedGridView
                timeSlots={timeSlots}
                weekDays={weekDays}
                activeSlotType={currentSlotType}
                events={events}
                onSlotClick={handleSlotClick}
                maxConcurrent={Number(policies?.MaxConcurrentBookings ?? 1)}
              />) : null
          )}
        </div>
      </div>
    </div>
  );
};
