import { useState, useRef } from "react";
import { FileDown, Loader2 } from "lucide-react";
import DashboardMetrics from "../../features/dashboard/components/DashboardMetrics";
import LecturerBookingRequestsPanel from "../../features/dashboard/components/LecturerBookingRequestsPanel";
import OperationsSummaryPanel from "../../features/dashboard/components/OperationsSummaryPanel";
import RoomBookingStatsTable from "../../features/dashboard/components/RoomBookingStatsTable";
import DashboardTimeFilter from "../../features/dashboard/components/DashboardTimeFilter";
import { useDashboardStats } from "../../features/dashboard/hooks/useDashboard";
import {
  type TimeFilter,
  getDateRangeFromFilter,
} from "../../features/dashboard/types/dashboard.type";
import { exportDashboardPdf } from "../../features/dashboard/utils/exportDashboardPdf";
import { LoadingFallback } from "../../components/ui/LoadingFallback";
import { getErrorMessage } from "../../utils/error";

const PERIOD_LABELS: Record<TimeFilter, string> = {
  "1d": "Today",
  "1w": "Last 7 Days",
  "4m": "Last 4 Months",
  "8m": "Last 8 Months",
  "1y": "Last 12 Months",
};

export default function ManagerDashboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("1d");
  const [exporting, setExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const dateRange = getDateRangeFromFilter(timeFilter);
  const { data, isLoading, error } = useDashboardStats(dateRange);

  const handleExportPdf = async () => {
    if (!dashboardRef.current) return;
    setExporting(true);
    try {
      // Give the element a stable id for the utility
      dashboardRef.current.id = "dashboard-print-area";
      await exportDashboardPdf({
        elementId: "dashboard-print-area",
        fileName: `bolab-dashboard-${timeFilter}-${dateRange.startDate}-to-${dateRange.endDate}.pdf`,
        period: PERIOD_LABELS[timeFilter],
      });
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-200">
        <h2 className="text-lg font-semibold">Unable to load dashboard</h2>
        <p className="mt-2 text-sm">
          {getErrorMessage(
            error,
            "Backend dashboard API is unavailable or returned an invalid response.",
          )}
        </p>
      </div>
    );
  }

  const stats = data;

  return (
    <div className="space-y-6">
      {/* ─── Header card ──────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-slate-50 to-blue-50 p-6 shadow-sm dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
              Operational Overview —{" "}
              <span className="text-blue-600 dark:text-blue-400">
                {PERIOD_LABELS[timeFilter]}
              </span>
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
              Approved booking requests, lecturer request volume, incident
              reports by schedule, lab utilization, and room-by-room booking
              statistics.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 lg:items-end">
            {/* Data source badge */}
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800/70">
              <p className="text-gray-500 dark:text-gray-400">Data source</p>
              <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                {stats.dataSource === "legacy"
                  ? "Legacy dashboard API"
                  : "Dashboard overview API"}
              </p>
            </div>

            {/* Export PDF button */}
            <button
              onClick={handleExportPdf}
              disabled={exporting}
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition-all hover:bg-blue-100 hover:text-blue-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting…
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  Export PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* ─── Time filter bar ──────────────────────────────────────── */}
        <div className="mt-5 rounded-xl border border-gray-200/70 bg-white/70 px-4 py-3 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/40">
          <DashboardTimeFilter value={timeFilter} onChange={setTimeFilter} />
        </div>
      </section>

      {/* ─── Printable content area ───────────────────────────────────── */}
      <div ref={dashboardRef} className="space-y-6">
        <DashboardMetrics stats={stats} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <LecturerBookingRequestsPanel stats={stats} />
          </div>
          <div className="xl:col-span-2">
            <OperationsSummaryPanel stats={stats} />
          </div>
        </div>

        <RoomBookingStatsTable stats={stats} />
      </div>
    </div>
  );
}
