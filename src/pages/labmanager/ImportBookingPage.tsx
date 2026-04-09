import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import ImportBookingFeature from "../../features/booking/components/ImportBookingFeature";

export default function ImportBookingPage() {
  return (
    <>
      <PageBreadcrumb pageTitle="Import Booking" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <ImportBookingFeature />
      </div>
    </>
  );
}
