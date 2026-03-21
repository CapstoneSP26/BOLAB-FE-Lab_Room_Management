import { useEffect, useMemo, useState } from "react";

import BookingRequestReviewModal from "../booking-requests/components/BookingRequestReviewModal";
import HistoryBookingTable from "./components/HistoryBookingTable";
import HistoryBookingFilter from "./components/HistoryBookingFilter";

import { getBookingRequestHistory } from "../api/bookingRequestApi";
import type { Booking } from "../type";

type HistoryStatus = "ALL" | "APPROVED" | "REJECTED";
const norm = (s: unknown) => String(s ?? "").toUpperCase();

function inDateRange(startIso: string, from: string, to: string) {
  if (!from && !to) return true;

  const t = new Date(startIso).getTime();
  if (Number.isNaN(t)) return true;

  const fromT = from ? new Date(`${from}T00:00:00`).getTime() : -Infinity;
  const toT = to ? new Date(`${to}T23:59:59`).getTime() : Infinity;
  return t >= fromT && t <= toT;
}

export default function HistoryBookingFeature() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Booking[]>([]);

  const [q, setQ] = useState("");
  const [roomId, setRoomId] = useState<number | "ALL">("ALL");
  const [status, setStatus] = useState<HistoryStatus>("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);

  const closeModal = () => {
    setOpen(false);
    setSelected(null);
  };

  const reload = async () => {
    setLoading(true);
    try {
      const data = await getBookingRequestHistory();
      console.log("booking history response =", data);
      setItems(data?.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const roomOptions = useMemo(() => {
    const set = new Set<number>();
    (items ?? []).forEach((b) => set.add(b.LabRoomId));
    return Array.from(set).sort((a, b) => a - b);
  }, [items]);

  const rows = useMemo(() => {
    const normalizedQ = q.trim().toLowerCase();
    let arr = [...(items ?? [])];

    if (status !== "ALL") {
      arr = arr.filter((b) => norm(b.BookingStatus) === status);
    }

    if (roomId !== "ALL") {
      arr = arr.filter((b) => b.LabRoomId === roomId);
    }

    arr = arr.filter((b) => inDateRange(b.StartTime, from, to));

    if (normalizedQ) {
      arr = arr.filter((b) => {
        const hay = [
          b.Id,
          String(b.LabRoomId),
          b.BookedByUserId,
          b.Reason,
          b.PurposeTypeName,
          String(b.BookingStatus),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(normalizedQ);
      });
    }

    arr.sort((a, b) => (b.StartTime ?? "").localeCompare(a.StartTime ?? ""));
    return arr;
  }, [items, q, roomId, status, from, to]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Filters & Search
          </h3>
        </div>

        <HistoryBookingFilter
          q={q}
          onQ={setQ}
          roomId={roomId}
          onRoomId={setRoomId}
          roomOptions={roomOptions}
          status={status}
          onStatus={setStatus}
          from={from}
          onFrom={setFrom}
          to={to}
          onTo={setTo}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            History Records ({rows.length})
          </h3>
        </div>

        <div className="p-6">
          <HistoryBookingTable
            loading={loading}
            rows={rows}
            onView={(b) => {
              setSelected(b);
              setOpen(true);
            }}
          />
        </div>
      </div>

      <BookingRequestReviewModal
        open={open}
        booking={selected}
        onClose={closeModal}
        onApprove={() => {}}
        onReject={() => {}}
      />
    </div>
  );
}
