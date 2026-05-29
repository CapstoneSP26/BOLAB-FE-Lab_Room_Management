import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import AdminGroupManagementFeature from "../../features/groups/components/AdminGroupManagementFeature";

export default function GroupManagementPage() {
  return (
    <>
      <PageBreadcrumb pageTitle="Groups Management" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <AdminGroupManagementFeature />
      </div>
    </>
  );
}
