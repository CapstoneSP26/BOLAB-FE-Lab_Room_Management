import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

import type { Report, GetReportsRequest } from "../types/report.type";
import { getReports, resolveReport } from "../api/reportApi";
import ReportListFilters from "./ReportListFilters";
import ReportListTable from "./ReportListTable";

import type { Building, BuildingDto } from "../../building/types/building.type";
import { buildingApi } from "../../building/api/buildingApi";
import type {
  LabRoomDto,
  LabRoomLookupItem,
} from "../../labroom/types/room.type";
import { labroomApi } from "../../labroom/api/labroom.api";

function mapBuildingOptions(items: BuildingDto[]): Building[] {
  return items.map((item) => ({
    id: String(item.id),
    name: item.buildingName,
    description: item.description ?? "",
    roomCount: 0,
    image: item.buildingImageUrl ?? "",
    color: undefined,
  }));
}

function mapRoomOptions(items: LabRoomDto[]): LabRoomLookupItem[] {
  return items.map((item) => ({
    id: item.id,
    roomName: item.roomName,
    roomNo: item.roomNo,
    buildingId: item.buildingId,
    buildingName: item.buildingName,
  }));
}

export default function ReportListFeature() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [lookupLoading, setLookupLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [items, setItems] = useState<Report[]>([]);
  const [buildingOptions, setBuildingOptions] = useState<Building[]>([]);
  const [roomOptions, setRoomOptions] = useState<LabRoomLookupItem[]>([]);

  const [q, setQ] = useState("");
  const [buildingId, setBuildingId] = useState<number | "ALL">("ALL");
  const [roomId, setRoomId] = useState<number | "ALL">("ALL");

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

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const params: GetReportsRequest = {
        q: q.trim() || undefined,
        buildingId: buildingId === "ALL" ? undefined : buildingId,
        roomId: roomId === "ALL" ? undefined : roomId,
        page: 1,
        limit: 1000,
        sortBy: "CreatedAt",
        isDescending: true,
      };

      const response = await getReports(params);
      setItems(Array.isArray(response?.data) ? response.data : []);
    } finally {
      setLoading(false);
    }
  }, [q, buildingId, roomId]);

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

  useEffect(() => {
    void reload();
  }, [reload]);

  const rows = useMemo(() => {
    return [...items].sort((a, b) =>
      String(b.CreatedAt ?? "").localeCompare(String(a.CreatedAt ?? "")),
    );
  }, [items]);

  const stats = useMemo(() => {
    const resolved = rows.filter((r) => r.IsResolved).length;
    const unresolved = rows.filter((r) => !r.IsResolved).length;

    return {
      total: rows.length,
      resolved,
      unresolved,
      resolutionRate:
        rows.length > 0 ? Math.round((resolved / rows.length) * 100) : 0,
    };
  }, [rows]);

  const hasActiveFilters = useMemo(() => {
    return q.trim() !== "" || buildingId !== "ALL" || roomId !== "ALL";
  }, [q, buildingId, roomId]);

  const handleReset = () => {
    setQ("");
    setBuildingId("ALL");
    setRoomId("ALL");
  };

  const onToggleResolved = async (id: string, next: boolean) => {
    if (!next) return;

    const response = await resolveReport(id, { isResolved: true });
    const updated = response.data;

    setItems((prev) =>
      prev.map((item) =>
        String(item.Id) === String(updated.Id) ? updated : item,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/10">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Issue Reports
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  View and manage reported issues
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
          <StatCard
            label="Total Reports"
            value={stats.total}
            icon={<CardIcon />}
            color="blue"
          />
          <StatCard
            label="Resolved"
            value={stats.resolved}
            icon={<ResolvedIcon />}
            color="emerald"
          />
          <StatCard
            label="Unresolved"
            value={stats.unresolved}
            icon={<PendingIcon />}
            color="amber"
          />
          <StatCard
            label="Resolution Rate"
            value={`${stats.resolutionRate}%`}
            icon={<RateIcon />}
            color="purple"
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
          className={`transition-all duration-300 ease-in-out ${
            showFilters
              ? "max-h-[1000px] opacity-100"
              : "max-h-0 overflow-hidden opacity-0"
          }`}
        >
          <div className="border-t border-gray-200 p-6 dark:border-gray-700">
            <ReportListFilters
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
              onGenerate={reload}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        {(loading || lookupLoading) && items.length === 0 ? (
          <LoadingSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No Reports Found"
            description={
              hasActiveFilters
                ? "No reports match your current filters."
                : "There are no reports at the moment."
            }
            icon={<EmptyIcon />}
          />
        ) : (
          <div className="overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Reports ({rows.length})
              </h3>
            </div>

            <ReportListTable
              loading={loading}
              rows={rows}
              onView={(id) => nav(`/labmanager/reports/${id}`)}
              onToggleResolved={onToggleResolved}
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
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    purple:
      "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
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
  icon: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      {icon}
      <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
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

function CardIcon() {
  return (
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
  );
}

function ResolvedIcon() {
  return (
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
  );
}

function PendingIcon() {
  return (
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
  );
}

function RateIcon() {
  return (
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
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

function EmptyIcon() {
  return (
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
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}
