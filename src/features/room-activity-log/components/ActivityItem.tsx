import type { Activity } from "../type";
import { formatTime } from "../../../utils/labmanager/format";

export function ActivityItem({
  activity,
  config,
  isLast,
}: {
  activity: Activity;
  config: { label: string; icon: string; color: string; bgColor: string };
  isLast: boolean;
}) {
  return (
    <div className="relative flex gap-4">
      {!isLast && (
        <div className="absolute left-5 top-12 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
      )}

      <div
        className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${config.bgColor}`}
      >
        <span className="text-lg">{config.icon}</span>
      </div>

      <div className="flex-1 pb-2">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className={`text-sm font-semibold ${config.color}`}>
                  {config.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(activity.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-900 dark:text-white">
                {activity.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2 py-1 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {activity.userName}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2 py-1 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {activity.roomName}
            </span>
            <span className="rounded-lg bg-white px-2 py-1 font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {activity.buildingName}
            </span>
          </div>

          {activity.details && (
            <div className="mt-3 space-y-1 border-t border-gray-200 pt-3 dark:border-gray-700">
              {activity.details.startTime && activity.details.endTime && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Time slot:</span>{" "}
                  {new Date(activity.details.startTime).toLocaleString()} -{" "}
                  {new Date(activity.details.endTime).toLocaleTimeString()}
                </p>
              )}
              {activity.details.previousStatus &&
                activity.details.newStatus && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Status changed:</span>{" "}
                    {activity.details.previousStatus} →{" "}
                    {activity.details.newStatus}
                  </p>
                )}
              {activity.details.reason && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Reason:</span>{" "}
                  {activity.details.reason}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
