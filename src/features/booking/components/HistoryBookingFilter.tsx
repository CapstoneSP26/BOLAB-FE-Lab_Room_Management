import type { Building } from "../../building/types/building.type";
import type { LabRoomLookupItem } from "../../labroom/types/room.type";
import type {
  BookingStatusLookupItem,
  HistoryStatus,
} from "../types/bookingRequest.type";
import {
  Search,
  Building2,
  DoorOpen,
  CheckCircle2,
  Calendar,
  CalendarRange,
  X,
  RotateCcw,
} from "lucide-react";

type Props = {
  q: string;
  onQ: (v: string) => void;

  buildingId: number | "ALL";
  onBuildingId: (v: number | "ALL") => void;
  buildingOptions: Building[];

  roomId: number | "ALL";
  onRoomId: (v: number | "ALL") => void;
  roomOptions: LabRoomLookupItem[];

  status: HistoryStatus;
  onStatus: (v: HistoryStatus) => void;
  statusOptions: BookingStatusLookupItem[];

  from: string;
  onFrom: (v: string) => void;

  to: string;
  onTo: (v: string) => void;

  onApplyFilters?: () => void | Promise<void>;
};

function toStatusLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getStatusBadgeColor(status: string) {
  const s = status.toUpperCase();
  if (s === "PENDING")
    return "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30";
  if (s === "REJECTED")
    return "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30";
  if (s === "APPROVED")
    return "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30";
  return "bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-500/30";
}

