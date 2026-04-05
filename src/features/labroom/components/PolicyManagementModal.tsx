import { useMemo, useState, type FormEvent } from "react";
import {
  ClipboardList,
  Loader2,
  Pencil,
  PlusCircle,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useToast } from "../../../hooks/useToast";
import { getErrorMessage } from "../../../utils/error";
import {
  useCreateRoomPolicy,
  useDeleteRoomPolicy,
  useRoomPolicies,
  useUpdateRoomPolicy,
} from "../hooks/useLabRooms";
import type {
  LabRoomPolicy,
  LabRoomPolicyFormValues,
} from "../types/policy.type";
import { PolicyType } from "../types/policy.type";
import type { LabRoomDto } from "../types/room.type";

type Props = {
  isOpen: boolean;
  room: LabRoomDto | null;
  onClose: () => void;
};

type FormErrors = Partial<Record<keyof LabRoomPolicyFormValues, string>>;

const POLICY_OPTIONS = Object.values(PolicyType);

const POLICY_META: Record<
  (typeof POLICY_OPTIONS)[number],
  { label: string; placeholder: string; hint: string }
> = {
  IsFreeTimeAllowed: {
    label: "Allow free time booking",
    placeholder: "true or false",
    hint: "Boolean rule to allow or block free-time booking.",
  },
  MinBookingLeadTime: {
    label: "Minimum lead time",
    placeholder: "2",
    hint: "Number of hours required before booking starts.",
  },
  MaxBookingAdvance: {
    label: "Maximum booking advance",
    placeholder: "14",
    hint: "Number of days users can book ahead.",
  },
  CurfewTime: {
    label: "Curfew time",
    placeholder: "22:00",
    hint: "Latest allowed end time in HH:mm format.",
  },
  MaxOutSlotDuration: {
    label: "Maximum out-slot duration",
    placeholder: "4",
    hint: "Maximum duration allowed for flexible bookings.",
  },
  MaxConcurrentBookings: {
    label: "Maximum concurrent bookings",
    placeholder: "1",
    hint: "Limit how many bookings can coexist at once.",
  },
};

const getPolicyKey = (policy: LabRoomPolicy) =>
  policy.policyKeyName || policy.policyKey;

const getDefaultValues = (): LabRoomPolicyFormValues => ({
  policyKey: POLICY_OPTIONS[0],
  value: "",
});

