import type { ReportType } from "../type";

type ResolvedFilter = "ALL" | "RESOLVED" | "UNRESOLVED";
type ReportTypeFilter = ReportType | "ALL";

function isReportTypeFilter(v: string): v is ReportTypeFilter {
  return (
    v === "ALL" ||
    v === "USER" ||
    v === "LAB_ROOM" ||
    v === "BOOKING" ||
    v === "INCIDENT"
  );
}

function isResolvedFilter(v: string): v is ResolvedFilter {
  return v === "ALL" || v === "RESOLVED" || v === "UNRESOLVED";
}

export default function ReportListFilters({
  reportType,
  onReportType,
  resolved,
  onResolved,
  q,
  onQ,
  from,
  to,
  onFrom,
  onTo,
  onReset,
  onGenerate,
}: {
  reportType: ReportTypeFilter;
  onReportType: (v: ReportTypeFilter) => void;
  resolved: ResolvedFilter;
  onResolved: (v: ResolvedFilter) => void;
  q: string;
  onQ: (v: string) => void;
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
  onReset: () => void;
  onGenerate: () => void;
}) {
  const input =
    "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800";

  return (
    <div className="mb-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-3">
          <div className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
            Report type
          </div>
          <select
            className={input}
            value={reportType}
            onChange={(e) => {
              const v = e.target.value;
              if (isReportTypeFilter(v)) onReportType(v);
            }}
          >
            <option value="ALL">All</option>
            <option value="USER">User</option>
            <option value="LAB_ROOM">Lab Room</option>
            <option value="BOOKING">Booking</option>
            <option value="INCIDENT">Incident</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <div className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
            Status
          </div>
          <select
            className={input}
            value={resolved}
            onChange={(e) => {
              const v = e.target.value;
              if (isResolvedFilter(v)) onResolved(v);
            }}
          >
            <option value="ALL">All</option>
            <option value="UNRESOLVED">Pending</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <div className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
            From
          </div>
          <input
            className={input}
            type="date"
            value={from}
            onChange={(e) => onFrom(e.target.value)}
          />
        </div>

        <div className="md:col-span-3">
          <div className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
            To
          </div>
          <input
            className={input}
            type="date"
            value={to}
            onChange={(e) => onTo(e.target.value)}
          />
        </div>

        <div className="md:col-span-8">
          <div className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
            Keyword
          </div>
          <input
            className={input}
            value={q}
            onChange={(e) => onQ(e.target.value)}
            placeholder="Search..."
          />
        </div>

        <div className="md:col-span-4 flex items-end justify-end gap-2">
          <button
            type="button"
            onClick={onReset}
            className="h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.04]"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onGenerate}
            className="h-11 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
