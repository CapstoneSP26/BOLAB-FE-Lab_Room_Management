import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import {
  NOTIFICATION_QUERY_KEYS,
  useMarkAllReadNotifications,
  useMarkAsReadNotification,
  useNotifications,
} from "../hooks/useNotifications";
import type { NotificationItem } from "../types/notification.type";
import {
  getNotificationFallbackRoute,
  getTypeBadgeClass,
  getTypeDotClass,
  openNotificationTarget,
} from "../utils/notificationMenu.util";
import { getErrorMessage } from "../../../utils/error";
import { useSignalRListener } from "../../../hooks/useSignalRListener";

export default function NotificationMenu() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const notificationsQuery = useNotifications({
    pageNumber: 1,
    pageSize: 8,
  });

  const markAllReadMutation = useMarkAllReadNotifications();
  const markAsReadMutation = useMarkAsReadNotification();

  const notifications = notificationsQuery.data?.items ?? [];
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const notifying = unreadCount > 0;

  const closeDropdown = () => setDropdownOpen(false);

  const markReadInCache = (ids?: string[]) => {
    queryClient.setQueriesData(
      { queryKey: [NOTIFICATION_QUERY_KEYS.LIST] },
      (data: unknown) => {
        const payload = data as { items?: NotificationItem[] } | undefined;
        if (!payload?.items) return data;

        const nextItems = payload.items.map((item) => {
          if (!ids) {
            return { ...item, isRead: true };
          }

          return ids.includes(item.id) ? { ...item, isRead: true } : item;
        });

        return {
          ...payload,
          items: nextItems,
        };
      },
    );
  };

  const toggleDropdown = () => {
    const nextOpen = !dropdownOpen;

    if (nextOpen) {
      void notificationsQuery.refetch();
    }

    if (nextOpen && unreadCount > 0) {
      markReadInCache();
      markAllReadMutation.mutate();
    }

    setDropdownOpen(nextOpen);
  };

  const getTypeColor = (type: NotificationItem["type"]) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-600";
      case "warning":
        return "bg-yellow-100 text-yellow-600";
      case "success":
        return "bg-green-100 text-green-600";
      case "error":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  useSignalRListener("notification.created", () => {
    queryClient.invalidateQueries({
      queryKey: [NOTIFICATION_QUERY_KEYS.LIST],
    });
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const el = dropdownRef.current;
      if (!el) return;
      if (event.target instanceof Node && !el.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleItemClick = (notification: NotificationItem) => {
    closeDropdown();

    if (!notification.isRead) {
      markReadInCache([notification.id]);
      markAsReadMutation.mutate(notification.id);
    }

    openNotificationTarget(navigate, notification);
  };

  const handleViewAllClick = () => {
    closeDropdown();
    navigate(getNotificationFallbackRoute());
  };

  const errorMessage = notificationsQuery.isError
    ? getErrorMessage(notificationsQuery.error, "Cannot load notifications.")
    : null;

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        type="button"
        className="relative group p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Notifications"
        onClick={toggleDropdown}
      >
        <svg
          className="w-6 h-6 transition text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center shadow-lg bg-orange-600">
            {unreadCount}
          </span>
        )}

        {unreadCount === 0 && notifying && (
          <span className="absolute top-1.5 right-1.5 z-[1] h-2 w-2 rounded-full bg-orange-400" />
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999] dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-900 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  markReadInCache();
                  markAllReadMutation.mutate();
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-500/10"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {notificationsQuery.isLoading ? (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                Loading notifications...
              </div>
            ) : errorMessage ? (
              <div className="m-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-500/10 dark:text-rose-300">
                {errorMessage}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-gray-400 dark:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="font-medium">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-all dark:hover:bg-gray-800/50 ${
                    !notification.isRead
                      ? "bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-500/5"
                      : ""
                  }`}
                  onClick={() => handleItemClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 mt-1 p-2 rounded-full ${getTypeColor(
                        notification.type,
                      )}`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-sm font-semibold truncate ${
                            !notification.isRead
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2 dark:text-gray-400">
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {notification.timeLabel}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-900 dark:border-gray-800">
            <button
              type="button"
              onClick={handleViewAllClick}
              className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-500/10"
            >
              <span>View all notifications</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
