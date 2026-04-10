import { DatabaseZap } from "lucide-react";
import DashboardMetrics from "../../features/dashboard/components/DashboardMetrics";
import LecturerBookingRequestsPanel from "../../features/dashboard/components/LecturerBookingRequestsPanel";
import OperationsSummaryPanel from "../../features/dashboard/components/OperationsSummaryPanel";
import RoomBookingStatsTable from "../../features/dashboard/components/RoomBookingStatsTable";
import { useDashboardStats } from "../../features/dashboard/hooks/useDashboard";
import { LoadingFallback } from "../../components/ui/LoadingFallback";
import { getErrorMessage } from "../../utils/error";

const getDashboardRoleLabel = (role: string) =>
  role === "ADMIN" ? "Admin" : "Lab Manager";

export default function ManagerDashboard() {
  const { data, isLoading, error } = useDashboardStats();

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
  const roleLabel = getDashboardRoleLabel(stats.scope);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-slate-50 to-blue-50 p-6 shadow-sm dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm dark:bg-white/10 dark:text-gray-300">
              <DatabaseZap className="h-3.5 w-3.5" />
              {roleLabel} Dashboard
            </div>
            <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
              Operational overview for booking, incidents, and room usage
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
              Approved booking requests today, lecturer request volume, incident
              reports by schedule, lab utilization, and room-by-room booking
              statistics.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800/70">
            <p className="text-gray-500 dark:text-gray-400">Data source</p>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">
              {stats.dataSource === "legacy"
                ? "Legacy dashboard API"
                : "Dashboard overview API"}
            </p>
          </div>
        </div>
      </section>

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
  );
}
