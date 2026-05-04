import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import HistoryBookingFeature from "../../features/booking/components/HistoryBookingFeature";

export default function BookingRequestsHistoryPage() {
  return (
    <>
      <PageBreadcrumb pageTitle="Booking Requests" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <HistoryBookingFeature />
      </div>
    </>
  );
}
