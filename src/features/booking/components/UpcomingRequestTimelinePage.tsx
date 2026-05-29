import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

import { buildingApi } from "../../building/api/buildingApi";
import { labroomApi } from "../../labroom/api/labroom.api";
import { slotApi } from "../../slot/api/slotApi";
import { QUERY_KEYS, useBookingRequests } from "../hooks/useBookingRequest";
import BookingTimelineCanvas, { normalizeDateKey, getMinutesFrom0700 } from "./BookingTimelineCanvas";
import RequestDetailsPanel from "./RequestDetailsPanel";
import ApproveBookingModal from "./ApproveBookingModal";
import RejectReasonModal from "./RejectReasonModal";
import { useApproveBooking } from "../hooks/useApproveBooking";
import { useRejectBooking } from "../hooks/useRejectBooking";

import type { BuildingDto } from "../../building/types/building.type";
import type { LabRoomDto } from "../../labroom/types/room.type";
import type { SlotType } from "../../slot/types/slot.types";
import type {
  BookingRequest,
  BookingStatus,
  GetBookingRequestsRequest,
} from "../types/booking.type";

import { ReportStatCard } from "../../../components/ui/ComponentsParts";
import { useAuthStore } from "../../../store/useAuthStore";
import { Role } from "../../../constants/role";

import { useSignalRListener } from '../../../hooks/useSignalRListener';

import { useQueryClient } from "@tanstack/react-query";
import { useToast } from '../../../hooks/useToast';

type SlotTypeFilter = "ALL" | number;
type PriorityFilter = "ALL" | "SCHOOL_EVENT" | "ACADEMIC" | "NORMAL";

type TimelineStats = {
  totalPending: number;
  conflictCount: number;
  schoolEventCount: number;
  academicCount: number;
  normalCount: number;
};

