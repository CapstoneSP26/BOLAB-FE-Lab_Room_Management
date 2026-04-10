import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import type { DashboardStatsDto } from "../types/dashboard.type";
import { MetricCard } from "./DashboardUiParts";

interface DashboardMetricsProps {
  stats: DashboardStatsDto;
}

export default function DashboardMetrics({ stats }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="Approved Today"
        value={stats.approvedBookingRequestsToday}
        description="Booking requests approved today."
        icon={<CheckCircle2 className="h-5 w-5" />}
        tone="emerald"
      />

      <MetricCard
        title="Lecturers Creating Requests"
        value={stats.lecturerBookingRequests.length}
        description="Lecturers with at least one request today."
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
