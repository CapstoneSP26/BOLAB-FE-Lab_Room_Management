import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import type { GroupDto } from "../types/group.type";

interface Props {
  isOpen: boolean;
  mode: "create" | "edit";
  group: GroupDto | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (values: { groupName: string }) => Promise<void>;
}

export default function AdminGroupFormModal({
  isOpen,
  mode,
  group,
  isLoading,
  onClose,
  onSubmit,
}: Props) {
  const [groupName, setGroupName] = useState("");
  const [errors, setErrors] = useState<{ groupName?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && group) {
        setGroupName(group.groupName);
      } else {
        setGroupName("");
      }
      setErrors({});
    }
  }, [isOpen, mode, group]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { groupName?: string } = {};
    if (!groupName.trim()) {
      newErrors.groupName = "Group name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onSubmit({ groupName });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm sm:p-0">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {mode === "create" ? "Create Group" : "Edit Group"}
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 disabled:opacity-50 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                disabled={isLoading}
                placeholder="e.g. SE1801"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-all focus:outline-none dark:bg-gray-900/50 dark:text-white ${
                  errors.groupName
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:border-red-500/50"
                    : "border-gray-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-600"
                } disabled:bg-gray-50 dark:disabled:bg-gray-800`}
              />
              {errors.groupName && (
                <p className="mt-1 text-sm text-red-500">{errors.groupName}</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-400 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
