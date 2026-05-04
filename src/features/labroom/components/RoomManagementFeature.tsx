import { useDeferredValue, useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  Filter,
  MonitorCog,
  Plus,
  Power,
  RefreshCw,
  Rows3,
  X,
} from "lucide-react";
import { useToast } from "../../../hooks/useToast";
import {
  EmptyIcon,
  EmptyState,
  LoadingSkeleton,
  ReportStatCard,
} from "../../../components/ui/ComponentsParts";
import { useBuildings } from "../../building/hooks/useBuildings";
import { getErrorMessage } from "../../../utils/error";
import {
  useCreateLabRoom,
  useDeleteLabRoom,
  useManagedLabRooms,
  useUpdateLabRoom,
  useUpdateLabRoomStatus,
} from "../hooks/useLabRooms";
import type { LabRoomDto, LabRoomFormValues, LabRoomStatusFilter } from "../types/room.type";
import PolicyManagementModal from "./PolicyManagementModal";
import RoomFormModal from "./RoomFormModal";
import RoomManagementFilters from "./RoomManagementFilters";
import RoomManagementTable from "./RoomManagementTable";
import { useAuthStore } from "../../../store/useAuthStore";

const PAGE_SIZE = 10;

export default function RoomManagementFeature() {
  const { user } = useAuthStore();
  const toast = useToast();
  const [showFilters, setShowFilters] = useState(true);
  const [search, setSearch] = useState("");
  const [buildingId, setBuildingId] = useState<number | "ALL">("ALL");
  const [status, setStatus] = useState<LabRoomStatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState<"create" | "edit">("edit");
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<LabRoomDto | null>(null);
  const [policyRoom, setPolicyRoom] = useState<LabRoomDto | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const isAdmin = useMemo(() => user && user.roles.includes("Admin") ? true : false, [user])

  const deferredSearch = useDeferredValue(search.trim());

  const { data: pagedBuildings } = useBuildings({
    params: { pageNumber: 1, pageSize: 1000 },
  });
  const buildingOptions = useMemo(
    () => pagedBuildings?.items ?? [],
    [pagedBuildings?.items],
  );

  const {
    data: pagedRooms,
    isLoading,
    isFetching,
    refetch,
  } = useManagedLabRooms({
    searchTerm: deferredSearch || undefined,
    buildingId: buildingId === "ALL" ? undefined : buildingId,
    isActive:
      status === "ALL" ? undefined : status === "ACTIVE",
    includeBuilding: true,
    pageNumber: page,
    pageSize: PAGE_SIZE,
    sortBy: "RoomNo",
    isDescending: false,
  });

  const rooms = useMemo(() => pagedRooms?.items ?? [], [pagedRooms?.items]);
  const totalCount = pagedRooms?.totalCount ?? 0;
  const totalPages = pagedRooms?.totalPages ?? 1;
  const loading = isLoading || isFetching;

  const stats = useMemo(() => {
    const activeOnPage = rooms.filter((room) => room.isActive).length;
    const inactiveOnPage = rooms.length - activeOnPage;

    return {
      total: totalCount,
      activeOnPage,
      inactiveOnPage,
      currentPage: page,
    };
  }, [page, rooms, totalCount]);

  const hasActiveFilters =
    search.trim() !== "" || buildingId !== "ALL" || status !== "ALL";

  const activeFilterCount = [
    search.trim() !== "",
    buildingId !== "ALL",
    status !== "ALL",
  ].filter(Boolean).length;

  const createRoomMutation = useCreateLabRoom({
    onSuccess: (_room, message) => {
      toast.success("Success", message);
      setIsRoomModalOpen(false);
      setSelectedRoom(null);
    },
    onError: (error) => {
      toast.error(
        "Create failed",
        getErrorMessage(error, "Unable to create lab room."),
      );
    },
  });

  const updateRoomMutation = useUpdateLabRoom({
    onSuccess: (_room, message) => {
      toast.success("Success", message);
      setIsRoomModalOpen(false);
      setSelectedRoom(null);
    },
    onError: (error) => {
      toast.error(
        "Update failed",
        getErrorMessage(error, "Unable to update lab room."),
      );
    },
  });

  const updateStatusMutation = useUpdateLabRoomStatus({
    onSuccess: (_room, message) => {
      toast.success("Success", message);
      setActionLoadingId(null);
    },
    onError: (error) => {
      toast.error(
        "Status update failed",
        getErrorMessage(error, "Unable to update room status."),
      );
      setActionLoadingId(null);
    },
  });

  const deleteRoomMutation = useDeleteLabRoom({
    onSuccess: (_void, message) => {
      toast.success("Success", message);
      setActionLoadingId(null);
    },
    onError: (error) => {
      toast.error(
        "Delete failed",
        getErrorMessage(error, "Unable to delete lab room."),
      );
      setActionLoadingId(null);
    },
  });

  const modalLoading =
    createRoomMutation.isPending || updateRoomMutation.isPending;

  const handleResetFilters = () => {
    setSearch("");
    setBuildingId("ALL");
    setStatus("ALL");
    setPage(1);
  };

  const handleOpenCreate = () => {
    if (!user) return;
    setModalMode("create");
    setSelectedRoom(null);
    setIsRoomModalOpen(true);
  };

  const handleOpenEdit = (room: LabRoomDto) => {
    setModalMode("edit");
    setSelectedRoom(room);
    setIsRoomModalOpen(true);
  };

  const handleOpenPolicies = (room: LabRoomDto) => {
    setPolicyRoom(room);
  };

  const handleSubmitRoom = async (values: LabRoomFormValues) => {
    const payload = {
      roomName: values.roomName,
      roomNo: values.roomNo,
      location: values.location,
      capacity: values.capacity,
      hasEquipment: values.hasEquipment,
      description: values.description,
      buildingId: Number(values.buildingId),
      isActive: values.isActive,
      labOwnerId: values.labOwnerId,
    };

    if (modalMode === "create" && isAdmin) {
      await createRoomMutation.mutateAsync(payload);
      return;
    }

    if (!selectedRoom?.id) {
      toast.error("Update failed", "Unable to determine which room to update.");
      return;
    }

    await updateRoomMutation.mutateAsync({
      id: selectedRoom.id,
      payload,
    });
  };

  const handleToggleStatus = async (room: LabRoomDto) => {
    const nextActive = !room.isActive;
    const actionLabel = nextActive ? "activate" : "de-activate";

    if (
      !window.confirm(
        `Are you sure you want to ${actionLabel} ${room.roomName || room.roomNo || "this room"}?`,
      )
    ) {
      return;
    }

    setActionLoadingId(room.id);
    await updateStatusMutation.mutateAsync({
      room,
      isActive: nextActive,
    });
  };

  const handleDelete = async (room: LabRoomDto) => {
    if (
      !window.confirm(
        `Delete ${room.roomName || room.roomNo || "this room"} permanently?`,
      )
    ) {
      return;
    }

    setActionLoadingId(room.id);
    await deleteRoomMutation.mutateAsync(room.id);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-cyan-50/30 to-sky-50/30 p-6 shadow-sm dark:border-gray-700 dark:from-gray-800/50 dark:via-cyan-900/5 dark:to-sky-900/5">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 shadow-lg shadow-cyan-500/20">
                  <MonitorCog className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Rooms Management
                  </h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {isAdmin
                      ? "ADMIN: create room + update fully (including building change). Policy: create / update value / delete."
                      : "Lab Manager: only update room (no create; no building change). Policy: only update value (PUT only value)."}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void refetch()}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-800/70"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Lab Room
                  </button>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <ReportStatCard
                label="Total Rooms"
                value={stats.total}
                icon={<Building2 className="h-5 w-5" />}
                color="blue"
              />
              <ReportStatCard
                label="Active On Page"
                value={stats.activeOnPage}
                icon={<Power className="h-5 w-5" />}
                color="emerald"
              />
              <ReportStatCard
                label="De-activated On Page"
                value={stats.inactiveOnPage}
                icon={<X className="h-5 w-5" />}
                color="amber"
              />
              <ReportStatCard
                label="Current Page"
                value={stats.currentPage}
                icon={<Rows3 className="h-5 w-5" />}
                color="purple"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800/50">
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="w-full border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 text-left transition-all hover:from-gray-100 hover:to-gray-200/50 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50 dark:hover:from-gray-700 dark:hover:to-gray-700/50"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm transition-all dark:bg-gray-700 ${showFilters ? "rotate-180" : "rotate-0"
                    }`}
                >
                  <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Room Filters
                  </h3>
                </div>

                {hasActiveFilters && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-500/10 dark:text-blue-400">
                    {activeFilterCount} Active
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleResetFilters();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <X className="h-3 w-3" />
                  Clear All
                </button>
              )}
            </div>
          </button>

          <div
            className={`grid transition-all duration-300 ease-in-out ${showFilters ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
          >
            <div className="overflow-hidden">
              <div className="border-t border-gray-200 p-6 dark:border-gray-700">
                <RoomManagementFilters
                  search={search}
                  buildingId={buildingId}
                  status={status}
                  buildingOptions={buildingOptions}
                  onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                  }}
                  onBuildingChange={(value) => {
                    setBuildingId(value);
                    setPage(1);
                  }}
                  onStatusChange={(value) => {
                    setStatus(value);
                    setPage(1);
                  }}
                  onReset={handleResetFilters}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
          {loading && rooms.length === 0 ? (
            <LoadingSkeleton />
          ) : rooms.length === 0 ? (
            <EmptyState
              title="No Lab Rooms Found"
              description={
                hasActiveFilters
                  ? "No lab rooms match your current filters. Try changing search, building, or status."
                  : isAdmin
                    ? "No lab rooms are available yet. Create a new room to get started."
                    : "No lab rooms are available yet."
              }
              icon={<EmptyIcon />}
              onReset={hasActiveFilters ? handleResetFilters : undefined}
            />
          ) : (
            <div className="overflow-hidden">
              <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Lab Room Directory
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Search by room number. Filter by building and active status.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {loading && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>Updating...</span>
                      </div>
                    )}
                    <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {rooms.length} room(s) on this page
                    </span>
                  </div>
                </div>
              </div>

              <RoomManagementTable
                rows={rooms}
                loading={loading}
                page={page}
                totalPages={Math.max(totalPages, 1)}
                totalCount={totalCount}
                onPageChange={setPage}
                onEdit={handleOpenEdit}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                onManagePolicies={handleOpenPolicies}
                actionLoadingId={actionLoadingId}
              />
            </div>
          )}
        </div>
      </div>

      {isRoomModalOpen && (isAdmin && modalMode === "create" ? true : !!selectedRoom) && (
        <RoomFormModal
          key={
            modalMode === "create"
              ? "create"
              : `edit:${selectedRoom?.id ?? ""}`
          }
          isOpen={isRoomModalOpen}
          mode={modalMode}
          room={modalMode === "edit" ? selectedRoom : null}
          isAdmin={isAdmin}
          buildingOptions={buildingOptions}
          isLoading={modalLoading}
          onClose={() => {
            if (modalLoading) {
              return;
            }
            setIsRoomModalOpen(false);
            setSelectedRoom(null);
          }}
          onSubmit={handleSubmitRoom}
        />
      )}

      {policyRoom && (
        <PolicyManagementModal
          isOpen={!!policyRoom}
          room={policyRoom}
          isAdmin={isAdmin}
          onClose={() => setPolicyRoom(null)}
        />
      )}
    </>
  );
}