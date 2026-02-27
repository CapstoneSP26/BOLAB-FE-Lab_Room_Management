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
    <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
      <div className="md:col-span-4">
        <input
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder="Search by id, user, room, purpose, reason..."
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="md:col-span-2">
        <select
          value={roomId}
          onChange={(e) =>
            onRoomId(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
          }
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="ALL">All rooms</option>
          {roomOptions.map((r) => (
            <option key={r} value={r}>
              Room {r}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2">
        <select
          value={status}
          onChange={(e) => onStatus(e.target.value as HistoryStatus)}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="ALL">All status</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <input
          type="date"
          value={from}
          onChange={(e) => onFrom(e.target.value)}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        />
      </div>

      <div className="md:col-span-2">
        <input
          type="date"
          value={to}
          onChange={(e) => onTo(e.target.value)}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        />
      </div>
    </div>
  );
}
