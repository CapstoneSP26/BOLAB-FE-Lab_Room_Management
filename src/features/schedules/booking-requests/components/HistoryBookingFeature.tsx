import { useEffect, useMemo, useState } from "react";

import BookingRequestReviewModal from "./BookingRequestReviewModal";
import HistoryBookingTable from "./HistoryBookingTable";
import HistoryBookingFilter from "./HistoryBookingFilter";

import { getBookingRequestHistory, getRoomOptions } from "../../api/bookingRequestApi";
import type { Booking } from "../../type";

type HistoryStatus = "ALL" | "APPROVED" | "REJECTED";

export default function HistoryBookingFeature() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Booking[]>([]);

  const [q, setQ] = useState("");
  const [roomId, setRoomId] = useState<number | "ALL">("ALL");
  const [roomOptions, setRoomOptions] = useState<number[]>([]);
  const [status, setStatus] = useState<HistoryStatus>("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);

  const closeModal = () => {
    setOpen(false);
    setSelected(null);
  };

  const reload = async () => {
    setLoading(true);
    try {
      const data = await getBookingRequestHistory({
        page,
        limit,
        status: status === "ALL" ? "all" : status.toLowerCase(),
        startDate: from ? `${from}T00:00:00.000Z` : undefined,
        endDate: to ? `${to}T23:59:59.999Z` : undefined,
        labRoomId: roomId === "ALL" ? undefined : roomId,
      });

      setItems(data?.data ?? []);
      setTotal(Number(data?.total ?? 0));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, [status, from, to, roomId, page]);

  useEffect(() => {
    const loadRoomOptions = async () => {
      try {
        const rooms = await getRoomOptions();
        const roomIds = rooms
          .map((r) => Number(r.id))
          .filter((id) => Number.isFinite(id))
          .sort((a, b) => a - b);

        setRoomOptions(Array.from(new Set(roomIds)));
      } catch {
        setRoomOptions([]);
      }
    };

    void loadRoomOptions();
  }, []);


  const rows = useMemo(() => {
    const normalizedQ = q.trim().toLowerCase().replace(/^#/, "");
    let arr = [...(items ?? [])];

    if (normalizedQ) {
      arr = arr.filter((b) => {
        const start = b.StartTime ? new Date(b.StartTime) : null;
        const end = b.EndTime ? new Date(b.EndTime) : null;

        const hay = [
          b.Id,
          String(b.LabRoomId),
          `room ${String(b.LabRoomId)}`,
          (b as Booking & { roomName?: string }).roomName,
          (b as Booking & { buildingName?: string }).buildingName,
          b.BookedByUserId,
          b.Reason,
          b.PurposeTypeName,
          String(b.BookingStatus),
          start && !Number.isNaN(start.getTime())
            ? `${String(start.getDate()).padStart(2, "0")}/${String(start.getMonth() + 1).padStart(2, "0")}/${start.getFullYear()}`
            : "",
          start && !Number.isNaN(start.getTime())
            ? `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`
            : "",
          end && !Number.isNaN(end.getTime())
            ? `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`
            : "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .replace(/^#/, "");

        return hay.includes(normalizedQ);
      });
    }

    arr.sort((a, b) => (b.StartTime ?? "").localeCompare(a.StartTime ?? ""));
    return arr;
  }, [items, q]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    setPage(1);
  }, [status, from, to, roomId]);

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

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-200 pt-4 text-sm dark:border-gray-700">
            <div className="text-gray-600 dark:text-gray-400">
              Page {page} / {totalPages} • Total {total}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={loading || page <= 1}
                className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={loading || page >= totalPages}
                className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
              >
                Next
              </button>
            </div>
          </div>
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