export default function PolicyManagementModal({
  isOpen,
  room,
  onClose,
}: Props) {
  const toast = useToast();
  const roomId = room?.id ?? 0;
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [values, setValues] = useState<LabRoomPolicyFormValues>(getDefaultValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const { data: policies = [], isLoading, isFetching } = useRoomPolicies(
    roomId,
    isOpen && roomId > 0,
  );

  const createPolicyMutation = useCreateRoomPolicy({
    onSuccess: () => {
      toast.success("Policy created", "The room policy has been added.");
      setMode("create");
      setEditingKey(null);
      setValues(getDefaultValues());
    },
    onError: (error) => {
      toast.error(
        "Create failed",
        getErrorMessage(error, "Unable to create room policy."),
      );
    },
  });

  const updatePolicyMutation = useUpdateRoomPolicy({
    onSuccess: () => {
      toast.success("Policy updated", "The room policy has been updated.");
      setMode("create");
      setEditingKey(null);
      setValues(getDefaultValues());
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
      if (mode === "edit") {
        setMode("create");
        setEditingKey(null);
        setValues(getDefaultValues());
      }
    },
    onError: (error) => {
      toast.error(
        "Delete failed",
        getErrorMessage(error, "Unable to delete room policy."),
      );
    },
  });

  const usedPolicyKeys = useMemo(
    () => new Set(policies.map((policy) => getPolicyKey(policy))),
    [policies],
  );

  const availablePolicyOptions = useMemo(
    () =>
      POLICY_OPTIONS.filter(
        (policyKey) =>
          mode === "edit" || !usedPolicyKeys.has(policyKey) || values.policyKey === policyKey,
      ),
    [mode, usedPolicyKeys, values.policyKey],
  );

  if (!isOpen || !room) {
    return null;
  }

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!values.policyKey) {
      nextErrors.policyKey = "Policy key is required.";
    }

    if (!values.value.trim()) {
      nextErrors.value = "Policy value is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = <K extends keyof LabRoomPolicyFormValues>(
    key: K,
    value: LabRoomPolicyFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleEdit = (policy: LabRoomPolicy) => {
    const policyKey = getPolicyKey(policy);
    setMode("edit");
    setEditingKey(policyKey);
    setValues({
      policyKey: policyKey as LabRoomPolicyFormValues["policyKey"],
      value: policy.value,
    });
  };

  const handleCancelEdit = () => {
    setMode("create");
    setEditingKey(null);
    setValues(getDefaultValues());
    setErrors({});
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    if (mode === "edit" && editingKey) {
      await updatePolicyMutation.mutateAsync({
        labRoomId: roomId,
        policyKey: editingKey,
        payload: values,
      });
      return;
    }

    await createPolicyMutation.mutateAsync({
      labRoomId: roomId,
      payload: values,
    });
  };

  const handleDelete = async (policy: LabRoomPolicy) => {
    const policyKey = getPolicyKey(policy);

    if (!window.confirm(`Delete policy ${policyKey} from ${room.roomName}?`)) {
      return;
    }

    await deletePolicyMutation.mutateAsync({
      labRoomId: roomId,
      policyKey,
    });
  };

  const activeMeta = POLICY_META[values.policyKey];
  const isSubmitting =
    createPolicyMutation.isPending ||
    updatePolicyMutation.isPending ||
    deletePolicyMutation.isPending;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Room Policies
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage policy rules for {room.roomName} ({room.roomNo}).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Current Policies
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Create, edit, or remove room-level booking rules.
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                    {policies.length} policy
                    {policies.length === 1 ? "" : "ies"}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {isLoading || isFetching ? (
                  <div className="px-5 py-8 text-sm text-gray-500 dark:text-gray-400">
                    Loading policies...
                  </div>
                ) : policies.length === 0 ? (
                  <div className="px-5 py-8 text-sm text-gray-500 dark:text-gray-400">
                    No policies configured for this room yet.
                  </div>
                ) : (
                  policies.map((policy) => {
                    const policyKey = getPolicyKey(policy);
                    const meta = POLICY_META[policyKey as keyof typeof POLICY_META];

                    return (
                      <div
                        key={policyKey}
                        className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-start md:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {meta?.label || policyKey}
                            </h4>
                            {editingKey === policyKey && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                                Editing
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {meta?.hint || policyKey}
                          </p>
                          <div className="mt-2 rounded-xl bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                            {policy.value}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(policy)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(policy)}
                            disabled={deletePolicyMutation.isPending}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5 dark:border-gray-800 dark:bg-gray-900/50">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {mode === "create" ? "Add Policy" : "Edit Policy"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Configure rule value for this room.
                </p>
              </div>

              {mode === "edit" ? (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  Cancel edit
                </button>
              ) : (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Create
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Policy key *
                </label>
                <select
                  value={values.policyKey}
                  onChange={(event) =>
                    handleChange(
                      "policyKey",
                      event.target.value as LabRoomPolicyFormValues["policyKey"],
                    )
                  }
                  disabled={mode === "edit" || isSubmitting}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
                >
                  {availablePolicyOptions.map((policyKey) => (
                    <option key={policyKey} value={policyKey}>
                      {POLICY_META[policyKey].label}
                    </option>
                  ))}
                </select>
                {errors.policyKey && (
                  <p className="mt-1 text-sm text-red-600">{errors.policyKey}</p>
                )}
              </div>

              <div className="rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-xs text-sky-800 dark:border-sky-900/60 dark:bg-sky-500/10 dark:text-sky-200">
                <div className="font-semibold">{activeMeta.label}</div>
                <div className="mt-1">{activeMeta.hint}</div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Value *
                </label>
                <input
                  value={values.value}
                  onChange={(event) => handleChange("value", event.target.value)}
                  disabled={isSubmitting}
                  placeholder={activeMeta.placeholder}
                  className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
                />
                {errors.value && (
                  <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  (mode === "create" && availablePolicyOptions.length === 0)
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : mode === "create" ? (
                  <PlusCircle className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {mode === "create" ? "Create Policy" : "Save Policy"}
              </button>

              {mode === "create" && availablePolicyOptions.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-300">
                  All supported policies are already configured for this room.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
