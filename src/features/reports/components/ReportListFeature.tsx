import { useCallback, useEffect, useMemo, useState } from "react";
import type { Report, ReportResolvedFilter } from "../types/report.type";
import {
  getFilteredReports,
  getUnresolvedReports,
  resolveReport,
} from "../api/reportApi";
import ReportListFilters from "./ReportListFilters";
import ReportListTable from "./ReportListTable";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
export default function ReportListFeature() {
  const nav = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Report[]>([]);

  const [reportType, setReportType] = useState<string | "ALL">("ALL");
  const [resolved, setResolved] = useState<ReportResolvedFilter>("UNRESOLVED");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data =
        resolved === "UNRESOLVED"
          ? await getUnresolvedReports({
              q,
            })
          : await getFilteredReports({
              q,
              status: resolved,
            });

      const reports = Array.isArray(data?.data?.reports)
        ? data.data.reports
        : [];

      let next = reports;

      if (reportType !== "ALL") {
        next = next.filter((r) => r.ReportType === reportType);
      }

      if (from) {
        const fromTime = new Date(`${from}T00:00:00`).getTime();
        next = next.filter((r) => new Date(r.CreatedAt).getTime() >= fromTime);
      }

      if (to) {
        const toTime = new Date(`${to}T23:59:59`).getTime();
        next = next.filter((r) => new Date(r.CreatedAt).getTime() <= toTime);
      }

      setItems(next);
    } finally {
      setLoading(false);
    }
  }, [resolved, q, reportType, from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(() => items, [items]);

  const stats = useMemo(() => {
    const resolvedCount = rows.filter((r) => r.IsResolved).length;
    const unresolvedCount = rows.filter((r) => !r.IsResolved).length;

    const typeBreakdown: Record<string, number> = {};
    rows.forEach((r) => {
      const type = r.ReportType || "Unknown";
      typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;
    });

    const resolutionRate =
      rows.length > 0 ? Math.round((resolvedCount / rows.length) * 100) : 0;

    return {
      total: rows.length,
      resolved: resolvedCount,
      unresolved: unresolvedCount,
      resolutionRate,
      typeBreakdown,
    };
  }, [rows]);

  const onToggleResolved = async (id: string, next: boolean) => {
    if (!next) return;

    const updated = await resolveReport(id);

    setItems((prev) => prev.filter((x) => x.Id !== updated.Id));
  };

  const hasActiveFilters =
    reportType !== "ALL" ||
    resolved !== "UNRESOLVED" ||
    q.trim() !== "" ||
    from !== "" ||
    to !== "";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/10">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Issue Reports
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  View and manage all reported issues and problems
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <svg
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
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
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Reports"
            value={stats.total}
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
            color="blue"
          />
          <StatCard
            label="Resolved"
            value={stats.resolved}
            icon={
              <svg
                className="h-5 w-5"
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
            }
            color="emerald"
          />
          <StatCard
            label="PendingApproval"
            value={stats.unresolved}
            icon={
              <svg
                className="h-5 w-5"
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
            }
            color="amber"
          />
          <StatCard
            label="Resolution Rate"
            value={`${stats.resolutionRate}%`}
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
            color="purple"
          />
        </div>

        {stats.total > 0 && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/30">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Resolution Progress
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {stats.resolved} / {stats.total}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                style={{ width: `${stats.resolutionRate}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>{stats.unresolved} pending</span>
              <span>{stats.resolutionRate}% complete</span>
            </div>
          </div>
        )}

        {Object.keys(stats.typeBreakdown).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(stats.typeBreakdown).map(([type, count]) => (
              <div
                key={type}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 dark:border-gray-700 dark:bg-gray-800"
              >
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {type}
                </span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-600 transition-all hover:bg-gray-100 active:scale-95 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                aria-label={showFilters ? "Hide filters" : "Show filters"}
              >
                {showFilters ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>

              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-gray-600 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Filters & Search
                </h3>
              </div>

              {hasActiveFilters && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                  <svg
                    className="h-3 w-3"
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
                  Active
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {showFilters ? "Hide" : "Show"} Filters
            </button>
          </div>
        </div>

        <div
          className={`transition-all duration-300 ease-in-out ${
            showFilters
              ? "max-h-[1000px] opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="border-t border-gray-200 p-6 dark:border-gray-700">
            <ReportListFilters
              reportType={reportType}
              onReportType={setReportType}
              resolved={resolved}
              onResolved={setResolved}
              q={q}
              onQ={setQ}
              from={from}
              to={to}
              onFrom={setFrom}
              onTo={setTo}
              onReset={() => {
                setReportType("ALL");
                setResolved("UNRESOLVED");
                setQ("");
                setFrom("");
                setTo("");
              }}
              onGenerate={load}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        {loading && items.length === 0 ? (
          <LoadingSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No Reports Found"
            description={
              hasActiveFilters
                ? "No reports match your current filters. Try adjusting your search criteria."
                : "There are no issue reports at the moment."
            }
            icon={
              <svg
                className="h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          />
        ) : (
          <div className="overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Reports ({rows.length})
                </h3>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Resolved: {stats.resolved}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Pending: {stats.unresolved}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <ReportListTable
              loading={loading}
              rows={rows}
              onView={(id) => nav(`/labmanager/reports/${id}`)}
              onToggleResolved={onToggleResolved}
            />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              Managing Reports
            </h4>
            <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-300">
              <li>
                • Click on any report to view detailed information and images
              </li>
              <li>
                • Use filters to find specific reports by type, status, or date
                range
              </li>
              <li>• Toggle resolution status directly from the table</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "amber" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    purple:
      "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700/30">
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${colorClasses[color]}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {label}
        </div>
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          {value}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      {icon}
      <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6">
      <div className="space-y-4">
        <div className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
