import { Calendar } from "lucide-react";
import type { TimeFilter } from "../types/dashboard.type";
import { TIME_FILTER_OPTIONS } from "../types/dashboard.type";

interface DashboardTimeFilterProps {
  value: TimeFilter;
  onChange: (filter: TimeFilter) => void;
}

const FILTER_DESCRIPTIONS: Record<TimeFilter, string> = {
  "1d": "Showing data for the last 24 hours.",
  "1w": "Showing data for the last 7 days.",
  "4m": "Showing data for the last 4 months.",
  "8m": "Showing data for the last 8 months.",
  "1y": "Showing data for the last 12 months.",
};

export default function DashboardTimeFilter({
  value,
  onChange,
}: DashboardTimeFilterProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
        <Calendar className="h-4 w-4" />
        <span>Period:</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TIME_FILTER_OPTIONS.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              type="button"
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30 dark:bg-blue-500 dark:shadow-blue-500/20"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-600/50 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 sm:ml-1">
        {FILTER_DESCRIPTIONS[value]}
      </p>
    </div>
  );
}
