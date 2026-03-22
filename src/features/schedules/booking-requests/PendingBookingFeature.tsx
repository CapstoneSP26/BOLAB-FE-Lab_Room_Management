import { useEffect, useMemo, useState } from "react";

import BookingRequestReviewModal from "../booking-requests/components/BookingRequestReviewModal";
import BookingFilters from "../booking-requests/components/BookingRequestFilter";
import BookingTable from "./components/BookingRequestTable";

import {
  getBookingRequests,
  updateBookingRequestStatus,
} from "../api/bookingRequestApi";
import type { Booking } from "../type";

type SortKey = "Old_slot" | "New_slot" | "Out_slot";

// Helper function to get building from room ID
const getBuildingFromRoom = (roomId: number): string => {
  if (roomId >= 100 && roomId < 200) return "Building A";
  if (roomId >= 200 && roomId < 300) return "Building B";
  if (roomId >= 300 && roomId < 400) return "Building C";
  return "Other";
};

export default function PendingBookingFeature() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Booking[]>([]);

  const [q, setQ] = useState("");
  const [roomId, setRoomId] = useState<number | "ALL">("ALL");
  const [building, setBuilding] = useState<string>("ALL");
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
      const data = await getBookingRequests({ status: "PENDING" });
      setItems(Array.isArray(data?.data) ? data.data : []);
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

  // NEW: Calculate building options from rooms
  const buildingOptions = useMemo(() => {
    const buildings = new Set<string>();
    roomOptions.forEach((room) => {
      const buildingName = getBuildingFromRoom(room);
      if (buildingName !== "Other") {
        buildings.add(buildingName);
      }
    });
    return Array.from(buildings).sort();
  }, [roomOptions]);

  const rows = useMemo(() => {
    const normalizedQ = q.trim().toLowerCase();
    let arr = [...items];

    // Building filter
    if (building !== "ALL") {
      arr = arr.filter((b) => {
        const itemBuilding = getBuildingFromRoom(b.LabRoomId);
        return itemBuilding === building;
      });
    }

    // Room filter
    if (roomId !== "ALL") {
      arr = arr.filter((b) => b.LabRoomId === roomId);
    }

    // Search filter
    if (normalizedQ) {
      arr = arr.filter((b) => {
        const hay = [
          b.Id,
          String(b.LabRoomId),
          b.BookedByUserId,
          b.Reason,
          b.PurposeTypeName,
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(normalizedQ);
      });
    }

    // Sort
    if (sort === "Old_slot") {
      arr.sort((a, b) => (b.CreatedAt ?? "").localeCompare(a.CreatedAt ?? ""));
    } else if (sort === "New_slot") {
      arr.sort((a, b) => a.StartTime.localeCompare(b.StartTime));
    } else {
      arr.sort((a, b) => a.LabRoomId - b.LabRoomId);
    }

    return arr;
  }, [items, q, building, roomId, sort]);

  const approve = async (id: string) => {
    const ok = window.confirm("Approve this booking?");
    if (!ok) return;
    await updateBookingRequestStatus(id, { status: "APPROVED" });
    setItems((prev) => prev.filter((x) => x.Id !== id));
    closeModal();
  };

  const reject = async (id: string) => {
    const ok = window.confirm("Reject this booking?");
    if (!ok) return;
    await updateBookingRequestStatus(id, { status: "REJECTED" });
    setItems((prev) => prev.filter((x) => x.Id !== id));
    closeModal();
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/10">
                <svg
                  className="h-6 w-6 text-amber-600 dark:text-amber-400"
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
                  Pending Requests
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Review and manage booking requests awaiting approval
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-800 dark:bg-amber-900/20">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-200 dark:bg-amber-800">
                <span className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  {rows.length}
                </span>
              </div>
              <div>
                <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  Pending
                </div>
                <div className="text-xs text-amber-700 dark:text-amber-300">
                  Requests
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

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <QuickStat
            label="Total Items"
            value={items.length}
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
            color="blue"
          />
          <QuickStat
            label="Filtered Results"
            value={rows.length}
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
          <QuickStat
            label="Active Rooms"
            value={roomOptions.length}
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            }
            color="green"
          />
          <QuickStat
            label="Buildings"
            value={buildingOptions.length}
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            }
            color="gray"
          />
        </div>
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
        <BookingFilters<SortKey>
          q={q}
          onQ={setQ}
          roomId={roomId}
          onRoomId={setRoomId}
          building={building}
          onBuilding={setBuilding}
          sort={sort}
          onSort={setSort}
          roomOptions={roomOptions}
          buildingOptions={buildingOptions}
        />
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        {loading && items.length === 0 ? (
          <LoadingSkeleton />
        ) : rows.length === 0 && items.length === 0 ? (
          <EmptyState
            title="No Pending Requests"
            description="There are no pending booking requests at the moment."
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
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
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Booking Requests ({rows.length})
              </h3>
            </div>
            <BookingTable
              loading={loading}
              rows={rows}
              emptyText="No pending requests."
              onView={(b) => {
                setSelected(b);
                setOpen(true);
              }}
              onApprove={approve}
              onReject={reject}
            />
          </div>
        )}
      </div>

      {/* Help Card */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
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
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              Quick Tips
            </h4>
            <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-300">
              <li>• Click on any row to view detailed information</li>
              <li>
                • Use filters to narrow down results by building, room or sort
                order
              </li>
              <li>• Approve or reject requests directly from the table</li>
            </ul>
          </div>
        </div>
      </div>

      <BookingRequestReviewModal
        open={open}
        booking={selected}
        onClose={closeModal}
        onApprove={approve}
        onReject={reject}
      />
    </div>
  );
}

// Helper Components
function QuickStat({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: "blue" | "purple" | "green" | "gray";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    purple:
      "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
    green:
      "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
    gray: "bg-gray-50 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400",
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
