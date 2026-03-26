import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Filter,
  X,
  RefreshCw,
  Calendar,
  TrendingUp,
} from "lucide-react";

import BookingRequestReviewModal from "./BookingRequestReviewModal";
import HistoryBookingTable from "./HistoryBookingTable";
import HistoryBookingFilter from "./HistoryBookingFilter";

import {
  getBookingRequestHistory,
  getBuildingOptions,
  getRoomOptions,
  getBookingRequestById,
  updateBookingRequestStatus,
  getBookingStatusLookup,
} from "../api/bookingRequestApi";

import type {
  Booking,
  HistoryStatus,
  BookingStatusLookupItem,
} from "../types/schedule.type";
import type { Building } from "../../building/types/building.type";
import type { Room } from "../../labroom/types/room.type";

const normText = (s: unknown) =>
  String(s ?? "")
    .trim()
    .toLowerCase();

export default function HistoryBookingFeature() {
  const [loading, setLoading] = useState(true);
  const [lookupLoading, setLookupLoading] = useState(true);

  const [items, setItems] = useState<Booking[]>([]);
  const [buildingOptions, setBuildingOptions] = useState<Building[]>([]);
  const [roomOptions, setRoomOptions] = useState<Room[]>([]);
  const [statusOptions, setStatusOptions] = useState<BookingStatusLookupItem[]>(
    [],
  );

  const [q, setQ] = useState("");
  const [building, setBuilding] = useState<string>("ALL");
  const [roomId, setRoomId] = useState<number | "ALL">("ALL");
  const [status, setStatus] = useState<HistoryStatus>("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);

  const [showFilters, setShowFilters] = useState(false);

  const closeModal = () => {
    setOpen(false);
    setSelected(null);
  };

  const loadLookups = useCallback(async () => {
    setLookupLoading(true);
    try {
      const [buildingsResult, roomsResult, statusesResult] =
        await Promise.allSettled([
          getBuildingOptions(),
          getRoomOptions(),
          getBookingStatusLookup(),
        ]);

      setBuildingOptions(
        buildingsResult.status === "fulfilled" ? buildingsResult.value : [],
      );

      setRoomOptions(
        roomsResult.status === "fulfilled" ? roomsResult.value : [],
      );

      setStatusOptions(
        statusesResult.status === "fulfilled" &&
          Array.isArray(statusesResult.value?.data)
          ? statusesResult.value.data
          : [],
      );
    } finally {
      setLookupLoading(false);
    }
  }, []);

  const handleView = async (b: Booking) => {
    if (!b.Id) return;

    const detail = await getBookingRequestById(b.Id);
    setSelected(detail.data);
    setOpen(true);
  };

  const handleApprove = async () => {
    if (!selected?.Id) return;

    await updateBookingRequestStatus(selected.Id, {
      status: "APPROVED",
    });

    await reload();
    closeModal();
  };

  const handleReject = async () => {
    if (!selected?.Id) return;

    await updateBookingRequestStatus(selected.Id, {
      status: "REJECTED",
    });

    await reload();
    closeModal();
  };

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBookingRequestHistory({
        startDate: from || undefined,
        endDate: to || undefined,
        labRoomId: roomId === "ALL" ? undefined : roomId,
        buildingName: building === "ALL" ? undefined : building,
        keyword: q.trim() || undefined,
        status: status === "ALL" ? undefined : status,
      });

      setItems(Array.isArray(data?.data) ? data.data : []);
    } finally {
      setLoading(false);
    }
  }, [from, to, roomId, building, q, status]);

  useEffect(() => {
    void loadLookups();
  }, [loadLookups]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const filteredRoomOptions = useMemo(() => {
    if (building === "ALL") return roomOptions;

    return roomOptions.filter(
      (room) => normText(room.building) === normText(building),
    );
  }, [roomOptions, building]);

  useEffect(() => {
    if (roomId === "ALL") return;

    const stillExists = filteredRoomOptions.some((room) => room.id === roomId);
    if (!stillExists) {
      setRoomId("ALL");
    }
  }, [filteredRoomOptions, roomId]);

  const rows = useMemo(() => {
    return [...items].sort((a, b) =>
      (b.StartTime ?? "").localeCompare(a.StartTime ?? ""),
    );
  }, [items]);

  const hasActiveFilters = useMemo(() => {
    return (
      q.trim() !== "" ||
      building !== "ALL" ||
      roomId !== "ALL" ||
      status !== "ALL" ||
      from !== "" ||
      to !== ""
    );
  }, [q, building, roomId, status, from, to]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (q.trim() !== "") count++;
    if (building !== "ALL") count++;
    if (roomId !== "ALL") count++;
    if (status !== "ALL") count++;
    if (from !== "") count++;
    if (to !== "") count++;
    return count;
  }, [q, building, roomId, status, from, to]);

  const clearAllFilters = () => {
    setQ("");
    setBuilding("ALL");
    setRoomId("ALL");
    setStatus("ALL");
    setFrom("");
    setTo("");
  };

  // Calculate stats
  const stats = useMemo(() => {
    const approved = items.filter(
      (item) => normText(item.BookingStatus) === "approved",
    ).length;
    const rejected = items.filter(
      (item) => normText(item.BookingStatus) === "rejected",
    ).length;
    const pending = items.filter(
      (item) => normText(item.BookingStatus) === "pending",
    ).length;

    return {
      total: items.length,
      approved,
      rejected,
      pending,
      approvalRate:
        items.length > 0 ? Math.round((approved / items.length) * 100) : 0,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-gray-50 to-blue-50/30 p-6 shadow-sm dark:border-gray-700 dark:from-gray-800/50 dark:via-gray-800/30 dark:to-blue-900/10">
        <div className="flex flex-col gap-6">
          {/* Title Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Booking History
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  View and manage all booking records and history
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={reload}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard
              label="Total Records"
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
              color="green"
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
              label="Pending"
              value={stats.pending}
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              color="amber"
            />
            <StatCard
              label="Approval Rate"
              value={`${stats.approvalRate}%`}
              icon={<TrendingUp className="h-5 w-5" />}
              color="purple"
            />
          </div>
        </div>
      </div>

      {/* Collapsible Filter Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800/50">
        {/* Filter Header */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 text-left transition-all hover:from-gray-100 hover:to-gray-200/50 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50 dark:hover:from-gray-700 dark:hover:to-gray-700/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm transition-all dark:bg-gray-700 ${
                  showFilters ? "rotate-180" : "rotate-0"
                }`}
              >
                <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Advanced Filters
                </h3>
              </div>

              {hasActiveFilters && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-500/10 dark:text-blue-400">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {activeFilterCount} Active
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAllFilters();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <X className="h-3 w-3" />
                  Clear All
                </button>
              )}

              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {showFilters ? "Hide" : "Show"} Filters
              </span>
            </div>
          </div>
        </button>

        {/* Filter Content */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            showFilters
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-gray-200 p-6 dark:border-gray-700">
              <HistoryBookingFilter
                q={q}
                onQ={setQ}
                building={building}
                onBuilding={setBuilding}
                buildingOptions={buildingOptions}
                roomId={roomId}
                onRoomId={setRoomId}
                roomOptions={filteredRoomOptions}
                status={status}
                onStatus={setStatus}
                statusOptions={statusOptions}
                from={from}
                onFrom={setFrom}
                to={to}
                onTo={setTo}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-700">
                <svg
                  className="h-5 w-5 text-gray-600 dark:text-gray-300"
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
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  History Records
                </h3>
                {hasActiveFilters && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Showing filtered results
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {rows.length > 0 && (
                <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  <svg
                    className="h-4 w-4 text-gray-400"
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
                  {rows.length} {rows.length === 1 ? "record" : "records"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <HistoryBookingTable
            loading={loading || lookupLoading}
            rows={rows}
            onView={handleView}
          />
        </div>
      </div>

      <BookingRequestReviewModal
        open={open}
        booking={selected}
        onClose={closeModal}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: "blue" | "green" | "red" | "amber" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    green:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    red: "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    amber:
      "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    purple:
      "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white/50 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/30">
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${colorClasses[color]}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {label}
        </div>
        <div className="mt-0.5 text-xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
      </div>
    </div>
  );
}
