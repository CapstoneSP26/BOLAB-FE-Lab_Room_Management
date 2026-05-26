import React, { useState, useRef, useMemo, useCallback } from 'react';
import type { CalendarMode } from '../types/calendar.type';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { getWeekDaysByOffset } from '../../../utils/date.util';
import { SlotTypeSelector } from '../../slot/components/SlotTypeSelector';
import { FLEXIBLE_ID } from '../../slot/constants/slot.constant';
import { CalendarNavigation } from './CalendarNavigation';
import { CalendarDayHeader } from './CalendarDayHeader';
import { CALENDAR_CONFIG } from '../constants/calendar.constants';
import { positionToTime } from '../utils/calendar-math.util';
import { FlexibleGridView } from './FlexibleGridView';
import { FixedGridView } from './FixedGridView';
import type { PendingBooking } from '../../booking/types/booking.type';
import { getStartOfDayVNInUTC } from '../../../utils/date.util';
import { addDays, formatDate } from 'date-fns';
import { PolicyType, type PolicyTypeEnum } from '../../labroom';
import { checkLabPolicies } from '../../labroom/utils/policy.util';
import { useToast } from '../../../hooks/useToast';
import type { SlotType } from '../../slot/types/slot.types';
import { useSignalRListener } from '../../../hooks/useSignalRListener';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useAuthStore';

interface DragState {
  isActive: boolean;
  dayIndex: number | null;
  startY: number | null;
  currentY: number | null;
  startTime: string;
  endTime: string;
}

export interface WeeklyCalendarProps {
  policies?: Record<PolicyTypeEnum, string>;
  calendarMode: CalendarMode;
  selectedRoomId: string;
  onCreateBooking: (data: PendingBooking) => void;
  selectedSlotTypeId: number;
  onSlotTypeChange: (id: number) => void;
  weekOffset?: number;
  onWeekChange: (offset: number) => void;
  slotTypes: SlotType[];
}

/**
 * 🗓️ Weekly Calendar Grid Component (Google Calendar Style)
 * Click-and-drag to create bookings, resize blocks, visual conflict detection
 */
