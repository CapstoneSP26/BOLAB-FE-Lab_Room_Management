import React, { type ReactNode } from "react";
import type { Report } from "../types/report.type";
import { formatDate, getRelativeTime } from "../../../utils/formatDate";

interface TimelineItemProps {
  report: Report;
}

interface QuickInfoProps {
  report: Report;
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon: ReactNode;
}

interface ContentCardProps {
  title: string;
  icon: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
}

interface InfoRowProps {
  report: Report;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ report }) => {
  const items = [
    {
      key: "created",
      show: true,
      title: "Report Created",
      time: formatDate(report.createdAt),
      user: report.createdBy,
      color: "blue" as const,
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
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
    },
    {
      key: "updated",
      show: Boolean(report.updatedAt && report.updatedAt !== report.createdAt),
      title: "Report Updated",
      time: formatDate(report.updatedAt ?? report.createdAt),
      user: report.updatedBy,
      color: "purple" as const,
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
    },
    {
      key: "resolved",
      show: report.isResolved,
      title: "Report Resolved",
      time: formatDate(report.updatedAt ?? report.createdAt),
      user: report.updatedBy,
      color: "green" as const,
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
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
  ].filter((item) => item.show);

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    purple:
      "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
    green:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  };

  const lineColor = {
    blue: "bg-blue-200 dark:bg-blue-800",
    purple: "bg-purple-200 dark:bg-purple-800",
    green: "bg-emerald-200 dark:bg-emerald-800",
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={item.key} className="relative flex gap-3">
            {!isLast && (
              <div
                className={`absolute left-4 top-8 h-full w-0.5 ${lineColor[item.color]}`}
              />
            )}

            <div
              className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${colorClasses[item.color]}`}
            >
              {item.icon}
            </div>

            <div className="flex-1 pt-0.5">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {item.title}
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {item.time}
              </div>
              {item.user && (
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  by <span className="font-medium">{item.user}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const QuickInfo: React.FC<QuickInfoProps> = ({ report }) => {
  const items = [
    {
      label: "Created",
      value: formatDate(report.createdAt),
      sublabel: getRelativeTime(report.createdAt),
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
    },
    {
      label: "Last Updated",
      value: report.updatedAt ? formatDate(report.updatedAt) : "-",
      sublabel: report.updatedAt ? getRelativeTime(report.updatedAt) : null,
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
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white/50 p-3 dark:border-gray-700 dark:bg-gray-800/30"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {item.icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {item.label}
            </div>
            <div className="mt-0.5 truncate text-sm font-semibold text-gray-900 dark:text-white">
              {item.value}
            </div>
            {item.sublabel && (
              <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {item.sublabel}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-96 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700"
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
            >
              <div className="h-14 animate-pulse bg-gray-100 dark:bg-gray-800" />
              <div className="space-y-3 p-6">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50"
            >
              <div className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
}) => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-12 dark:border-gray-700 dark:bg-gray-800/30">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
};

export const ContentCard: React.FC<ContentCardProps> = ({
  title,
  icon,
  badge,
  children,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm dark:bg-gray-700 dark:text-gray-300">
              {icon}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          {badge && <div>{badge}</div>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

export const InfoRow: React.FC<InfoRowProps> = ({ report }) => {
  const items = [
    { label: "User", value: report.userName ?? "-" },
    { label: "Report Type", value: report.reportType || "-" },
    { label: "Room", value: report.roomName || "-" },
    { label: "Building", value: report.buildingName || "-" },
    { label: "Reason", value: report.reason || "-" },
    { label: "Status", value: report.isResolved ? "Resolved" : "Pending" },
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between gap-4 text-sm"
        >
          <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};
