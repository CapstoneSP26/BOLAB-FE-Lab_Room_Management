import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import BookingRequestReviewModal from "./BookingRequestReviewModal";
import BookingFilters from "./BookingRequestFilter";
import BookingTable from "./BookingRequestTable";
import RejectReasonModal from "./RejectReasonModal";
import { buildingApi } from "../../building/api/buildingApi";
import { labroomApi } from "../../labroom/api/labroom.api";
import { slotApi } from "../../slot/api/slotApi";
import { useBookingRequests } from "../hooks/useBookingRequest";

import type { BuildingDto } from "../../building/types/building.type";
import type { LabRoomDto } from "../../labroom/types/room.type";
import type { SlotType } from "../../slot/types/slot.types";
import type {
  BookingRequest,
  BookingStatus,
  GetBookingRequestsRequest,
} from "../types/booking.type";

import {
  EmptyState,
  LoadingSkeleton,
  ReportStatCard,
} from "../../../components/ui/ComponentsParts";
import { useRejectBooking } from "../hooks/useRejectBooking";
import { useApproveBooking } from "../hooks/useApproveBooking";

type SlotTypeFilter = "ALL" | number;

export default function PendingBookingFeature() {
  const [lookupLoading, setLookupLoading] = useState(true);
  const [buildingOptions, setBuildingOptions] = useState<BuildingDto[]>([]);
  const [roomOptions, setRoomOptions] = useState<LabRoomDto[]>([]);
  const [slotOptions, setSlotOptions] = useState<SlotType[]>([]);

  const [q, setQ] = useState("");
  const [roomId, setRoomId] = useState<number | "ALL">("ALL");
  const [buildingId, setBuildingId] = useState<number | "ALL">("ALL");
  const [slotType, setSlotType] = useState<SlotTypeFilter>("ALL");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<BookingRequest | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Reject with reason state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [q, buildingId, roomId, slotType]);

  const params: GetBookingRequestsRequest = useMemo(
    () => ({
      status: "PendingApproval" as BookingStatus,
      labRoomId: roomId === "ALL" ? undefined : roomId,
      buildingId: buildingId === "ALL" ? undefined : buildingId,
      keyword: q.trim() || undefined,
      slotTypeId: slotType === "ALL" ? undefined : slotType,
      page: page,
      limit: limit,
      sortBy: "RequestedAt",
      isDescending: true,
    }),
    [roomId, buildingId, q, slotType, page, limit],
  );

  const pendingQuery = useBookingRequests(params);

  const { mutate: approve, } = useApproveBooking();
  const { mutate: reject, isPending } = useRejectBooking();

  const closeModal = () => {
    setOpen(false);
    setSelected(null);
    setRejectId(null);
    setRejectModalOpen(false);
  };

  const rawData: any = pendingQuery.data;
  const items = useMemo<BookingRequest[]>(
    () => rawData?.data ?? rawData?.items ?? [],
    [rawData],
  );
  const totalCount = rawData?.total ?? rawData?.totalCount ?? 0;
  const loading = pendingQuery.isLoading || pendingQuery.isFetching;

  const totalPages = Math.ceil(totalCount / limit);

  const reload = async () => {
    await pendingQuery.refetch();
  };

  useEffect(() => {
    const loadLookups = async () => {
      setLookupLoading(true);
      try {
        const [buildingsRes, slotsRes] = await Promise.all([
          buildingApi.getBuildings({
            pageNumber: 1,
            pageSize: 100,
          }),
          slotApi.getSlotTypes(),
        ]);

        setBuildingOptions(buildingsRes.items ?? []);
        setSlotOptions(slotsRes ?? []);
      } catch {
        setBuildingOptions([]);
        setSlotOptions([]);
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
      slotType !== "ALL"
    );
  }, [q, buildingId, roomId, slotType]);

  const HandleApprove = async (id: string) => {
    const ok = window.confirm("Approve this booking?");
    if (!ok) return;

    approve(id);
    closeModal();
  };

  const HandleOpenRejectModal = (id: string) => {
    setRejectId(id);
    setRejectModalOpen(true);
  }

  const handleConfirmReject = async (id: string, reason: string) => {
    reject({ id: id, "reason": reason });
    closeModal();
    setRejectId(null);
  };

  return (
    <div className="space-y-6">
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

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <ReportStatCard
            label="Total Items"
            value={totalCount}
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
          <ReportStatCard
            label="Filtered Results"
            value={totalCount}
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
          <ReportStatCard
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
            color="emerald"
          />
          <ReportStatCard
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
            color="amber"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-600 transition-all hover:bg-gray-100 active:scale-95 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                aria-label={showFilters ? "Hide filters" : "Show filters"}
              >
                {showFilters ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>

              <div className="flex items-center gap-2">
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

              {hasActiveFilters && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
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
                  Active
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {showFilters ? "Hide" : "Show"} Filters
            </button>
          </div>
        </div>

        <div
          className={`transition-all duration-300 ease-in-out ${showFilters
            ? "max-h-[1000px] opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
            }`}
        >
          <div className="border-t border-gray-200 p-6 dark:border-gray-700">
            <BookingFilters
              q={q}
              onQ={setQ}
              roomId={roomId}
              onRoomId={setRoomId}
              buildingId={buildingId}
              onBuildingId={(value) => {
                setBuildingId(value);
                setRoomId("ALL");
              }}
              slotType={slotType}
              onSlotType={setSlotType}
              roomOptions={roomOptions}
              buildingOptions={buildingOptions}
              slotOptions={slotOptions}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        {(loading || lookupLoading) && items.length === 0 ? (
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
                Booking Requests ({totalCount})
              </h3>
            </div>

            <BookingTable
              loading={loading}
              rows={rows}
              emptyText="No pending requests."
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setPage}
              onView={(b) => {
                setSelected(b);
                setOpen(true);
              }}
              onApprove={HandleApprove}
              handleOpenRejectModal={HandleOpenRejectModal}
            />
          </div>
        )}
      </div>

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
                • Use filters to narrow down results by building, room or slot
                type
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
        onApprove={HandleApprove}
        handleOpenRejectModal={HandleOpenRejectModal}
      />

      <RejectReasonModal
        rejectId={rejectId}
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={handleConfirmReject}
        isLoading={isPending}
      />
    </div>
  );
}
