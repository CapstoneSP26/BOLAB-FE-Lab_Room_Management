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

import { labSchedulerApi } from "../api/labSchedulerApi";
import type { CalendarEvent } from "../types/calendar.type";

import type { Booking } from "../../booking/types/booking.type";
import {
  getBookingRequests,
  getBookingRequestHistory,
} from "../../booking/api/bookingRequestApi";

import { norm, statusClass, statusDot } from "../../../utils/status";

import { useScheduleData } from "../../booking/hooks/useBookingData";
import { useLabManagerBookingModal } from "../../booking/hooks/useLabManagerBookingModal";

import { BookingDetailsModal } from "../../booking/components/BookingDetailsModal";
import CsvImportModal from "./CSVImportModal";

type ExtProps = {
  schedule: Schedule;
  status: unknown;
  hasBooking: boolean;
};

const getBuildingFromRoom = (roomId: number): string => {
  if (roomId >= 100 && roomId < 200) return "Building A";
  if (roomId >= 200 && roomId < 300) return "Building B";
  if (roomId >= 300 && roomId < 400) return "Building C";
  return "Other";
};

export default function LabCalendar() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const [bookingByScheduleId, setBookingByScheduleId] = useState<
    Record<string, Booking>
  >({});

  const schedule = useScheduleData();
  const bookingModal = useLabManagerBookingModal();
  const [csvOpen, setCsvOpen] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState<number | "ALL">("ALL");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("ALL");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedSlotType, setSelectedSlotType] = useState<string>("ALL");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const sch = await labSchedulerApi.list();
      setSchedules(sch ?? []);

      const [pendingResponse, historyResponse] = await Promise.all([
        getBookingRequests({ status: "PENDING" }),
        getBookingRequestHistory(),
      ]);

      const all = [
        ...(pendingResponse?.data ?? []),
        ...(historyResponse?.data ?? []),
      ];

      const map: Record<string, Booking> = {};

      for (const s of sch ?? []) {
        const b =
          all.find((x) => x.Id === s.Id) ??
          all.find(
            (x) =>
              x.LabRoomId === s.LabRoomId &&
              x.StartTime === s.StartTime &&
              x.EndTime === s.EndTime,
          );

        if (b) {
          map[s.Id] = b;
        }
      }

      setBookingByScheduleId(map);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

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

  const availableRooms = useMemo(() => {
    const roomSet = new Set<number>();
    (schedules ?? []).forEach((s) => roomSet.add(s.LabRoomId));
    return Array.from(roomSet).sort((a, b) => a - b);
  }, [schedules]);

  const availableBuildings = useMemo(() => {
    const buildingSet = new Set<string>();
    (schedules ?? []).forEach((s) =>
      buildingSet.add(getBuildingFromRoom(s.LabRoomId)),
    );
    return Array.from(buildingSet).sort();
  }, [schedules]);

  const timeRanges = [
    { value: "ALL", label: "All Day" },
    { value: "MORNING", label: "Morning (6:00 - 12:00)" },
    { value: "AFTERNOON", label: "Afternoon (12:00 - 18:00)" },
    { value: "EVENING", label: "Evening (18:00 - 23:00)" },
  ];

  const statusOptions = [
    { value: "ALL", label: "All Status" },
    { value: "APPROVED", label: "Approved" },
    { value: "PENDING", label: "Pending" },
    { value: "REJECTED", label: "Rejected" },
  ];

  const slotTypeOptions = [
    { value: "ALL", label: "All Types" },
    { value: "OLD_SLOT", label: "Old Slot" },
    { value: "NEW_SLOT", label: "New Slot" },
    { value: "OUT_SLOT", label: "Out Slot" },
  ];

  const isInTimeRange = (startTime: string, range: string) => {
    if (range === "ALL") return true;
    const hour = new Date(startTime).getHours();
    if (range === "MORNING") return hour >= 6 && hour < 12;
    if (range === "AFTERNOON") return hour >= 12 && hour < 18;
    if (range === "EVENING") return hour >= 18 && hour < 23;
    return true;
  };

  const eventInputs = useMemo<EventInput[]>(() => {
    return (schedules ?? []).map((s) => {
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

  const filteredEventInputs = useMemo(() => {
    return eventInputs.filter((event) => {
      const ext = event.extendedProps as ExtProps;

      if (selectedBuilding !== "ALL") {
        const building = getBuildingFromRoom(ext.schedule.LabRoomId);
        if (building !== selectedBuilding) return false;
      }

      if (selectedRoom !== "ALL" && ext.schedule.LabRoomId !== selectedRoom) {
        return false;
      }

      if (!isInTimeRange(ext.schedule.StartTime, selectedTimeRange)) {
        return false;
      }

      if (selectedStatus !== "ALL") {
        const eventStatus = norm(ext.status);
        if (eventStatus !== selectedStatus) return false;
      }

      if (selectedSlotType !== "ALL") {
        const slotType = norm(ext.schedule.ScheduleType);
        if (slotType !== selectedSlotType) return false;
      }

      return true;
    });
  }, [
    eventInputs,
    selectedBuilding,
    selectedRoom,
    selectedTimeRange,
    selectedStatus,
    selectedSlotType,
  ]);

  const filterStats = useMemo(() => {
    return {
      total: eventInputs.length,
      filtered: filteredEventInputs.length,
    };
  }, [eventInputs, filteredEventInputs]);

  const { onDateClick, onSelect, onEventClick } = schedule.handlers;
  const { isLabManager, onEventClick: onBookingEventClick } = bookingModal;

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
      events: filteredEventInputs,
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
          ? `${String(start.getHours()).padStart(2, "0")}:${String(
              start.getMinutes(),
            ).padStart(2, "0")}`
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
    filteredEventInputs,
    schedule.isAdmin,
    onDateClick,
    onSelect,
    onEventClick,
    isLabManager,
    onBookingEventClick,
  ]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Lab Calendar
          </div>

          <div className="flex items-center gap-2">
            {schedule.isAdmin && (
              <button
                type="button"
                onClick={() => setCsvOpen(true)}
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
                Import CSV, Excel
              </button>
            )}
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
      </div>

      <div className="border-b border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
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
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Building
              </label>
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="ALL">All Buildings</option>
                {availableBuildings.map((building) => (
                  <option key={building} value={building}>
                    {building}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Room
              </label>
              <select
                value={selectedRoom}
                onChange={(e) =>
                  setSelectedRoom(
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value),
                  )
                }
                className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="ALL">All Rooms</option>
                {availableRooms.map((room) => (
                  <option key={room} value={room}>
                    Room {room}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Time
              </label>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {timeRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Type
              </label>
              <select
                value={selectedSlotType}
                onChange={(e) => setSelectedSlotType(e.target.value)}
                className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                {slotTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              {(selectedBuilding !== "ALL" ||
                selectedRoom !== "ALL" ||
                selectedTimeRange !== "ALL" ||
                selectedStatus !== "ALL" ||
                selectedSlotType !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBuilding("ALL");
                    setSelectedRoom("ALL");
                    setSelectedTimeRange("ALL");
                    setSelectedStatus("ALL");
                    setSelectedSlotType("ALL");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-300 active:scale-[0.98] dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Clear All Filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {filterStats.filtered} / {filterStats.total} events
              </span>
              {filterStats.filtered < filterStats.total && (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  filtered
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-6">Loading...</div>
      ) : (schedules ?? []).length === 0 ? (
        <div className="p-6">No schedules found</div>
      ) : (
        <div className="p-4">
          <FullCalendar {...calendarOptions} />

          {bookingModal.renderModal((scheduleId, booking) => {
            setBookingByScheduleId((prev) => ({
              ...prev,
              [scheduleId]: booking,
            }));
          })}

          {schedule.isAdmin && (
            <BookingEditModal
              key={`${schedule.editModal.mode}:${schedule.editModal.schedule?.Id ?? "new"}:${schedule.editModal.initial?.start ?? ""}`}
              {...schedule.editModal}
            />
          )}
        </div>
      )}

      <CsvImportModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onImport={async (file) => {
          const text = await file.text();
          console.log("CSV content:", text);
          await reload();
        }}
        templateFileName="schedule_template.csv"
        templateText={
          "LabRoomId,StartTime,EndTime,ScheduleType,ScheduleStatus\n101,2026-02-24T08:00:00Z,2026-02-24T10:00:00Z,REGULAR,AVAILABLE\n"
        }
      />
    </div>
  );
}
