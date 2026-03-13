type Props<TSort extends string> = {
  q: string;
  onQ: (v: string) => void;

  roomId: number | "ALL";
  onRoomId: (v: number | "ALL") => void;

  sort: TSort;
  onSort: (v: TSort) => void;

  roomOptions: number[];
};

export default function BookingFilters<TSort extends string>({
  q,
  onQ,
  roomId,
  onRoomId,
  sort,
  onSort,
  roomOptions,
}: Props<TSort>) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-12">
      <div className="md:col-span-6">
        <input
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder="Search by id, user, room, purpose, reason..."
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="md:col-span-3">
        <select
          value={String(roomId)}
          onChange={(e) =>
            onRoomId(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
          }
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="ALL">All rooms</option>
          {roomOptions.map((r) => (
            <option key={r} value={String(r)}>
              Room {r}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-3">
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value as TSort)}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          {(["Old_slot", "New_slot", "Out_slot"] as unknown as TSort[]).map(
            (k) => (
              <option key={k} value={k}>
                Slot: {String(k).replace("_", " ").toLowerCase()}
              </option>
            ),
          )}
        </select>
      </div>
    </div>
  );
}
