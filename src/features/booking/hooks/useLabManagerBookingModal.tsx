import { useCallback, useMemo, useState } from "react";
import BookingRequestModal from "../components/BookingRequestReviewModal";
import {
  getBookingRequestByScheduleId,
  updateBookingRequestStatus,
} from "../api/bookingRequestApi";
import type { BookingRequest } from "../types/booking.type";
import type { EventClickArg } from "@fullcalendar/core";

type Role = "ADMIN" | "LAB_MANAGER" | "LECTURER" | "STUDENT";

const getRole = (): Role =>
  (localStorage.getItem("role") as Role) || "LAB_MANAGER";

export function useLabManagerBookingModal() {
  const role = useMemo(() => getRole(), []);
  const isLabManager = role === "LAB_MANAGER";

  const [open, setOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(
    null,
  );
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null,
  );

  const closeModal = useCallback(() => {
    setOpen(false);
    setSelectedBooking(null);
    setSelectedScheduleId(null);
    setLoadingDetail(false);
  }, []);

  const onEventClick = useCallback(
    async (clickInfo: EventClickArg) => {
      if (!isLabManager) return;

      const scheduleId = clickInfo.event.id;
      setSelectedScheduleId(scheduleId);
      setOpen(true);
      setLoadingDetail(true);

      try {
        const response = await getBookingRequestByScheduleId(scheduleId);
        setSelectedBooking(response.data);
      } finally {
        setLoadingDetail(false);
      }
    },
    [isLabManager],
  );

  const approve = useCallback(
    async (bookingId: string) => {
      if (!selectedScheduleId) return null;
      const response = await updateBookingRequestStatus(bookingId, {
        status: "APPROVED",
      });
      closeModal();
      return { scheduleId: selectedScheduleId, booking: response.data };
    },
    [selectedScheduleId, closeModal],
  );

  const reject = useCallback(
    async (bookingId: string) => {
      if (!selectedScheduleId) return null;

      const response = await updateBookingRequestStatus(bookingId, {
        status: "REJECTED",
      });

      closeModal();
      return { scheduleId: selectedScheduleId, booking: response.data };
    },
    [selectedScheduleId, closeModal],
  );

  const renderModal = useCallback(
    (onUpdated: (scheduleId: string, booking: BookingRequest) => void) => {
      if (!isLabManager) return null;

      return (
        <BookingRequestModal
          open={open}
          booking={selectedBooking}
          loading={loadingDetail}
          onClose={closeModal}
          onApprove={async (id) => {
            const res = await approve(id);
            if (res) onUpdated(res.scheduleId, res.booking);
          }}
          onReject={async (id) => {
            const res = await reject(id);
            if (res) onUpdated(res.scheduleId, res.booking);
          }}
        />
      );
    },
    [
      isLabManager,
      open,
      selectedBooking,
      loadingDetail,
      closeModal,
      approve,
      reject,
    ],
  );

  return { onEventClick, renderModal, isLabManager };
}
//đang cho labmanager click vào schedule để xem detail booking, approve/reject booking request
