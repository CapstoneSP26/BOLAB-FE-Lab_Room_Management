import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Report, ReportImage } from "../type";
import { reportApi } from "../api/reportApi";
import ReportImages from "./ReportImages";

function badge(isResolved: boolean) {
  return isResolved
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
    : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
}

function fmt(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export default function ReportDetailFeature() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [images, setImages] = useState<ReportImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canLoad = Boolean(id);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const r = await reportApi.getById(id);
      if (!r) {
        setReport(null);
        setImages([]);
        setError("Report not found.");
        return;
      }
      setReport(r);
      const imgs = await reportApi.listImages(r.Id);
      setImages(imgs);
    } catch {
      setError("Fail to load report detail.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canLoad) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const header = useMemo(() => {
    if (!report) return null;
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Report #{report.Id}
              </h1>
              <span
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold ${badge(
                  report.IsResolved,
                )}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    report.IsResolved ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                {report.IsResolved ? "Resolved" : "Pending"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  Type:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {report.ReportType}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  User:
                </span>
                <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">
                  {report.UserId}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => nav(-1)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back
            </button>

            <button
              type="button"
              disabled={!report || saving}
              onClick={async () => {
                if (!report) return;
                setSaving(true);
                try {
                  const updated = await reportApi.setResolved(
                    report.Id,
                    !report.IsResolved,
                  );
                  setReport(updated);
                } finally {
                  setSaving(false);
                }
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                report?.IsResolved
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {saving ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : report?.IsResolved ? (
                "Mark as Pending"
              ) : (
                "Mark as Resolved"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }, [nav, report, saving]);

  if (!canLoad) {
    return (
      <EmptyState
        title="Missing Report ID"
        description="No report ID was provided in the URL."
      />
    );
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
              Error Loading Report
            </h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
            <button
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              type="button"
              onClick={load}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <EmptyState
        title="Report Not Found"
        description="The report you're looking for doesn't exist or has been deleted."
      />
    );
  }

  return (
    <div className="space-y-6">
      {header}

      {/* Meta cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MetaCard
          label="Created"
          value={fmt(report.CreatedAt)}
          meta={`by ${report.CreatedBy ?? "Unknown"}`}
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          }
        />

        <MetaCard
          label="Last Updated"
          value={fmt(report.UpdatedAt)}
          meta={`by ${report.UpdatedBy ?? "Unknown"}`}
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          }
        />

        <MetaCard
          label="Schedule ID"
          value={report.ScheduleId ?? "Not assigned"}
          meta={`Type: ${report.ReportType}`}
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
      </div>

      {/* Description */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Description
          </h3>
        </div>
        <div className="px-6 py-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-200">
            {report.Description || (
              <span className="italic text-gray-400">
                No description provided
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Images */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Attached Images
            </h3>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {images.length} {images.length === 1 ? "image" : "images"}
            </span>
          </div>
        </div>
        <div className="p-6">
          <ReportImages images={images} />
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetaCard({
  label,
  value,
  meta,
  icon,
}: {
  label: string;
  value: string;
  meta: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
      <div className="flex items-start gap-4 p-5">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {label}
          </div>
          <div className="mt-1 break-words text-sm font-semibold text-gray-900 dark:text-white">
            {value}
          </div>
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {meta}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 p-12 dark:border-gray-700">
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
      <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>

      {/* Meta cards skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50"
          >
            <div className="flex gap-4">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Description skeleton */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
        <div className="h-12 animate-pulse bg-gray-100 dark:bg-gray-800" />
        <div className="space-y-3 p-6">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      {/* Images skeleton */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
        <div className="h-12 animate-pulse bg-gray-100 dark:bg-gray-800" />
        <div className="p-6">
          <div className="h-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
