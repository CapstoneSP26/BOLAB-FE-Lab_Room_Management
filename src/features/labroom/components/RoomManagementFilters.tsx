import { Building2, Power, RotateCcw, Search, X } from "lucide-react";
import type { BuildingDto } from "../../building/types/building.type";
import type { LabRoomStatusFilter } from "../types/room.type";

type Props = {
  search: string;
  buildingId: number | "ALL";
  status: LabRoomStatusFilter;
  buildingOptions: BuildingDto[];
  onSearchChange: (value: string) => void;
  onBuildingChange: (value: number | "ALL") => void;
  onStatusChange: (value: LabRoomStatusFilter) => void;
  onReset: () => void;
};

export default function RoomManagementFilters({
  search,
  buildingId,
  status,
  buildingOptions,
  onSearchChange,
  onBuildingChange,
  onStatusChange,
  onReset,
}: Props) {
  const hasActiveFilters =
    search.trim() !== "" || buildingId !== "ALL" || status !== "ALL";

  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-lg shadow-gray-200/20 dark:border-gray-800/60 dark:bg-gray-900/40 dark:shadow-none">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            Search Lab Room
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by room no or room number..."
              className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-10 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            Building
          </label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={buildingId === "ALL" ? "ALL" : String(buildingId)}
              onChange={(event) =>
                onBuildingChange(
                  event.target.value === "ALL" ? "ALL" : Number(event.target.value),
                )
              }
              className="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-11 pr-10 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
            >
              <option value="ALL">All buildings</option>
              {buildingOptions.map((building) => (
                <option key={building.id} value={String(building.id)}>
                  {building.buildingName}
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

        <div className="lg:col-span-2">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            Status
          </label>
          <div className="relative">
            <Power className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as LabRoomStatusFilter)
              }
              className="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-11 pr-10 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
            >
              <option value="ALL">All status</option>
              <option value="ACTIVE">Activate</option>
              <option value="DEACTIVATED">De-activate</option>
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

        <div className="flex items-end lg:col-span-1">
          <button
            type="button"
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 dark:hover:bg-gray-700/50"
          >
            <RotateCcw className="h-4 w-4 transition-transform group-hover:rotate-180" />
            <span className="hidden text-sm font-semibold xl:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
