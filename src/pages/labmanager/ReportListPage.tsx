import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import ReportListFeature from "../../features/reports/ReportListFeature";

export default function ReportListPage() {
  return (
    <>
      <PageBreadcrumb pageTitle="Report List" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <ReportListFeature />
      </div>
    </>
  );
}
