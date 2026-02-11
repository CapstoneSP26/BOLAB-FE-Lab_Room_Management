import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, Timer, Settings } from 'lucide-react';
import type { TimeSlot, BookingMode } from '../types';
import { formatDate } from '../../../utils/formatDate';

interface SlotConfig {
  slotDuration: number; // in hours
  breakDuration: number; // in hours
  numberOfSlots: number;
}

interface DragState {
  isActive: boolean;
  dayIndex: number | null;
  startY: number | null;
  currentY: number | null;
  startTime: string;
  endTime: string;
}

interface WeeklyCalendarGridProps {
  selectedRoomId: string;
  existingBookings: TimeSlot[];
  onCreateBooking: (data: {
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
  weekOffset?: number;
  onWeekChange?: (offset: number) => void;
}

/**
 * 🗓️ Weekly Calendar Grid Component (Google Calendar Style)
 * Click-and-drag to create bookings, resize blocks, visual conflict detection
 */
export const WeeklyCalendarGrid: React.FC<WeeklyCalendarGridProps> = ({
  existingBookings,
  onCreateBooking,
  weekOffset = 0,
  onWeekChange,
}) => {
  const [bookingMode, setBookingMode] = useState<BookingMode>('OutSlot');
  const [showSlotConfig, setShowSlotConfig] = useState(false);
  const [slotConfig, setSlotConfig] = useState<SlotConfig>({
    slotDuration: 2.5,
    breakDuration: 0,
    numberOfSlots: 6,
  });
  const [dragState, setDragState] = useState<DragState>({
    isActive: false,
    dayIndex: null,
    startY: null,
    currentY: null,
    startTime: '',
    endTime: '',
  });

  const gridRef = useRef<HTMLDivElement>(null);
  const CELL_HEIGHT = 80; // 80px per hour slot
  const START_HOUR = 7;

  // Generate time slots (7:00 AM - 10:00 PM, hourly display only)
  const timeSlots: string[] = [];
  for (let hour = 7; hour <= 22; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  // Generate fixed slots for OldSlot mode
  const fixedSlots: Array<{ slotNumber: number; label: string; startTime: string; endTime: string }> = [];
  
  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };
  
  for (let i = 1; i <= slotConfig.numberOfSlots; i++) {
    const startHour = START_HOUR + (i - 1) * (slotConfig.slotDuration + slotConfig.breakDuration);
    const endHour = startHour + slotConfig.slotDuration;
    
    fixedSlots.push({
      slotNumber: i,
      label: `Slot ${i}`,
      startTime: formatTime(startHour),
      endTime: formatTime(endHour),
    });
  }

  // Generate week days (Monday - Sunday)
  const getWeekDays = (offset: number) => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7); // Monday of current week + offset

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays(weekOffset);
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];

  // Check if time slot has booking
  const hasBooking = (dayIndex: number, timeSlot: string): TimeSlot | null => {
    const date = weekDays[dayIndex].toISOString().split('T')[0];
    return (
      existingBookings.find(
        (booking) =>
          booking.date === date &&
          booking.startTime <= timeSlot &&
          booking.endTime > timeSlot
      ) || null
    );
  };

  // Check if cell is in drag selection
  const isInDragSelection = (dayIndex: number, timeSlotIndex: number): boolean => {
    if (!dragState.isActive || dragState.dayIndex === null || dragState.startY === null || dragState.currentY === null) return false;
    if (dayIndex !== dragState.dayIndex) return false;

    const minY = Math.min(dragState.startY, dragState.currentY);
    const maxY = Math.max(dragState.startY, dragState.currentY);
    const cellY = timeSlotIndex * CELL_HEIGHT;
    const cellEndY = cellY + CELL_HEIGHT;

    return cellEndY > minY && cellY < maxY;
  };

