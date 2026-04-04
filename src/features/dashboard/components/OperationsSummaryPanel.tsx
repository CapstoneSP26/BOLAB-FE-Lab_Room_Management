import { Activity, AlertTriangle, Building2 } from "lucide-react";
import type { DashboardStatsDto } from "../types/dashboard.type";
import { ProgressBar } from "./DashboardUiParts";

interface OperationsSummaryPanelProps {
  stats: DashboardStatsDto;
}

export default function OperationsSummaryPanel({
  stats,
}: OperationsSummaryPanelProps) {
  const { incidentReportsInSchedules, labUtilization } = stats;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Incident Reports In Schedules
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              How many incident reports were sent and in how many schedules.
            </p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total incident reports
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {incidentReportsInSchedules.totalIncidentReports}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Affected schedules
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {incidentReportsInSchedules.totalSchedulesWithIncidentReports}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Lab Utilization
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Overall room usage. Lab manager only sees managed rooms.
            </p>
          </div>
          <div className="rounded-xl bg-violet-50 p-3 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Utilization rate
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {labUtilization.utilizationRate.toFixed(1)}%
              </span>
            </div>
            <ProgressBar value={labUtilization.utilizationRate} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Building2 className="h-4 w-4" />
                Rooms in use
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {labUtilization.usedRooms}/{labUtilization.totalRooms}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/60">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Activity className="h-4 w-4" />
                Schedule usage
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {labUtilization.usedSchedules ?? 0}/{labUtilization.totalSchedules ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
