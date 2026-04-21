import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import type { BuildingDto } from "../types/building.type";

type Props = {
  rows: BuildingDto[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onEdit: (building: BuildingDto) => void;
  onDelete: (building: BuildingDto) => void;
  actionLoadingId?: number | null;
};

export default function BuildingManagementTable({
  rows,
  loading,
  page,
  totalPages,
  totalCount,
  onPageChange,
  onEdit,
  onDelete,
  actionLoadingId,
}: Props) {
  const safeTotalPages = Math.max(totalPages, 1);
  const pageButtons = Array.from(
    { length: Math.min(5, safeTotalPages) },
    (_, index) => {
      const startPage = Math.max(1, Math.min(page - 2, safeTotalPages - 4));
      return startPage + index;
    },
  ).filter((value) => value <= safeTotalPages);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Building</th>
              <th className="px-4 py-3">Campus</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Rooms</th>
              <th className="min-w-[200px] px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-gray-500 dark:text-gray-400"
                >
                  Loading buildings...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-gray-500 dark:text-gray-400"
                >
                  No buildings found.
                </td>
              </tr>
            ) : (
              rows.map((building) => (
                <tr key={building.id} className="bg-white dark:bg-transparent">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/30">
                        {building.buildingImageUrl ? (
                          <img
                            src={building.buildingImageUrl}
                            alt={building.buildingName}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : null}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {building.buildingName}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          ID: {building.id} • Campus ID: {building.campusId}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {building.campusName || "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    <span className="line-clamp-2 block max-w-[520px]">
                      {building.description || "-"}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right font-semibold text-gray-900 dark:text-white">
                    {building.roomCount ?? 0}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(building)}
                        className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-800/60"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(building)}
                        disabled={actionLoadingId === building.id}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 shadow-sm transition-all hover:bg-red-100 hover:text-red-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-300"
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
          Page{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {page}
          </span>{" "}
          / {safeTotalPages}. Total buildings:{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {totalCount}
          </span>
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
            onClick={() => onPageChange(Math.min(safeTotalPages, page + 1))}
            disabled={page >= safeTotalPages}
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

