import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  useMarkAllReadNotifications,
  useMarkAsReadNotification,
  useNotifications,
} from "../../features/notifications/hooks/useNotifications";
import { openNotificationTarget } from "../../features/notifications/utils/notificationMenu.util";

export default function ManagerNotificationsPage() {
  const navigate = useNavigate();

  const notificationsQuery = useNotifications({
    pageNumber: 1,
    pageSize: 50,
  });

  const markAllReadMutation = useMarkAllReadNotifications();
  const markAsReadMutation = useMarkAsReadNotification();

  const notifications = notificationsQuery.data?.items ?? [];

  useEffect(() => {
    if (notifications.length > 0) {
      markAllReadMutation.mutate();
    }
    // Intentionally only run when list changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications.length]);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Notifications
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Latest activity updates for lab manager.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || notifications.length === 0}
          >
            Mark all as read
          </button>
        </div>

        {notificationsQuery.isLoading ? (
          <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
            Loading notifications...
          </div>
        ) : notificationsQuery.isError ? (
          <div className="p-6 text-sm text-rose-700 dark:text-rose-300">
            Cannot load notifications.
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No notifications found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                  notification.isRead ? "" : "bg-blue-50/40 dark:bg-blue-500/5"
                }`}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsReadMutation.mutate(notification.id);
                  }

                  openNotificationTarget(navigate, notification);
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {notification.message}
                    </div>
                  </div>

                  {!notification.isRead && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                  )}
                </div>

                <div className="text-xs text-gray-400">{notification.timeLabel}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
