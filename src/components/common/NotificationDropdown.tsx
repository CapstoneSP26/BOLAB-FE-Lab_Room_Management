import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../features/notifications/store/notificationStore';
import type { NotificationType } from '../../features/notifications/notification.mapper';

interface NotificationDropdownProps {
  isHomePage?: boolean;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isHomePage = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const startRealtime = useNotificationStore((state) => state.startRealtime);
  const stopRealtime = useNotificationStore((state) => state.stopRealtime);

  useEffect(() => {
    fetchNotifications(1, 10);
    startRealtime();

    return () => {
      stopRealtime();
    };
  }, [fetchNotifications, startRealtime, stopRealtime]);

  useEffect(() => {
    // Polling fallback only when realtime is unavailable.
    const timer = window.setInterval(() => {
      if (!useNotificationStore.getState().isRealtimeConnected) {
        void useNotificationStore.getState().fetchNotifications(1, 10);
      }
    }, 30000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-600';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      case 'success':
        return 'bg-green-100 text-green-600';
      case 'error':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        className={`relative group p-2 rounded-lg transition-colors ${
          isHomePage ? 'hover:bg-white/10' : 'hover:bg-gray-100'
        }`}
        aria-label="Notifications"
        onClick={() => {
          setIsOpen(!isOpen);
          // Mark all as read when opening the dropdown
          if (!isOpen && unreadCount > 0) {
            markAllAsRead();
          }
        }}
      >
        <svg
          className={`w-6 h-6 transition ${
            isHomePage
              ? 'text-white group-hover:text-white/80 drop-shadow-lg'
              : 'text-gray-700 group-hover:text-gray-900'
          }`}
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
          <span
            className={`absolute top-1 right-1 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center shadow-lg ${
              isHomePage ? 'bg-orange-500' : 'bg-orange-600'
            }`}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
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

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-gray-400"
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
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-all ${
                    !notification.isRead ? 'bg-blue-50/50 hover:bg-blue-50' : ''
                  }`}
                  onClick={async () => {
                    await markAsRead(notification.id);
                    setIsOpen(false);
                    navigate(notification.relatedPath ?? '/notifications');
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 mt-1 p-2 rounded-full ${getTypeColor(notification.type)}`}
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
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
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
};
