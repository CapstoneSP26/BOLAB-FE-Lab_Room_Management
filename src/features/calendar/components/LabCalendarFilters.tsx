import type { BuildingDto } from "../../building/types/building.type";
import type { LabRoomDto } from "../../labroom/types/room.type";
import type {
  LabCalendarFilterState,
  LabCalendarSelectOption,
} from "../types/calendar.type";
import { LAB_CALENDAR_TIME_RANGES } from "../constants/calendar.constants";

type LabCalendarFiltersProps = {
  filters: LabCalendarFilterState;
  buildingOptions: BuildingDto[];
  roomOptions: LabRoomDto[];
  statusOptions: LabCalendarSelectOption[];
  slotTypeOptions: LabCalendarSelectOption[];
  filterStats: {
    total: number;
    filtered: number;
  };
  onFilterChange: (key: keyof LabCalendarFilterState, value: string) => void;
  onClearFilters: () => void;
};

export function LabCalendarFilters({
  filters,
  buildingOptions,
  roomOptions,
  onFilterChange,
  onClearFilters,
}: LabCalendarFiltersProps) {
  const hasActiveFilters =
    filters.selectedBuilding !== "ALL" ||
    filters.selectedRoom !== "ALL" ||
    filters.selectedTimeRange !== "ALL" ||
    filters.selectedStatus !== "ALL" ||
    filters.selectedSlotType !== "ALL";

  return (
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
              value={filters.selectedBuilding}
              onChange={(event) =>
                onFilterChange("selectedBuilding", event.target.value)
              }
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="ALL">All Buildings</option>
              {buildingOptions.map((b) => (
                <option key={String(b.id)} value={String(b.id)}>
                  {b.buildingName}
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
              value={filters.selectedRoom}
              onChange={(event) =>
                onFilterChange("selectedRoom", event.target.value)
              }
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="ALL">All Rooms</option>
              {roomOptions.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  {r.roomName}
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
              value={filters.selectedTimeRange}
              onChange={(event) =>
                onFilterChange("selectedTimeRange", event.target.value)
              }
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {LAB_CALENDAR_TIME_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearFilters}
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
        </div>
      </div>
    </div>
  );
}
