import React, { useEffect, useMemo, useRef, useState } from 'react';
import { addDays } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { CalenderIcon } from '../../components/icon';
import { CalendarDayHeader } from '../../features/calendar/components/CalendarDayHeader';
import { CalendarNavigation } from '../../features/calendar/components/CalendarNavigation';
import { FlexibleGridView } from '../../features/calendar/components/FlexibleGridView';
import { CALENDAR_CONFIG } from '../../features/calendar/constants/calendar.constants';
import { useCalendarEvents } from '../../features/calendar/hooks/useCalendarEvents';
import type { CalendarEvent } from '../../features/calendar/types/calendar.type';
import { useResolveLabRoomIdForSchedule } from '../../features/labroom/hooks/useLabRoomLookup';
import { getWeekDaysByOffset, getStartOfDayVNInUTC } from '../../utils/date.util';

const SLOT_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'NEW', label: 'New Slot' },
  { value: 'OLD', label: 'Old Slot' },
  { value: 'OUT', label: 'Out Slot' },
] as const;

type SlotFilterValue = (typeof SLOT_FILTER_OPTIONS)[number]['value'];

const normalizeText = (value: string | undefined | null) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const getSlotFilterValue = (event: CalendarEvent): string => {
  const rawEvent = event.rawOrigin && typeof event.rawOrigin === 'object'
    ? (event.rawOrigin as { slotName?: string; type?: string })
    : undefined;

  const rawSlotName = rawEvent?.slotName ?? event.slotName;
  if (rawSlotName == null || String(rawSlotName).trim() === '') {
    return 'out';
  }

  const normalized = normalizeText(rawSlotName);
  if (normalized.includes('new')) return 'new';
  if (normalized.includes('old')) return 'old';
  if (normalized.includes('out')) return 'out';
  return 'out';
};

/**
 * 🗓️ Weekly Calendar Grid Component (Google Calendar Style)
 * Click-and-drag to create bookings, resize blocks, visual conflict detection
 */
const CalendarTabletPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomNo } = useParams();
  const [weekOffset, setWeekOffset] = useState(0);
  const [slotFilter, setSlotFilter] = useState<SlotFilterValue>('ALL');
  const { START_HOUR, END_HOUR } = CALENDAR_CONFIG;

  const normalizedRoomNo = roomNo?.trim() ?? '';
  const { resolvedLabRoomId } = useResolveLabRoomIdForSchedule({
    labRoomId: Number.isFinite(Number(roomNo)) ? Number(roomNo) : undefined,
    enabled: normalizedRoomNo.length > 0,
  });

  const roomLabel = normalizedRoomNo || 'Lab Room';
  const normalizedRoomKey = normalizeText(normalizedRoomNo);

  const { weekDays, weekStart, weekEnd } = useMemo(() => {
    const days = getWeekDaysByOffset(weekOffset);
    return {
      weekDays: days,
      weekStart: days[0],
      weekEnd: days[6],
    };
  }, [weekOffset]);

  const { events } = useCalendarEvents({
    calendarMode: 'PUBLIC',
    labRoomId: resolvedLabRoomId,
    startDate: getStartOfDayVNInUTC(weekStart),
    endDate: getStartOfDayVNInUTC(addDays(weekEnd, 1)),
  });

  const filteredEvents = useMemo(() => {
    const roomScopedEvents = events.filter((event) => {
      const eventRoomId = (event.rawOrigin as { labRoomId?: number } | undefined)?.labRoomId;
      if (resolvedLabRoomId != null && eventRoomId != null) {
        return eventRoomId === resolvedLabRoomId;
      }

      const eventRoomNo = normalizeText(
        (event.rawOrigin as { roomNo?: string } | undefined)?.roomNo ??
          (event.rawOrigin as { labRoomName?: string; roomNo?: string } | undefined)?.labRoomName ??
          event.groupName,
      );

      if (!normalizedRoomKey) return true;

      return eventRoomNo === normalizedRoomKey || eventRoomNo.includes(normalizedRoomKey);
    });

    if (slotFilter === 'ALL') return roomScopedEvents;

    return roomScopedEvents.filter((event) => getSlotFilterValue(event) === slotFilter.toLowerCase());
  }, [events, normalizedRoomKey, resolvedLabRoomId, slotFilter]);

  const gridRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const timeSlots: string[] = [];
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  return (
    <div className="flex flex-col items-center justify-start w-full h-screen px-8 py-6 md:px-10 md:py-12 pt-0">
      <div className="absolute top-2 left-0 right-0 px-4 md:px-6 pointer-events-none">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
            <CalenderIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700 drop-shadow-lg">
            {roomLabel}
          </h1>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
      </div>

      <div className="flex flex-col w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ width: '950px', height: '600px', marginTop: '20px', marginBottom: 'auto' }}>
        <div className="flex-none items-center justify-between px-3 py-2 border-b border-gray-200 bg-white z-30">
          <div className="flex items-center justify-between gap-3">
            <CalendarNavigation
              weekStart={weekStart}
              weekEnd={weekEnd}
              weekOffset={weekOffset}
              onWeekChange={setWeekOffset}
              labRoomName={roomLabel}
            />
            <div ref={dropdownRef} className="ml-auto relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(`/attendance/camera/${roomNo ?? ''}`)}
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-blue-100 hover:shadow-md"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 7a2 2 0 012-2h7a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Camera Attendance
              </button>

              <button
                type="button"
                onClick={() => setIsDropdownOpen((value) => !value)}
                className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2.5 shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_8px_20px_rgba(15,23,42,0.10)]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 6h16M7 12h10M10 18h4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>

                <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-gray-500">
                  View by
                </span>

                <span className="inline-flex min-w-[110px] items-center justify-between gap-3 rounded-full bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800 ring-1 ring-gray-200">
                  {SLOT_FILTER_OPTIONS.find((option) => option.value === slotFilter)?.label}
                  <svg
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-50 min-w-[260px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
                  {SLOT_FILTER_OPTIONS.map((option) => {
                    const active = slotFilter === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSlotFilter(option.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                          active
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            active ? 'bg-white' : 'bg-gray-300'
                          }`}
                        />
                        <span className="font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='flex-1 flex min-h-0 overflow-hidden'>
          <div className='flex-1 overflow-y-auto overflow-x-auto bg-gray-50/30 custom-scrollbar' style={{ zoom: '0.85' }}>
            <div className="sticky top-0 flex-none border-b border-gray-200 bg-white z-20">
              <div>
                <CalendarDayHeader weekDays={weekDays} />
              </div>
            </div>

            <div ref={gridRef} className="relative select-none">
              <FlexibleGridView
                timeSlots={timeSlots}
                weekDays={weekDays}
                events={filteredEvents}
                minBookingLeadTime={0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarTabletPage;