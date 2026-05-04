import type { ReactNode } from "react";

export interface ReportStatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: ReactNode;
}

export function getReportStatusConfig(isResolved: boolean): ReportStatusConfig {
  return isResolved
    ? {
        label: "Resolved",
        bgColor: "bg-emerald-100 dark:bg-emerald-500/10",
        textColor: "text-emerald-700 dark:text-emerald-400",
        borderColor: "border-emerald-200 dark:border-emerald-800",
        icon: (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      }
    : {
        label: "Pending",
        bgColor: "bg-amber-100 dark:bg-amber-500/10",
        textColor: "text-amber-700 dark:text-amber-400",
        borderColor: "border-amber-200 dark:border-amber-800",
        icon: (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      };
}
