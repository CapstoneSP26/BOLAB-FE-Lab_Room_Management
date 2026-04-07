import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import ImportUserFeature from "../../features/user/components/ImportUserFeature";

export default function ImportUserPage() {
  return (
    <>
      <PageBreadcrumb pageTitle="Import Users" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <ImportUserFeature />
      </div>
    </>
  );
}
