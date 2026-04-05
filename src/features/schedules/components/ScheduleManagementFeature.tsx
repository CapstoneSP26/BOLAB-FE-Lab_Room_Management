import { useDeferredValue, useMemo, useState } from "react";
import { CalendarClock, Layers, Plus, RefreshCw } from "lucide-react";
import { useToast } from "../../../hooks/useToast";
import { getErrorMessage } from "../../../utils/error";
import type { ScheduleDto } from "../types/schedule.type";
import type { ScheduleManagementListParams } from "../types/scheduleManagement.type";
import { useScheduleManagementList } from "../hooks/useScheduleManagementList";
import {
  useCreateSchedule,
  useDeleteSchedule,
  useUpdateSchedule,
} from "../hooks/useScheduleManagementMutations";
import type { CreateSchedulePayload } from "../types/scheduleManagement.type";
import ScheduleFormModal from "./ScheduleFormModal";
import ScheduleManagementFilters, {
  type ScheduleFiltersState,
} from "./ScheduleManagementFilters";
import ScheduleManagementTable from "./ScheduleManagementTable";
import SlotTypeManagementPanel from "./SlotTypeManagementPanel";

const PAGE_SIZE = 10;

const emptyFilters = (): ScheduleFiltersState => ({
  labRoomId: "",
  subjectId: "",
  fromDate: "",
  toDate: "",
  status: "",
  scheduleType: "",
});

function countActive(filters: ScheduleFiltersState): number {
  return [
    filters.labRoomId.trim() !== "",
    filters.subjectId.trim() !== "",
    filters.fromDate !== "",
    filters.toDate !== "",
    filters.status !== "",
    filters.scheduleType.trim() !== "",
  ].filter(Boolean).length;
}

function toListParams(
  page: number,
  filters: ScheduleFiltersState,
): ScheduleManagementListParams {
  const labRoomId =
    filters.labRoomId.trim() === ""
      ? undefined
      : Number(filters.labRoomId);
  return {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    labRoomId: Number.isFinite(labRoomId) ? labRoomId : undefined,
    subjectId: filters.subjectId.trim() || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
    status: filters.status || undefined,
    scheduleType: filters.scheduleType.trim() || undefined,
    sortBy: "startTime",
    isDescending: false,
  };
}

export default function ScheduleManagementFeature() {
  const toast = useToast();
  const [tab, setTab] = useState<"schedules" | "slots">("schedules");
  const [showFilters, setShowFilters] = useState(true);
  const [draftFilters, setDraftFilters] = useState<ScheduleFiltersState>(
    emptyFilters,
  );
  const [appliedFilters, setAppliedFilters] = useState<ScheduleFiltersState>(
    emptyFilters,
  );
  const [page, setPage] = useState(1);

  const deferredApplied = useDeferredValue(appliedFilters);

  const listParams = useMemo(
    () => toListParams(page, deferredApplied),
    [page, deferredApplied],
  );

  const { data, isLoading, isFetching, refetch } =
    useScheduleManagementList(listParams, tab === "schedules");

  const rows = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const loading = isLoading || isFetching;

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleModalMode, setScheduleModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleDto | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const createMut = useCreateSchedule();
  const updateMut = useUpdateSchedule();
  const deleteMut = useDeleteSchedule();

  const activeFilterCount = countActive(appliedFilters);

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setPage(1);
  };

  const resetFilters = () => {
    const cleared = emptyFilters();
    setDraftFilters(cleared);
    setAppliedFilters(cleared);
    setPage(1);
  };

  const openCreateSchedule = () => {
    setScheduleModalMode("create");
    setSelectedSchedule(null);
    setScheduleModalOpen(true);
  };

  const openEditSchedule = (row: ScheduleDto) => {
    setScheduleModalMode("edit");
    setSelectedSchedule(row);
    setScheduleModalOpen(true);
  };

  const handleSubmitSchedule = async (payload: CreateSchedulePayload) => {
    try {
      if (scheduleModalMode === "create") {
        await createMut.mutateAsync(payload);
        toast.success("Created", "Schedule has been created.");
      } else if (selectedSchedule) {
        await updateMut.mutateAsync({
          id: selectedSchedule.id,
          payload,
        });
        toast.success("Updated", "Schedule has been updated.");
      }
      setScheduleModalOpen(false);
      setSelectedSchedule(null);
    } catch (e) {
      toast.error(
        "Request failed",
        getErrorMessage(e, "Unable to save schedule."),
      );
    }
  };

  const handleDeleteSchedule = async (row: ScheduleDto) => {
    if (
      !window.confirm(
        `Delete schedule ${row.id}? This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingId(row.id);
    try {
      await deleteMut.mutateAsync(row.id);
      toast.success("Deleted", "Schedule removed.");
    } catch (e) {
      toast.error(
        "Delete failed",
        getErrorMessage(e, "Unable to delete schedule."),
      );
    } finally {
      setDeletingId(null);
    }
  };

  const scheduleBusy =
    createMut.isPending || updateMut.isPending || deleteMut.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50/60 p-1 dark:border-gray-800 dark:bg-white/[0.03]">
        <button
          type="button"
          onClick={() => setTab("schedules")}
          className={[
            "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
            tab === "schedules"
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
          ].join(" ")}
        >
          <CalendarClock className="h-4 w-4" />
          Schedules
        </button>
        <button
          type="button"
          onClick={() => setTab("slots")}
          className={[
            "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
            tab === "slots"
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
          ].join(" ")}
        >
          <Layers className="h-4 w-4" />
          Slot types and frames
        </button>
      </div>

      {tab === "schedules" ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Schedule list
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Filter by room, subject, time range, status, and type. Paginated
                results.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void refetch()}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                type="button"
                onClick={openCreateSchedule}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
              >
                <Plus className="h-4 w-4" />
                Add schedule
              </button>
            </div>
          </div>

          <ScheduleManagementFilters
            values={draftFilters}
            onChange={setDraftFilters}
            onApply={applyFilters}
            onReset={resetFilters}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters((v) => !v)}
            activeFilterCount={activeFilterCount}
          />

          <ScheduleManagementTable
            rows={rows}
            loading={loading}
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={setPage}
            onEdit={openEditSchedule}
            onDelete={handleDeleteSchedule}
            deletingId={deletingId}
          />

          <ScheduleFormModal
            isOpen={scheduleModalOpen}
            mode={scheduleModalMode}
            schedule={selectedSchedule}
            isLoading={scheduleBusy}
            onClose={() => {
              if (!scheduleBusy) {
                setScheduleModalOpen(false);
                setSelectedSchedule(null);
              }
            }}
            onSubmit={handleSubmitSchedule}
          />
        </>
      ) : (
        <SlotTypeManagementPanel />
      )}
    </div>
  );
}
