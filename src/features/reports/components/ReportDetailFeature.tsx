import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Report, ReportImage } from "../types/report.type";
import { getReportDetail, resolveReport } from "../api/reportApi";
import ReportImages from "./ReportImages";
import {
  ContentCard,
  EmptyState,
  LoadingSkeleton,
  QuickInfo,
  TimelineItem,
  InfoRow,
} from "./ReportDetailParts";
import { getReportStatusConfig } from "./ReportDetailStatus";
import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
  AlignLeft,
  Image as ImageIcon,
  Clock,
  Info,
} from "lucide-react";

export default function ReportDetailFeature() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [images, setImages] = useState<ReportImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canLoad = Boolean(id);

  const load = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getReportDetail({ reportId: id });
      const item = response?.data ?? null;

      if (!item) {
        setReport(null);
        setImages([]);
        setError("Report not found.");
        return;
      }

      setReport(item);
      const imagesData = (item as any).images || (item as any).Images || [];
      setImages(Array.isArray(imagesData) ? imagesData : []);
    } catch {
      setReport(null);
      setImages([]);
      setError("Failed to load report detail.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!canLoad) return;
    void load();
  }, [canLoad, load]);

  const status = report ? getReportStatusConfig(report.isResolved) : null;

  const header = useMemo(() => {
    if (!report || !status) return null;

    return (
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-900/40 shadow-xl shadow-gray-200/20 dark:shadow-none">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-purple-50 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20 opacity-50" />

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col gap-6">
            {/* Top Section */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              {/* Left: Title & Metadata */}
              <div className="flex items-start gap-4 flex-1">
                {/* Icon */}
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                  <FileText className="h-8 w-8 text-white" strokeWidth={2.5} />
                </div>

                {/* Title & Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      Report Details
                    </h1>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide ${status.bgColor} ${status.textColor} ${status.borderColor} shadow-sm`}
                    >
                      {status.icon}
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => nav(-1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 dark:hover:bg-gray-700/50 shadow-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>

                <button
                  type="button"
                  disabled={!report || saving}
                  onClick={async () => {
                    if (!report) return;
                    setSaving(true);
                    try {
                      const response = await resolveReport(report.id, {
                        isResolved: !report.isResolved,
                      });
                      setReport(response.data);
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                    report.isResolved
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-500/30 hover:from-amber-600 hover:to-amber-700"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700"
                  }`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : report.isResolved ? (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      <span>Reopen</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Mark Resolved</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 pt-4 border-t border-gray-200/60 dark:border-gray-800/60">
              <QuickInfo report={report} />
            </div>
          </div>
        </div>
      </div>
    );
  }, [nav, report, saving, status]);

  if (!canLoad) {
    return (
      <EmptyState
        title="Missing Report ID"
        description="No report ID was provided in the URL."
        icon={
          <AlertCircle
            className="h-16 w-16 text-gray-400 dark:text-gray-600"
            strokeWidth={1.5}
          />
        }
      />
    );
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200/60 dark:border-red-800/60 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-gray-900/40 p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30 shadow-sm">
            <AlertCircle
              className="h-7 w-7 text-red-600 dark:text-red-400"
              strokeWidth={2}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-900 dark:text-red-200">
              Error Loading Report
            </h3>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300 leading-relaxed">
              {error}
            </p>
            <button
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:from-red-700 hover:to-red-800 active:scale-[0.98]"
              type="button"
              onClick={() => void load()}
            >
              <RefreshCw className="h-4 w-4" />
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
        icon={
          <FileText
            className="h-16 w-16 text-gray-400 dark:text-gray-600"
            strokeWidth={1.5}
          />
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {header}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description Card */}
          <ContentCard
            title="Description"
            icon={<AlignLeft className="h-5 w-5" />}
          >
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 border border-gray-200/60 dark:border-gray-700/60">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {report.description || (
                  <span className="italic text-gray-400 dark:text-gray-500 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    No description provided
                  </span>
                )}
              </p>
            </div>
          </ContentCard>

          {/* Images Card */}
          <ContentCard
            title="Attached Images"
            icon={<ImageIcon className="h-5 w-5" />}
            badge={
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 dark:bg-blue-500/20 px-2.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                {images.length} {images.length === 1 ? "image" : "images"}
              </span>
            }
          >
            <ReportImages images={images} />
          </ContentCard>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Activity Timeline Card */}
          <ContentCard
            title="Activity Timeline"
            icon={<Clock className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <TimelineItem report={report} />
            </div>
          </ContentCard>

          {/* Additional Info Card */}
          <ContentCard
            title="Additional Info"
            icon={<Info className="h-5 w-5" />}
          >
            <div className="space-y-3">
              <InfoRow report={report} />
            </div>
          </ContentCard>
        </div>
      </div>
    </div>
  );
}
