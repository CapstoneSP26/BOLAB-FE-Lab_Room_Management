import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";
import { formatDate } from "../../../utils/formatDate";
import type { LabRoomDto } from "../types/room.type";
import { getLabRoomStatusLabel } from "../types/room.mapper";

type Props = {
  rows: LabRoomDto[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onEdit: (room: LabRoomDto) => void;
  onToggleStatus: (room: LabRoomDto) => void;
  onDelete: (room: LabRoomDto) => void;
  onManagePolicies: (room: LabRoomDto) => void;
  actionLoadingId?: number | null;
};

export default function RoomManagementTable({
  rows,
  loading,
  page,
  totalPages,
  totalCount,
  onPageChange,
  onEdit,
  onToggleStatus,
  onDelete,
  onManagePolicies,
  actionLoadingId,
}: Props) {
  const pageButtons = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => {
      const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
      return startPage + index;
    },
  ).filter((value) => value <= totalPages);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Room ID</th>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Building</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Equipment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated At</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-gray-500 dark:text-gray-400">
                  Loading rooms...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-gray-500 dark:text-gray-400">
                  No lab rooms found.
                </td>
              </tr>
            ) : (
              rows.map((room) => (
                <tr key={room.id} className="bg-white dark:bg-transparent">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      #{room.id}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {room.roomNo || "No room number"}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {room.roomName || "-"}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {room.location || "No location"}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {room.buildingName || "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {room.capacity}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        room.hasEquipment
                          ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                          : "bg-gray-500/15 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {room.hasEquipment ? "Ready" : "Not ready"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        room.isActive
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {getLabRoomStatusLabel(room.isActive)}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {room.updatedAt && room.updatedAt !== "Invalid Date"
                      ? formatDate(room.updatedAt, "DD/MM/YYYY")
                      : room.createdAt
                        ? formatDate(room.createdAt, "DD/MM/YYYY")
                        : "-"}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onManagePolicies(room)}
                        className="inline-flex items-center gap-1 rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100 dark:border-sky-700/60 dark:bg-sky-500/10 dark:text-sky-300"
                      >
                        <ClipboardList className="h-3.5 w-3.5" />
                        Policies
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(room)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.04]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleStatus(room)}
                        disabled={actionLoadingId === room.id}
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-white ${
                          room.isActive
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        <Power className="h-3.5 w-3.5" />
                        {room.isActive ? "De-activate" : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(room)}
                        disabled={actionLoadingId === room.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-gray-200 bg-gray-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900/40">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Page <span className="font-semibold text-gray-900 dark:text-white">{page}</span>{" "}
          / {Math.max(totalPages, 1)}. Total rooms:{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{totalCount}</span>
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          {pageButtons.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onPageChange(value)}
              className={`h-10 w-10 rounded-lg text-sm font-semibold transition ${
                value === page
                  ? "bg-brand-500 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              }`}
            >
              {value}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
