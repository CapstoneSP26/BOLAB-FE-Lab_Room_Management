import { useDeferredValue, useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  Filter,
  Plus,
  RefreshCw,
  Rows3,
  Search,
  X,
} from "lucide-react";
import { useToast } from "../../../hooks/useToast";
import {
  EmptyIcon,
  EmptyState,
  LoadingSkeleton,
  ReportStatCard,
} from "../../../components/ui/ComponentsParts";
import BuildingManagementFilters from "./BuildingManagementFilters";
import BuildingManagementTable from "./BuildingManagementTable";
import type { BuildingDto, BuildingFormValues } from "../types/building.type";
import {
  useCreateBuilding,
  useDeleteBuilding,
  useBuildings,
  useUpdateBuilding,
} from "../hooks/useBuildings";
import { getErrorMessage } from "../../../utils/error";
import BuildingFormModal from "./BuildingFormModal";

const PAGE_SIZE = 10;

export default function BuildingManagementFeature() {
  const toast = useToast();
  const [showFilters, setShowFilters] = useState(true);
  const [search, setSearch] = useState("");
  const [campusId, setCampusId] = useState<number | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingDto | null>(
    null,
  );
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const deferredSearch = useDeferredValue(search.trim());

  const {
    data: pagedBuildings,
    isLoading,
    isFetching,
    refetch,
  } = useBuildings({
    params: {
      searchTerm: deferredSearch || undefined,
      campusId: campusId === "ALL" ? undefined : campusId,
      pageNumber: page,
      pageSize: PAGE_SIZE,
    }
  });

  const rows = useMemo(() => pagedBuildings?.items ?? [], [pagedBuildings?.items]);
  const totalCount = pagedBuildings?.totalCount ?? 0;
  const totalPages = pagedBuildings?.totalPages ?? 1;
  const loading = isLoading || isFetching;

  const createMutation = useCreateBuilding({
    onSuccess: () => {
      toast.success("Building created", "New building has been added.");
      setIsModalOpen(false);
      setSelectedBuilding(null);
    },
    onError: (error) => {
      toast.error(
        "Create failed",
        getErrorMessage(error, "Unable to create building."),
      );
    },
  });

  const updateMutation = useUpdateBuilding({
    onSuccess: () => {
      toast.success("Building updated", "Building information has been updated.");
      setIsModalOpen(false);
      setSelectedBuilding(null);
    },
    onError: (error) => {
      toast.error(
        "Update failed",
        getErrorMessage(error, "Unable to update building."),
      );
    },
  });

  const deleteMutation = useDeleteBuilding({
    onSuccess: () => {
      toast.success("Building deleted", "The building has been removed.");
      setActionLoadingId(null);
    },
    onError: (error) => {
      toast.error(
        "Delete failed",
        getErrorMessage(error, "Unable to delete building."),
      );
      setActionLoadingId(null);
    },
  });

  const modalLoading = createMutation.isPending || updateMutation.isPending;

  const stats = useMemo(() => {
    const roomCountOnPage = rows.reduce(
      (acc, item) => acc + (item.roomCount ?? 0),
      0,
    );

    return {
      total: totalCount,
      roomCountOnPage,
      currentPage: page,
      pageSize: PAGE_SIZE,
    };
  }, [page, rows, totalCount]);

  const hasActiveFilters = useMemo(() => {
    return search.trim() !== "" || campusId !== "ALL";
  }, [search, campusId]);

  const activeFilterCount = useMemo(() => {
    return [search.trim() !== "", campusId !== "ALL"].filter(Boolean).length;
  }, [search, campusId]);

  const handleReset = () => {
    setSearch("");
    setCampusId("ALL");
    setPage(1);
  };

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedBuilding(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (building: BuildingDto) => {
    setModalMode("edit");
    setSelectedBuilding(building);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: BuildingFormValues) => {
    if (modalMode === "create") {
      await createMutation.mutateAsync(values);
      return;
    }

    if (!selectedBuilding?.id) {
      toast.error("Update failed", "Unable to determine which building to update.");
      return;
    }

    await updateMutation.mutateAsync({
      id: selectedBuilding.id,
      payload: values,
    });
  };

  const handleDelete = async (building: BuildingDto) => {
    if (
      !window.confirm(
        `Delete ${building.buildingName || "this building"} permanently?`,
      )
    ) {
      return;
    }

    setActionLoadingId(building.id);
    await deleteMutation.mutateAsync(building.id);
  };

  return (
    <>
      <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-amber-50/20 to-orange-50/20 p-6 shadow-sm dark:border-gray-700 dark:from-gray-800/50 dark:via-amber-900/5 dark:to-orange-900/5">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/20">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Buildings Management
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Search and browse buildings with campus and room metrics.
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

              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-400"
              >
                <Plus className="h-4 w-4" />
                Add Building
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <ReportStatCard
              label="Total Buildings"
              value={stats.total}
              icon={<Building2 className="h-5 w-5" />}
              color="blue"
            />
            <ReportStatCard
              label="Rooms (On Page)"
              value={stats.roomCountOnPage}
              icon={<Rows3 className="h-5 w-5" />}
              color="emerald"
            />
            <ReportStatCard
              label="Current Page"
              value={stats.currentPage}
              icon={<Filter className="h-5 w-5" />}
              color="purple"
            />
            <ReportStatCard
              label="Page Size"
              value={stats.pageSize}
              icon={<Search className="h-5 w-5" />}
              color="amber"
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
                className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm transition-all dark:bg-gray-700 ${
                  showFilters ? "rotate-180" : "rotate-0"
                }`}
              >
                <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Building Filters
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
                  handleReset();
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
          className={`grid transition-all duration-300 ease-in-out ${
            showFilters ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-gray-200 p-6 dark:border-gray-700">
              <BuildingManagementFilters
                search={search}
                campusId={campusId}
                onSearchChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
                onCampusIdChange={(value) => {
                  setCampusId(value);
                  setPage(1);
                }}
                onReset={handleReset}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        {loading && rows.length === 0 ? (
          <LoadingSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No Buildings Found"
            description={
              hasActiveFilters
                ? "No buildings match your current filters. Try changing search or campus."
                : "No buildings are available yet."
            }
            icon={<EmptyIcon />}
            onReset={hasActiveFilters ? handleReset : undefined}
          />
        ) : (
          <div className="overflow-hidden">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Building Directory
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Search by name. Filter by campus id.
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
                    {rows.length} building(s) on this page
                  </span>
                </div>
              </div>
            </div>

            <BuildingManagementTable
              rows={rows}
              loading={loading}
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setPage}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              actionLoadingId={actionLoadingId}
            />
          </div>
        )}
      </div>
      </div>

      {isModalOpen && (
        <BuildingFormModal
          key={`${modalMode}:${selectedBuilding?.id ?? "new"}`}
          isOpen={isModalOpen}
          mode={modalMode}
          building={selectedBuilding}
          isLoading={modalLoading}
          onClose={() => {
            if (modalLoading) return;
            setIsModalOpen(false);
            setSelectedBuilding(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}

