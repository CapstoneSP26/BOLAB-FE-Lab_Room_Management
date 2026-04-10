import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import RoomManagementFeature from "../../features/labroom/components/RoomManagementFeature";

export default function RoomManagementPage() {
  return (
    <>
      <PageBreadcrumb pageTitle="Rooms Management" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <RoomManagementFeature />
      </div>
    </>
  );
}
