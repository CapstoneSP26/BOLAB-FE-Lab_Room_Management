import { useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  CalendarOptions,
  EventContentArg,
  EventInput,
} from "@fullcalendar/core";

type LabCalendarViewProps = {
  loading: boolean;
  scheduleCount: number;
  events: EventInput[];
  onEventClick?: (schedule: any) => void;
};

export function LabCalendarView({
  loading,
  scheduleCount,
  events,
  onEventClick,
}: LabCalendarViewProps) {
  useEffect(() => {
    const styleId = "fullcalendar-custom-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .fc{font-family:inherit}.fc-header-toolbar{padding:1rem;margin-bottom:1rem!important;gap:.75rem}.fc-toolbar-chunk{display:flex;align-items:center;gap:.5rem}.fc-toolbar-title{font-size:1.25rem;font-weight:600;color:rgb(17 24 39)}.dark .fc-toolbar-title{color:rgb(255 255 255)}.fc-button{padding:.5rem 1rem!important;font-size:.875rem!important;font-weight:600!important;border-radius:.5rem!important;border:1px solid rgb(209 213 219)!important;background:white!important;color:rgb(55 65 81)!important;text-transform:capitalize!important;transition:all .15s ease!important}.dark .fc-button{border-color:rgb(55 65 81)!important;background:rgb(31 41 55)!important;color:rgb(229 231 235)!important}.fc-button:hover{background:rgb(249 250 251)!important;border-color:rgb(156 163 175)!important}.dark .fc-button:hover{background:rgb(55 65 81)!important;border-color:rgb(75 85 99)!important}.fc-button:focus{box-shadow:0 0 0 3px rgba(59,130,246,.1)!important}.fc-button-active{background:rgb(59 130 246)!important;border-color:rgb(59 130 246)!important;color:white!important}.fc-button-active:hover{background:rgb(37 99 235)!important;border-color:rgb(37 99 235)!important}.fc-button:disabled{opacity:.4!important;cursor:not-allowed!important}.fc-col-header-cell{padding:.75rem .5rem;background:rgb(249 250 251);border-color:rgb(229 231 235)!important}.dark .fc-col-header-cell{background:rgb(31 41 55);border-color:rgb(55 65 81)!important}.fc-col-header-cell-cushion{font-size:.75rem;font-weight:600;text-transform:uppercase;color:rgb(107 114 128);letter-spacing:.05em}.dark .fc-col-header-cell-cushion{color:rgb(156 163 175)}.fc-daygrid-day{border-color:rgb(229 231 235)!important}.dark .fc-daygrid-day{border-color:rgb(55 65 81)!important}.fc-daygrid-day-top{padding:.5rem}.fc-daygrid-day-number{font-size:.875rem;font-weight:500;color:rgb(55 65 81);padding:.25rem .5rem}.dark .fc-daygrid-day-number{color:rgb(229 231 235)}.fc-day-today{background:rgb(239 246 255)!important}.dark .fc-day-today{background:rgb(30 58 138/.2)!important}.fc-day-today .fc-daygrid-day-number{background:rgb(59 130 246);color:white;border-radius:.375rem;font-weight:600}.fc-day-other .fc-daygrid-day-number{color:rgb(156 163 175)}.dark .fc-day-other .fc-daygrid-day-number{color:rgb(75 85 99)}.fc-day-sat,.fc-day-sun{background:rgb(249 250 251)}.dark .fc-day-sat,.dark .fc-day-sun{background:rgb(17 24 39)}.fc-daygrid-day-events{margin:.25rem!important}.fc-daygrid-event-harness{margin-bottom:.25rem!important}.fc-more-link{font-size:.75rem;font-weight:600;color:rgb(59 130 246);padding:.25rem .5rem;margin:.25rem;border-radius:.375rem;background:rgb(239 246 255)}.dark .fc-more-link{color:rgb(96 165 250);background:rgb(30 58 138/.2)}.fc-more-link:hover{background:rgb(219 234 254);text-decoration:none}.dark .fc-more-link:hover{background:rgb(30 58 138/.3)}.fc-popover{border-radius:.75rem!important;border:1px solid rgb(229 231 235)!important;box-shadow:0 10px 15px -3px rgb(0 0 0/.1)!important;background:white!important}.dark .fc-popover{border-color:rgb(55 65 81)!important;background:rgb(31 41 55)!important}.fc-popover-header{padding:.75rem 1rem!important;background:rgb(249 250 251)!important;border-bottom:1px solid rgb(229 231 235)!important;border-radius:.75rem .75rem 0 0!important}.dark .fc-popover-header{background:rgb(17 24 39)!important;border-color:rgb(55 65 81)!important}.fc-popover-title{font-size:.875rem;font-weight:600;color:rgb(17 24 39)}.dark .fc-popover-title{color:rgb(243 244 246)}.fc-popover-close{opacity:.5;transition:opacity .15s}.fc-popover-close:hover{opacity:1}.fc-timegrid-slot{height:3rem;border-color:rgb(229 231 235)!important}.dark .fc-timegrid-slot{border-color:rgb(55 65 81)!important}.fc-timegrid-slot-label{font-size:.75rem;color:rgb(107 114 128)}.dark .fc-timegrid-slot-label{color:rgb(156 163 175)}.fc-timegrid-event{border-radius:.375rem!important;border-width:1px!important}.fc-scroller{overflow-y:auto!important}.fc-scroller::-webkit-scrollbar{width:8px;height:8px}.fc-scroller::-webkit-scrollbar-track{background:rgb(243 244 246);border-radius:4px}.dark .fc-scroller::-webkit-scrollbar-track{background:rgb(17 24 39)}.fc-scroller::-webkit-scrollbar-thumb{background:rgb(209 213 219);border-radius:4px}.dark .fc-scroller::-webkit-scrollbar-thumb{background:rgb(55 65 81)}.fc-scroller::-webkit-scrollbar-thumb:hover{background:rgb(156 163 175)}.dark .fc-scroller::-webkit-scrollbar-thumb:hover{background:rgb(75 85 99)}
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) existingStyle.remove();
    };
  }, []);

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
      events,
      dateClick: undefined,
      selectable: false,
      select: undefined,
      eventClick: (info) => {
        const schedule = info.event.extendedProps.schedule;
        if (schedule && onEventClick) {
          onEventClick(schedule);
        }
      },
      height: "auto",
      expandRows: true,
      eventContent: (arg: EventContentArg) => {
        // Force all calendar events to be blue as requested
        const cls = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30";
        const dot = "bg-blue-500";

        const start = arg.event.start;
        const time = start
          ? `${String(start.getHours()).padStart(2, "0")}:${String(
              start.getMinutes(),
            ).padStart(2, "0")}`
          : "";

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
                {arg.event.title}
              </span>
            </div>
          </div>
        );
      },
    };
  }, [events]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (scheduleCount === 0) {
    return <div className="p-6">No schedules found</div>;
  }

  return (
    <div className="p-4">
      <FullCalendar {...calendarOptions} />
    </div>
  );
}
