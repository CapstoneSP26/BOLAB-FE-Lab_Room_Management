import type { BuildingDto } from "../../building/types/building.type";
import type { LabRoomDto } from "../../labroom/types/room.type";
import type {
  BookingStatus,
  BookingStatusLookupItem,
} from "../types/booking.type";
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
  buildingOptions: BuildingDto[];

  roomId: number | "ALL";
  onRoomId: (v: number | "ALL") => void;
  roomOptions: LabRoomDto[];

  status: BookingStatus;
  onStatus: (v: BookingStatus) => void;
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
  if (s === "PENDING" || s === "PENDINGAPPROVAL")
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
  const triggerApply = (delay = 0) => {
    if (onApplyFilters) {
      setTimeout(() => onApplyFilters(), delay);
    }
  };

  const handleSearchChange = (value: string) => {
    onQ(value);
    triggerApply(300);
  };

  const handleBuildingChange = (value: number | "ALL") => {
    onBuildingId(value);
    // Reset room khi đổi building
    if (value === "ALL") {
      onRoomId("ALL");
    }
    if (onApplyFilters) {
      setTimeout(() => onApplyFilters(), 0);
    }
  };

  const handleRoomChange = (value: number | "ALL") => {
    onRoomId(value);
    triggerApply();
  };

  const handleStatusChange = (value: BookingStatus) => {
    onStatus(value);
    triggerApply();
  };

  const handleFromChange = (value: string) => {
    onFrom(value);
    triggerApply();
  };

  const handleToChange = (value: string) => {
    onTo(value);
    triggerApply();
  };

  const handleReset = () => {
    onQ("");
    onBuildingId("ALL");
    onRoomId("ALL");
    onStatus("All");
    onFrom("");
    onTo("");
    triggerApply();
  };

  const hasActiveFilters =
    q !== "" ||
    buildingId !== "ALL" ||
    roomId !== "ALL" ||
    status !== "All" ||
    from !== "" ||
    to !== "";

  return (
    <div className="mb-6 space-y-4">
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-lg shadow-gray-200/20 backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/40 dark:shadow-none">
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
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              Building
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={String(buildingId)}
                onChange={(e) =>
                  handleBuildingChange(
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value),
                  )
                }
                className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-gray-300 bg-white pl-11 pr-10 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:border-blue-500"
              >
                <option value="ALL">All buildings</option>
                {buildingOptions.map((b) => (
                  <option key={String(b.id)} value={b.id}>
                    {b.buildingName}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
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

          <div className="lg:col-span-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              Room
            </label>
            <div className="relative">
              <DoorOpen className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={String(roomId)}
                onChange={(e) =>
                  handleRoomChange(
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value),
                  )
                }
                disabled={buildingId === "ALL"}
                className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-gray-300 bg-white pl-11 pr-10 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:border-blue-500 dark:disabled:bg-gray-700/50 dark:disabled:text-gray-500"
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
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
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

          <div className="lg:col-span-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              Status
            </label>
            <div className="relative">
              <CheckCircle2 className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={status}
                onChange={(e) =>
                  handleStatusChange(e.target.value as BookingStatus)
                }
                className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-gray-300 bg-white pl-11 pr-10 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:border-blue-500"
              >
                <option value="All">All status</option>
                {statusOptions
                  .filter((s) => s.code !== "All")
                  .map((s) => (
                    <option key={s.code} value={s.code}>
                      {toStatusLabel(s.name)}
                    </option>
                  ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
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

          <div className="lg:col-span-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              From Date
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={from}
                onChange={(e) => handleFromChange(e.target.value)}
                className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-gray-300 bg-white pl-11 pr-4 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 [color-scheme:light] dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:border-blue-500 dark:[color-scheme:dark]"
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              To Date
            </label>
            <div className="relative">
              <CalendarRange className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={to}
                onChange={(e) => handleToChange(e.target.value)}
                min={from}
                className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-gray-300 bg-white pl-11 pr-4 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 [color-scheme:light] dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:border-blue-500 dark:[color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex items-end lg:col-span-1">
            <button
              type="button"
              onClick={handleReset}
              disabled={!hasActiveFilters}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:bg-white dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-700/50"
              title="Clear all filters"
            >
              <RotateCcw className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
              <span className="hidden text-sm font-semibold xl:inline">
                Reset
              </span>
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-5 dark:border-gray-800">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Active Filters:
            </span>

            {q && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300">
                <Search className="h-3 w-3" />
                <span>
                  Search: "{q.length > 30 ? `${q.substring(0, 30)}...` : q}"
                </span>
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="ml-1 rounded-md p-0.5 transition-colors hover:bg-blue-200 dark:hover:bg-blue-500/30"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {buildingId !== "ALL" && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/20 dark:text-purple-300">
                <Building2 className="h-3 w-3" />
                <span>
                  {buildingOptions.find((b) => b.id === buildingId)
                    ?.buildingName || "Building"}
                </span>
                <button
                  type="button"
                  onClick={() => handleBuildingChange("ALL")}
                  className="ml-1 rounded-md p-0.5 transition-colors hover:bg-purple-200 dark:hover:bg-purple-500/30"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {roomId !== "ALL" && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 dark:border-green-500/30 dark:bg-green-500/20 dark:text-green-300">
                <DoorOpen className="h-3 w-3" />
                <span>
                  {roomOptions.find((r) => r.id === roomId)?.roomName || "Room"}
                </span>
                <button
                  type="button"
                  onClick={() => handleRoomChange("ALL")}
                  className="ml-1 rounded-md p-0.5 transition-colors hover:bg-green-200 dark:hover:bg-green-500/30"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {status !== "All" && (
              <div
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium ${getStatusBadgeColor(String(status))}`}
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>
                  {toStatusLabel(
                    statusOptions.find((s) => s.code === status)?.name ||
                      String(status),
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => handleStatusChange("All")}
                  className="ml-1 rounded-md p-0.5 transition-opacity hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {(from || to) && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-300">
                <CalendarRange className="h-3 w-3" />
                <span>
                  {from && to
                    ? `${from} → ${to}`
                    : from
                      ? `From ${from}`
                      : `Until ${to}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleFromChange("");
                    handleToChange("");
                  }}
                  className="ml-1 rounded-md p-0.5 transition-colors hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
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
