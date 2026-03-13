import DashboardMetrics from "../../features/dashboard/components/DashboardMetrics";
import MonthlyBookings from "../../features/dashboard/components/MonthlyBookings";
import CheckinComplianceToday from "../../features/dashboard/components/CheckinComplianceToday";
import StatisticsChart from "../../features/dashboard/components/StatisticsChart";

export default function ManagerDashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <DashboardMetrics />
        <MonthlyBookings />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <CheckinComplianceToday />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      {/* <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div> */}
    </div>
  );
}
