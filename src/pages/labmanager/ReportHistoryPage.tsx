import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import ReportHistoryFeature from "../../features/reports/components/ReportHistoryFeature";

export default function IncidentHistoryPage() {
  return (
    <>
      <PageBreadcrumb pageTitle="Incident History" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <ReportHistoryFeature />
      </div>
    </>
  );
}
