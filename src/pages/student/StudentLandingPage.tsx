/**
 * StudentLandingPage - Student Dashboard
 * Friendlier timetable-first landing page for students.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  QrCode,
  ScanLine,
  Sparkles,
} from 'lucide-react';
import { useSchedulesStudent } from '../../features/schedules/hooks/useSchedules';

const STATUS_MAP: Record<number, 'inactive' | 'active'> = {
  1: 'inactive',
  2: 'active',
  3: 'inactive',
  4: 'inactive',
};

type ScheduleCard = {
  id: string;
  subjectCode: string;
  labRoomName: string;
  lecturerName: string;
  startTime: string;
  endTime: string;
  slotName: string;
  status: 'inactive' | 'active' | string;
  dayLabel: string;
  dateKey: string;
  dateLabel: string;
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ITEMS_PER_PAGE = 50;

const vietnamDate = (input: string | Date) => {
  const date = input instanceof Date ? input : new Date(input);
  return new Date(date.getTime() + 7 * 60 * 60 * 1000);
};

const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

const getWeekRange = (date: Date) => {
  const start = new Date(date);
  const day = start.getDay() === 0 ? 7 : start.getDay();
  start.setDate(start.getDate() - day + 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const formatTimeSlot = (startTime: string, endTime: string): string => {
  try {
    const start = vietnamDate(startTime);
    const end = vietnamDate(endTime);

    const startHours = start.getUTCHours().toString().padStart(2, '0');
    const startMinutes = start.getUTCMinutes().toString().padStart(2, '0');
    const endHours = end.getUTCHours().toString().padStart(2, '0');
    const endMinutes = end.getUTCMinutes().toString().padStart(2, '0');

    return `${startHours}:${startMinutes} - ${endHours}:${endMinutes}`;
  } catch {
    return 'Unknown';
  }
};

const formatDayLabel = (date: Date) =>
  date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

const formatWeekRangeLabel = (start: Date, end: Date) =>
  `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}`;

const transformScheduleData = (data: any): ScheduleCard => {
  const start = vietnamDate(data.startTime);
  const dateKey = formatDateKey(start);

  return {
    id: data.id,
    subjectCode: data.subjectCode,
    labRoomName: data.labRoomName,
    lecturerName: data.lecturerName,
    startTime: data.startTime,
    endTime: data.endTime,
    slotName: formatTimeSlot(data.startTime, data.endTime),
    status: STATUS_MAP[data.status] || data.status,
    dayLabel: WEEK_DAYS[start.getUTCDay() === 0 ? 6 : start.getUTCDay() - 1],
    dateKey,
    dateLabel: formatDayLabel(start),
  };
};

export default function StudentLandingPage() {
  const navigate = useNavigate();
  const [weekOffset, setWeekOffset] = useState(0);

  const currentDate = vietnamDate(new Date());
  const baseWeek = getWeekRange(currentDate);
  const weekStart = new Date(baseWeek.start);
  weekStart.setDate(baseWeek.start.getDate() + weekOffset * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  const today = formatDateKey(currentDate);
  const weekStartKey = formatDateKey(weekStart);
  const weekEndKey = formatDateKey(weekEnd);
  const weekRangeLabel = formatWeekRangeLabel(weekStart, weekEnd);

  const { data: scheduleResponse, isLoading: classesLoading, error: classesError } = useSchedulesStudent({
    fromDate: weekStartKey,
    toDate: weekEndKey,
    pageNumber: 1,
    pageSize: ITEMS_PER_PAGE,
  });

  const schedules = useMemo(() => {
    const items = scheduleResponse?.items || [];
    return items.map(transformScheduleData).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [scheduleResponse]);

  const groupedByDate = useMemo(() => {
    return schedules.reduce<Record<string, ScheduleCard[]>>((acc, item) => {
      acc[item.dateKey] ??= [];
      acc[item.dateKey].push(item);
      return acc;
    }, {});
  }, [schedules]);

  const todaySchedules = useMemo(
    () => schedules.filter((item) => item.dateKey === today),
    [schedules, today],
  );

  const weekDays = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateKey = formatDateKey(date);

      return {
        dateKey,
        dayLabel: WEEK_DAYS[index],
        dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        classes: groupedByDate[dateKey] ?? [],
      };
    });

    return days;
  }, [groupedByDate, weekStart]);

  const ongoingClass = useMemo(
    () =>
      todaySchedules.find((item) => item.status === 'active') ??
      schedules.find((item) => item.status === 'active'),
    [todaySchedules, schedules],
  );

  const nextClass = useMemo(
    () =>
      todaySchedules.find((item) => item.status !== 'active') ??
      schedules.find((item) => item.status !== 'active'),
    [todaySchedules, schedules],
  );

  const handleScanQRFromClass = (scheduleId: string) => {
    navigate(`/student/scan-attendance/${scheduleId}`);
  };

  const isOngoing = (status: string) => status === 'active';

  const statusMeta = (status: string) => {
    if (status === 'active') {
      return {
        label: 'Ongoing',
        icon: <ScanLine className="w-4 h-4" />,
        className: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      };
    }

    return {
      label: 'Upcoming',
      icon: <Clock className="w-4 h-4" />,
      className: 'bg-blue-50 border-blue-200 text-blue-700',
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      <div className="w-full px-4 md:max-w-7xl md:mx-auto py-4 md:py-8 space-y-4 md:space-y-8">
        <section className="flex flex-col gap-3 rounded-3xl bg-slate-900 px-5 py-5 text-white shadow-2xl md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Weekly timetable
            </p>
            <h1 className="mt-3 text-2xl font-bold md:text-4xl">Your classes this week</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
              Open this page, see every class in the current week, and jump straight into the next action without digging through a long table.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:min-w-[320px]">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-slate-300">Today</p>
              <p className="mt-2 text-2xl font-semibold">{todaySchedules.length}</p>
              <p className="text-xs text-slate-300">classes scheduled</p>
            </div>
            <div className="rounded-2xl bg-emerald-500/15 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-emerald-200">Action now</p>
              <p className="mt-2 text-2xl font-semibold">{ongoingClass ? 'Scan' : 'Wait'}</p>
              <p className="text-xs text-emerald-100">one tap attendance</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white shadow-lg ring-1 ring-slate-200/70 overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-4 md:px-6 md:py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 md:text-2xl">Weekly timetable</h2>
                <p className="mt-1 text-sm text-slate-500">
                  A week view that makes it easy to see where you need to be today, tomorrow, and later in the week.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs text-slate-600 md:text-sm">
                <MapPin className="h-4 w-4" />
                Week {weekOffset === 0 ? 'this' : weekOffset > 0 ? `+${weekOffset}` : weekOffset} • {weekRangeLabel}
              </div>
            </div>
          </div>

          {classesLoading ? (
            <div className="px-6 py-16 text-center">
              <Loader2 className="mx-auto mb-3 h-9 w-9 animate-spin text-slate-400" />
              <p className="text-sm text-slate-500">Loading your timetable...</p>
            </div>
          ) : classesError ? (
            <div className="px-6 py-16 text-center text-red-600">
              <AlertCircle className="mx-auto mb-3 h-9 w-9" />
              <p className="text-sm font-medium">Failed to load schedule</p>
              <p className="mt-1 text-sm text-red-500">Please try again in a moment.</p>
            </div>
          ) : schedules.length > 0 ? (
            <div className="space-y-4 p-4 md:p-6">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Week view</p>
                  <p className="text-sm font-bold text-slate-900">{weekRangeLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWeekOffset((value) => value - 1)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Previous week
                  </button>
                  <button
                    onClick={() => setWeekOffset((value) => value + 1)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Next week
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-7">
                {weekDays.map((day) => {
                  const isToday = day.dateKey === today;
                  const hasClasses = day.classes.length > 0;

                  return (
                    <div
                      key={day.dateKey}
                      className={`rounded-2xl border p-3 transition ${
                        isToday ? 'border-blue-300 bg-blue-50/70' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{day.dayLabel}</p>
                          <p className="mt-1 text-sm font-bold text-slate-900">{day.dateLabel}</p>
                        </div>
                        {isToday && (
                          <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                            Today
                          </span>
                        )}
                      </div>

                      <div className="mt-3 space-y-2">
                        {hasClasses ? (
                          day.classes.map((item) => {
                            const meta = statusMeta(item.status);
                            return (
                              <button
                                key={item.id}
                                onClick={() => handleScanQRFromClass(item.id)}
                                className={`w-full rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${meta.className}`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-[11px] font-medium uppercase tracking-wide opacity-80">{item.slotName}</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">{item.subjectCode}</p>
                                  </div>
                                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                </div>
                                <p className="mt-2 text-[11px] text-slate-600">{item.labRoomName}</p>
                                {isOngoing(item.status) ? (
                                  <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white">
                                    <ScanLine className="h-3 w-3" />
                                    Scan now
                                  </p>
                                ) : (
                                  <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white">
                                    <Clock className="h-3 w-3" />
                                    Upcoming
                                  </p>
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500">
                            Free day
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 md:flex md:items-center md:justify-between">
                <p>
                  Tap a class card to scan attendance, or use the floating button for the fastest path.
                </p>
                <p className="mt-2 font-medium text-slate-900 md:mt-0">
                  Focus on the class happening now, then prepare for the next one.
                </p>
              </div>
            </div>
          ) : (
            <div className="px-6 py-16 text-center text-slate-500">
              <Calendar className="mx-auto mb-3 h-12 w-12 text-slate-300" />
              <p className="text-base font-medium text-slate-700">You have no classes scheduled today.</p>
              <p className="mt-1 text-sm">Enjoy your free time or check your profile for the next day&apos;s classes.</p>
            </div>
          )}
        </section>
      </div>

      <button
        onClick={() => {
          if (ongoingClass) {
            navigate(`/student/scan-attendance/${ongoingClass.id}`);
            return;
          }

          if (nextClass) {
            navigate(`/student/scan-attendance/${nextClass.id}`);
            return;
          }

          navigate('/student/scan-attendance/general');
        }}
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl transition hover:scale-105 hover:from-blue-700 hover:to-blue-800 md:bottom-8 md:right-8 md:h-20 md:w-20"
        title="Open attendance scanner"
      >
        <QrCode className="h-8 w-8 md:h-10 md:w-10" />
      </button>
    </div>
  );
}
