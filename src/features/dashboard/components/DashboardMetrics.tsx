import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import type { DashboardStatsDto, TimeFilter } from "../types/dashboard.type";
import { MetricCard } from "./DashboardUiParts";

interface DashboardMetricsProps {
  stats: DashboardStatsDto;
  timeFilter?: TimeFilter;
}

export default function DashboardMetrics({ stats, timeFilter = "1d" }: DashboardMetricsProps) {
  const getPeriodText = (filter: TimeFilter) => {
    switch (filter) {
      case "1w": return "7 days";
      case "4m": return "4 months";
      case "8m": return "8 months";
      case "1y": return "1 year";
      case "1d":
      default: return "today";
    }
  };

  const getCapitalizedPeriodText = (filter: TimeFilter) => {
    switch (filter) {
      case "1w": return "7 Days";
      case "4m": return "4 Months";
      case "8m": return "8 Months";
      case "1y": return "1 Year";
      case "1d":
      default: return "Today";
    }
  };

  const periodText = getPeriodText(timeFilter);
  const capitalizedPeriodText = getCapitalizedPeriodText(timeFilter);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title={`Approved ${capitalizedPeriodText}`}
        value={stats.approvedBookingRequestsToday}
        description={`Booking requests approved ${periodText}.`}
        icon={<CheckCircle2 className="h-5 w-5" />}
        tone="emerald"
      />

      <MetricCard
        title="Lecturers Creating Requests"
        value={stats.lecturerBookingRequests.length}
        description={`Lecturers with at least one request ${periodText}.`}
        icon={<GraduationCap className="h-5 w-5" />}
        tone="blue"
      />

      <MetricCard
        title="Incident Reports / Schedules"
        value={`${stats.incidentReportsInSchedules.totalIncidentReports} / ${stats.incidentReportsInSchedules.totalSchedulesWithIncidentReports}`}
        description="Reports sent across schedules."
        icon={<AlertTriangle className="h-5 w-5" />}
        tone="amber"
      />

      <MetricCard
        title="Lab Utilization"
        value={`${stats.labUtilization.utilizationRate.toFixed(1)}%`}
        description={`${stats.labUtilization.usedRooms}/${stats.labUtilization.totalRooms} room(s) in use.`}
        icon={<Activity className="h-5 w-5" />}
        tone="violet"
      />
    </div>
  );
}
