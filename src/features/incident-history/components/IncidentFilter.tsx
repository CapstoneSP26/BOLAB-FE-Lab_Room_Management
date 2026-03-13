export type IncidentSortKey = "Newest" | "Oldest" | "Room";
export type IncidentStatusFilter = "ALL" | "OPEN" | "CLOSED" | "RESOLVED";

type Props = {
  q: string;
  onQ: (v: string) => void;

  roomId: number | "ALL";
  onRoomId: (v: number | "ALL") => void;

  status: IncidentStatusFilter;
  onStatus: (v: IncidentStatusFilter) => void;

  sort: IncidentSortKey;
  onSort: (v: IncidentSortKey) => void;

  roomOptions: number[];

  onClear?: () => void;
};

export default function IncidentFilters({
  q,
  onQ,
  roomId,
  onRoomId,
  status,
  onStatus,
  sort,
  onSort,
  roomOptions,
  onClear,
}: Props) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-12">
      <div className="md:col-span-6">
        <input
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder="Search by id, report id, room, title, status, severity..."
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
          onChange={(e) => onStatus(e.target.value as IncidentStatusFilter)}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="ALL">All status</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
          <option value="OPEN">OPEN</option>
        </select>
      </div>

      <div className="md:col-span-2 flex gap-2">
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value as IncidentSortKey)}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="Newest">Newest</option>
          <option value="Oldest">Oldest</option>
          <option value="Room">Room</option>
        </select>

        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="h-11 shrink-0 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.04]"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
