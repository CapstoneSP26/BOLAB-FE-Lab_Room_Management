import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import type { BookingRequest } from "../types/booking.type";
import { convertHoursUtcToVN } from "../../../utils/date.util";

type PriorityFilter = "ALL" | "WORKSHOP" | "PRACTICAL" | "LECTURE";

type RoomLane = {
  id: string | number;
  name: string;
  capacity?: number;
  bookings: BookingRequest[];
};

type Props = {
  selectedDate: Date;
  selectedRoomId: number | "ALL";
  conflictOnly: boolean;
  priorityFilter: PriorityFilter;
  selectedBookingId?: string;
  onSelectBooking: (booking: BookingRequest) => void;
  lanes?: RoomLane[];
};

const START_HOUR = 7;
const END_HOUR = 22;
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60; // (22 - 7) * 60 = 900

const BOOKING_ROW_HEIGHT = 44;
const BOOKING_ROW_GAP = 6;
const BOOKING_ROW_PADDING = 10;
const MIN_LANE_HEIGHT = 64;

// Visual major time anchors
const TIME_MARKERS = [7, 10, 13, 16, 19];

function getTimelineDays(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 3 }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return next;
  });
}

function formatDateKeyFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeDateKey(value?: string | Date) {
  if (!value) return "";
  if (value instanceof Date) return formatDateKeyFromDate(value);
  const dmyMatch = value.match(/^(\d{2})-(\d{2})-(\d{4})/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return `${year}-${month}-${day}`;
  }
  const dmySlashMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (dmySlashMatch) {
    const [, day, month, year] = dmySlashMatch;
    return `${year}-${month}-${day}`;
  }
  const match = value.match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return formatDateKeyFromDate(parsed);
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatHourLabel(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function getLocalTimeLabel(timeString?: string) {
  if (!timeString) return "";
  // If format is HH:mm or HH:mm:ss
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeString)) {
    return convertHoursUtcToVN(timeString);
  }
  if (timeString.includes("T")) {
    const d = new Date(timeString);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
    }
  }
  return timeString;
}

function getMinutesFrom0700(timeString?: string) {
  if (!timeString) return 0;
  
  const localTimeStr = getLocalTimeLabel(timeString);
  const match = localTimeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 0;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  
  return (hour - START_HOUR) * 60 + minute;
}

function getVisualBounds(booking: BookingRequest) {
  let startMinutes = getMinutesFrom0700(booking.startTime);
  let endMinutes = getMinutesFrom0700(booking.endTime);
  
  // Clamp to 7h - 22h boundaries
  startMinutes = Math.max(0, Math.min(startMinutes, TOTAL_MINUTES));
  endMinutes = Math.max(0, Math.min(endMinutes, TOTAL_MINUTES));
  
  const duration = Math.max(15, endMinutes - startMinutes); // minimum 15 mins for clickability
  
  const leftPercent = (startMinutes / TOTAL_MINUTES) * 100;
  const widthPercent = (duration / TOTAL_MINUTES) * 100;
  
  return { left: leftPercent, right: leftPercent + widthPercent };
}

function isOverlappingVisually(a: BookingRequest, b: BookingRequest) {
  const boundsA = getVisualBounds(a);
  const boundsB = getVisualBounds(b);
  // Stack if they visually overlap on screen (with a tiny 1% safety gap)
  return boundsA.left < boundsB.right + 1 && boundsA.right > boundsB.left - 1;
}

function stackBookingsVisually(bookings: BookingRequest[]) {
  const rows: BookingRequest[][] = [];
  bookings.forEach((booking) => {
    const rowIndex = rows.findIndex((row) => row.every((item) => !isOverlappingVisually(item, booking)));
    if (rowIndex === -1) {
      rows.push([booking]);
    } else {
      rows[rowIndex].push(booking);
    }
  });
  return rows;
}

