import { useEffect, useMemo } from "react";
import type { Incident } from "../type";

type Props = {
  open: boolean;
  incident: Incident | null;
  onClose: () => void;
};

const norm = (v: unknown) => String(v ?? "").toUpperCase();

function fmt(v?: string) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

function statusBadgeClass(v: unknown) {
  const st = norm(v);
  if (st === "OPEN")
    return "bg-amber-500/15 text-amber-700 dark:text-amber-200";
  if (st === "CLOSED") return "bg-gray-500/10 text-gray-700 dark:text-gray-200";
  return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200";
}

function severityBadgeClass(v: unknown) {
  const st = norm(v);
  if (st === "CRITICAL") return "bg-red-500/15 text-red-700 dark:text-red-200";
  if (st === "HIGH")
    return "bg-orange-500/15 text-orange-700 dark:text-orange-200";
  if (st === "LOW") return "bg-gray-500/10 text-gray-700 dark:text-gray-200";
  return "bg-amber-500/15 text-amber-700 dark:text-amber-200";
}

function shortId(id?: string, keep = 8) {
  if (!id) return "-";
  if (id.length <= keep * 2 + 3) return id;
  return `${id.slice(0, keep)}...${id.slice(-keep)}`;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div className="mt-1 break-words text-sm font-semibold text-gray-900 dark:text-white/90">
        {value}
      </div>
    </div>
  );
}

export default function IncidentModal({ open, incident, onClose }: Props) {
  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // lock scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const statusLabel = useMemo(
    () => (incident ? norm(incident.Status) : ""),
    [incident],
  );
  const severityLabel = useMemo(
    () => (incident ? norm(incident.Severity) : ""),
    [incident],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/45 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[900px] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-gray-200 p-6 dark:border-gray-800">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-xl font-semibold text-gray-900 dark:text-white/90">
                Incident details
              </h3>

              {incident ? (
                <>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                      incident.Status,
                    )}`}
                  >
                    {statusLabel}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${severityBadgeClass(
                      incident.Severity,
                    )}`}
                  >
                    {severityLabel}
                  </span>
                </>
              ) : null}
            </div>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Review archived incident information from resolved report.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-[0.99] dark:bg-white/[0.06] dark:text-gray-300 dark:hover:bg-white/[0.1]"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="no-scrollbar max-h-[75vh] overflow-y-auto p-6">
          {!incident ? (
            <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-200">
              Incident not found.
            </div>
          ) : (
            <>
              {/* Top summary card */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex flex-col gap-1">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Title
                  </div>
                  <div className="text-base font-semibold text-gray-900 dark:text-white/90">
                    {incident.Title}
                  </div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Description
                  </div>
                  <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
                    {incident.Description}
                  </div>
                </div>
              </div>

              {/* Grid info */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Info label="Incident Id" value={shortId(incident.Id)} />
                <Info label="Report Id" value={shortId(incident.ReportId)} />
                <Info label="LabRoomId" value={String(incident.LabRoomId)} />
                <Info label="CreatedAt" value={fmt(incident.CreatedAt)} />
                <Info label="ResolvedAt" value={fmt(incident.ResolvedAt)} />
                <Info label="ResolvedBy" value={incident.ResolvedBy ?? "-"} />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.04]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
