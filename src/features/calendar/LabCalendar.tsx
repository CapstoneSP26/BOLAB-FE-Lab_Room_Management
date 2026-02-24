import { useEffect, useMemo, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  EventContentArg,
  EventInput,
  CalendarOptions,
} from "@fullcalendar/core";

import "./calendar.css";

import { labSchedulerService } from "../../services/labmanager/labScheduler.service";
import type { Schedule } from "../../services/labmanager/labScheduler.service";

import type { Booking } from "../../services/labmanager/bookingRequest.service";
import { bookingRequestsService } from "../../services/labmanager/bookingRequest.service";

import { norm, statusClass, statusDot } from "../../utils/status";

import { useScheduleData } from "../../hooks/useBookingData";

import { useLabManagerBookingModal } from "../../hooks/useLabManagerBookingModal";

import ScheduleEditModal from "../../features/schedules/bookings/components/BookingEditModal";

type ExtProps = {
  schedule: Schedule;
  status: unknown;
  hasBooking: boolean;
};

export default function LabCalendar() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const [bookingByScheduleId, setBookingByScheduleId] = useState<
    Record<string, Booking>
  >({});

  const schedule = useScheduleData(); 
  const bookingModal = useLabManagerBookingModal(); 

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const sch = await labSchedulerService.listSchedules();
      setSchedules(sch);

      const [pending, history] = await Promise.all([
        bookingRequestsService.listPending(),
        bookingRequestsService.listHistory(),
      ]);
      const all = [...pending, ...history];

      const map: Record<string, Booking> = {};
      for (const s of sch) {
        const b =
          all.find((x) => x.Id === s.Id) ??
          all.find(
            (x) =>
              x.LabRoomId === s.LabRoomId &&
              x.StartTime === s.StartTime &&
              x.EndTime === s.EndTime,
          );
        if (b) map[s.Id] = b;
      }
      setBookingByScheduleId(map);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // ====== build eventInputs (typed extendedProps) ======
  const eventInputs = useMemo<EventInput[]>(() => {
    return schedules.map((s) => {
      const linkedBooking = bookingByScheduleId[s.Id];
      const status = linkedBooking?.BookingStatus ?? s.ScheduleStatus;

      const ext: ExtProps = {
        schedule: s,
        status,
        hasBooking: Boolean(linkedBooking),
      };

      return {
        id: s.Id,
        title: `Room ${s.LabRoomId}`,
        start: s.StartTime,
        end: s.EndTime,
        extendedProps: ext,
      };
    });
  }, [schedules, bookingByScheduleId]);

  const { onDateClick, onSelect, onEventClick } = schedule.handlers;
  const { isLabManager, onEventClick: onBookingEventClick } = bookingModal;

  const handleImportCSV = () => {
    // TODO: Implement CSV import logic
    // This could open a file picker or modal
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log("CSV file selected:", file.name);
        // TODO: Parse and import CSV data
        // const text = await file.text();
        // Parse and process CSV...
      }
    };
    input.click();
  };

  const calendarOptions = useMemo<CalendarOptions>(() => {
    return {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: "dayGridMonth",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },

      eventDisplay: "block",
      dayMaxEventRows: 3,
      moreLinkText: "more",

      events: eventInputs,

      dateClick: schedule.isAdmin ? onDateClick : undefined,

      selectable: schedule.isAdmin,
      select: schedule.isAdmin ? onSelect : undefined,

      eventClick: (arg) => {
        if (isLabManager) return onBookingEventClick(arg);
        if (schedule.isAdmin) return onEventClick(arg);
      },

      height: "auto",
      expandRows: true,

      eventContent: (arg: EventContentArg) => {
        const ext = arg.event.extendedProps as ExtProps | undefined;
        const status = ext?.status;

        const cls = statusClass(status);
        const dot = statusDot(status);

        const start = arg.event.start;
        const time = start
          ? `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`
          : "";

        const room = arg.event.title;

        return (
          <div
            className={`group w-full cursor-pointer overflow-hidden rounded-md border px-2.5 py-1.5 transition-all hover:shadow-sm ${cls}`}
          >
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />

              {time && (
                <span className="shrink-0 text-[11px] font-bold">{time}</span>
              )}

              <span className="min-w-0 flex-1 truncate text-xs font-semibold">
                {room}
              </span>

              {norm(status) === "PENDING" && (
                <span className="shrink-0 rounded bg-current/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                  Pending
                </span>
              )}
            </div>
          </div>
        );
      },
    };
  }, [
    eventInputs,
    schedule.isAdmin,
    onDateClick,
    onSelect,
    onEventClick,
    isLabManager,
    onBookingEventClick,
  ]);

  return (
    <div className="custom-calendar overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Lab Calendar
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleImportCSV}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition-all hover:bg-blue-100 active:scale-[0.98] dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Import CSV
          </button>

          <button
            type="button"
            onClick={reload}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.04]"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-6">Loading...</div>
      ) : schedules.length === 0 ? (
        <div className="p-6">No schedules found</div>
      ) : (
        <div className="p-4">
          <FullCalendar {...calendarOptions} />

          {/* ✅ LAB_MANAGER modal */}
          {bookingModal.renderModal((scheduleId, booking) => {
            setBookingByScheduleId((prev) => ({
              ...prev,
              [scheduleId]: booking,
            }));
          })}

          {/* ✅ ADMIN modal (create/edit schedule) */}
          {schedule.isAdmin && (
            <ScheduleEditModal
              key={`${schedule.editModal.mode}:${schedule.editModal.schedule?.Id ?? "new"}:${schedule.editModal.initial?.start ?? ""}`}
              {...schedule.editModal}
            />
          )}
        </div>
      )}
    </div>
  );
}
