import { useState, type FormEvent } from "react";
import { Loader2, Shield, UserPlus, X } from "lucide-react";
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

  if (!isOpen) {
    return null;
  }

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

    if (mode === "create" && !values.password.trim()) {
      nextErrors.password = "Password is required when creating a user.";
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

    if (!validate()) {
      return;
    }

    await onSubmit(values);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-300">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {mode === "create" ? "Add User" : "Update User"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full name *
              </label>
              <input
                value={values.fullName}
                onChange={(event) => handleChange("fullName", event.target.value)}
                disabled={isLoading}
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
                placeholder="Nguyen Van A"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email *
              </label>
              <input
                value={values.email}
                onChange={(event) => handleChange("email", event.target.value)}
                disabled={isLoading}
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
                placeholder="name@fpt.edu.vn"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                User code
              </label>
              <input
                value={values.userCode}
                onChange={(event) => handleChange("userCode", event.target.value)}
                disabled={isLoading}
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role *
              </label>
              <div className="relative">
                <Shield className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={values.role}
                  onChange={(event) =>
                    handleChange("role", event.target.value as UserRole)
                  }
                  disabled={isLoading}
                  className="h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-11 pr-10 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {getRoleLabel(role)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={values.isActive ? "ACTIVE" : "DEACTIVATED"}
                onChange={(event) =>
                  handleChange("isActive", event.target.value === "ACTIVE")
                }
                disabled={isLoading}
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
              >
                <option value="ACTIVE">Activate</option>
                <option value="DEACTIVATED">De-activate</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create User" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
