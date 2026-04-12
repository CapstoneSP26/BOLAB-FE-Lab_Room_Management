import type {
  NotificationItem,
  NotificationType,
} from "../types/notification.type";

export const getTypeBadgeClass = (type: NotificationType) => {
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

export const getTypeDotClass = (type: NotificationType) => {
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

export const getNotificationFallbackRoute = () => "/labmanager/dashboard";

export const openNotificationTarget = (
  navigate: (path: string) => void,
  notification: NotificationItem,
) => {
  const target = notification.referencePath || getNotificationFallbackRoute();

  if (/^https?:\/\//i.test(target)) {
    window.location.href = target;
    return;
  }

  navigate(target);
};
