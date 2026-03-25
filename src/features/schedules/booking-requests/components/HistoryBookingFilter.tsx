type HistoryStatus = "ALL" | "APPROVED" | "REJECTED";

type Props = {
  q: string;
  onQ: (v: string) => void;

  roomId: number | "ALL";
  onRoomId: (v: number | "ALL") => void;
  roomOptions: number[];

  status: HistoryStatus;
  onStatus: (v: HistoryStatus) => void;

  from: string; // YYYY-MM-DD
  onFrom: (v: string) => void;

  to: string; // YYYY-MM-DD
  onTo: (v: string) => void;
};

export default function HistoryBookingFilter({
  q,
  onQ,
  roomId,
  onRoomId,
  roomOptions,
  status,
  onStatus,
  from,
  onFrom,
  to,
  onTo,
}: Props) {
  return (
    <div className="mb-4 space-y-3">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <svg
            className="h-4 w-4 text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder="Search by id, user, room, purpose, reason..."
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Room
          </label>
          <select
            value={String(roomId)}
            onChange={(e) =>
              onRoomId(
                e.target.value === "ALL" ? "ALL" : Number(e.target.value),
              )
            }
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="ALL">All rooms</option>
            {roomOptions.map((r) => (
              <option key={r} value={String(r)}>
                Room {r}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            Status
          </label>
          <select
            value={status}
            onChange={(e) => onStatus(e.target.value as HistoryStatus)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="ALL">All status</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="relative">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z"
              />
            </svg>
            From date
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => onFrom(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
          />
        </div>

        <div className="relative">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z"
              />
            </svg>
            To date
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => onTo(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
          />
        </div>
      </div>
    </div>
  );
}
