import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useNotificationsList } from "../../../features/notifications/hooks/useNotificationsList";
import type {
  NotificationItem,
  NotificationType,
} from "../../../features/notifications/types/notification.type";
import { getErrorMessage } from "../../../utils/error";

const getTypeBadgeClass = (type: NotificationType) => {
  switch (type) {
    case "success":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
    case "warning":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
    case "error":
      return "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300";
    case "info":
    default:
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300";
  }
};

const getTypeDotClass = (type: NotificationType) => {
  switch (type) {
    case "success":
      return "bg-emerald-500";
    case "warning":
      return "bg-amber-500";
    case "error":
      return "bg-rose-500";
    case "info":
    default:
      return "bg-blue-500";
  }
};

const getFallbackRoute = () => "/labmanager/dashboard";

const openNotificationTarget = (
  navigate: ReturnType<typeof useNavigate>,
  notification: NotificationItem,
) => {
  const target = notification.referencePath || getFallbackRoute();

  if (/^https?:\/\//i.test(target)) {
    window.location.href = target;
    return;
  }

  navigate(target);
};

export default function NotificationMenu() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const notificationsQuery = useNotificationsList({
    pageNumber: 1,
    pageSize: 8,
  });

  const notifications = notificationsQuery.data?.items ?? [];
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const notifying = unreadCount > 0;

  const closeDropdown = () => setDropdownOpen(false);

  const toggleDropdown = () => {
    setDropdownOpen((value) => !value);
  };

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
    openNotificationTarget(navigate, notification);
  };

  const handleViewAllClick = () => {
    closeDropdown();
    navigate(getFallbackRoute());
  };

  const errorMessage = notificationsQuery.isError
    ? getErrorMessage(notificationsQuery.error, "Cannot load notifications.")
    : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-dark-900 h-11 w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <span
          className={[
            "absolute right-0 top-0.5 z-[1] h-2 w-2 rounded-full bg-orange-400",
            notifying ? "flex" : "hidden",
          ].join(" ")}
        >
          <span className="absolute -z-[1] inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
        </span>

        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
          />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0">
          <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
            <div>
              <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Notification
              </h5>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {unreadCount} unread
              </p>
            </div>

            <button
              type="button"
              onClick={closeDropdown}
              className="text-gray-500 dark:text-gray-400"
              aria-label="Close"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                />
              </svg>
            </button>
          </div>

          <ul className="custom-scrollbar flex h-auto flex-col overflow-y-auto">
            {notificationsQuery.isLoading ? (
              <li className="rounded-lg p-4 text-sm text-gray-500 dark:text-gray-400">
                Loading notifications...
              </li>
            ) : errorMessage ? (
              <li className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-500/10 dark:text-rose-300">
                {errorMessage}
              </li>
            ) : notifications.length === 0 ? (
              <li className="rounded-lg p-4 text-sm text-gray-500 dark:text-gray-400">
                No notifications found.
              </li>
            ) : (
              notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(notification)}
                    className={`flex w-full items-start gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 text-left hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${
                      notification.isRead ? "" : "bg-blue-50/50 dark:bg-blue-500/5"
                    }`}
                  >
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <span
                        className={`h-3 w-3 rounded-full ${getTypeDotClass(notification.type)}`}
                      />
                    </span>

                    <span className="block min-w-0 flex-1">
                      <span className="mb-1 flex items-start justify-between gap-2">
                        <span className="block min-w-0">
                          <span className="block truncate text-sm font-semibold text-gray-800 dark:text-white/90">
                            {notification.title}
                          </span>
                          <span className="mt-1 block line-clamp-2 text-theme-sm text-gray-500 dark:text-gray-400">
                            {notification.message}
                          </span>
                        </span>

                        {!notification.isRead && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                        )}
                      </span>

                      <span className="flex items-center gap-2 text-theme-xs text-gray-500 dark:text-gray-400">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${getTypeBadgeClass(notification.type)}`}
                        >
                          {notification.type}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-gray-400" />
                        <span>{notification.timeLabel}</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>

          <button
            type="button"
            className="mt-3 flex justify-center rounded-lg border border-gray-300 bg-white p-3 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            onClick={handleViewAllClick}
          >
            Back To Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
