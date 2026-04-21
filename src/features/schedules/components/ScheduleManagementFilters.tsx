import { Building2, DoorOpen, Filter } from "lucide-react";
import type {
  ScheduleStatus,
} from "../types/schedule.type";
import type { BuildingDto } from "../../building/types/building.type";
import type { LabRoomDto } from "../../labroom/types/room.type";

type Props = {
  buildingId: number | "ALL";
  onBuildingId: (id: number | "ALL") => void;
  labRoomId: number | "ALL";
  onLabRoomId: (id: number | "ALL") => void;
  status: ScheduleStatus | "";
  onStatus: (status: ScheduleStatus | "") => void;
  fromDate: string;
  onFromDate: (date: string) => void;
  toDate: string;
  onToDate: (date: string) => void;
  q: string;
  onQ: (val: string) => void;

  buildingOptions: BuildingDto[];
  roomOptions: LabRoomDto[];

  showFilters: boolean;
  onToggleFilters: () => void;
  onReset?: () => void;
};

const STATUS_OPTIONS: { value: ScheduleStatus | ""; label: string }[] = [
  { value: "", label: "All status" },
  { value: "Active", label: "Active" },
  { value: "InProcess", label: "In Process" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];
export default function ScheduleManagementFilters({
  buildingId,
  onBuildingId,
  labRoomId,
  onLabRoomId,
  status,
  onStatus,
  fromDate,
  onFromDate,
  toDate,
  onToDate,
  q,
  onQ,

  buildingOptions,
  roomOptions,

  showFilters,
  onToggleFilters,
  onReset,
}: Props) {
  const activeFilterCount = [
    buildingId !== "ALL",
    labRoomId !== "ALL",
    status !== "",
    fromDate !== "",
    toDate !== "",
    q.trim() !== "",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onToggleFilters}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 ? (
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
              {activeFilterCount}
            </span>
          ) : null}
        </button>

        {showFilters && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Clear Filters
          </button>
        )}
      </div>

      {showFilters ? (
        <div className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-white/[0.03] md:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Search
            </span>
            <input
              type="text"
              value={q}
              onChange={(e) => onQ(e.target.value)}
              placeholder="Search subject, lecturer..."
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </label>

          <div className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Building
            </span>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={String(buildingId)}
                onChange={(e) => {
                  const val =
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value);
                  onBuildingId(val);
                  onLabRoomId("ALL");
                }}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-gray-900 shadow-sm outline-none transition-all focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="ALL">All buildings</option>
                {buildingOptions.map((b) => (
                  <option key={String(b.id)} value={b.id}>
                    {b.buildingName || (b as any).name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Lab room
            </span>
            <div className="relative">
              <DoorOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={String(labRoomId)}
                onChange={(e) => {
                  const val =
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value);
                  onLabRoomId(val);
                }}
                disabled={buildingId === "ALL"}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-gray-900 shadow-sm outline-none transition-all focus:border-brand-500 disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:disabled:bg-gray-700/50"
              >
                <option value="ALL">
                  {buildingId === "ALL"
                    ? "Select building first"
                    : "All rooms"}
                </option>
                {roomOptions.map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    {r.roomName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Status
            </span>
            <select
              value={status}
              onChange={(e) =>
                onStatus(e.target.value as ScheduleStatus | "")
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={String(opt.value)} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              From (occurs after)
            </span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => onFromDate(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              To (ends before)
            </span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => onToDate(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
