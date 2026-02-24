import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import LabCalendar from "../../features/calendar/LabCalendar";

export default function LabSchedulerPage() {
  const currentPageTitle = "Calendar";

  return (
    <>
      <PageBreadcrumb pageTitle={currentPageTitle} />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <LabCalendar />
      </div>
    </>
  );
}
