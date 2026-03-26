import type { Building } from "../../building/types/building.type";
import type { Room } from "../../room/types/room.type";
import type {
  BookingStatusLookupItem,
  HistoryStatus,
} from "../types/schedule.type";

type Props = {
  q: string;
  onQ: (v: string) => void;

  building: string;
  onBuilding: (v: string) => void;
  buildingOptions: Building[];

  roomId: number | "ALL";
  onRoomId: (v: number | "ALL") => void;
  roomOptions: Room[];

  status: HistoryStatus;
  onStatus: (v: HistoryStatus) => void;
  statusOptions: BookingStatusLookupItem[];

  from: string;
  onFrom: (v: string) => void;

  to: string;
  onTo: (v: string) => void;
};
function toStatusLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function HistoryBookingFilter({
  q,
  onQ,
  building,
  onBuilding,
  buildingOptions,
  roomId,
  onRoomId,
  roomOptions,
  status,
  onStatus,
  statusOptions,
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
            Building
          </label>
          <select
            value={building}
            onChange={(e) => onBuilding(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="ALL">All buildings</option>
            {buildingOptions.map((b) => (
              <option key={String(b.id)} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
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
              <option key={r.id} value={String(r.id)}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => onStatus(e.target.value as HistoryStatus)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="ALL">All status</option>
            {statusOptions.map((s) => (
              <option key={s.code} value={s.code}>
                {toStatusLabel(s.name)}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
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
