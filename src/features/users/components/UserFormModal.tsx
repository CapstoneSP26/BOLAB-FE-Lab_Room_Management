import { useState, type FormEvent } from "react";
import { Loader2, UserPlus, X } from "lucide-react";
import {
  getDefaultUserFormValues,
  getRoleLabel,
} from "../types/userManagement.mapper";
import type {
  UserFormValues,
  UserListItem,
  UserRole,
} from "../types/userManagement.type";

type Props = {
  isOpen: boolean;
  mode: "create" | "edit";
  user?: UserListItem | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
};

type FormErrors = Partial<Record<keyof UserFormValues, string>>;

const ROLE_OPTIONS: UserRole[] = ["ADMIN", "LAB_MANAGER", "LECTURER", "STUDENT"];

export default function UserFormModal({
  isOpen,
  mode,
  user,
  isLoading = false,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<UserFormValues>(() =>
    getDefaultUserFormValues(user),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  if (!isOpen) return null;

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!values.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!values.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = "Email format is invalid.";
    }

    if (values.roles.length === 0) {
      nextErrors.roles = "At least one role is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
  

  const handleChange = <K extends keyof UserFormValues>(
    key: K,
    value: UserFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const finalValues = {
      ...values,
      password: mode === "create" ? values.email.trim() : values.password,
    };

    await onSubmit(finalValues);
  };

  const toggleRole = (role: UserRole) => {
    const nextRoles = values.roles.includes(role)
      ? values.roles.filter((r) => r !== role)
      
      : [...values.roles, role];
    handleChange("roles", nextRoles);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[15px] font-medium text-gray-900 dark:text-white">
                {mode === "create" ? "Add user" : "Update user"}
              </h2>
              <p className="text-[13px] text-gray-500 dark:text-gray-400">
                {mode === "create"
                  ? "Create a new account and assign role."
                  : `Editing ${user?.fullName ?? "selected user"}.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">

          {/* Full name */}
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-500 dark:text-gray-400">
              Full name *
            </label>
            <input
              value={values.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              disabled={isLoading}
              placeholder="Nguyen Van A"
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 disabled:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
            )}
          </div>

          {/* Email + User code */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-500 dark:text-gray-400">
                Email *
              </label>
              <input
                value={values.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={isLoading}
                placeholder="name@fpt.edu.vn"
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 disabled:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-500 dark:text-gray-400">
                User code
              </label>
              <input
                value={values.userCode}
                onChange={(e) => handleChange("userCode", e.target.value)}
                disabled={isLoading}
                placeholder="Optional"
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 disabled:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
              />
            </div>
          </div>

          {/* Roles */}
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-500 dark:text-gray-400">
              Roles *
            </label>
            <div
              className={`flex min-h-10 flex-wrap items-center gap-2 rounded-lg border px-2.5 py-1.5 transition ${
                errors.roles
                  ? "border-red-400 bg-red-50/30 dark:border-red-500/50"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              {ROLE_OPTIONS.map((role) => {
                const isSelected = values.roles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    disabled={isLoading}
                    className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[13px] transition-all disabled:cursor-not-allowed ${
                      isSelected
                        ? "border-blue-300 bg-blue-50 font-medium text-blue-600 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-400"
                        : "border-gray-200 bg-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span
                      className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border transition-all ${
                        isSelected
                          ? "border-blue-400 bg-blue-400 dark:border-blue-500 dark:bg-blue-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="h-2 w-2 text-white"
                          viewBox="0 0 10 10"
                          fill="none"
                        >
                          <polyline
                            points="2,5 4,7 8,3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    {getRoleLabel(role)}
                  </button>
                );
              })}
            </div>
            {errors.roles && (
              <p className="mt-1 text-xs text-red-500">{errors.roles}</p>
            )}
          </div>

          {/* Password + Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-500 dark:text-gray-400">
                Status
              </label>
              <select
                value={values.isActive ? "ACTIVE" : "DEACTIVATED"}
                onChange={(e) =>
                  handleChange("isActive", e.target.value === "ACTIVE")
                }
                disabled={isLoading}
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 disabled:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
              >
                <option value="ACTIVE">Active</option>
                <option value="DEACTIVATED">De-activated</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="h-9 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create user" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}