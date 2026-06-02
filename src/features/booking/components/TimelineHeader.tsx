import { ChevronLeft, ChevronRight, RefreshCw, CalendarDays } from "lucide-react";
import { formatDisplayDate } from "../../../utils/date.util";

type Stats = {
  totalPending: number;
  conflictCount: number;
  workshopCount: number;
  practicalCount: number;
  lectureCount: number;
};

type ViewMode = "timeline" | "list";

type Props = {
  title: string;
  subtitle?: string;
  stats: Stats;
  selectedDate: Date;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onRefresh: () => void;
  loading?: boolean;
};

function StatPill({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={`rounded-xl border px-3 py-2 ${tone}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</div>
      <div className="mt-0.5 text-sm font-bold">{value}</div>
    </div>
  );
}

export default function TimelineHeader({
  title,
  subtitle,
  stats,
  selectedDate,
  viewMode,
  onViewModeChange,
  onPrevDay,
  onNextDay,
  onToday,
  onRefresh,
  loading = false,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
              {subtitle ? (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 font-medium dark:bg-gray-700">
              {formatDisplayDate(selectedDate)}
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              Timeline Control Center
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onPrevDay}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-200"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <button
            type="button"
            onClick={onToday}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-200"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onNextDay}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-200"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatPill label="Pending" value={stats.totalPending} tone="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-500/10 dark:text-amber-200" />
        <StatPill label="Conflicts" value={stats.conflictCount} tone="border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-500/10 dark:text-red-200" />
        <StatPill label="Workshop" value={stats.workshopCount} tone="border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-500/10 dark:text-rose-200" />
        <StatPill label="Practical" value={stats.practicalCount} tone="border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-500/10 dark:text-orange-200" />
        <StatPill label="Lecture" value={stats.lectureCount} tone="border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-500/10 dark:text-blue-200" />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onViewModeChange("timeline")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${viewMode === "timeline"
            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
            }`}
        >
          Timeline View
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("list")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${viewMode === "list"
            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
            }`}
        >
          List View
        </button>
      </div>
    </div>
  );
}
