import type { LabRoomLookupItem } from "../../labroom/types/room.type";
import type { Building } from "../../building/types/building.type";

type Props = {
  q: string;
  onQ: (v: string) => void;

  roomId: number | "ALL";
  onRoomId: (v: number | "ALL") => void;

  buildingId: number | "ALL";
  onBuildingId: (v: number | "ALL") => void;

  roomOptions: LabRoomLookupItem[];
  buildingOptions: Building[];

  onReset: () => void;
  onGenerate: () => void | Promise<void>;
};

export default function ReportListFilters({
  q,
  onQ,
  roomId,
  onRoomId,
  buildingId,
  onBuildingId,
  roomOptions,
  buildingOptions,
  onReset,
  onGenerate,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
      <div className="md:col-span-4">
        <input
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder="Search reports..."
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="md:col-span-2">
        <select
          value={String(buildingId)}
          onChange={(e) =>
            onBuildingId(
              e.target.value === "ALL" ? "ALL" : Number(e.target.value),
            )
          }
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="ALL">All buildings</option>
          {buildingOptions.map((building) => (
            <option key={building.id} value={String(building.id)}>
              {building.name}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2">
        <select
          value={String(roomId)}
          onChange={(e) =>
            onRoomId(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
          }
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
        >
          <option value="ALL">All rooms</option>
          {roomOptions.map((room) => (
            <option key={room.id} value={String(room.id)}>
              {room.roomName}
              {room.buildingName ? ` - ${room.buildingName}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-12 flex gap-2">
        <button
          type="button"
          onClick={onGenerate}
          className="h-11 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Apply
        </button>

        <button
          type="button"
          onClick={onReset}
          className="h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.04]"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
