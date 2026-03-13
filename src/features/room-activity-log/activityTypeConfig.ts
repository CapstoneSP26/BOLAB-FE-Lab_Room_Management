import type { ActivityType } from "./type";

export const activityTypeConfig: Record<
  ActivityType,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  BOOKING_CREATED: {
    label: "Booking Created",
    icon: "📝",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-500/10",
  },
  BOOKING_APPROVED: {
    label: "Booking Approved",
    icon: "✅",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-500/10",
  },
  BOOKING_REJECTED: {
    label: "Booking Rejected",
    icon: "❌",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-500/10",
  },
  SCHEDULE_CREATED: {
    label: "Schedule Created",
    icon: "➕",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-500/10",
  },
  SCHEDULE_UPDATED: {
    label: "Schedule Updated",
    icon: "✏️",
    color: "text-indigo-700 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-500/10",
  },
  SCHEDULE_DELETED: {
    label: "Schedule Deleted",
    icon: "🗑️",
    color: "text-gray-700 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-500/10",
  },
};