function getPriorityLevel(purpose?: string) {
  const text = String(purpose ?? "").toUpperCase();
  if (text.includes("WORKSHOP")) return 4;
  if (text.includes("PRACTICAL")) return 3;
  if (text.includes("LECTURE")) return 2;
  return 1;
}

function getBookingTone(booking: BookingRequest) {
  const purpose = String(booking.purpose ?? "").toUpperCase();
  if (purpose.includes("WORKSHOP")) {
    return {
      ring: "border-red-300 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-100",
      accent: "bg-red-500",
      priority: "Workshop",
      zIndex: 30,
    };
  }

  if (purpose.includes("PRACTICAL")) {
    return {
      ring: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100",
      accent: "bg-amber-500",
      priority: "Practical",
      zIndex: 20,
    };
  }

  if (purpose.includes("LECTURE")) {
    return {
      ring: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-100",
      accent: "bg-blue-500",
      priority: "Lecture",
      zIndex: 10,
    };
  }

  return {
    ring: "border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white",
    accent: "bg-gray-400",
    priority: "Normal",
    zIndex: 5,
  };
}

function BookingBlock({
  booking,
  selected,
  onClick,
  top,
  isConflict,
  isLocked,
}: {
  booking: BookingRequest;
  selected?: boolean;
  onClick: () => void;
  top: number;
  isConflict: boolean;
  isLocked?: boolean;
}) {
  const tone = getBookingTone(booking);
  
  let startMinutes = getMinutesFrom0700(booking.startTime);
  let endMinutes = getMinutesFrom0700(booking.endTime);
  
  startMinutes = Math.max(0, Math.min(startMinutes, TOTAL_MINUTES));
  endMinutes = Math.max(0, Math.min(endMinutes, TOTAL_MINUTES));
  
  const durationMinutes = Math.max(15, endMinutes - startMinutes);
  
  const leftPercent = (startMinutes / TOTAL_MINUTES) * 100;
  const widthPercent = (durationMinutes / TOTAL_MINUTES) * 100;
  
  const conflictTone = isConflict
    ? "border-red-400 bg-[repeating-linear-gradient(135deg,rgba(248,113,113,0.1),rgba(248,113,113,0.1)_8px,transparent_8px,transparent_16px)]"
    : "";

  const timeLabel = `${getLocalTimeLabel(booking.startTime)} - ${getLocalTimeLabel(booking.endTime)}`;
  
  let tooltip = `${booking.purpose || "Booking"}\n${timeLabel}\n${booking.requester?.fullName || booking.requestedBy || ""}`;
  if (isLocked) {
    tooltip = `LOCKED: Higher priority bookings exist in this room.\n\n${tooltip}`;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      style={{ 
        left: `${leftPercent}%`, 
        width: `${widthPercent}%`, 
        minWidth: "24px", 
        top: `${top}px`, 
        height: BOOKING_ROW_HEIGHT,
        zIndex: selected ? 50 : tone.zIndex
      }}
      className={`absolute flex flex-col justify-center overflow-hidden rounded-xl border p-1.5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${selected ? "ring-2 ring-blue-500 shadow-md scale-[1.02]" : ""} ${tone.ring} ${conflictTone}`}
    >
      <div className={`absolute left-0 top-0 h-full w-1 ${tone.accent}`} />
      
      <div className="flex w-full flex-col gap-0.5 pl-2">
        <div className="truncate text-[11px] font-bold leading-tight">
          {booking.purpose || "Booking"}
        </div>
        <div className="truncate text-[9px] font-medium opacity-90">
          {timeLabel}
        </div>
      </div>

      {isConflict && (
        <span className="absolute bottom-1 right-1 text-red-600">
          <AlertTriangle className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}

export default function BookingTimelineCanvas({
  selectedDate,
  selectedRoomId,
  conflictOnly,
  priorityFilter,
  selectedBookingId,
  onSelectBooking,
  lanes = [],
}: Props) {
  const filteredLanes = useMemo(() => {
    return lanes
      .filter((lane) => selectedRoomId === "ALL" || String(lane.id) === String(selectedRoomId))
      .map((lane) => ({
        ...lane,
        bookings: lane.bookings.filter((booking) => {
          const status = String(booking.status ?? "").toUpperCase();
          if (conflictOnly && !String(booking.reason ?? "").trim() && !status.includes("CONFLICT")) return false;
          if (priorityFilter !== "ALL") {
            const text = String(booking.purpose || "").toUpperCase();
            if (!text.includes(priorityFilter)) return false;
          }
          return true;
        }),
      }));
  }, [lanes, selectedRoomId, conflictOnly, priorityFilter]);

  const timelineDays = useMemo(() => getTimelineDays(selectedDate), [selectedDate]);
  const todayKey = normalizeDateKey(new Date());

  const lanesWithData = useMemo(() => {
    return filteredLanes.map((lane) => {
      let maxRowsAcrossDays = 0;
      
      const daysData = timelineDays.map((day) => {
        const dayKey = normalizeDateKey(day);
        const dayBookings = lane.bookings
          .filter((booking) => normalizeDateKey(booking.date || booking.startTime || booking.requestedAt) === dayKey)
          .sort((a, b) => {
            const priorityDiff = getPriorityLevel(b.purpose) - getPriorityLevel(a.purpose);
            if (priorityDiff !== 0) return priorityDiff;
            
            const startA = getMinutesFrom0700(a.startTime);
            const startB = getMinutesFrom0700(b.startTime);
            return startA - startB;
          });

        const conflictIds = new Set<string>();
        dayBookings.forEach((booking, index) => {
          const status = String(booking.status ?? "").toUpperCase();
          if (status.includes("CONFLICT")) {
            conflictIds.add(String(booking.id));
          }
          const start = getMinutesFrom0700(booking.startTime);
          const end = getMinutesFrom0700(booking.endTime);
          for (let j = index + 1; j < dayBookings.length; j += 1) {
            const other = dayBookings[j];
            const otherStart = getMinutesFrom0700(other.startTime);
            const otherEnd = getMinutesFrom0700(other.endTime);
            if (start < otherEnd && end > otherStart) {
              conflictIds.add(String(booking.id));
              conflictIds.add(String(other.id));
            }
          }
        });

        const rows = stackBookingsVisually(dayBookings);
        maxRowsAcrossDays = Math.max(maxRowsAcrossDays, rows.length);
        
        const dayMaxPriority = dayBookings.length > 0
          ? Math.max(...dayBookings.map(b => getPriorityLevel(b.purpose)))
          : 1;
        
        return { day, dayKey, rows, conflictIds, maxPriority: dayMaxPriority };
      });

      const laneHeight = Math.max(MIN_LANE_HEIGHT, BOOKING_ROW_PADDING * 2 + maxRowsAcrossDays * BOOKING_ROW_HEIGHT + Math.max(0, maxRowsAcrossDays - 1) * BOOKING_ROW_GAP);

      return { ...lane, daysData, laneHeight };
    });
  }, [filteredLanes, timelineDays]);

  return (
    <div className="w-full overflow-x-hidden overflow-y-visible rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
      <div className="flex w-full">
        
        {/* LEFT COLUMN: Rooms */}
        <div className="w-[220px] shrink-0 border-r border-gray-200 bg-white z-10 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Rooms</span>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
              {filteredLanes.length}
            </span>
          </div>
          
          {lanesWithData.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500 dark:text-gray-400">
              No rooms.
            </div>
          ) : (
            lanesWithData.map((lane) => (
              <div 
                key={lane.id} 
                style={{ height: lane.laneHeight }} 
                className="flex flex-col justify-center border-b border-gray-200/60 bg-white px-4 transition-colors hover:bg-gray-50 dark:border-gray-700/60 dark:bg-gray-900 dark:hover:bg-gray-800/80"
              >
                <div className="truncate text-sm font-semibold text-gray-900 dark:text-white" title={lane.name}>{lane.name}</div>
                <div className="mt-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  Cap: {lane.capacity ?? "-"}
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT COLUMN: Timeline Viewport */}
        <div className="flex-1 grid grid-cols-3 min-w-[700px] overflow-hidden bg-gray-50/30 dark:bg-gray-900/20">
          {timelineDays.map((day, dayIndex) => {
            const dayKey = normalizeDateKey(day);
            const isToday = dayKey === todayKey;

            return (
              <div 
                key={dayKey} 
                className={`relative flex flex-col border-gray-200/80 dark:border-gray-700/80 ${dayIndex < 2 ? 'border-r' : ''}`}
              >
                {/* Day Header */}
                <div className={`h-14 border-b border-gray-200 px-3 py-2 dark:border-gray-700 ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-white dark:bg-gray-800'}`}>
                  <div className="flex items-center gap-2 pl-1 text-xs font-bold text-gray-800 dark:text-gray-200">
                    {formatDayLabel(day)}
                    {isToday && (
                      <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                        Today
                      </span>
                    )}
                  </div>
                  
                  {/* Padded marker area */}
                  <div className="relative mt-1 h-4 w-full text-[10px] font-medium text-gray-500 dark:text-gray-400">
                    <div className="absolute inset-x-2">
                      {TIME_MARKERS.map((hour) => {
                        const markerLeftPercent = ((hour - START_HOUR) * 60 / TOTAL_MINUTES) * 100;
                        return (
                          <div 
                            key={hour} 
                            style={{ left: `${markerLeftPercent}%` }} 
                            className="absolute top-0 -translate-x-1/2 whitespace-nowrap hover:text-gray-900 hover:font-bold dark:hover:text-gray-200 transition-colors"
                          >
                            {formatHourLabel(hour)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Day Lanes */}
                {lanesWithData.map((lane) => {
                  const dayData = lane.daysData.find(d => d.dayKey === dayKey);
                  if (!dayData) return null;

                  return (
                    <div 
                      key={`${lane.id}-${dayKey}`} 
                      style={{ height: lane.laneHeight }} 
                      className={`relative border-b border-gray-200/60 transition-colors dark:border-gray-700/60 hover:bg-gray-100/40 dark:hover:bg-gray-800/40 ${isToday ? 'bg-blue-50/10 dark:bg-blue-900/5' : ''}`}
                    >
                      {/* Internal Padding Wrapper for breathing room */}
                      <div className="absolute inset-y-0 left-2 right-2">
                        
                        {/* Vertical Grid Lines */}
                        <div className="absolute inset-0 pointer-events-none">
                          {TIME_MARKERS.map((hour) => {
                            const markerLeftPercent = ((hour - START_HOUR) * 60 / TOTAL_MINUTES) * 100;
                            return (
                              <div 
                                key={hour} 
                                style={{ left: `${markerLeftPercent}%` }} 
                                className="absolute top-0 bottom-0 border-l border-dashed border-gray-300/60 dark:border-gray-600/50"
                              />
                            );
                          })}
                        </div>

                        {/* Bookings */}
                        {dayData.rows.flatMap((row, rowIndex) => 
                          row.map(booking => (
                            <BookingBlock
                              key={String(booking.id)}
                              booking={booking}
                              selected={String(booking.id) === String(selectedBookingId)}
                              onClick={() => onSelectBooking(booking)}
                              top={BOOKING_ROW_PADDING + rowIndex * (BOOKING_ROW_HEIGHT + BOOKING_ROW_GAP)}
                              isConflict={dayData.conflictIds.has(String(booking.id))}
                              isLocked={getPriorityLevel(booking.purpose) < dayData.maxPriority}
                            />
                          ))
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
    </div>
  );
}
