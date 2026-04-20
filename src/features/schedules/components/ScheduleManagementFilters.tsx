import { Building2, DoorOpen, Filter } from "lucide-react";
import type {
  GetSchedulesFilters,
  ScheduleStatus,
  ScheduleType,
} from "../types/schedule.type";
import type { BuildingDto } from "../../building/types/building.type";
import type { LabRoomDto } from "../../labroom/types/room.type";

type Props = {
  values: GetSchedulesFilters;
  onChange: (next: GetSchedulesFilters) => void;
  buildingOptions: BuildingDto[];
  roomOptions: LabRoomDto[];

  showFilters: boolean;
  onToggleFilters: () => void;
  activeFilterCount: number;
  onReset?: () => void;
};

const STATUS_OPTIONS: { value: ScheduleStatus | ""; label: string }[] = [
  { value: "", label: "All status" },
  { value: "Active", label: "Active" },
  { value: "InProcess", label: "In Process" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

const TYPE_OPTIONS: { value: ScheduleType | ""; label: string }[] = [
  { value: "", label: "All types" },
  { value: "Academic", label: "Academic" },
  { value: "Personal", label: "Personal" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Examination", label: "Examination" },
  { value: "Event", label: "Event" },
];

export default function ScheduleManagementFilters({
  values,
  onChange,
  buildingOptions,
  roomOptions,

  showFilters,
  onToggleFilters,
  activeFilterCount,
  onReset,
}: Props) {
  const patch = (partial: Partial<GetSchedulesFilters>) =>
    onChange({ ...values, ...partial });

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
          <div className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Building
            </span>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={String(values.buildingId)}
                onChange={(e) => {
                  const val =
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value);
                  patch({ buildingId: val, labRoomId: "ALL" });
                }}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-gray-900 shadow-sm outline-none transition-all focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="ALL">All buildings</option>
                {buildingOptions.map((b) => (
                  <option key={String(b.id)} value={b.id}>
                    {b.buildingName}
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
                value={String(values.labRoomId)}
                onChange={(e) => {
                  const val =
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value);
                  patch({ labRoomId: val });
                }}
                disabled={values.buildingId === "ALL"}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-8 text-gray-900 shadow-sm outline-none transition-all focus:border-brand-500 disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:disabled:bg-gray-700/50"
              >
                <option value="ALL">
                  {values.buildingId === "ALL"
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
              From (occurs after)
            </span>
            <input
              type="date"
              value={values.fromDate}
              onChange={(e) => patch({ fromDate: e.target.value })}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              To (ends before)
            </span>
            <input
              type="date"
              value={values.toDate}
              onChange={(e) => patch({ toDate: e.target.value })}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Status
            </span>
            <select
              value={values.status}
              onChange={(e) =>
                patch({ status: e.target.value as ScheduleStatus | "" })
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

          <label className="flex flex-col gap-1.5 text-sm md:col-span-2 lg:col-span-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Schedule type
            </span>
            <select
              value={values.scheduleType}
              onChange={(e) =>
                patch({ scheduleType: e.target.value as ScheduleType | "" })
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={String(opt.value)} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
    </div>
  );
}