  // Convert Y position to time string (snap to 15-minute intervals)
  const positionToTime = (yPos: number): string => {
    const totalMinutes = Math.floor((yPos / CELL_HEIGHT) * 60); // 80px = 1 hour = 60 minutes
    // Snap to nearest 15-minute interval
    const snappedMinutes = Math.floor(totalMinutes / 15) * 15;
    const hours = START_HOUR + Math.floor(snappedMinutes / 60);
    const minutes = snappedMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Check if drag selection has conflict
  const hasConflict = (): boolean => {
    if (!dragState.isActive || dragState.dayIndex === null) return false;

    const dayIndex = dragState.dayIndex;
    const startTime = dragState.startTime;
    const endTime = dragState.endTime;

    return existingBookings.some((booking) => {
      const date = weekDays[dayIndex].toISOString().split('T')[0];
      if (booking.date !== date) return false;
      
      // Check for overlap
      return !(endTime <= booking.startTime || startTime >= booking.endTime);
    });
  };

  // Handle mouse down (start drag)
  const handleMouseDown = (e: React.MouseEvent, dayIndex: number, timeSlotIndex: number) => {
    // Only allow drag in OutSlot mode
    if (bookingMode === 'OldSlot') return;
    
    // Don't start drag if cell already has booking
    if (hasBooking(dayIndex, timeSlots[timeSlotIndex])) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const yOffset = e.clientY - rect.top;
    const startY = timeSlotIndex * CELL_HEIGHT + yOffset;

    const startTime = positionToTime(startY);
    const endTime = positionToTime(startY + CELL_HEIGHT); // Default 1 slot (15 min)

    setDragState({
      isActive: true,
      dayIndex,
      startY,
      currentY: startY + CELL_HEIGHT,
      startTime,
      endTime,
    });
  };

  // Handle OldSlot click (one-click booking for fixed slots)
  const handleOldSlotClick = (dayIndex: number, slotNumber: number) => {
    if (bookingMode !== 'OldSlot') return;

    const date = weekDays[dayIndex].toISOString().split('T')[0];
    
    // Check if this slot is already booked
    const existingBooking = existingBookings.find(
      (b) => b.date === date && b.slotNumber === slotNumber && b.slotType === 'OldSlot'
    );
    
    if (existingBooking) return; // Slot already booked

    // Calculate time based on slot number (each slot = 2.5 hours starting from 7:00)
    const startMinutes = (slotNumber - 1) * 150; // 150 minutes = 2.5 hours
    const endMinutes = slotNumber * 150;
    
    const startHour = START_HOUR + Math.floor(startMinutes / 60);
    const startMin = startMinutes % 60;
    const endHour = START_HOUR + Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;

    const startTime = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

    onCreateBooking({
      date,
      startTime,
      endTime,
    });
  };

  // Handle mouse move (update drag) - Global mouse move
  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!dragState.isActive || !gridRef.current || dragState.dayIndex === null || dragState.startY === null) return;

    const gridRect = gridRef.current.getBoundingClientRect();
    const scrollContainer = gridRef.current.parentElement;
    const scrollTop = scrollContainer?.scrollTop || 0;
    
    // Calculate Y position relative to grid
    const relativeY = e.clientY - gridRect.top + scrollTop - 56; // 56px = header height
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

  const handlePrevWeek = () => {
    onWeekChange?.(weekOffset - 1);
  };

  const handleNextWeek = () => {
    onWeekChange?.(weekOffset + 1);
  };

  const handleToday = () => {
    onWeekChange?.(0);
  };

