import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Filter, X, RefreshCw, AlertTriangle } from "lucide-react";

import ReportHistoryFilter from "./ReportHistoryFilter";
import ReportHistoryTable from "./ReportHistoryTable";
import { buildingApi } from "../../building/api/buildingApi";
import { labroomApi } from "../../labroom/api/labroom.api";
import type { BuildingDto } from "../../building/types/building.type";
import type { LabRoomDto } from "../../labroom/types/room.type";
import { useReportHistory } from "../hooks/useReport";
import {
  ReportStatCard,
  EmptyIcon,
  EmptyState,
  LoadingSkeleton,
} from "../../../components/ui/ComponentsParts";

export default function ReportHistoryFeature() {
  const nav = useNavigate();

  const [showFilters, setShowFilters] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(true);
  const [buildingOptions, setBuildingOptions] = useState<BuildingDto[]>([]);
  const [roomOptions, setRoomOptions] = useState<LabRoomDto[]>([]);

  const [q, setQ] = useState("");
  const [buildingId, setBuildingId] = useState<number | "ALL">("ALL");
  const [roomId, setRoomId] = useState<number | "ALL">("ALL");

  const {
    data: pagedReports,
    isLoading,
    refetch,
    isFetching,
  } = useReportHistory({
    q: q.trim() || undefined,
    buildingId: buildingId === "ALL" ? undefined : buildingId,
    roomId: roomId === "ALL" ? undefined : roomId,
    page: 1,
    limit: 1000,
    sortBy: "CreatedAt",
    isDescending: true,
  });

  const items = useMemo(() => pagedReports?.items ?? [], [pagedReports?.items]);
  const totalCount = pagedReports?.totalCount ?? items.length;

  useEffect(() => {
    const loadBuildings = async () => {
      setLookupLoading(true);
      try {
        const buildingsResponse = await buildingApi.getBuildings({
          pageNumber: 1,
          pageSize: 1000,
        });

        const buildings = Array.isArray(buildingsResponse?.items)
          ? buildingsResponse.items
          : [];

        setBuildingOptions(buildings);
      } finally {
        setLookupLoading(false);
      }
    };

    void loadBuildings();
  }, []);

  useEffect(() => {
    const loadRoomsByBuilding = async () => {
      if (buildingId === "ALL") {
        setRoomOptions([]);
        setRoomId("ALL");
        return;
      }

      try {
        const response = await labroomApi.getRooms({
          buildingId,
          pageNumber: 1,
          pageSize: 1000,
          includeBuilding: true,
          isDescending: false,
        });

        const rooms = Array.isArray(response?.items) ? response.items : [];
        setRoomOptions(rooms);
      } catch {
        setRoomOptions([]);
      }
    };

    void loadRoomsByBuilding();
  }, [buildingId]);

  const rows = useMemo(() => items, [items]);

  const stats = useMemo(() => {
    return {
      totalResolved: totalCount,
    };
  }, [totalCount]);

  const hasActiveFilters = useMemo(() => {
    return q.trim() !== "" || buildingId !== "ALL" || roomId !== "ALL";
  }, [q, buildingId, roomId]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (q.trim() !== "") count++;
    if (buildingId !== "ALL") count++;
    if (roomId !== "ALL") count++;
    return count;
  }, [q, buildingId, roomId]);

  const handleReset = () => {
    setQ("");
    setBuildingId("ALL");
    setRoomId("ALL");
  };
  const loading = isLoading || isFetching;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-red-50/30 to-orange-50/20 p-6 shadow-sm dark:border-gray-700 dark:from-gray-800/50 dark:via-red-900/5 dark:to-orange-900/5">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg shadow-red-500/20">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  History Reports
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  View and manage all reported issues and problems
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void refetch()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ReportStatCard
              label="Resolved Reports"
              value={stats.totalResolved}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-500/10 dark:text-blue-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {activeFilterCount} Active
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
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
            showFilters ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-gray-200 p-6 dark:border-gray-700">
              <ReportHistoryFilter
                q={q}
                onQ={setQ}
                buildingId={buildingId}
                onBuildingId={(value) => {
                  setBuildingId(value);
                  setRoomId("ALL");
                }}
                roomId={roomId}
                onRoomId={setRoomId}
                buildingOptions={buildingOptions}
                roomOptions={roomOptions}
                onReset={handleReset}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        {(loading || lookupLoading) && items.length === 0 ? (
          <LoadingSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No Resolved Reports Found"
            description={
              hasActiveFilters
                ? "No resolved reports match your current filters."
                : "There are no resolved reports in history yet."
            }
            icon={<EmptyIcon />}
            onReset={hasActiveFilters ? handleReset : undefined}
          />
        ) : (
          <div className="overflow-hidden">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-700">
                    <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      Issue Reports
                    </h3>
                    {hasActiveFilters && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">Filtered results</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {loading && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Updating...</span>
                    </div>
                  )}
                  <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    {rows.length} {rows.length === 1 ? "report" : "reports"}
                  </span>
                </div>
              </div>
            </div>

            <ReportHistoryTable
              loading={loading}
              rows={rows}
              onView={(id) => nav(`/labmanager/reports/${id}`)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
