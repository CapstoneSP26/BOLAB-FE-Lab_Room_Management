import { useEffect, useMemo, useState } from "react";

import BookingRequestModal from "./components/BookingRequestModal";
import HistoryBookingTable from "../booking-requests/components/HistoryBookingtable";
import BookingFilters from "../../schedules/booking-requests/components/BookingRequestFilter";

import { bookingRequestsService } from "../../../services/labmanager/bookingRequest.service";
import type { Booking } from "../../../services/labmanager/bookingRequest.service";

type SortKey = "Old_slot" | "New_slot" | "Out_slot";

const norm = (s: unknown) => String(s ?? "").toUpperCase();

export default function HistoryBookingFeature() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Booking[]>([]);

  const [q, setQ] = useState("");
  const [roomId, setRoomId] = useState<number | "ALL">("ALL");
  const [sort, setSort] = useState<SortKey>("Old_slot");

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

    if (roomId !== "ALL") arr = arr.filter((b) => b.LabRoomId === roomId);

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

    if (sort === "Old_slot") {
      arr.sort((a, b) => (b.UpdatedAt ?? "").localeCompare(a.UpdatedAt ?? ""));
    } else if (sort === "New_slot") {
      arr.sort((a, b) => a.StartTime.localeCompare(b.StartTime));
    } else {
      arr.sort((a, b) => a.LabRoomId - b.LabRoomId);
    }

    return arr;
  }, [items, q, roomId, sort]);

  // Calculate statistics
  const stats = useMemo(() => {
    const approved = rows.filter((b) => norm(b.BookingStatus) === "APPROVED");
    const rejected = rows.filter((b) => norm(b.BookingStatus) === "REJECTED");

    return {
      total: items.length,
      filtered: rows.length,
      approved: approved.length,
      rejected: rejected.length,
    };
  }, [items, rows]);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700">
                <svg
                  className="h-6 w-6 text-gray-600 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Booking History
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  View all previously processed booking requests
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-700/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-600">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-200">
                  {rows.length}
                </span>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Total
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  Records
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={reload}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <svg
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total History"
            value={stats.total}
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
            color="blue"
          />
          <StatCard
            label="Approved"
            value={stats.approved}
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            color="emerald"
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            color="red"
          />
          <StatCard
            label="Filtered View"
            value={stats.filtered}
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            }
            color="purple"
          />
        </div>

        {/* Approval Rate */}
        {stats.total > 0 && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/30">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Approval Rate
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {Math.round((stats.approved / stats.total) * 100)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                style={{
                  width: `${(stats.approved / stats.total) * 100}%`,
                }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>{stats.approved} approved</span>
              <span>{stats.rejected} rejected</span>
            </div>
          </div>
        )}
      </div>

      {/* Filters Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="mb-4 flex items-center gap-2">
          <svg
            className="h-5 w-5 text-gray-600 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Filters & Search
          </h3>
        </div>
        <BookingFilters
          q={q}
          onQ={setQ}
          roomId={roomId}
          onRoomId={setRoomId}
          sort={sort}
          onSort={setSort}
          roomOptions={roomOptions}
        />
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        {loading && items.length === 0 ? (
          <LoadingSkeleton />
        ) : rows.length === 0 && items.length === 0 ? (
          <EmptyState
            title="No History Records"
            description="There are no processed booking requests in the history."
            icon={
              <svg
                className="h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No Results Found"
            description="Try adjusting your filters or search query."
            icon={
              <svg
                className="h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />
        ) : (
          <div className="overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  History Records ({rows.length})
                </h3>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Approved: {stats.approved}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Rejected: {stats.rejected}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <HistoryBookingTable
              loading={loading}
              rows={rows}
              onView={(b) => {
                setSelected(b);
                setOpen(true);
              }}
            />
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/30">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              About History
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              This page shows all booking requests that have been approved or
              rejected. Click on any row to view detailed information about past
              decisions.
            </p>
          </div>
        </div>
      </div>

      <BookingRequestModal
        open={open}
        booking={selected}
        onClose={closeModal}
        onApprove={async (id) => {
          await bookingRequestsService.approve(id);
          closeModal();
          reload();
        }}
        onReject={async (id) => {
          await bookingRequestsService.reject(id);
          closeModal();
          reload();
        }}
      />
    </div>
  );
}

// Helper Components
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "red" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    purple:
      "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700/30">
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${colorClasses[color]}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {label}
        </div>
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          {value}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      {icon}
      <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6">
      <div className="space-y-4">
        <div className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