  const conflict = hasConflict();

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      {/* Week Navigation Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50">
        <div className="flex items-center gap-4">
          <button
            onClick={handleToday}
            className="px-5 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all border border-blue-200 hover:border-blue-300"
          >
            Today
          </button>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={handlePrevWeek}
              className="p-2 hover:bg-white rounded-md transition-all group"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            </button>
            <button
              onClick={handleNextWeek}
              className="p-2 hover:bg-white rounded-md transition-all group"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">
              {formatDate(weekStart, 'MMM DD')} – {formatDate(weekEnd, 'MMM DD, YYYY')}
            </h2>
          </div>
        </div>

        {/* Booking Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBookingMode('OutSlot')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
                bookingMode === 'OutSlot'
                  ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>Flexible</span>
            </button>
            <button
              onClick={() => setBookingMode('OldSlot')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
                bookingMode === 'OldSlot'
                  ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Fixed Slots</span>
            </button>
          </div>
          
          {/* Slot Settings Button */}
          {bookingMode === 'OldSlot' && (
            <button
              onClick={() => setShowSlotConfig(true)}
              className="p-2.5 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all border border-gray-200 hover:border-blue-300"
              title="Configure Slot Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto bg-gradient-to-b from-white to-gray-50">
        <div
          ref={gridRef}
          className="grid grid-cols-[80px_repeat(7,1fr)] border-l border-t border-gray-200 relative"
          style={{ minWidth: '1000px' }}
        >
          {/* Time column header */}
          <div className="sticky top-0 bg-white border-b-2 border-r border-gray-200 z-20 shadow-sm"></div>

          {/* Day headers */}
          {weekDays.map((date, dayIndex) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const dayName = formatDate(date, 'ddd');
            const dayNumber = date.getDate();
            const monthName = formatDate(date, 'MMM');
            
            return (
              <div
                key={dayIndex}
                className={`sticky top-0 z-10 border-b-2 border-r border-gray-200 transition-all ${
                  isToday 
                    ? 'bg-gradient-to-b from-blue-50 to-blue-100 shadow-sm' 
                    : 'bg-white hover:bg-gray-50 shadow-sm'
                }`}
              >
                <div className="px-4 py-3">
                  {/* Day name */}
                  <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                    isToday ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {dayName}
                  </div>
                  
                  {/* Date display */}
                  <div className="flex items-baseline justify-center gap-1.5">
                    <div className={`text-3xl font-extrabold leading-none ${
                      isToday ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {dayNumber}
                    </div>
                    <div className={`text-sm font-semibold ${
                      isToday ? 'text-blue-500' : 'text-gray-500'
                    }`}>
                      {monthName}
                    </div>
                  </div>
                  
                  {/* Today indicator badge */}
                  {isToday && (
                    <div className="mt-2">
                      <span className="inline-block px-3 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                        Today
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Time slots or Fixed slots - Conditional rendering based on booking mode */}
          {bookingMode === 'OutSlot' ? (
            // OutSlot Mode: Show hourly time slots with drag-to-book
            timeSlots.map((time, timeSlotIndex) => {
              return (
                <React.Fragment key={timeSlotIndex}>
                  {/* Time label */}
                  <div className="h-20 border-b border-r border-gray-300 bg-gradient-to-r from-gray-50 to-white flex items-start justify-end pr-3 pt-1">
                    <span className="text-xs text-gray-600 font-semibold">{time}</span>
                  </div>

                  {/* Day cells */}
                  {weekDays.map((_date, dayIndex) => {
                    const booking = hasBooking(dayIndex, time);
                    const inSelection = isInDragSelection(dayIndex, timeSlotIndex);
                    const isDraggingThisColumn = dragState.isActive && dragState.dayIndex === dayIndex;

                    return (
                      <div
                        key={`${dayIndex}-${timeSlotIndex}`}
                        className={`h-20 border-b border-r border-gray-300 relative cursor-pointer transition-all ${
                          inSelection && conflict
                            ? 'bg-red-50 border-red-200'
                            : inSelection
                            ? 'bg-blue-50 border-blue-200'
                            : booking
                            ? booking.status === 'Available'
                              ? 'bg-white hover:bg-gray-50 hover:shadow-sm'
                              : booking.status === 'Pending'
                              ? 'bg-amber-50'
                              : 'bg-indigo-50'
                            : 'bg-white hover:bg-gray-50 hover:shadow-sm'
                        }`}
                        onMouseDown={(e) => handleMouseDown(e, dayIndex, timeSlotIndex)}
                      >
                        {/* Existing booking block */}
                        {booking && booking.status !== 'Available' && (
                          <div
                            className={`absolute inset-0 mx-1 my-1 rounded-lg px-3 py-2 text-xs font-medium border-l-4 ${
                              booking.status === 'Booked'
                                ? 'bg-indigo-100 text-indigo-900 border-indigo-400'
                                : 'bg-amber-100 text-amber-900 border-amber-400 border-dashed'
                            }`}
                            title={`${booking.bookedBy || 'Booked'} - ${booking.groupName || ''}`}
                          >
                            <div className="truncate font-semibold">{booking.groupName || 'Booked'}</div>
                          </div>
                        )}

                        {/* Drag preview - render only in the first cell of dragging column */}
                        {isDraggingThisColumn && timeSlotIndex === 0 && dragState.startY !== null && dragState.currentY !== null && (
                          <div
                            className={`absolute left-1 right-1 rounded-lg px-3 py-2 text-xs font-medium pointer-events-none z-30 border-l-4 ${
                              conflict
                                ? 'bg-red-100 text-red-900 border-red-400'
                                : 'bg-blue-100 text-blue-900 border-blue-400'
                            }`}
                            style={{
                              top: `${Math.min(dragState.startY, dragState.currentY)}px`,
                              height: `${Math.abs(dragState.currentY - dragState.startY)}px`,
                            }}
                          >
                            <div className="font-semibold">(No title)</div>
                            <div className="text-xs opacity-90 mt-0.5">
                              {dragState.startTime} - {dragState.endTime}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })
          ) : (
            // OldSlot Mode: Show fixed slots (slot 1, slot 2, etc.)
            fixedSlots.map((slot, slotIndex) => {
              return (
                <React.Fragment key={slotIndex}>
                  {/* Slot label */}
                  <div className="h-32 border-b border-r border-gray-300 bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center px-2">
                    <span className="text-sm text-gray-700 font-semibold">{slot.label}</span>
                    <span className="text-xs text-gray-600 mt-1 font-medium">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>

                  {/* Day cells for fixed slots */}
                  {weekDays.map((_date, dayIndex) => {
                    const date = weekDays[dayIndex].toISOString().split('T')[0];
                    const existingSlot = existingBookings.find(
                      (b) => b.date === date && b.slotNumber === slot.slotNumber && b.slotType === 'OldSlot'
                    );

                    return (
                      <div
                        key={`${dayIndex}-${slotIndex}`}
                        onClick={() => handleOldSlotClick(dayIndex, slot.slotNumber)}
                        className={`h-32 border-b border-r border-gray-300 relative cursor-pointer transition-all ${
                          existingSlot
                            ? existingSlot.status === 'Booked'
                              ? 'bg-indigo-100 cursor-not-allowed border-l-4 border-l-indigo-400'
                              : 'bg-amber-100 cursor-not-allowed border-l-4 border-l-amber-400 border-dashed'
                            : 'bg-white hover:bg-gray-50 hover:shadow-sm'
                        }`}
                      >
                        {existingSlot ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                            <div className={`font-semibold text-sm truncate w-full text-center ${
                              existingSlot.status === 'Booked' ? 'text-indigo-900' : 'text-amber-900'
                            }`}>
                              {existingSlot.groupName || 'Booked'}
                            </div>
                            <div className={`text-xs mt-1 ${
                              existingSlot.status === 'Booked' ? 'text-indigo-700' : 'text-amber-700'
                            }`}>
                              {existingSlot.startTime} - {existingSlot.endTime}
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div className="text-gray-600 font-medium text-sm">Click to book</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>

      {/* Slot Configuration Modal */}
      {showSlotConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="w-5 h-5 text-blue-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Slot Configuration</h3>
              </div>
              <button
                onClick={() => setShowSlotConfig(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Slot Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slot Duration (hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="8"
                  value={slotConfig.slotDuration}
                  onChange={(e) => setSlotConfig({ ...slotConfig, slotDuration: parseFloat(e.target.value) || 0.5 })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Duration of each time slot</p>
              </div>

              {/* Break Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Break Duration (hours)
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="2"
                  value={slotConfig.breakDuration}
                  onChange={(e) => setSlotConfig({ ...slotConfig, breakDuration: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Rest time between slots</p>
              </div>

              {/* Number of Slots */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Slots
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={slotConfig.numberOfSlots}
                  onChange={(e) => setSlotConfig({ ...slotConfig, numberOfSlots: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Total number of bookable slots</p>
              </div>

              {/* Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">Preview:</p>
                <div className="space-y-1.5 text-xs text-blue-800">
                  {fixedSlots.slice(0, 3).map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="font-medium">{slot.label}:</span>
                      <span>{slot.startTime} - {slot.endTime}</span>
                    </div>
                  ))}
                  {fixedSlots.length > 3 && (
                    <div className="text-blue-600 font-medium">
                      ... and {fixedSlots.length - 3} more slots
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSlotConfig(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSlotConfig(false)}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
              >
                Apply Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