export default function HistoryBookingFilter({
  q,
  onQ,
  buildingId,
  onBuildingId,
  buildingOptions,
  roomId,
  onRoomId,
  roomOptions,
  status,
  onStatus,
  statusOptions,
  from,
  onFrom,
  to,
  onTo,
  onApplyFilters,
}: Props) {
  // Auto-apply filters
  const handleSearchChange = (value: string) => {
    onQ(value);
    if (onApplyFilters) {
      setTimeout(() => onApplyFilters(), 300);
    }
  };

  const handleBuildingChange = (value: number | "ALL") => {
    onBuildingId(value);
    if (value === "ALL") {
      onRoomId("ALL");
    }
    if (onApplyFilters) {
      setTimeout(() => onApplyFilters(), 0);
    }
  };

  const handleRoomChange = (value: number | "ALL") => {
    onRoomId(value);
    if (onApplyFilters) {
      setTimeout(() => onApplyFilters(), 0);
    }
  };

  const handleStatusChange = (value: HistoryStatus) => {
    onStatus(value);
    if (onApplyFilters) {
      setTimeout(() => onApplyFilters(), 0);
    }
  };

  const handleFromChange = (value: string) => {
    onFrom(value);
    if (onApplyFilters) {
      setTimeout(() => onApplyFilters(), 0);
    }
  };

  const handleToChange = (value: string) => {
    onTo(value);
    if (onApplyFilters) {
      setTimeout(() => onApplyFilters(), 0);
    }
  };

  const handleReset = () => {
    onQ("");
    onBuildingId("ALL");
    onRoomId("ALL");
    onStatus("ALL");
    onFrom("");
    onTo("");
    if (onApplyFilters) {
      setTimeout(() => onApplyFilters(), 0);
    }
  };

  const hasActiveFilters =
    q !== "" ||
    buildingId !== "ALL" ||
    roomId !== "ALL" ||
    status !== "ALL" ||
    from !== "" ||
    to !== "";

  return (
    <div className="space-y-4 mb-6">
      {/* Filter Controls */}
      <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-900/40 backdrop-blur-sm shadow-lg shadow-gray-200/20 dark:shadow-none p-6">
        {/* Search Bar - Full Width */}
        <div className="mb-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by ID, user, room, purpose, reason..."
              className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-10 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500"
            />
            {q && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {/* Building Filter */}
          <div className="lg:col-span-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              Building
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <select
                value={String(buildingId)}
                onChange={(e) =>
                  handleBuildingChange(
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value),
                  )
                }
                className="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-11 pr-10 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">All buildings</option>
                {buildingOptions.map((b) => (
                  <option key={String(b.id)} value={String(b.id)}>
                    {b.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Room Filter */}
          <div className="lg:col-span-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              Room
            </label>
            <div className="relative">
              <DoorOpen className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <select
                value={String(roomId)}
                onChange={(e) =>
                  handleRoomChange(
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value),
                  )
                }
                disabled={buildingId === "ALL"}
                className="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-11 pr-10 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:border-blue-500 dark:disabled:bg-gray-700/50 dark:disabled:text-gray-500 cursor-pointer"
              >
                <option value="ALL">
                  {buildingId === "ALL" ? "Select building first" : "All rooms"}
                </option>
                {roomOptions.map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    {r.roomName} - {r.buildingName}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              Status
            </label>
            <div className="relative">
              <CheckCircle2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <select
                value={status}
                onChange={(e) =>
                  handleStatusChange(e.target.value as HistoryStatus)
                }
                className="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-11 pr-10 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">All status</option>
                {statusOptions.map((s) => (
                  <option key={s.code} value={s.code}>
                    {toStatusLabel(s.name)}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* From Date */}
          <div className="lg:col-span-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              From Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <input
                type="date"
                value={from}
                onChange={(e) => handleFromChange(e.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-11 pr-4 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:border-blue-500 cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {/* To Date */}
          <div className="lg:col-span-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              To Date
            </label>
            <div className="relative">
              <CalendarRange className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <input
                type="date"
                value={to}
                onChange={(e) => handleToChange(e.target.value)}
                min={from}
                className="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-11 pr-4 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:border-blue-500 cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {/* Reset Button */}
          <div className="lg:col-span-1 flex items-end">
            <button
              type="button"
              onClick={handleReset}
              disabled={!hasActiveFilters}
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 dark:hover:bg-gray-700/50 dark:hover:border-gray-600 flex items-center justify-center gap-2 group"
              title="Clear all filters"
            >
              <RotateCcw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-300" />
              <span className="text-sm font-semibold hidden xl:inline">
                Reset
              </span>
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-5 flex flex-wrap items-center gap-2 pt-5 border-t border-gray-200 dark:border-gray-800">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Active Filters:
            </span>

            {q && (
              <div className="inline-flex items-center gap-2 rounded-lg bg-blue-100 dark:bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                <Search className="h-3 w-3" />
                <span>
                  Search: "{q.length > 30 ? q.substring(0, 30) + "..." : q}"
                </span>
                <button
                  onClick={() => handleSearchChange("")}
                  className="ml-1 rounded-md hover:bg-blue-200 dark:hover:bg-blue-500/30 p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {buildingId !== "ALL" && (
              <div className="inline-flex items-center gap-2 rounded-lg bg-purple-100 dark:bg-purple-500/20 px-3 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                <Building2 className="h-3 w-3" />
                <span>
                  {buildingOptions.find((b) => b.id === buildingId)?.name ||
                    "Building"}
                </span>
                <button
                  onClick={() => handleBuildingChange("ALL")}
                  className="ml-1 rounded-md hover:bg-purple-200 dark:hover:bg-purple-500/30 p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {roomId !== "ALL" && (
              <div className="inline-flex items-center gap-2 rounded-lg bg-green-100 dark:bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/30">
                <DoorOpen className="h-3 w-3" />
                <span>
                  {roomOptions.find((r) => r.id === roomId)?.roomName || "Room"}
                </span>
                <button
                  onClick={() => handleRoomChange("ALL")}
                  className="ml-1 rounded-md hover:bg-green-200 dark:hover:bg-green-500/30 p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {status !== "ALL" && (
              <div
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium border ${getStatusBadgeColor(String(status))}`}
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>
                  {toStatusLabel(
                    statusOptions.find((s) => s.code === status)?.name ||
                      String(status),
                  )}
                </span>
                <button
                  onClick={() => handleStatusChange("ALL")}
                  className="ml-1 rounded-md hover:opacity-70 p-0.5 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {(from || to) && (
              <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                <CalendarRange className="h-3 w-3" />
                <span>
                  {from && to
                    ? `${from} → ${to}`
                    : from
                      ? `From ${from}`
                      : `Until ${to}`}
                </span>
                <button
                  onClick={() => {
                    handleFromChange("");
                    handleToChange("");
                  }}
                  className="ml-1 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-500/30 p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
