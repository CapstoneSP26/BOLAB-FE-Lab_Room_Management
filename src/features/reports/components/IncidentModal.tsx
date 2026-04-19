import type { Incident } from "../types/report.type";

type Props = {
  open: boolean;
  incident: Incident | null;
  onClose: () => void;
};

function fmt(v?: string) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;

  return d.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function IncidentModal({ open, incident, onClose }: Props) {
  if (!open || !incident) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Incident Details
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Review full incident information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoRow label="Incident ID" value={incident.Id} mono />
          <InfoRow label="Report ID" value={incident.ReportId} mono />
          <InfoRow label="Room" value={`Room ${incident.LabRoomId}`} />
          <InfoRow label="Title" value={incident.Title} />
          <InfoRow label="Severity" value={incident.Severity} />
          <InfoRow label="Status" value={incident.Status} />
          <InfoRow label="Created At" value={fmt(incident.CreatedAt)} />
          <InfoRow label="Resolved At" value={fmt(incident.ResolvedAt ?? undefined)} />
          <InfoRow label="Resolved By" value={incident.ResolvedBy ?? "-"} />
        </div>

        <div className="mt-5 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Description
          </div>
          <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
            {incident.Description || "No description provided"}
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black dark:bg-white dark:text-gray-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div
        className={`mt-1 text-sm font-semibold text-gray-900 dark:text-white ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