function getWeekStart(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getWeekEnd(date: Date) {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatWeekLabel(date: Date) {
  const start = getWeekStart(date);
  const end = getWeekEnd(date);
  const yearLabel =
    start.getFullYear() === end.getFullYear()
      ? String(start.getFullYear())
      : `${start.getFullYear()}-${end.getFullYear()}`;
  return `${formatShortDate(start)} - ${formatShortDate(end)}, ${yearLabel}`;
}

export default function UpcomingRequestTimelinePage() {
  const user = useAuthStore((state) => state.user);
  const isManager = Boolean(user?.roles?.includes(Role.Manager));
  const [buildingOptions, setBuildingOptions] = useState<BuildingDto[]>([]);
  const [roomOptions, setRoomOptions] = useState<LabRoomDto[]>([]);
  const [slotOptions, setSlotOptions] = useState<SlotType[]>([]);

  const [q, setQ] = useState("");
  const [roomId, setRoomId] = useState<number | "ALL">("ALL");
  const [buildingId, setBuildingId] = useState<number | "ALL">("ALL");
  const [slotType, setSlotType] = useState<SlotTypeFilter>("ALL");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");
  const [conflictOnly, setConflictOnly] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Modals state
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);

  // Mutations
  const approveMutation = useApproveBooking();
  const rejectMutation = useRejectBooking();

  const [page, setPage] = useState(1);
  const [limit] = useState(100);

  const weekStart = useMemo(() => getWeekStart(selectedDate), [selectedDate]);
  const weekEnd = useMemo(() => getWeekEnd(selectedDate), [selectedDate]);

  const appAlert = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setPage(1);
  }, [q, buildingId, roomId, slotType, selectedDate]);

  const params: GetBookingRequestsRequest = useMemo(
    () => {
      // The timeline shows 7 days
      const apiEndDate = new Date(weekEnd);
      apiEndDate.setDate(apiEndDate.getDate() + 1);

      return {
        requestStatus: "PendingApproval" as BookingStatus,
        labRoomId: roomId === "ALL" ? undefined : roomId,
        buildingId: buildingId === "ALL" ? undefined : buildingId,
        keyword: q.trim() || undefined,
        slotTypeId: slotType === "ALL" ? undefined : slotType,
        startDate: formatDateKey(weekStart),
        endDate: formatDateKey(apiEndDate),
        page,
        limit,
        sortBy: "RequestedAt",
        isDescending: true,
      };
    },
    [roomId, buildingId, q, slotType, page, limit, weekStart, weekEnd],
  );

  const pendingQuery = useBookingRequests(params);

  const rawData = pendingQuery.data as
    | { data?: BookingRequest[]; items?: BookingRequest[] }
    | undefined;

  const items = useMemo<BookingRequest[]>(() => {
    const raw = rawData?.data ?? rawData?.items ?? [];
    return raw.filter((item) => {
      const status = String(item.status ?? "").toUpperCase();
      return status === "1" || status === "PENDINGAPPROVAL" || status === "PENDING" || status.includes("CONFLICT");
    });
  }, [rawData]);

  const loading = pendingQuery.isLoading || pendingQuery.isFetching;
  const totalCount = items.length;

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const purpose = String(item.purpose ?? "").toUpperCase();
      const matchesPriority = priorityFilter === "ALL" || purpose.includes(priorityFilter);

      const status = String(item.status ?? "").toUpperCase();
      const hasConflict = status.includes("CONFLICT");
      const matchesConflict = !conflictOnly || hasConflict;

      const matchesSearch =
        q.trim() === "" ||
        [item.roomName, item.buildingName, item.purpose, item.requestedBy]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q.trim().toLowerCase()));

      return matchesPriority && matchesConflict && matchesSearch;
    });
  }, [items, priorityFilter, conflictOnly, q]);

  const selectedBooking = useMemo(() => {
    if (!selectedBookingId) return null;
    return visibleItems.find((b) => String(b.id) === selectedBookingId) || null;
  }, [selectedBookingId, visibleItems]);

  const isSelectedBookingLocked = useMemo(() => {
    if (!selectedBooking) return false;

    // Get priority level of selected booking
    function getPriorityLevel(purpose?: string) {
      const text = String(purpose ?? "").toUpperCase();
      if (text.includes("SCHOOL EVENT")) return 4;
      if (text.includes("ACADEMIC")) return 3;
      if (text.includes("NORMAL")) return 2;
      return 1;
    }

    const selectedPriority = getPriorityLevel(selectedBooking.purpose);

    // Check if there are ANY pending bookings in the same room AND same day with HIGHER priority
    const selectedDateKey = normalizeDateKey(selectedBooking.date || selectedBooking.startTime || selectedBooking.requestedAt);
    const roomBookingsOnSameDay = visibleItems.filter(b =>
      String(b.roomId) === String(selectedBooking.roomId) &&
      normalizeDateKey(b.date || b.startTime || b.requestedAt) === selectedDateKey
    );
    const hasHigherPriority = roomBookingsOnSameDay.some(b => getPriorityLevel(b.purpose) > selectedPriority);

    return hasHigherPriority;
  }, [selectedBooking, visibleItems]);

  const conflictingBookings = useMemo(() => {
    if (!selectedBooking) return [];

    const selectedDateKey = normalizeDateKey(selectedBooking.date || selectedBooking.startTime || selectedBooking.requestedAt);
    const start = getMinutesFrom0700(selectedBooking.startTime);
    const end = getMinutesFrom0700(selectedBooking.endTime);

    return visibleItems.filter(b => {
      if (String(b.id) === String(selectedBooking.id)) return false;
      if (String(b.roomId) !== String(selectedBooking.roomId)) return false;
      if (normalizeDateKey(b.date || b.startTime || b.requestedAt) !== selectedDateKey) return false;

      const bStart = getMinutesFrom0700(b.startTime);
      const bEnd = getMinutesFrom0700(b.endTime);

      // Check for time overlap
      return start < bEnd && end > bStart;
    });
  }, [selectedBooking, visibleItems]);

  const stats = useMemo<TimelineStats>(() => {
    const countByPurpose = (keyword: string) =>
      items.filter((item) => String(item.purpose ?? "").toLowerCase().includes(keyword)).length;

    return {
      totalPending: totalCount,
      conflictCount: Math.floor(totalCount / 4),
      schoolEventCount: countByPurpose("SCHOOL EVENT"),
      academicCount: countByPurpose("ACADEMIC"),
      normalCount: countByPurpose("NORMAL"),
    };
  }, [items, totalCount]);

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [buildingsRes, slotsRes] = await Promise.all([
          buildingApi.getBuildings({ pageNumber: 1, pageSize: 100 }),
          slotApi.getSlotTypes(),
        ]);
        setBuildingOptions(buildingsRes.items ?? []);
        setSlotOptions(slotsRes ?? []);
      } catch {
        setBuildingOptions([]);
        setSlotOptions([]);
      }
    };

    void loadLookups();
  }, []);

  useEffect(() => {
    const loadRoomsByBuilding = async () => {
      try {
        const rooms = await labroomApi.getRooms({
          buildingId: buildingId === "ALL" ? undefined : buildingId,
          pageNumber: 1,
          pageSize: 100,
          includeBuilding: true,
        });
        const items = rooms.items ?? [];
        const managedRooms =
          isManager && user?.id
            ? items.filter(
              (room) =>
                String(room.labOwnerId ?? room.labOwner?.id ?? "") === String(user.id),
            )
            : items;
        setRoomOptions(managedRooms);
        if (buildingId === "ALL") {
          setRoomId("ALL");
        }
      } catch {
        setRoomOptions([]);
      }
    };

    void loadRoomsByBuilding();
  }, [buildingId, isManager, user?.id]);

  const hasActiveFilters =
    q.trim() !== "" ||
    buildingId !== "ALL" ||
    roomId !== "ALL" ||
    slotType !== "ALL" ||
    priorityFilter !== "ALL" ||
    conflictOnly;

  const reload = async () => {
    await pendingQuery.refetch();
  };

  const shiftWeek = (delta: number) => {
    setSelectedDate((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + delta * 3);
      return next;
    });
  };

  useSignalRListener("booking.new", async (payload: any) => {
    const isCurrentRoom = roomOptions.some(room => String(room.id) === String(payload.labRoomId));
    if (!isCurrentRoom) return; // Nếu sự kiện không liên quan đến phòng đang xem, bỏ qua

    // Trong lúc này UI sẽ mượt hơn vì Booking cũ đã biến mất
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    await delay(1800);

    // 3. REFETCH cưỡng chế cho Schedules
    // Sử dụng refetch thay vì invalidate để đảm bảo nó gọi API ngay lập tức
    await queryClient.refetchQueries({
      predicate: (query) =>
        query.queryKey[0] === QUERY_KEYS.BOOKING_REQUESTS,
      type: 'active' // Chỉ fetch lại những gì đang hiện trên màn hình
    });

    appAlert.success("Cập nhật", "Upcoming requests đã được đồng bộ mới nhất.");
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/10">
                <svg className="h-6 w-6 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Booking Requests Timeline</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Visualize requests by time, room, and priority</p>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{formatWeekLabel(selectedDate)}</div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Pending</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{stats.totalPending}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Conflicts</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{stats.conflictCount}</div>
            </div>
            <button type="button" onClick={reload} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <ReportStatCard label="School Event" value={stats.schoolEventCount} color="amber" />
          <ReportStatCard label="Academic" value={stats.academicCount} color="emerald" />
          <ReportStatCard label="Normal" value={stats.normalCount} color="blue" />
          <ReportStatCard label="Visible" value={visibleItems.length} color="purple" />
        </div>
      </div>

      <div className="flex flex-col xl:flex-row items-start gap-6">
        {/* Left Column: Timeline + Filters */}
        <div className="flex-1 min-w-0 flex flex-col gap-6 w-full">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Timeline Canvas</h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">The canvas is the primary interaction area for pending requests.</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => shiftWeek(-1)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setSelectedDate(new Date())} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">Today</button>
                <button type="button" onClick={() => shiftWeek(1)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <BookingTimelineCanvas
              selectedDate={selectedDate}
              selectedRoomId={roomId}
              conflictOnly={conflictOnly}
              priorityFilter={priorityFilter}
              selectedBookingId={selectedBookingId ?? undefined}
              onSelectBooking={(booking) => setSelectedBookingId(String(booking.id))}
              lanes={roomOptions.map((room) => ({
                id: room.id,
                name: room.roomName || `Room ${room.id}`,
                capacity: room.capacity,
                bookings: visibleItems.filter((booking) => String(booking.roomId) === String(room.id)),
              }))}
            />
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Priority Legend</h2>
                <span className="rounded-full bg-violet-100 px-2 py-1 text-[11px] font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">Timeline</span>
              </div>
              <div className="space-y-2.5 text-xs">
                {[["SCHOOL EVENT", "bg-rose-500"], ["ACADEMIC", "bg-amber-500"], ["NORMAL", "bg-sky-500"]].map(([label, color]) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                    <span className="text-gray-700 dark:text-gray-300">{label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filters</h2>
                {hasActiveFilters && <span className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">Active</span>}
              </div>
              <div className="space-y-3 text-xs">

                <label className="block">
                  <span className="text-gray-500 dark:text-gray-400">Room</span>
                  <select value={roomId} onChange={(event) => setRoomId(event.target.value === "ALL" ? "ALL" : Number(event.target.value))} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900/40 dark:text-white">
                    <option value="ALL">All</option>
                    {roomOptions.map((room) => (
                      <option key={String(room.id)} value={room.id}>{room.roomName || `Room ${room.id}`}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-gray-500 dark:text-gray-400">Priority</span>
                  <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as PriorityFilter)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900/40 dark:text-white">
                    <option value="ALL">All</option>
                    <option value="SCHOOL EVENT">School Event</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="NORMAL">Normal</option>
                  </select>
                </label>

              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
              <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Room Summary</h2>
              <div className="space-y-3">
                {roomOptions.slice(0, 4).map((room, index) => (
                  <div key={String(room.id)} className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">{room.roomName || `Room ${room.id}`}</div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{String(room.capacity ?? "-")}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Pending requests: {Math.max(0, visibleItems.length - index)}</div>
                  </div>
                ))}
                {roomOptions.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Select a building to load rooms.</p>}
              </div>
            </section>
          </div>
        </div>

        {/* Right Column: Inspector Panel */}
        {selectedBookingId && (
          <aside className="w-full xl:w-[380px] shrink-0 xl:sticky xl:top-6 z-20 transition-all duration-300 animate-in slide-in-from-right-4">
            <RequestDetailsPanel
              booking={selectedBooking}
              conflictingBookings={conflictingBookings}
              isLocked={isSelectedBookingLocked}
              onClose={() => setSelectedBookingId(null)}
              onApprove={(id) => setApproveId(id)}
              onReject={(id) => setRejectId(id)}
            />
          </aside>
        )}
      </div>

      <ApproveBookingModal
        isOpen={approveId !== null}
        approveId={approveId}
        onClose={() => setApproveId(null)}
        isLoading={approveMutation.isPending}
        onSubmit={(id) => {
          approveMutation.mutate(id, {
            onSuccess: () => {
              setApproveId(null);
              setSelectedBookingId(null);
            }
          });
        }}
      />

      <RejectReasonModal
        isOpen={rejectId !== null}
        rejectId={rejectId}
        onClose={() => setRejectId(null)}
        isLoading={rejectMutation.isPending}
        onSubmit={(id, reason) => {
          rejectMutation.mutate({ id, reason }, {
            onSuccess: () => {
              setRejectId(null);
              setSelectedBookingId(null);
            }
          });
        }}
      />
    </div>
  );
}
