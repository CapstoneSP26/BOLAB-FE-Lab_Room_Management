import React, { useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  ExternalLink,
  Filter,
  Search,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "../../features/notifications/store/notificationStore";

type FilterMode = "all" | "unread" | "read";

const typeStyles: Record<string, string> = {
  info: "bg-sky-100 text-sky-700 border-sky-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  success: "bg-emerald-100 text-emerald-700 border-emerald-200",
  error: "bg-rose-100 text-rose-700 border-rose-200",
};

const typeAccentStyles: Record<string, string> = {
  info: "border-l-sky-400",
  warning: "border-l-amber-400",
  success: "border-l-emerald-400",
  error: "border-l-rose-400",
};

const typeIconMap = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  error: XCircle,
};

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const removeNotification = useNotificationStore(
    (state) => state.removeNotification,
  );
  const clearReadNotifications = useNotificationStore(
    (state) => state.clearReadNotifications,
  );

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const readCount = notifications.length - unreadCount;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesFilter =
        filterMode === "all" ||
        (filterMode === "unread" && !item.isRead) ||
        (filterMode === "read" && item.isRead);

      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [notifications, filterMode, searchQuery]);

  const displayedUnreadCount = filteredNotifications.filter(
    (item) => !item.isRead,
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-orange-100/60">
      <main className="max-w-6xl mx-auto px-6 lg:px-10 py-8 space-y-6 relative">
        <div className="pointer-events-none absolute -top-8 left-0 h-44 w-44 rounded-full bg-orange-300/30 blur-3xl" />
        <div className="pointer-events-none absolute top-24 right-0 h-56 w-56 rounded-full bg-sky-200/25 blur-3xl" />

        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 lg:p-8 shadow-xl">
          <div className="absolute -right-14 -top-10 h-36 w-36 rounded-full bg-orange-400/30 blur-2xl" />
          <div className="absolute -left-14 -bottom-10 h-36 w-36 rounded-full bg-cyan-400/20 blur-2xl" />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 text-orange-200 px-3 py-1 text-xs font-semibold uppercase tracking-wider border border-white/20">
                <Bell className="w-3.5 h-3.5" />
                Lecturer Notifications
              </p>
              <h1 className="text-3xl lg:text-4xl font-black text-white mt-3">
                Notification Center
              </h1>
              <p className="text-slate-200 mt-1">
                Keep track of booking, attendance, and system activity in one
                focused workspace.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllAsRead}
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-300/60 bg-emerald-400/15 text-emerald-200 font-semibold hover:bg-emerald-400/25 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </button>
              <button
                onClick={clearReadNotifications}
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-rose-300/50 bg-rose-400/15 text-rose-200 font-semibold hover:bg-rose-400/25 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear read
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-slate-300 font-semibold">
                Total
              </p>
              <p className="text-2xl font-black text-white mt-1">
                {notifications.length}
              </p>
            </div>
            <div className="rounded-xl border border-amber-300/40 bg-amber-400/15 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-amber-200 font-semibold">
                Unread
              </p>
              <p className="text-2xl font-black text-amber-100 mt-1">
                {unreadCount}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-300/40 bg-emerald-400/15 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-emerald-200 font-semibold">
                Read
              </p>
              <p className="text-2xl font-black text-emerald-100 mt-1">
                {readCount}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm space-y-4 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
            <div className="relative w-full lg:max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search notifications..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <button
                onClick={() => setFilterMode("all")}
                className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filterMode === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                All ({filteredNotifications.length})
              </button>
              <button
                onClick={() => setFilterMode("unread")}
                className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filterMode === "unread"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
              >
                Unread ({displayedUnreadCount})
              </button>
              <button
                onClick={() => setFilterMode("read")}
                className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filterMode === "read"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  }`}
              >
                Read ({filteredNotifications.length - displayedUnreadCount})
              </button>
            </div>
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold">No notifications found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-xl border border-l-4 p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${typeAccentStyles[notification.type]} ${notification.isRead
                      ? "border-slate-200 bg-white"
                      : "border-orange-200 bg-orange-50/70"
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        {React.createElement(typeIconMap[notification.type], {
                          className: `w-4 h-4 ${notification.isRead ? "text-slate-500" : "text-orange-600"}`,
                        })}
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${typeStyles[notification.type]}`}
                        >
                          {notification.type}
                        </span>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-orange-500" />
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        {notification.time}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {notification.relatedPath && (
                        <button
                          onClick={() =>
                            navigate(notification.relatedPath as string)
                          }
                          className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          Open
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="cursor-pointer px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-xs font-semibold transition-colors"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default NotificationsPage;
