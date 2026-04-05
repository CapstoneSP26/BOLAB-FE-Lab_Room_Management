import { useMemo, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import type { SlotType } from "../../slot/types/slot.types";
import { useToast } from "../../../hooks/useToast";
import { getErrorMessage } from "../../../utils/error";
import {
  useCreateSlotType,
  useDeleteSlotType,
  useSlotTypesForManagement,
  useUpdateSlotType,
} from "../hooks/useSlotTypeManagement";
import type { UpsertSlotTypePayload } from "../types/scheduleManagement.type";
import SlotTypeFormModal from "./SlotTypeFormModal";

export default function SlotTypeManagementPanel() {
  const toast = useToast();
  const [campusFilter, setCampusFilter] = useState("");
  const campusId = useMemo(() => {
    const n = Number(campusFilter);
    return campusFilter.trim() !== "" && Number.isFinite(n) ? n : undefined;
  }, [campusFilter]);

  const { data, isLoading, isFetching, refetch } =
    useSlotTypesForManagement(campusId);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<SlotType | null>(null);

  const createMut = useCreateSlotType();
  const updateMut = useUpdateSlotType();
  const deleteMut = useDeleteSlotType();

  const rows = data ?? [];
  const loading = isLoading || isFetching;

  const openCreate = () => {
    setModalMode("create");
    setSelected(null);
    setModalOpen(true);
  };

  const openEdit = (st: SlotType) => {
    setModalMode("edit");
    setSelected(st);
    setModalOpen(true);
  };

  const handleSubmit = async (payload: UpsertSlotTypePayload) => {
    try {
      if (modalMode === "create") {
        await createMut.mutateAsync(payload);
        toast.success("Created", "Slot type has been created.");
      } else if (selected) {
        await updateMut.mutateAsync({ id: selected.id, payload });
        toast.success("Updated", "Slot type has been updated.");
      }
      setModalOpen(false);
      setSelected(null);
    } catch (e) {
      toast.error(
        "Request failed",
        getErrorMessage(e, "Unable to save slot type."),
      );
    }
  };

  const handleDelete = async (st: SlotType) => {
    if (
      !window.confirm(
        `Delete slot type "${st.name}" (${st.code})? This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await deleteMut.mutateAsync(st.id);
      toast.success("Deleted", "Slot type removed.");
    } catch (e) {
      toast.error(
        "Delete failed",
        getErrorMessage(e, "Unable to delete slot type."),
      );
    }
  };

  const busy =
    createMut.isPending || updateMut.isPending || deleteMut.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            Campus ID
            <input
              type="number"
              min={1}
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value)}
              placeholder="All"
              className="w-28 rounded-lg border border-gray-200 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </label>
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" />
          Add slot type
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Frames</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-gray-500 dark:text-gray-400"
                  >
                    Loading slot types...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-gray-500 dark:text-gray-400"
                  >
                    No slot types found.
                  </td>
                </tr>
              ) : (
                rows.map((st) => (
                  <tr key={st.id} className="bg-white dark:bg-transparent">
                    <td className="px-4 py-3 font-mono text-xs">{st.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {st.code}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {st.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {st.slotFrames?.length ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(st)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deleteMut.isPending}
                          onClick={() => void handleDelete(st)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
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
      </div>

      <SlotTypeFormModal
        isOpen={modalOpen}
        mode={modalMode}
        slotType={selected}
        isLoading={busy}
        onClose={() => {
          if (!busy) {
            setModalOpen(false);
            setSelected(null);
          }
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
