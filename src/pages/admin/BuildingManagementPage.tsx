import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import BuildingManagementFeature from "../../features/building/components/BuildingManagementFeature";

export default function BuildingManagementPage() {
  return (
    <>
      <PageBreadcrumb pageTitle="Buildings Management" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <BuildingManagementFeature />
      </div>
    </>
  );
}

