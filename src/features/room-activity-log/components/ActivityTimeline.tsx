import type { Activity } from "../type";
import { activityTypeConfig } from "../activityTypeConfig";
import { ActivityItem } from "./ActivityItem";

export function ActivityTimeline({
  groupedActivities,
  hasActiveFilters,
}: {
  groupedActivities: Record<string, Activity[]>;
  hasActiveFilters: boolean;
}) {
  const entries = Object.entries(groupedActivities);

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="p-12 text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            No activities found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {hasActiveFilters
              ? "Try adjusting your filters to see more results"
              : "Activity logs will appear here"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {entries.map(([date, dateActivities]) => (
          <div key={date} className="p-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
              {date}
            </h3>
            <div className="space-y-4">
              {dateActivities.map((a, idx) => (
                <ActivityItem
                  key={a.id}
                  activity={a}
                  config={activityTypeConfig[a.type]}
                  isLast={idx === dateActivities.length - 1}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
