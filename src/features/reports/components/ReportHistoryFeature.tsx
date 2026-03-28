import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Filter, X, RefreshCw, AlertTriangle } from "lucide-react";

import ReportHistoryFilter from "./ReportHistoryFilter";
import ReportHistoryTable from "./ReportHistoryTable";

import { buildingApi } from "../../building/api/buildingApi";
import { labroomApi } from "../../labroom/api/labroom.api";
import { mapBuildingOptions, mapRoomOptions } from "../types/report.mapper";
import type { Building } from "../../building/types/building.type";
import type { LabRoomLookupItem } from "../../labroom/types/room.type";
import { useReports } from "../hooks/useReport";

export default function ReportHistoryFeature() {
  const nav = useNavigate();

  const [lookupLoading, setLookupLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [buildingOptions, setBuildingOptions] = useState<Building[]>([]);
  const [roomOptions, setRoomOptions] = useState<LabRoomLookupItem[]>([]);

  const [q, setQ] = useState("");
  const [buildingId, setBuildingId] = useState<number | "ALL">("ALL");
  const [roomId, setRoomId] = useState<number | "ALL">("ALL");

  const {
    data: items = [],
    isLoading,
    isFetching,
    refetch,
  } = useReports({
    q: q.trim() || undefined,
    buildingId: buildingId === "ALL" ? undefined : buildingId,
    roomId: roomId === "ALL" ? undefined : roomId,
    isResolved: true,
    page: 1,
    limit: 1000,
    sortBy: "CreatedAt",
    isDescending: true,
  });

  const loadLookups = useCallback(async () => {
    setLookupLoading(true);
    try {
      const buildings = await buildingApi.getBuildings({
        pageNumber: 1,
        pageSize: 1000,
      });

      setBuildingOptions(mapBuildingOptions(buildings ?? []));
      setRoomOptions([]);
    } finally {
      setLookupLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLookups();
  }, [loadLookups]);

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
        setRoomOptions(mapRoomOptions(rooms));
      } catch {
        setRoomOptions([]);
      }
    };

    void loadRoomsByBuilding();
  }, [buildingId]);

  const rows = useMemo(() => {
    return [...items].sort((a, b) =>
      String(b.CreatedAt ?? "").localeCompare(String(a.CreatedAt ?? "")),
    );
  }, [items]);

  const stats = useMemo(() => {
    return {
      totalResolved: rows.length,
    };
  }, [rows]);

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
      {/* Hero Header */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-red-50/30 to-orange-50/20 p-6 shadow-sm dark:border-gray-700 dark:from-gray-800/50 dark:via-red-900/5 dark:to-orange-900/5">
        <div className="flex flex-col gap-6">
          {/* Title Section */}
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
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <StatCard
              label="Resolved Reports"
              value={stats.totalResolved}
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
              <ReportHistoryFilter
                q={q}
                onQ={setQ}
                buildingId={buildingId}
                onBuildingId={(value) => {
                  setBuildingId(value);
                  setRoomId("ALL");
                  // Auto-reload happens via useEffect
                }}
                roomId={roomId}
                onRoomId={setRoomId}
                // Auto-reload happens via useEffect
                buildingOptions={buildingOptions}
                roomOptions={roomOptions}
                onReset={handleReset}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Card */}
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
                      Issue Reports
                    </h3>
                    {hasActiveFilters && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Filtered results
                      </p>
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
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  color: "blue" | "emerald" | "amber" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    emerald:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
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

function EmptyState({
  title,
  description,
  icon,
  onReset,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  onReset?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-center text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
          Clear Filters
        </button>
      )}
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

function EmptyIcon() {
  return (
    <svg
      className="h-10 w-10 text-gray-400"
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
  );
}
