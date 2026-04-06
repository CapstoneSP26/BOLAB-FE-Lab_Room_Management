import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import UserManagementFeature from "../../features/users/components/UserManagementFeature";

export default function UserManagementPage() {
  return (
    <>
      <PageBreadcrumb pageTitle="User Management" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <UserManagementFeature />
      </div>
    </>
  );
}
