import { Filter, Flag, MapPin, Users } from "lucide-react";

type PriorityFilter = "ALL" | "SCHOOL_EVENT" | "ACADEMIC" | "NORMAL";

type RoomSummary = {
  id: string | number;
  name: string;
  capacity?: number;
  pendingCount?: number;
  conflictCount?: number;
};

type Props = {
  selectedRoomId: number | "ALL";
  onSelectedRoomIdChange: (value: number | "ALL") => void;
  conflictOnly: boolean;
  onConflictOnlyChange: (value: boolean) => void;
  priorityFilter: PriorityFilter;
  onPriorityFilterChange: (value: PriorityFilter) => void;
  roomSummaries?: RoomSummary[];
};

function LegendItem({
  label,
  tone,
}: {
  label: string;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`h-3 w-3 rounded-full ${tone}`} />
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
    </div>
  );
}

export default function TimelineSidebar({
  selectedRoomId,
  onSelectedRoomIdChange,
  conflictOnly,
  onConflictOnlyChange,
  priorityFilter,
  onPriorityFilterChange,
  roomSummaries = [],
}: Props) {
  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Filters & Legend</h2>
      </div>

      <section className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Priority Legend</h3>
        <div className="space-y-2">
          <LegendItem label="School Event" tone="bg-rose-500" />
          <LegendItem label="Academic" tone="bg-orange-500" />
          <LegendItem label="Normal" tone="bg-blue-500" />
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Quick Filters</h3>
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
          <span className="text-gray-700 dark:text-gray-300">Conflict only</span>
          <input
            type="checkbox"
            checked={conflictOnly}
            onChange={(e) => onConflictOnlyChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
          />
        </label>

        <select
          value={priorityFilter}
          onChange={(e) => onPriorityFilterChange(e.target.value as PriorityFilter)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        >
          <option value="ALL">All priorities</option>
          <option value="SCHOOL_EVENT">School Event</option>
          <option value="ACADEMIC">Academic</option>
          <option value="NORMAL">Normal</option>
        </select>
      </section>

      <section className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Rooms</h3>
        </div>

        <select
          value={selectedRoomId}
          onChange={(e) => {
            const value = e.target.value;
            onSelectedRoomIdChange(value === "ALL" ? "ALL" : Number(value));
          }}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        >
          <option value="ALL">All rooms</option>
          {roomSummaries.map((room) => (
            <option key={String(room.id)} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>

        <div className="space-y-2">
          {roomSummaries.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No room summary data yet.</p>
          ) : (
            roomSummaries.map((room) => (
              <button
                key={String(room.id)}
                type="button"
                onClick={() => onSelectedRoomIdChange(typeof room.id === "number" ? room.id : Number(room.id))}
                className={`w-full rounded-xl border px-3 py-3 text-left transition ${String(selectedRoomId) === String(room.id)
                  ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20"
                  : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                  }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{room.name}</div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{room.capacity ?? "-"}</span>
                      <span>Pending {room.pendingCount ?? 0}</span>
                      <span className="text-red-500">Conflicts {room.conflictCount ?? 0}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
