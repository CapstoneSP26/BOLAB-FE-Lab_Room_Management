import { ChevronLeft, ChevronRight, Pencil, Power, Trash2 } from "lucide-react";
import { formatDate } from "../../../utils/formatDate";
import {
  getRoleLabel,
  getUserStatusLabel,
} from "../types/userManagement.mapper";
import type { UserListItem } from "../types/userManagement.type";

type Props = {
  rows: UserListItem[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onEdit: (user: UserListItem) => void;
  onToggleStatus: (user: UserListItem) => void;
  onDelete: (user: UserListItem) => void;
  actionLoadingId?: string | null;
};

export default function UserManagementTable({
  rows,
  loading,
  page,
  totalPages,
  totalCount,
  onPageChange,
  onEdit,
  onToggleStatus,
  onDelete,
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
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">User Code</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created At</th>
              <th className="px-4 py-3">Updated At</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-gray-500 dark:text-gray-400">
                  Loading users...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-gray-500 dark:text-gray-400">
                  No users found.
                </td>
              </tr>
            ) : (
              rows.map((user) => (
                <tr key={user.id} className="bg-white dark:bg-transparent">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {user.userCode || "-"}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {user.fullName || "-"}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {user.email || "-"}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {getRoleLabel(user.primaryRole)}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        user.isActive
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {getUserStatusLabel(user.isActive)}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {user.createdAt ? formatDate(user.createdAt, "DD/MM/YYYY") : "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                    {user.updatedAt ? formatDate(user.updatedAt, "DD/MM/YYYY") : "-"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="flex flex-nowrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(user)}
                        className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-800/60"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleStatus(user)}
                        disabled={actionLoadingId === user.id}
                        className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          user.isActive
                            ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-800/70"
                            : "border-sky-400/45 bg-sky-50/90 text-sky-900 hover:bg-sky-100/80 dark:border-sky-600/45 dark:bg-sky-950/35 dark:text-sky-100 dark:hover:bg-sky-900/45"
                        }`}
                      >
                        <Power className="h-3.5 w-3.5" />
                        {user.isActive ? "De-activate" : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(user)}
                        disabled={actionLoadingId === user.id}
                        className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 shadow-sm transition-all hover:bg-red-100 hover:text-red-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-300"
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
          / {Math.max(totalPages, 1)}. Total users:{" "}
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
