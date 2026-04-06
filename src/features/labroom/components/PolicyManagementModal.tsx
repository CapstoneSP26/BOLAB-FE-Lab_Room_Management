import { useState, type FormEvent } from "react";
import {
  ClipboardList,
  Loader2,
  Pencil,
  Save,
  Trash2,
  X,
  Shield,
  Eye,
  AlertCircle,
  Info,
  Settings2,
  Sparkles,
} from "lucide-react";
import { useToast } from "../../../hooks/useToast";
import { getErrorMessage } from "../../../utils/error";
import {
  useDeleteRoomPolicy,
  useRoomPolicies,
  useUpdateRoomPolicy,
} from "../hooks/useLabRooms";
import  type {LabRoomPolicy } from "../types/policy.type";
import type { LabRoomDto } from "../types/room.type";
import { POLICY_META } from "../constants/policyManagementModal.constants";
type Props = {
  isOpen: boolean;
  room: LabRoomDto | null;
  onClose: () => void;
  isAdmin?: boolean;
};


const getPolicyKey = (policy: LabRoomPolicy) =>
  policy.policyKeyName || policy.policyKey;

export default function PolicyManagementModal({
  isOpen,
  room,
  onClose,
  isAdmin = false,
}: Props) {
  const toast = useToast();
  const roomId = room?.id ?? 0;
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [valueError, setValueError] = useState("");

  const {
    data: policies = [],
    isLoading,
    isFetching,
  } = useRoomPolicies(roomId, isOpen && roomId > 0);

  const updatePolicyMutation = useUpdateRoomPolicy({
    onSuccess: () => {
      toast.success("Policy updated", "The policy value has been saved.");
      setEditingKey(null);
      setValue("");
      setValueError("");
    },
    onError: (error) => {
      toast.error(
        "Update failed",
        getErrorMessage(error, "Unable to update room policy."),
      );
    },
  });

  const deletePolicyMutation = useDeleteRoomPolicy({
    onSuccess: () => {
      toast.success("Policy deleted", "The room policy has been removed.");
      if (editingKey) {
        setEditingKey(null);
        setValue("");
      }
    },
    onError: (error) => {
      toast.error(
        "Delete failed",
        getErrorMessage(error, "Unable to delete room policy."),
      );
    },
  });

  const effectiveEditingKey = isAdmin ? editingKey : null;

  if (!isOpen || !room) {
    return null;
  }

  const validateValue = () => {
    if (!value.trim()) {
      setValueError("Policy value is required.");
      return false;
    }
    setValueError("");
    return true;
  };

  const handleEdit = (policy: LabRoomPolicy) => {
    if (!isAdmin) return;
    const key = getPolicyKey(policy);
    setEditingKey(key);
    setValue(policy.policyValue);
    setValueError("");
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setValue("");
    setValueError("");
  };

  const handleSubmitValue = async (event: FormEvent) => {
    event.preventDefault();
    if (!effectiveEditingKey || !validateValue()) return;

    await updatePolicyMutation.mutateAsync({
      labRoomId: roomId,
      policyKey: effectiveEditingKey,
      payload: { policyValue: value.trim() },
    });
  };

  const handleDelete = async (policy: LabRoomPolicy) => {
    if (!isAdmin) return;
    const policyKey = getPolicyKey(policy);
    if (
      !window.confirm(
        `Delete policy "${POLICY_META[policyKey as keyof typeof POLICY_META]?.label || policyKey}" from ${room.roomName}?`,
      )
    ) {
      return;
    }
    await deletePolicyMutation.mutateAsync({ labRoomId: roomId, policyKey });
  };

  const activeMeta = effectiveEditingKey
    ? POLICY_META[effectiveEditingKey as keyof typeof POLICY_META]
    : undefined;

  const isSubmitting =
    updatePolicyMutation.isPending || deletePolicyMutation.isPending;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-gray-200/60 dark:border-gray-800/60">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/30 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/10" />

          <div className="relative px-6 py-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {/* Icon */}
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
                  <ClipboardList
                    className="h-8 w-8 text-white"
                    strokeWidth={2.5}
                  />
                </div>

                {/* Title & Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                      Room Policies
                    </h2>
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 shadow-sm">
                        <Shield className="h-3.5 w-3.5" />
                        ADMIN MODE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 dark:bg-gray-500/20 px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-500/30">
                        <Eye className="h-3.5 w-3.5" />
                        VIEW ONLY
                      </span>
                    )}
                  </div>

                  {/* Room Name */}
                  <div className="inline-flex items-center gap-2 rounded-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-3 py-1.5 mb-2 border border-gray-200/60 dark:border-gray-700/60">
                    <Settings2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      {room.roomName}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {isAdmin ? (
                      <>
                        Manage policies:{" "}
                        <strong className="text-blue-600 dark:text-blue-400">
                          update value
                        </strong>{" "}
                        and{" "}
                        <strong className="text-red-600 dark:text-red-400">
                          delete
                        </strong>{" "}
                          — do not create new policies from this interface.
                      </>
                    ) : (
                      <>View mode — cannot perform edit operations</>
                    )}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl p-2.5 text-gray-500 transition-all hover:bg-white/80 hover:text-gray-700 disabled:cursor-not-allowed dark:hover:bg-gray-800 dark:hover:text-gray-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div
            className={`grid gap-6 p-6 ${isAdmin ? "lg:grid-cols-[1.5fr_1fr]" : ""}`}
          >
            {/* Left: Policies List */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 overflow-hidden bg-white dark:bg-gray-900/40 shadow-sm">
                {/* List Header */}
                <div className="border-b border-gray-200/60 dark:border-gray-800/60 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/30 px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        Configured Policies
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {isAdmin
                          ? "Nhấn Edit để sửa hoặc Delete để xóa"
                          : "Xem danh sách các policies đã được cấu hình"}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-500/20 dark:to-purple-500/20 px-3.5 py-2 border border-blue-200 dark:border-blue-500/30">
                      <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                        {policies.length}{" "}
                        {policies.length === 1 ? "policy" : "policies"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Policies List */}
                <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {isLoading || isFetching ? (
                    <div className="px-5 py-16 text-center">
                      <div className="inline-flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Loading policies...
                        </p>
                      </div>
                    </div>
                  ) : policies.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                      <div className="inline-flex flex-col items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                          <AlertCircle className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            No policies configured
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {isAdmin
                              ? "Policy được gán từ hệ thống — không thêm mới tại đây."
                              : "This room has no active policies"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    policies.map((policy) => {
                      const policyKey = getPolicyKey(policy);
                      const meta =
                        POLICY_META[policyKey as keyof typeof POLICY_META];
                      const isEditing = effectiveEditingKey === policyKey;

                      return (
                        <div
                          key={policyKey}
                          className={`group transition-all duration-200 ${
                            isEditing
                              ? "bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-amber-500/10 dark:to-orange-500/5"
                              : "hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                          }`}
                        >
                          <div className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-start md:justify-between">
                            {/* Policy Content */}
                            <div className="min-w-0 flex-1">
                              {/* Header */}
                              <div className="flex items-start gap-3 mb-3">
                                <span className="text-3xl flex-shrink-0 mt-0.5">
                                  {meta?.icon || "⚙️"}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    <h4 className="font-bold text-base text-gray-900 dark:text-white">
                                      {meta?.label || policyKey}
                                    </h4>
                                    {isEditing && (
                                      <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/20 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 animate-pulse">
                                        <Pencil className="h-2.5 w-2.5" />
                                        EDITING
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                                    {policyKey}
                                    {policy.labRoomId && (
                                      <span className="ml-2 text-gray-400">
                                        · Room #{policy.labRoomId}
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {meta?.hint || "No description available"}
                                  </p>
                                </div>
                              </div>

                              {/* Value Badge */}
                              <div className="ml-12">
                                <div className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-50 via-purple-50/50 to-pink-50/30 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/5 px-4 py-3 border border-blue-200/60 dark:border-blue-500/30 shadow-sm">
                                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    Value:
                                  </span>
                                  <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                                    {policy.policyValue}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            {isAdmin && (
                              <div className="flex flex-wrap gap-2 ml-12 md:ml-0">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(policy)}
                                  disabled={isSubmitting}
                                  className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 hover:border-blue-300 disabled:opacity-50 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20 transition-all shadow-sm hover:shadow"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDelete(policy)}
                                  disabled={deletePolicyMutation.isPending}
                                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-xs font-bold text-white hover:from-red-700 hover:to-red-800 disabled:opacity-50 shadow-lg shadow-red-500/30 hover:shadow-xl transition-all active:scale-95"
                                >
                                  {deletePolicyMutation.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                  )}
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right: Edit form (Admin only — không tạo policy mới) */}
            {isAdmin && (
              <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-gradient-to-br from-gray-50/80 via-white to-gray-50/50 dark:from-gray-800/40 dark:via-gray-900/20 dark:to-gray-800/30 p-6 shadow-sm backdrop-blur-sm sticky top-0">
                {effectiveEditingKey ? (
                  <form onSubmit={handleSubmitValue} className="space-y-5">
                    <div className="flex items-start justify-between gap-3 pb-5 border-b border-gray-200 dark:border-gray-800">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Pencil className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          Update Policy
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Modify the value for this policy
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Policy Key Display */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">
                          {activeMeta?.icon || "⚙️"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                            {activeMeta?.label || effectiveEditingKey}
                          </div>
                          <div className="font-mono text-xs text-gray-500 dark:text-gray-400">
                            {effectiveEditingKey}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hint */}
                    {activeMeta && (
                      <div className="rounded-xl border border-blue-200 dark:border-blue-800/60 bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-500/10 dark:to-blue-500/5 px-4 py-3.5 shadow-sm">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                            {activeMeta.hint}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Value Input */}
                    <div>
                      <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                        New Value <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={value}
                        onChange={(event) => {
                          setValue(event.target.value);
                          setValueError("");
                        }}
                        disabled={isSubmitting}
                        placeholder={activeMeta?.placeholder}
                        className="h-12 w-full rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-gray-100 dark:disabled:bg-gray-800/60 disabled:cursor-not-allowed"
                      />
                      {valueError && (
                        <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 border border-red-200 dark:border-red-500/30">
                          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                          <span className="text-sm text-red-600 dark:text-red-400">
                            {valueError}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
                    >
                      {updatePolicyMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-white/50 px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-900/20">
                    <Pencil className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select <strong>Edit</strong> from the list on the left
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
