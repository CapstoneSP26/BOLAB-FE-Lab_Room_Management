import { useEffect, useMemo, useState, useRef, type FormEvent } from "react";
import {
  Loader2,
  PencilLine,
  PlusCircle,
  X,
  Upload,
  Trash2,
} from "lucide-react";
import type { BuildingDto, BuildingFormValues } from "../types/building.type";
import { addCacheBuster } from "../../../utils/imageCache";
type Props = {
  isOpen: boolean;
  mode: "create" | "edit";
  building?: BuildingDto | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: BuildingFormValues) => void | Promise<void>;
};

const toFormValues = (building?: BuildingDto | null): BuildingFormValues => ({
  BuildingName: building?.buildingName ?? "",
  Descriptions: building?.description ?? "",
  Images: null,
});

type FormErrors = Partial<Record<keyof BuildingFormValues, string>>;

export default function BuildingFormModal({
  isOpen,
  mode,
  building,
  isLoading = false,
  onClose,
  onSubmit,
}: Props) {
  const initial = useMemo(() => toFormValues(building), [building]);
  const [values, setValues] = useState<BuildingFormValues>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValues(initial);
    setErrors({});

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Show existing image when editing
    if (mode === "edit" && building?.buildingImageUrl) {
      setImagePreview(addCacheBuster(building.buildingImageUrl));
    } else {
      setImagePreview(null);
    }
  }, [initial, mode, building]);

  if (!isOpen) {
    return null;
  }

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!values.BuildingName.trim()) {
      nextErrors.BuildingName = "Building name is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = <K extends keyof BuildingFormValues>(
    key: K,
    value: BuildingFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleChange("Images", file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    handleChange("Images", null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-300">
              {mode === "create" ? (
                <PlusCircle className="h-5 w-5" />
              ) : (
                <PencilLine className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {mode === "create" ? "Add Building" : "Update Building"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {mode === "create"
                  ? "Create a new building and assign campus details."
                  : `Editing ${building?.buildingName ?? "selected building"}.`}
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
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Building name *
              </label>
              <input
                value={values.BuildingName}
                onChange={(event) =>
                  handleChange("BuildingName", event.target.value)
                }
                disabled={isLoading}
                className="h-11 w-full rounded-xl border border-gray-300 px-4 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
                placeholder="FPT Building A"
              />
              {errors.BuildingName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.BuildingName}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Building Image (optional)
              </label>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl border border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={() => {
                      console.log("Modal preview image failed:", imagePreview);
                      console.log(
                        "Original building image:",
                        building?.buildingImageUrl,
                      );
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isLoading}
                    className="absolute right-2 top-2 flex items-center justify-center rounded-lg bg-red-500 p-2 text-white transition hover:bg-red-600 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={isLoading}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm font-medium text-gray-600 transition hover:border-brand-500 hover:bg-brand-50/30 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:bg-brand-500/5"
              >
                <Upload className="h-5 w-5" />
                Choose Image from Device
              </button>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={values.Descriptions}
                onChange={(event) =>
                  handleChange("Descriptions", event.target.value)
                }
                disabled={isLoading}
                rows={4}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-800/60"
                placeholder="Building description or internal note..."
              />
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
              {mode === "create" ? "Create Building" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
