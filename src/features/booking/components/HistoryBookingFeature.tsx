import {
  ChevronDown,
  Filter,
  X,
  RefreshCw,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import BookingRequestReviewModal from "./BookingRequestReviewModal";
import HistoryBookingTable from "./HistoryBookingTable";
import HistoryBookingFilter from "./HistoryBookingFilter";
import { ReportStatCard } from "../../../components/ui/ComponentsParts";
import { bookingRequestApi } from "../api/bookingApi";
import { labroomApi } from "../../labroom/api/labroom.api";
import {
  useBookingRequestDetail,
  useBookingRequestHistory,
  useUpdateBookingStatus,
} from "../hooks/useBookingRequest";
import { buildingApi } from "../../building/api/buildingApi";

import type {
  BookingRequest,
  BookingStatus,
  GetBookingRequestsRequest,
  BookingStatusLookupItem,
} from "../types/booking.type";
import type { BuildingDto } from "../../building/types/building.type";
import type { LabRoomDto } from "../../labroom/types/room.type";

const normText = (s: unknown) =>
  String(s ?? "")
    .trim()
    .toLowerCase();

export default function HistoryBookingFeature() {
  const [lookupLoading, setLookupLoading] = useState(true);
  const [buildingOptions, setBuildingOptions] = useState<BuildingDto[]>([]);
  const [roomOptions, setRoomOptions] = useState<LabRoomDto[]>([]);

  const [statusOptions, setStatusOptions] = useState<BookingStatusLookupItem[]>(
    [],
  );

  const [q, setQ] = useState("");
  const [buildingId, setBuildingId] = useState<number | "ALL">("ALL");
  const [roomId, setRoomId] = useState<number | "ALL">("ALL");
  const [status, setStatus] = useState<BookingStatus>("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const params: GetBookingRequestsRequest = useMemo(
    () => ({
      startDate: from || undefined,
      endDate: to || undefined,
      labRoomId: roomId === "ALL" ? undefined : roomId,
      buildingId: buildingId === "ALL" ? undefined : buildingId,
      keyword: q.trim() || undefined,
      status: status === "All" ? undefined : status,
      page: 1,
      limit: 100,
      sortBy: "RequestedAt",
      isDescending: true,
    }),
    [from, to, roomId, buildingId, q, status],
  );

  const historyQuery = useBookingRequestHistory(params);

  const detailQuery = useBookingRequestDetail({
    id: selectedId ?? undefined,
    enabled: open && !!selectedId,
  });

  const closeModal = () => {
    setOpen(false);
    setSelectedId(null);
  };

  const updateStatusMutation = useUpdateBookingStatus({
    onSuccess: () => {
      closeModal();
      historyQuery.refetch();
    },
  });

  const items = useMemo(
    () => historyQuery.data?.data ?? [],
    [historyQuery.data],
  );
  const totalCount = historyQuery.data?.total ?? items.length;
  const loading = historyQuery.isLoading || historyQuery.isFetching;
  const selected: BookingRequest | null = detailQuery.data?.data ?? null;

  const reload = async () => {
    await historyQuery.refetch();
  };

  const handleView = async (id: string) => {
    if (!id) return;
    setSelectedId(id);
    setOpen(true);
  };

  const handleApprove = async () => {
    if (!selected?.id) return;

    await updateStatusMutation.mutateAsync({
      id: String(selected.id),
      body: { status: "APPROVED" },
    });
  };

  const handleReject = async () => {
    if (!selected?.id) return;

    await updateStatusMutation.mutateAsync({
      id: String(selected.id),
      body: { status: "REJECTED" },
    });
  };

  useEffect(() => {
    const loadLookups = async () => {
      setLookupLoading(true);
      try {
        const [buildingsRes, statusRes] = await Promise.all([
          buildingApi.getBuildings({
            pageNumber: 1,
            pageSize: 100,
          }),
          bookingRequestApi.getBookingStatusLookup(),
        ]);

        setBuildingOptions(buildingsRes.items ?? []);
        setStatusOptions(statusRes.data ?? []);
      } catch {
        setBuildingOptions([]);
        setStatusOptions([]);
      } finally {
        setLookupLoading(false);
      }
    };

    void loadLookups();
  }, []);

  useEffect(() => {
    const loadRoomsByBuilding = async () => {
      if (buildingId === "ALL") {
        setRoomOptions([]);
        setRoomId("ALL");
        return;
      }

      try {
        const rooms = await labroomApi.getRooms({
          buildingId,
          pageNumber: 1,
          pageSize: 100,
          includeBuilding: true,
        });

        setRoomOptions(rooms.items ?? []);
      } catch {
        setRoomOptions([]);
      }
    };

    void loadRoomsByBuilding();
  }, [buildingId]);

  const rows = useMemo(() => items, [items]);

  const hasActiveFilters = useMemo(() => {
    return (
      q.trim() !== "" ||
      buildingId !== "ALL" ||
      roomId !== "ALL" ||
      status !== "All" ||
      from !== "" ||
      to !== ""
    );
  }, [q, buildingId, roomId, status, from, to]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (q.trim() !== "") count++;
    if (buildingId !== "ALL") count++;
    if (roomId !== "ALL") count++;
    if (status !== "All") count++;
    if (from !== "") count++;
    if (to !== "") count++;
    return count;
  }, [q, buildingId, roomId, status, from, to]);

  const clearAllFilters = () => {
    setQ("");
    setBuildingId("ALL");
    setRoomId("ALL");
    setStatus("All");
    setFrom("");
    setTo("");
  };

  const stats = useMemo(() => {
    const approved = items.filter(
      (item) =>
        normText(item.status) === "approved" ||
        normText(item.status) === "accepted",
    ).length;

    const rejected = items.filter(
      (item) => normText(item.status) === "rejected",
    ).length;

    const pending = items.filter(
      (item) =>
        normText(item.status) === "pending" ||
        normText(item.status) === "pendingapproval",
    ).length;

    return {
      total: totalCount,
      approved,
      rejected,
      pending,
      approvalRate:
        totalCount > 0 ? Math.round((approved / totalCount) * 100) : 0,
    };
  }, [items, totalCount]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-gray-50 to-blue-50/30 p-6 shadow-sm dark:border-gray-700 dark:from-gray-800/50 dark:via-gray-800/30 dark:to-blue-900/10">
        <div className="flex flex-col gap-6">
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

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <ReportStatCard
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

            <ReportStatCard
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

            <ReportStatCard
              label="Rejected"
              value={stats.rejected}
              icon={<X className="h-5 w-5" />}
              color="blue"
            />

            <ReportStatCard
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

            <ReportStatCard
              label="Approval Rate"
              value={`${stats.approvalRate}%`}
              icon={<TrendingUp className="h-5 w-5" />}
              color="purple"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800/50">
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
                buildingId={buildingId}
                onBuildingId={(value) => {
                  setBuildingId(value);
                  setRoomId("ALL");
                }}
                buildingOptions={buildingOptions}
                roomId={roomId}
                onRoomId={setRoomId}
                roomOptions={roomOptions}
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
