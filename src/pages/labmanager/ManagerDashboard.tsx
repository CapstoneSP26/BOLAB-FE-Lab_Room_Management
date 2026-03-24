import { useDashboardStats } from "../../features/dashboard/hooks/useDashboard";
import DashboardMetrics from "../../features/dashboard/components/DashboardMetrics";
import MonthlyBookings from "../../features/dashboard/components/MonthlyBookings";
import CheckinComplianceToday from "../../features/dashboard/components/CheckinComplianceToday";
import StatisticsChart from "../../features/dashboard/components/StatisticsChart";
import { LoadingFallback } from "../../components/ui/LoadingFallback";

export default function ManagerDashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  //const { data: incidents, isLoading: incidentsLoading } = useUnresolvedIncidents();

  if (statsLoading) {
    return <LoadingFallback />;
  }

  if (statsError) {
    return (
      <div className="my-8 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        <h3 className="font-semibold">Failed to load dashboard</h3>
        <p className="mt-1 text-sm">{(statsError as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <DashboardMetrics stats={stats} />
        <MonthlyBookings stats={stats} />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <CheckinComplianceToday stats={stats} />
      </div>

      <div className="col-span-12">
        <StatisticsChart stats={stats} />
      </div>
    </div>
  );
}
