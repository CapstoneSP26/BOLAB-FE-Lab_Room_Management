import { useEffect, useMemo, useState } from "react";

import BookingRequestReviewModal from "../booking-requests/components/BookingRequestReviewModal";
import HistoryBookingTable from "./components/HistoryBookingTable";
import HistoryBookingFilter from "./components/HistoryBookingFilter";

import { bookingRequestsService } from "../../../services/labmanager/bookingRequest.service";
import type { Booking } from "../../../services/labmanager/bookingRequest.service";

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
  const [from, setFrom] = useState(""); // YYYY-MM-DD
  const [to, setTo] = useState(""); // YYYY-MM-DD

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);

  const closeModal = () => {
    setOpen(false);
    setSelected(null);
  };

  const reload = async () => {
    setLoading(true);
    try {
      const data = await bookingRequestsService.listHistory();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const roomOptions = useMemo(() => {
    const set = new Set<number>();
    items.forEach((b) => set.add(b.LabRoomId));
    return Array.from(set).sort((a, b) => a - b);
  }, [items]);

  const rows = useMemo(() => {
    const normalizedQ = q.trim().toLowerCase();
    let arr = [...items];

    // status
    if (status !== "ALL") {
      arr = arr.filter((b) => norm(b.BookingStatus) === status);
    }

    // room
    if (roomId !== "ALL") {
      arr = arr.filter((b) => b.LabRoomId === roomId);
    }

    // date range theo StartTime
    arr = arr.filter((b) => inDateRange(b.StartTime, from, to));

    // search
    if (normalizedQ) {
      arr = arr.filter((b) => {
        const hay = [
          b.Id,
          String(b.LabRoomId),
          b.BookedByUserId,
          b.Reason,
          String(b.PurposeTypeId),
          String(b.BookingStatus),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(normalizedQ);
      });
    }

    // sort: mới nhất trước theo StartTime
    arr.sort((a, b) => (b.StartTime ?? "").localeCompare(a.StartTime ?? ""));
    return arr;
  }, [items, q, roomId, status, from, to]);

  // const stats = useMemo(() => {
  //   const approved = rows.filter((b) => norm(b.BookingStatus) === "APPROVED");
  //   const rejected = rows.filter((b) => norm(b.BookingStatus) === "REJECTED");

  //   return {
  //     total: items.length,
  //     filtered: rows.length,
  //     approved: approved.length,
  //     rejected: rejected.length,
  //   };
  // }, [items.length, rows]);

  return (
    <div className="space-y-6">
      {/* ... phần header + stat của bạn giữ nguyên ... */}

      {/* Filters Card */}
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

      {/* Table Card */}
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

      {/* Modal: VIEW ONLY */}
      <BookingRequestReviewModal
        open={open}
        booking={selected}
        onClose={closeModal}
        // history không approve/reject nữa
        onApprove={() => {}}
        onReject={() => {}}
      />
    </div>
  );
}
