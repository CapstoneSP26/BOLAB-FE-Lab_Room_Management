import type { LabRoomDto } from "../../labroom/types/room.type";
import type { BuildingDto } from "../../building/types/building.type";
import { Search, Building2, DoorOpen, X, RotateCcw } from "lucide-react";

type Props = {
  q: string;
  onQ: (v: string) => void;
  roomId: number | "ALL";
  onRoomId: (v: number | "ALL") => void;
  buildingId: number | "ALL";
  onBuildingId: (v: number | "ALL") => void;
  roomOptions: LabRoomDto[];
  buildingOptions: BuildingDto[];
  onReset: () => void;
};

export default function ReportListFilters({
  q,
  onQ,
  roomId,
  onRoomId,
  buildingId,
  onBuildingId,
  roomOptions,
  buildingOptions,
  onReset,
}: Props) {
  const handleBuildingChange = (value: number | "ALL") => {
    onBuildingId(value);
    onRoomId("ALL");
  };

  const handleRoomChange = (value: number | "ALL") => {
    onRoomId(value);
  };

  const handleSearchChange = (value: string) => {
    onQ(value);
  };

  const hasActiveFilters = q !== "" || buildingId !== "ALL" || roomId !== "ALL";

  const selectedBuilding =
    buildingId === "ALL"
      ? null
      : (buildingOptions.find((b) => b.id === buildingId) ?? null);

  const selectedRoom =
    roomId === "ALL"
      ? null
      : (roomOptions.find((r) => r.id === roomId) ?? null);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-lg shadow-gray-200/20 backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/40 dark:shadow-none">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search reports..."
                className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-10 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              Building
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={buildingId === "ALL" ? "ALL" : String(buildingId)}
                onChange={(e) =>
                  handleBuildingChange(
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value),
                  )
                }
                className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-gray-300 bg-white pl-11 pr-10 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:border-blue-500"
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

          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              Room
            </label>
            <div className="relative">
              <DoorOpen className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={roomId === "ALL" ? "ALL" : String(roomId)}
                onChange={(e) =>
                  handleRoomChange(
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value),
                  )
                }
                disabled={buildingId === "ALL"}
                className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-gray-300 bg-white pl-11 pr-10 text-sm text-gray-800 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:border-blue-500 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
              >
                <option value="ALL">
                  {buildingId === "ALL" ? "Select building first" : "All rooms"}
                </option>
                {roomOptions.map((room) => (
                  <option key={room.id} value={String(room.id)}>
                    {room.roomName}
                    {room.buildingName ? ` - ${room.buildingName}` : ""}
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

          <div className="flex items-end md:col-span-1">
            <button
              type="button"
              onClick={onReset}
              disabled={!hasActiveFilters}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 dark:hover:bg-gray-700/50"
              title="Clear all filters"
            >
              <RotateCcw className="h-4 w-4 transition-transform group-hover:rotate-180" />
              <span className="hidden text-sm font-semibold xl:inline">
                Reset
              </span>
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Active Filters:
            </span>

            {q && (
              <div className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                <Search className="h-3 w-3" />
                <span>Search: "{q}"</span>
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="ml-1 rounded p-0.5 hover:bg-blue-200 dark:hover:bg-blue-500/30"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {selectedBuilding && (
              <div className="inline-flex items-center gap-2 rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                <Building2 className="h-3 w-3" />
                <span>{selectedBuilding.buildingName}</span>
                <button
                  type="button"
                  onClick={() => handleBuildingChange("ALL")}
                  className="ml-1 rounded p-0.5 hover:bg-purple-200 dark:hover:bg-purple-500/30"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {selectedRoom && (
              <div className="inline-flex items-center gap-2 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-500/20 dark:text-green-300">
                <DoorOpen className="h-3 w-3" />
                <span>{selectedRoom.roomName}</span>
                <button
                  type="button"
                  onClick={() => handleRoomChange("ALL")}
                  className="ml-1 rounded p-0.5 hover:bg-green-200 dark:hover:bg-green-500/30"
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
