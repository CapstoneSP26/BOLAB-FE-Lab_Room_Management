import { useEffect, useMemo, useState } from "react";
import { Building2, Image as ImageIcon, Loader2, X } from "lucide-react";
import type { BuildingDto } from "../types/building.type";
import type { BuildingFormValues } from "../types/buildingManagement.type";

type Props = {
  isOpen: boolean;
  mode: "create" | "edit";
  building?: BuildingDto | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: BuildingFormValues) => void | Promise<void>;
};

const toFormValues = (building?: BuildingDto | null): BuildingFormValues => ({
  campusId: building?.campusId ?? 0,
  buildingName: building?.buildingName ?? "",
  description: building?.description ?? "",
  buildingImageUrl: building?.buildingImageUrl ?? "",
});

export default function BuildingFormModal({
  isOpen,
  mode,
  building,
  isLoading,
  onClose,
  onSubmit,
}: Props) {
  const initial = useMemo(() => toFormValues(building), [building]);
  const [values, setValues] = useState<BuildingFormValues>(initial);

  useEffect(() => {
    setValues(initial);
  }, [initial]);

  if (!isOpen) return null;

  const title = mode === "create" ? "Add Building" : "Edit Building";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={() => {
          if (isLoading) return;
          onClose();
        }}
        className="absolute inset-0 bg-black/40"
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/60 px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/60">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/15">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                Provide campus id, name, description and optional image url.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (isLoading) return;
              onClose();
            }}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="space-y-5 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit(values);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Campus ID
              </label>
              <input
                inputMode="numeric"
                value={String(values.campusId)}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    campusId: Number(event.target.value || 0),
                  }))
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900/20 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Building Name
              </label>
              <input
                value={values.buildingName}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    buildingName: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900/20 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              Description
            </label>
            <textarea
              value={values.description}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-800 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900/20 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
              Image URL (optional)
            </label>
            <div className="relative">
              <ImageIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={values.buildingImageUrl ?? ""}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    buildingImageUrl: event.target.value,
                  }))
                }
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-gray-800 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900/20 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                if (isLoading) return;
                onClose();
              }}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!!isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

