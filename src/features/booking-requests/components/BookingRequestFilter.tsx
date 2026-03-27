import type { Building } from "../../building/types/building.type";
import type { LabRoomLookupItem } from "../../labroom/types/room.type";
import type { SlotType } from "../../slot/types/slot.types";

type SlotTypeFilter = "ALL" | string;

type Props = {
  q: string;
  onQ: (v: string) => void;

  roomId: number | "ALL";
  onRoomId: (v: number | "ALL") => void;

  buildingId: number | "ALL";
  onBuildingId: (v: number | "ALL") => void;

  slotType: SlotTypeFilter;
  onSlotType: (v: SlotTypeFilter) => void;

  roomOptions: LabRoomLookupItem[];
  buildingOptions: Building[];
  slotOptions: SlotType[];
};

export default function BookingFilters({
  q,
  onQ,
  roomId,
  onRoomId,
  buildingId,
  onBuildingId,
  slotType,
  onSlotType,
  roomOptions,
  buildingOptions,
  slotOptions,
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
            Building
          </label>
          <select
            value={buildingId}
            onChange={(e) =>
              onBuildingId(
                e.target.value === "ALL" ? "ALL" : Number(e.target.value),
              )
            }
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="ALL">All buildings</option>
            {buildingOptions.map((b) => (
              <option key={String(b.id)} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
            Room
          </label>
          <select
            value={String(roomId)}
            onChange={(e) =>
              onRoomId(
                e.target.value === "ALL" ? "ALL" : Number(e.target.value),
              )
            }
            disabled={buildingId === "ALL"}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800 dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
          >
            <option value="ALL">
              {buildingId === "ALL" ? "Select building first" : "All rooms"}
            </option>
            {roomOptions.map((r) => (
              <option key={r.id} value={String(r.id)}>
                {r.roomName} - {r.buildingName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
            Slot Type
          </label>
          <select
            value={slotType}
            onChange={(e) => onSlotType(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="ALL">All slot types</option>
            {slotOptions.map((slot) => (
              <option key={slot.id} value={slot.code}>
                {slot.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
