import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";
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
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
          <tr>
            <th className="px-4 py-3">Room</th>
            <th className="px-4 py-3 w-16 text-center">Cap.</th>
            <th className="px-4 py-3 w-24 text-center">Equipment</th>
            <th className="px-4 py-3">Manager</th>
            <th className="px-4 py-3 w-24 text-center">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {loading ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-gray-500 dark:text-gray-400">
                Loading rooms...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-gray-500 dark:text-gray-400">
                No lab rooms found.
              </td>
            </tr>
          ) : (
            rows.map((room) => (
              <tr key={room.id} className="bg-white dark:bg-transparent">
                {/* Room */}
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900 dark:text-white leading-tight">
                    {room.roomName || "-"}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {room.roomNo || "No number"}
                    {room.buildingName ? ` · ${room.buildingName}` : ""}
                  </div>
                </td>

                {/* Capacity */}
                <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                  {room.capacity}
                </td>

                {/* Equipment */}
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      room.hasEquipment
                        ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                        : "bg-gray-500/15 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {room.hasEquipment ? "Ready" : "No"}
                  </span>
                </td>

                {/* Manager */}
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800 dark:text-gray-200 leading-tight">
                    {room.labOwner?.fullName || "-"}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                    {room.labOwner?.email || "-"}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      room.isActive
                        ? "bg-sky-500/15 text-sky-800 dark:text-sky-200"
                        : "bg-slate-400/15 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {getLabRoomStatusLabel(room.isActive)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onManagePolicies(room)}
                      title="Manage Policies"
                      className="inline-flex items-center gap-1 rounded-lg border border-sky-300/80 bg-white px-2.5 py-1.5 text-xs font-semibold text-sky-800 transition hover:bg-sky-50 dark:border-sky-700/50 dark:bg-sky-950/20 dark:text-sky-200 dark:hover:bg-sky-900/35"
                    >
                      <ClipboardList className="h-3.5 w-3.5" />
                      Policies
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(room)}
                      title="Edit"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-800/60"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleStatus(room)}
                      disabled={actionLoadingId === room.id}
                      title={room.isActive ? "Deactivate" : "Activate"}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        room.isActive
                          ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-200"
                          : "border-sky-400/45 bg-sky-50 text-sky-900 hover:bg-sky-100 dark:border-sky-600/45 dark:bg-sky-950/35 dark:text-sky-100"
                      }`}
                    >
                      <Power className="h-3.5 w-3.5" />
                      {room.isActive ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(room)}
                      disabled={actionLoadingId === room.id}
                      title="Delete"
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900/40"
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

      {/* Pagination */}
      <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900/40">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Page{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{page}</span>
          {" "}/{" "}{Math.max(totalPages, 1)} · Total:{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{totalCount}</span>{" "}rooms
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>

          {pageButtons.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onPageChange(value)}
              className={`h-8 w-8 rounded-lg text-sm font-semibold transition ${
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
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}