export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  policies,
  calendarMode,
  selectedRoomId,
  onCreateBooking,
  selectedSlotTypeId,
  onSlotTypeChange,
  weekOffset = 0,
  onWeekChange,
  slotTypes
}) => {
  const { user } = useAuthStore();
  const appAlert = useToast();
  const { CELL_HEIGHT, START_HOUR, END_HOUR } = CALENDAR_CONFIG;
  const [dragState, setDragState] = useState<DragState>({
    isActive: false,
    dayIndex: null,
    startY: null,
    currentY: null,
    startTime: "",
    endTime: "",
  });

  const queryClient = useQueryClient();

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

  // Fetch Policies Data
  const isFreeTimeAllowed = (policies?.[PolicyType.IsFreeTimeAllowed] ?? 'true') === 'true' ? true : false;
  const maxConcurrentBookings = Number(policies?.[PolicyType.MaxConcurrentBookings] ?? 1);
  const minBookingLeadTime = Number(policies?.[PolicyType.MinBookingLeadTime] ?? 0);
  const maxBookingAdvance = Number(policies?.[PolicyType.MaxBookingAdvance] ?? 0);

  const { events } = useCalendarEvents({
    calendarMode: calendarMode,
    labRoomId: Number(selectedRoomId),
    startDate: getStartOfDayVNInUTC(weekStart),
    endDate: getStartOfDayVNInUTC(addDays(weekEnd, 1)),
  });

  useSignalRListener("calendar.statusUpdated", async (payload: any) => {
    // 1. XÓA NGAY LẬP TỨC cache của Bookings
    // Vì chắc chắn cái Booking này không còn là "Pending", xóa đi để UI không hiện nó nữa
    queryClient.removeQueries({
      predicate: (query) =>
        query.queryKey[0] === "bookings" &&
        (query.queryKey[1] as any)?.labRoomId === payload.labRoomId
    });

    // 2. ĐỢI 1 KHOẢNG NGẮN (Ví dụ 1s) để Backend xử lý xong MediatR Event (tạo Schedule)
    // Trong lúc này UI sẽ mượt hơn vì Booking cũ đã biến mất
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    await delay(1800);

    // 3. REFETCH cưỡng chế cho Schedules
    // Sử dụng refetch thay vì invalidate để đảm bảo nó gọi API ngay lập tức
    await queryClient.refetchQueries({
      predicate: (query) =>
        query.queryKey[0] === "schedules" &&
        (query.queryKey[1] as any)?.labRoomId === payload.labRoomId,
      type: 'active' // Chỉ fetch lại những gì đang hiện trên màn hình
    });

    appAlert.success("Cập nhật", "Lịch phòng vừa được cập nhật, đồng bộ mới nhất.");
  });

  useSignalRListener("booking.new", async (payload: any) => {
    if (user?.id == payload.publisherId) return; // Nếu sự kiện không liên quan đến booking của mình, bỏ qua
    // 1. XÓA NGAY LẬP TỨC cache của Bookings
    // Vì chắc chắn cái Booking này không còn là "Pending", xóa đi để UI không hiện nó nữa
    queryClient.removeQueries({
      predicate: (query) =>
        query.queryKey[0] === "bookings" &&
        (query.queryKey[1] as any)?.labRoomId === payload.labRoomId
    });

    // 2. ĐỢI 1 KHOẢNG NGẮN (Ví dụ 1s) để Backend xử lý xong MediatR Event (tạo Schedule)
    // Trong lúc này UI sẽ mượt hơn vì Booking cũ đã biến mất
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    await delay(1800);

    // 3. REFETCH cưỡng chế cho Schedules
    // Sử dụng refetch thay vì invalidate để đảm bảo nó gọi API ngay lập tức
    await queryClient.refetchQueries({
      predicate: (query) =>
        query.queryKey[0] === "schedules" &&
        (query.queryKey[1] as any)?.labRoomId === payload.labRoomId,
      type: 'active' // Chỉ fetch lại những gì đang hiện trên màn hình
    });

    appAlert.success("Cập nhật", "Phòng vừa có thêm 1 booking mới, lịch phòng đã được đồng bộ mới nhất.");
  });

  const gridRef = useRef<HTMLDivElement>(null);

  // Generate time slots (7:00 AM - 10:00 PM, hourly display only)
  const timeSlots: string[] = [];
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
  }

  // Handle clicking on a fixed slot
  const handleSlotClick = (date: string, frame: any) => {
    const bookingData = {
      date: date,
      startTime: frame.startTime.slice(0, 5), // Lấy giờ và phút (HH:mm)
      endTime: frame.endTime.slice(0, 5), // Lấy giờ và phút (HH:mm)
    };

    // --- VALIDATE POLICY CHO FIXED SLOT ---
    if (policies) {
      const validation = checkLabPolicies(policies, bookingData);
      if (!validation.isValid) {
        appAlert.error("Không thể đặt lịch", validation.message);
        return;
      }
    }

    // Thực thi callback onCreateBooking được truyền từ props
    onCreateBooking({
      date: date, // Định dạng YYYY-MM-DD
      startTime: frame.startTime,
      endTime: frame.endTime,
      slotTypeId: selectedSlotTypeId,
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
    if (
      !dragState.isActive ||
      !gridRef.current ||
      dragState.dayIndex === null ||
      dragState.startY === null
    )
      return;

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
    const dayHeader = gridRef.current.querySelector("[data-day-header]");
    const headerHeight = dayHeader?.getBoundingClientRect().height || 0;

    // Calculate Y position relative to grid content (after headers)
    // gridRect.top already accounts for scroll (can be negative), so just subtract it and header
    const relativeY = e.clientY - gridRect.top - headerHeight;
    const currentY = Math.max(
      0,
      Math.min(relativeY, timeSlots.length * CELL_HEIGHT),
    );

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
  const handleMouseUp = useCallback(() => {
    if (!dragState.isActive || dragState.dayIndex === null) {
      resetDragState();
      return;
    }
    // 2. Kiểm tra nếu chỉ là một cú click (không di chuyển chuột đáng kể)
    const dragDistance = Math.abs(
      (dragState.currentY || 0) - (dragState.startY || 0),
    );
    if (dragDistance < 5) {
      // 5px threshold
      resetDragState();
      return;
    }

    const date = formatDate(weekDays[dragState.dayIndex], "yyyy-MM-dd");
    const bookingData = {
      date,
      startTime: dragState.startTime,
      endTime: dragState.endTime,
    };
    // 3. CHỈ CHECK POLICY CHO CHẾ ĐỘ FLEXIBLE (KÉO THẢ)
    if (selectedSlotTypeId === FLEXIBLE_ID && policies) {
      const validation = checkLabPolicies(policies, bookingData);

      if (!validation.isValid) {
        appAlert.error("Không thể đặt lịch", validation.message);
        resetDragState();
        return;
      }
    }
    onCreateBooking({
      ...bookingData,
      slotTypeId: selectedSlotTypeId,
    });

    resetDragState();
  }, [dragState, weekDays, selectedSlotTypeId, policies, onCreateBooking]);

  const resetDragState = () => {
    setDragState({
      isActive: false,
      dayIndex: null,
      startY: null,
      currentY: null,
      startTime: "",
      endTime: "",
    });
  };

  // Handle global mouse events
  React.useEffect(() => {
    if (dragState.isActive) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragState]);


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
          onSelect={onSlotTypeChange}
          isFlexibleAllowed={isFreeTimeAllowed}
        />
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto bg-gradient-to-b from-white to-gray-50">
        <div
          ref={gridRef}
          className="border-l border-t border-gray-200 relative select-none"
          style={{ minWidth: "1000px" }}
        >
          {/* Day headers */}
          <CalendarDayHeader weekDays={weekDays} />

          {/* Time slots or Fixed slots - Conditional rendering based on booking mode */}
          {selectedSlotTypeId === FLEXIBLE_ID && isFreeTimeAllowed ? (
            // OutSlot Mode: Show hourly time slots with drag-to-book
            <FlexibleGridView
              minBookingLeadTime={minBookingLeadTime}
              maxBookingAdvance={maxBookingAdvance}
              timeSlots={timeSlots}
              weekDays={weekDays}
              dragState={dragState}
              events={events}
              handleMouseDown={handleMouseDown}
            />
          ) : // OldSlot Mode: Show fixed slots (slot 1, slot 2, etc.)
            currentSlotType !== undefined ? (
              <FixedGridView
                timeSlots={timeSlots}
                weekDays={weekDays}
                activeSlotType={currentSlotType}
                events={events}
                onSlotClick={handleSlotClick}
                minBookingLeadTime={minBookingLeadTime}
                maxBookingAdvance={maxBookingAdvance}
                maxConcurrent={maxConcurrentBookings}
              />
            ) : null}
        </div>
      </div>
    </div>
  );
};
